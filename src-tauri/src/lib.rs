use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::SystemTime;
use tauri::{AppHandle, Emitter, Manager, State};
use uuid::Uuid;
use log;
use serde::{Deserialize, Serialize};

mod terminal;
mod config;
use terminal::{PtyEvent, PtySession};
use config::config_to_json_theme;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReconSummary {
    pub credentials_found: u32,
    pub commands_executed: u32,
    pub connections_opened: u32,
    pub total_sessions: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReconEntry {
    pub id: String,
    pub entry_type: String,
    pub value: String,
    pub context: String,
    pub timestamp: f64,
    pub pane_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HostFingerprint {
    pub hostname: String,
    pub key_type: String,
    pub fingerprint: String,
    pub first_seen: f64,
    pub last_seen: f64,
}

pub struct ReconManager {
    entries: Arc<Mutex<Vec<ReconEntry>>>,
    host_keys: Arc<Mutex<Vec<HostFingerprint>>>,
}

impl ReconManager {
    pub fn new() -> Self {
        Self {
            entries: Arc::new(Mutex::new(Vec::new())),
            host_keys: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn scan_output(&self, data: &str, pane_id: &str) {
        let now = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs_f64();

        let mut new_entries = Vec::new();

        // Detect credentials
        for pattern in &[
            "password=",
            "Password:",
            "credential",
            "secret",
            "api_key",
            "token=",
            "auth=",
        ] {
            if data.to_lowercase().contains(&pattern.to_lowercase()) {
                let value = extract_line_containing(data, pattern);
                new_entries.push(ReconEntry {
                    id: Uuid::new_v4().to_string(),
                    entry_type: "credential".to_string(),
                    value,
                    context: String::new(),
                    timestamp: now,
                    pane_id: pane_id.to_string(),
                });
            }
        }

        // Detect CVEs
        for word in data.split_whitespace() {
            if word.starts_with("CVE-") {
                new_entries.push(ReconEntry {
                    id: Uuid::new_v4().to_string(),
                    entry_type: "cve".to_string(),
                    value: word.to_string(),
                    context: String::new(),
                    timestamp: now,
                    pane_id: pane_id.to_string(),
                });
            }
        }

        // Detect ports
        for word in data.split_whitespace() {
            let w = word.trim_matches(|c: char| !c.is_alphanumeric() && c != ':' && c != '-' && c != '/');
            if let Some(port_str) = w.strip_suffix("/tcp").or_else(|| w.strip_suffix("/udp")) {
                if port_str.parse::<u16>().is_ok() {
                    new_entries.push(ReconEntry {
                        id: Uuid::new_v4().to_string(),
                        entry_type: "port".to_string(),
                        value: w.to_string(),
                        context: String::new(),
                        timestamp: now,
                        pane_id: pane_id.to_string(),
                    });
                }
            }
        }

        // Detect URLs
        for word in data.split_whitespace() {
            if word.starts_with("http://") || word.starts_with("https://") {
                new_entries.push(ReconEntry {
                    id: Uuid::new_v4().to_string(),
                    entry_type: "url".to_string(),
                    value: word.to_string(),
                    context: String::new(),
                    timestamp: now,
                    pane_id: pane_id.to_string(),
                });
            }
        }

        // Detect private IPs
        for word in data.split_whitespace() {
            let clean: String = word.chars().filter(|c| c.is_alphanumeric() || *c == '.').collect();
            if looks_like_ip(&clean) && is_private_ip(&clean) {
                new_entries.push(ReconEntry {
                    id: Uuid::new_v4().to_string(),
                    entry_type: "private_ip".to_string(),
                    value: clean,
                    context: String::new(),
                    timestamp: now,
                    pane_id: pane_id.to_string(),
                });
            }
        }

        // Detect hostnames from SSH
        if data.contains("Host key fingerprint") || data.contains("fingerprint:") {
            if let Some(fingerprint) = extract_after(data, "fingerprint:") {
                new_entries.push(ReconEntry {
                    id: Uuid::new_v4().to_string(),
                    entry_type: "hostname".to_string(),
                    value: fingerprint.trim().to_string(),
                    context: "SSH host key".to_string(),
                    timestamp: now,
                    pane_id: pane_id.to_string(),
                });
            }
        }

        // Detect base64 blobs (long strings of alphanumeric+/=)
        for word in data.split_whitespace() {
            if word.len() > 40 && word.chars().all(|c| c.is_alphanumeric() || c == '+' || c == '/' || c == '=') {
                new_entries.push(ReconEntry {
                    id: Uuid::new_v4().to_string(),
                    entry_type: "base64".to_string(),
                    value: format!("{}...", &word[..40]),
                    context: format!("Length: {} chars", word.len()),
                    timestamp: now,
                    pane_id: pane_id.to_string(),
                });
            }
        }

        if !new_entries.is_empty() {
            if let Ok(mut entries) = self.entries.lock() {
                entries.extend(new_entries);
                // Keep last 500 entries
                let len = entries.len();
                if len > 500 {
                    entries.drain(0..len - 500);
                }
            }
        }
    }

    pub fn get_summary(&self) -> ReconSummary {
        let entries = self.entries.lock().unwrap_or_else(|e| e.into_inner());
        let host_keys = self.host_keys.lock().unwrap_or_else(|e| e.into_inner());

        let mut credentials_found = 0u32;
        let commands_executed = 0u32;
        let mut connections_opened = 0u32;

        for entry in entries.iter() {
            match entry.entry_type.as_str() {
                "credential" => credentials_found += 1,
                "port" => connections_opened += 1,
                _ => {}
            }
        }

        ReconSummary {
            credentials_found,
            commands_executed,
            connections_opened,
            total_sessions: host_keys.len() as u32,
        }
    }

    pub fn clear(&self) {
        if let Ok(mut entries) = self.entries.lock() {
            entries.clear();
        }
    }

    pub fn get_host_keys(&self) -> Vec<HostFingerprint> {
        self.host_keys.lock().unwrap_or_else(|e| e.into_inner()).clone()
    }

    pub fn get_entries(&self) -> Vec<ReconEntry> {
        self.entries.lock().unwrap_or_else(|e| e.into_inner()).clone()
    }
}

fn extract_line_containing(data: &str, pattern: &str) -> String {
    for line in data.lines() {
        if line.to_lowercase().contains(&pattern.to_lowercase()) {
            return line.trim().to_string();
        }
    }
    data.lines().next().unwrap_or("").trim().to_string()
}

fn extract_after(data: &str, marker: &str) -> Option<String> {
    data.lines().find_map(|line| {
        line.find(marker).map(|pos| line[pos + marker.len()..].to_string())
    })
}

fn looks_like_ip(s: &str) -> bool {
    let parts: Vec<&str> = s.split('.').collect();
    parts.len() == 4 && parts.iter().all(|p| p.parse::<u8>().is_ok())
}

fn is_private_ip(ip: &str) -> bool {
    let parts: Vec<u8> = ip.split('.').filter_map(|p| p.parse().ok()).collect();
    if parts.len() != 4 { return false; }
    match parts[0] {
        10 => true,
        172 => parts[1] >= 16 && parts[1] <= 31,
        192 => parts[1] == 168,
        127 => true,
        _ => false,
    }
}

pub struct PtyManager {
    sessions: Arc<Mutex<HashMap<String, PtySession>>>,
}

impl PtyManager {
    pub fn new() -> Self {
        Self {
            sessions: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    fn lock_sessions(
        &self,
    ) -> Result<std::sync::MutexGuard<'_, HashMap<String, PtySession>>, String> {
        self.sessions
            .lock()
            .map_err(|e| format!("Failed to lock sessions: {}", e))
    }

    pub fn spawn(
        &self,
        app: AppHandle,
        shell: Option<String>,
        cwd: Option<String>,
    ) -> Result<String, String> {
        let id = Uuid::new_v4().to_string();
        let mut session = PtySession::new(id.clone(), shell, cwd)?;

        let mut reader = session.reader.take().ok_or("No reader available")?;

        // Insert session BEFORE spawning reader thread to avoid race condition
        self.lock_sessions()?.insert(id.clone(), session);

        let app_clone = app.clone();
        let session_id = id.clone();
        let sessions_ref = Arc::clone(&self.sessions);

        thread::spawn(move || {
            let mut buf = [0u8; 16384];
            loop {
                match reader.read(&mut buf) {
                    Ok(0) => {
                        log::info!("PTY reader EOF for session {}", session_id);
                        break;
                    }
                    Ok(n) => {
                        let data = String::from_utf8_lossy(&buf[..n]).to_string();
                        if data.contains('\u{FFFD}') {
                            log::warn!("PTY session {} contained invalid UTF-8 sequences", session_id);
                        }
                        if let Err(e) = app_clone.emit(
                            "pty-data",
                            PtyEvent {
                                id: session_id.clone(),
                                data,
                            },
                        ) {
                            log::error!("Failed to emit pty-data for {}: {}", session_id, e);
                            break;
                        }
                    }
                    Err(e) => {
                        log::warn!("PTY read error for session {}: {}", session_id, e);
                        break;
                    }
                }
            }

            if let Ok(mut sessions) = sessions_ref.lock() {
                sessions.remove(&session_id);
                log::debug!("Cleaned up PTY session {}", session_id);
            }

            let _ = app_clone.emit("pty-exit", session_id);
        });

        log::info!("Spawned PTY session: {}", id);
        Ok(id)
    }

    pub fn write(&self, id: &str, data: &str) -> Result<(), String> {
        let writer = {
            let sessions = self.lock_sessions()?;
            let session = sessions.get(id).ok_or("Session not found")?;
            Arc::clone(&session.writer)
        };
        let mut writer = writer
            .lock()
            .map_err(|e| format!("Failed to lock writer: {}", e))?;
        writer
            .write_all(data.as_bytes())
            .map_err(|e| e.to_string())?;
        writer.flush().map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn resize(&self, id: &str, cols: u16, rows: u16) -> Result<(), String> {
        let sessions = self.lock_sessions()?;
        let session = sessions.get(id).ok_or("Session not found")?;
        session.resize(cols, rows)?;
        log::debug!("Resized PTY session {} to {}x{}", id, cols, rows);
        Ok(())
    }

    pub fn close(&self, id: &str) -> Result<(), String> {
        let mut sessions = self.lock_sessions()?;
        let mut session = sessions.remove(id).ok_or("Session not found")?;
        
        session.kill();
        drop(session);
        
        log::info!("Closed PTY session: {}", id);
        Ok(())
    }

    pub fn list(&self) -> Result<Vec<String>, String> {
        Ok(self.lock_sessions()?.keys().cloned().collect())
    }

    /// Close all sessions gracefully
    pub fn close_all(&self) {
        if let Ok(mut sessions) = self.sessions.lock() {
            for (id, mut session) in sessions.drain() {
                log::info!("Gracefully closing PTY session: {}", id);
                session.kill();
            }
        }
    }
}

impl Drop for PtyManager {
    fn drop(&mut self) {
        log::info!("PtyManager dropping, closing all sessions...");
        self.close_all();
    }
}

#[tauri::command]
fn pty_spawn(
    app: AppHandle,
    state: State<'_, PtyManager>,
    shell: Option<String>,
    cwd: Option<String>,
) -> Result<String, String> {
    state.spawn(app, shell, cwd)
}

#[tauri::command]
fn pty_write(state: State<'_, PtyManager>, id: String, data: String) -> Result<(), String> {
    state.write(&id, &data)
}

#[tauri::command]
fn pty_resize(
    state: State<'_, PtyManager>,
    id: String,
    cols: u16,
    rows: u16,
) -> Result<(), String> {
    state.resize(&id, cols, rows)
}

#[tauri::command]
fn pty_close(state: State<'_, PtyManager>, id: String) -> Result<(), String> {
    state.close(&id)
}

#[tauri::command]
fn pty_list(state: State<'_, PtyManager>) -> Result<Vec<String>, String> {
    state.list()
}

#[tauri::command]
fn get_recon_summary(state: State<'_, ReconManager>) -> ReconSummary {
    state.get_summary()
}

#[tauri::command]
fn clear_recon(state: State<'_, ReconManager>) {
    state.clear();
}

#[tauri::command]
fn get_host_keys(state: State<'_, ReconManager>) -> Vec<HostFingerprint> {
    state.get_host_keys()
}

#[tauri::command]
async fn notify_command_complete(app: AppHandle, title: String, body: String) -> Result<(), String> {
    use tauri_plugin_notification::NotificationExt;
    app.notification()
        .builder()
        .title(&title)
        .body(&body)
        .show()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn toggle_quick_terminal(app: AppHandle) -> Result<(), String> {
    let window = app.get_webview_window("main").ok_or("Main window not found")?;
    if window.is_visible().unwrap_or(false) {
        window.hide().map_err(|e| e.to_string())?;
    } else {
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn get_config_path() -> String {
    config::config_path().to_string_lossy().to_string()
}

#[tauri::command]
fn save_config(theme: String) -> Result<(), String> {
    // Accept JSON from frontend, parse into PulseConfig, save as TOML
    let json_value: serde_json::Value = serde_json::from_str(&theme)
        .map_err(|e| format!("Failed to parse theme JSON: {}", e))?;

    let mut pulse_config = config::load_config().unwrap_or_default();

    // Merge JSON theme data into PulseConfig
    if let Some(window) = json_value.get("window") {
        if let Some(v) = window.get("opacity").and_then(|v| v.as_f64()) {
            pulse_config.window.opacity = v;
        }
        if let Some(v) = window.get("blurRadius").and_then(|v| v.as_u64()) {
            pulse_config.window.blur_radius = v as u32;
        }
        if let Some(v) = window.get("borderRadius").and_then(|v| v.as_u64()) {
            pulse_config.window.border_radius = v as u32;
        }
        if let Some(v) = window.get("borderWidth").and_then(|v| v.as_u64()) {
            pulse_config.window.border_width = v as u32;
        }
        if let Some(v) = window.get("borderColor").and_then(|v| v.as_str()) {
            pulse_config.window.border_color = v.to_string();
        }
        if let Some(v) = window.get("shadow").and_then(|v| v.as_bool()) {
            pulse_config.window.shadow = v;
        }
        if let Some(v) = window.get("shadowBlur").and_then(|v| v.as_u64()) {
            pulse_config.window.shadow_blur = v as u32;
        }
        if let Some(v) = window.get("shadowOpacity").and_then(|v| v.as_f64()) {
            pulse_config.window.shadow_opacity = v;
        }
        if let Some(v) = window.get("paddingX").and_then(|v| v.as_u64()) {
            pulse_config.window.padding_x = v as u32;
        }
        if let Some(v) = window.get("paddingY").and_then(|v| v.as_u64()) {
            pulse_config.window.padding_y = v as u32;
        }
    }

    if let Some(font) = json_value.get("font") {
        if let Some(v) = font.get("family").and_then(|v| v.as_str()) {
            pulse_config.font.family = v.to_string();
        }
        if let Some(v) = font.get("fallback").and_then(|v| v.as_str()) {
            pulse_config.font.fallback = v.to_string();
        }
        if let Some(v) = font.get("size").and_then(|v| v.as_u64()) {
            pulse_config.font.size = v as u32;
        }
        if let Some(v) = font.get("weight").and_then(|v| v.as_str()) {
            pulse_config.font.weight = v.to_string();
        }
        if let Some(v) = font.get("style").and_then(|v| v.as_str()) {
            pulse_config.font.style = v.to_string();
        }
        if let Some(v) = font.get("ligatures").and_then(|v| v.as_bool()) {
            pulse_config.font.ligatures = v;
        }
        if let Some(v) = font.get("scrollback").and_then(|v| v.as_u64()) {
            pulse_config.font.scrollback = v as u32;
        }
        if let Some(features) = font.get("fontFeatures").and_then(|v| v.as_array()) {
            pulse_config.font.font_features = features.iter()
                .filter_map(|v| v.as_str().map(|s| s.to_string()))
                .collect();
        }
    }

    if let Some(glass) = json_value.get("glass") {
        if let Some(v) = glass.get("enabled").and_then(|v| v.as_bool()) {
            pulse_config.glass.enabled = v;
        }
        if let Some(v) = glass.get("blurRadius").and_then(|v| v.as_u64()) {
            pulse_config.glass.blur_radius = v as u32;
        }
        if let Some(v) = glass.get("noiseOpacity").and_then(|v| v.as_f64()) {
            pulse_config.glass.noise_opacity = v;
        }
        if let Some(v) = glass.get("saturation").and_then(|v| v.as_u64()) {
            pulse_config.glass.saturation = v as u32;
        }
    }

    if let Some(cursor) = json_value.get("cursor") {
        if let Some(v) = cursor.get("style").and_then(|v| v.as_str()) {
            pulse_config.cursor.style = v.to_string();
        }
        if let Some(v) = cursor.get("blinking").and_then(|v| v.as_bool()) {
            pulse_config.cursor.blinking = v;
        }
        if let Some(v) = cursor.get("blinkInterval").and_then(|v| v.as_u64()) {
            pulse_config.cursor.blink_interval = v as u32;
        }
        if let Some(v) = cursor.get("opacity").and_then(|v| v.as_f64()) {
            pulse_config.cursor.opacity = v;
        }
        if let Some(v) = cursor.get("cursor").and_then(|v| v.as_str()) {
            pulse_config.cursor.cursor_color = v.to_string();
        }
        if let Some(v) = cursor.get("text").and_then(|v| v.as_str()) {
            pulse_config.cursor.text_color = v.to_string();
        }
    }

    if let Some(selection) = json_value.get("selection") {
        if let Some(v) = selection.get("background").and_then(|v| v.as_str()) {
            pulse_config.selection.background = v.to_string();
        }
        if let Some(v) = selection.get("foreground").and_then(|v| v.as_str()) {
            pulse_config.selection.foreground = v.to_string();
        }
    }

    if let Some(tab_bar) = json_value.get("tabBar") {
        if let Some(v) = tab_bar.get("height").and_then(|v| v.as_u64()) {
            pulse_config.tab_bar.height = v as u32;
        }
        if let Some(v) = tab_bar.get("background").and_then(|v| v.as_str()) {
            pulse_config.tab_bar.background = v.to_string();
        }
        if let Some(v) = tab_bar.get("borderHeight").and_then(|v| v.as_u64()) {
            pulse_config.tab_bar.border_height = v as u32;
        }
        if let Some(v) = tab_bar.get("borderColor").and_then(|v| v.as_str()) {
            pulse_config.tab_bar.border_color = v.to_string();
        }
        if let Some(v) = tab_bar.get("tabPaddingX").and_then(|v| v.as_u64()) {
            pulse_config.tab_bar.tab_padding_x = v as u32;
        }
    }

    if let Some(pane) = json_value.get("pane") {
        if let Some(v) = pane.get("borderWidth").and_then(|v| v.as_u64()) {
            pulse_config.pane.border_width = v as u32;
        }
        if let Some(v) = pane.get("borderColor").and_then(|v| v.as_str()) {
            pulse_config.pane.border_color = v.to_string();
        }
        if let Some(v) = pane.get("activeBorderColor").and_then(|v| v.as_str()) {
            pulse_config.pane.active_border_color = v.to_string();
        }
        if let Some(v) = pane.get("splitterSize").and_then(|v| v.as_u64()) {
            pulse_config.pane.splitter_size = v as u32;
        }
    }

    if let Some(animations) = json_value.get("animations") {
        if let Some(v) = animations.get("enabled").and_then(|v| v.as_bool()) {
            pulse_config.animations.enabled = v;
        }
        if let Some(v) = animations.get("duration").and_then(|v| v.as_u64()) {
            pulse_config.animations.duration = v as u32;
        }
        if let Some(v) = animations.get("easing").and_then(|v| v.as_str()) {
            pulse_config.animations.easing = v.to_string();
        }
    }

    if let Some(kb) = json_value.get("keybindings") {
        macro_rules! merge_kb {
            ($field:ident, $json_key:expr) => {
                if let Some(v) = kb.get($json_key).and_then(|v| v.as_str()) {
                    pulse_config.keybindings.$field = v.to_string();
                }
            };
        }
        merge_kb!(new_tab, "newTab");
        merge_kb!(close_tab, "closeTab");
        merge_kb!(next_tab, "nextTab");
        merge_kb!(prev_tab, "prevTab");
        merge_kb!(split_horizontal, "splitHorizontal");
        merge_kb!(split_vertical, "splitVertical");
        merge_kb!(close_pane, "closePane");
        merge_kb!(pane_left, "paneLeft");
        merge_kb!(pane_right, "paneRight");
        merge_kb!(pane_up, "paneUp");
        merge_kb!(pane_down, "paneDown");
        merge_kb!(copy, "copy");
        merge_kb!(paste, "paste");
        merge_kb!(search, "search");
        merge_kb!(command_palette, "commandPalette");
        merge_kb!(settings, "settings");
        merge_kb!(zoom_in, "zoomIn");
        merge_kb!(zoom_out, "zoomOut");
        merge_kb!(zoom_reset, "zoomReset");
        merge_kb!(payload_palette, "payloadPalette");
        merge_kb!(recon, "recon");
        merge_kb!(quick_terminal, "quickTerminal");
    }

    if let Some(pulse) = json_value.get("pulse") {
        if let Some(v) = pulse.get("visualBell").and_then(|v| v.as_bool()) {
            pulse_config.pulse.visual_bell = v;
        }
        if let Some(v) = pulse.get("visualBellDuration").and_then(|v| v.as_u64()) {
            pulse_config.pulse.visual_bell_duration = v as u32;
        }
        if let Some(v) = pulse.get("commandNotifications").and_then(|v| v.as_bool()) {
            pulse_config.pulse.command_notifications = v;
        }
        if let Some(v) = pulse.get("autoThemeSwitch").and_then(|v| v.as_bool()) {
            pulse_config.pulse.auto_theme_switch = v;
        }
        if let Some(v) = pulse.get("scrollbar").and_then(|v| v.as_bool()) {
            pulse_config.pulse.scrollbar = v;
        }
        if let Some(v) = pulse.get("scrollbarStyle").and_then(|v| v.as_str()) {
            pulse_config.pulse.scrollbar_style = v.to_string();
        }
    }

    if let Some(shader) = json_value.get("shader") {
        if let Some(v) = shader.get("enabled").and_then(|v| v.as_bool()) {
            pulse_config.shader.enabled = v;
        }
        if let Some(v) = shader.get("preset").and_then(|v| v.as_str()) {
            pulse_config.shader.preset = v.to_string();
        }
        if let Some(v) = shader.get("customFragment").and_then(|v| v.as_str()) {
            pulse_config.shader.custom_fragment = v.to_string();
        }
        if let Some(v) = shader.get("intensity").and_then(|v| v.as_f64()) {
            pulse_config.shader.intensity = v;
        }
        if let Some(v) = shader.get("speed").and_then(|v| v.as_f64()) {
            pulse_config.shader.speed = v;
        }
    }

    config::save_config(&pulse_config)
}

#[tauri::command]
fn load_config() -> Result<String, String> {
    let pulse_config = config::load_config()?;
    let json_value = config_to_json_theme(&pulse_config);
    serde_json::to_string(&json_value).map_err(|e| e.to_string())
}

#[tauri::command]
fn reload_config() -> Result<String, String> {
    load_config()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .manage(PtyManager::new())
        .manage(ReconManager::new())
        .invoke_handler(tauri::generate_handler![
            pty_spawn,
            pty_write,
            pty_resize,
            pty_close,
            pty_list,
            get_recon_summary,
            clear_recon,
            get_host_keys,
            notify_command_complete,
            toggle_quick_terminal,
            get_config_path,
            save_config,
            load_config,
            reload_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Pulse");
}
