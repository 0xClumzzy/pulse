use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use std::thread;
use uuid::Uuid;
use log;

pub mod terminal;
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
        app_handle: Option<std::sync::Arc<dyn Fn(String) + Send + Sync>>,
        shell: Option<String>,
        cwd: Option<String>,
    ) -> Result<String, String> {
        let id = Uuid::new_v4().to_string();
        let session = PtySession::new(id.clone(), shell, cwd)?;

        let mut reader = session.reader.take().ok_or("No reader available")?;

        self.lock_sessions()?.insert(id.clone(), session);

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
                        if let Some(ref emit) = app_handle {
                            let _ = emit(format!("pty-data:{}", data));
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
}
