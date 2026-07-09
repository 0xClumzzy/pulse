use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{AppHandle, Emitter, State};
use uuid::Uuid;
use log;

mod terminal;
use terminal::{PtyEvent, PtySession};

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

        let mut reader = session.reader.take().ok_or("No reader")?;

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

            // Clean up session from HashMap on natural exit
            if let Ok(mut sessions) = sessions_ref.lock() {
                sessions.remove(&session_id);
            }

            let _ = app_clone.emit("pty-exit", session_id);
        });

        Ok(id)
    }

    pub fn write(&self, id: &str, data: &str) -> Result<(), String> {
        // Clone the writer Arc to release the sessions lock before doing I/O
        let writer = {
            let sessions = self.lock_sessions()?;
            let session = sessions.get(id).ok_or("Session not found")?;
            Arc::clone(&session.writer)
        };
        // Now write without holding the sessions lock
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
        session.resize(cols, rows)
    }

    pub fn close(&self, id: &str) -> Result<(), String> {
        let mut sessions = self.lock_sessions()?;
        let mut session = sessions.remove(id).ok_or("Session not found")?;
        session.kill();
        Ok(())
    }

    pub fn list(&self) -> Result<Vec<String>, String> {
        Ok(self.lock_sessions()?.keys().cloned().collect())
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
    Ok(())
}

#[tauri::command]
fn load_config() -> Result<String, String> {
    let config_path = dirs::config_dir()
        .ok_or_else(|| "Failed to get config directory".to_string())?
        .join("pulse")
        .join("theme.json");
    if config_path.exists() {
        std::fs::read_to_string(&config_path).map_err(|e| e.to_string())
    } else {
        Ok(String::new())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .manage(PtyManager::new())
        .invoke_handler(tauri::generate_handler![
            pty_spawn,
            pty_write,
            pty_resize,
            pty_close,
            pty_list,
            get_config_path,
            save_config,
            load_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Pulse");
}
