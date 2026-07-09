use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{AppHandle, Emitter, State};
use uuid::Uuid;

mod terminal;
use terminal::{PtySession, PtyEvent};

pub struct PtyManager {
    sessions: Arc<Mutex<HashMap<String, PtySession>>>,
}

impl PtyManager {
    pub fn new() -> Self {
        Self {
            sessions: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn spawn(
        &self,
        app: AppHandle,
        shell: Option<String>,
        cwd: Option<String>,
    ) -> Result<String, String> {
        let id = Uuid::new_v4().to_string();
        let mut session = PtySession::new(id.clone(), shell, cwd)?;

        let app_clone = app.clone();
        let session_id = id.clone();

        let mut reader = session.reader.take().ok_or("No reader")?;
        thread::spawn(move || {
            let mut buf = [0u8; 8192];
            loop {
                match reader.read(&mut buf) {
                    Ok(0) => break,
                    Ok(n) => {
                        let data = String::from_utf8_lossy(&buf[..n]).to_string();
                        let _ = app_clone.emit(
                            "pty-data",
                            PtyEvent {
                                id: session_id.clone(),
                                data,
                            },
                        );
                    }
                    Err(_) => break,
                }
            }
            let _ = app_clone.emit("pty-exit", session_id.clone());
        });

        self.sessions.lock().unwrap().insert(id.clone(), session);
        Ok(id)
    }

    pub fn write(&self, id: &str, data: &str) -> Result<(), String> {
        let sessions = self.sessions.lock().unwrap();
        let session = sessions.get(id).ok_or("Session not found")?;
        let mut writer = session.writer.lock().unwrap();
        writer
            .write_all(data.as_bytes())
            .map_err(|e| e.to_string())?;
        writer.flush().map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn resize(&self, id: &str, cols: u16, rows: u16) -> Result<(), String> {
        let mut sessions = self.sessions.lock().unwrap();
        let session = sessions.get_mut(id).ok_or("Session not found")?;
        session.resize(cols, rows)
    }

    pub fn close(&self, id: &str) -> Result<(), String> {
        let mut sessions = self.sessions.lock().unwrap();
        sessions.remove(id).ok_or("Session not found")?;
        Ok(())
    }

    pub fn list(&self) -> Vec<String> {
        self.sessions.lock().unwrap().keys().cloned().collect()
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
fn pty_resize(state: State<'_, PtyManager>, id: String, cols: u16, rows: u16) -> Result<(), String> {
    state.resize(&id, cols, rows)
}

#[tauri::command]
fn pty_close(state: State<'_, PtyManager>, id: String) -> Result<(), String> {
    state.close(&id)
}

#[tauri::command]
fn pty_list(state: State<'_, PtyManager>) -> Vec<String> {
    state.list()
}

#[tauri::command]
fn get_config_path() -> String {
    dirs::config_dir()
        .map(|p| p.join("pulse").to_string_lossy().to_string())
        .unwrap_or_else(|| "~/.config/pulse".to_string())
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running Pulse");
}
