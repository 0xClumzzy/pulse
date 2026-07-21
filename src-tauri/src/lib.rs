use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{AppHandle, Emitter, State};
use uuid::Uuid;
use log;

mod terminal;
mod handler;
use terminal::{PtyEvent, PtySession};
use handler::{HandlerManager, HandlerInfo};

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
fn handler_start(state: State<'_, HandlerManager>, port: u16) -> Result<HandlerInfo, String> {
    state.start_handler(port)
}

#[tauri::command]
fn handler_stop(state: State<'_, HandlerManager>, id: String) -> Result<(), String> {
    state.stop_handler(&id)
}

#[tauri::command]
fn handler_list(state: State<'_, HandlerManager>) -> Vec<HandlerInfo> {
    state.list_handlers()
}

#[tauri::command]
fn handler_remove(state: State<'_, HandlerManager>, id: String) -> Result<(), String> {
    state.remove_handler(&id)
}

#[tauri::command]
fn get_config_path() -> String {
    dirs::config_dir()
        .map(|p| p.join("pulse").to_string_lossy().to_string())
        .unwrap_or_else(|| "~/.config/pulse".to_string())
}

#[tauri::command]
fn save_config(theme: String) -> Result<(), String> {
    let config_dir = dirs::config_dir()
        .ok_or_else(|| "Failed to get config directory".to_string())?
        .join("pulse");
    std::fs::create_dir_all(&config_dir).map_err(|e| e.to_string())?;
    let config_path = config_dir.join("theme.json");
    std::fs::write(&config_path, &theme).map_err(|e| e.to_string())?;
    log::info!("Saved config to {}", config_path.display());
    Ok(())
}

#[tauri::command]
fn load_config() -> Result<String, String> {
    let config_path = dirs::config_dir()
        .ok_or_else(|| "Failed to get config directory".to_string())?
        .join("pulse")
        .join("theme.json");
    if config_path.exists() {
        log::info!("Loading config from {}", config_path.display());
        std::fs::read_to_string(&config_path).map_err(|e| e.to_string())
    } else {
        log::debug!("Config file not found at {}, using defaults", config_path.display());
        Ok(String::new())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .manage(PtyManager::new())
        .manage(HandlerManager::new())
        .invoke_handler(tauri::generate_handler![
            pty_spawn,
            pty_write,
            pty_resize,
            pty_close,
            pty_list,
            handler_start,
            handler_stop,
            handler_list,
            handler_remove,
            get_config_path,
            save_config,
            load_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Pulse");
}
