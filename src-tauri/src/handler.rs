use serde::{Deserialize, Serialize};
use std::net::TcpListener;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::SystemTime;
use log;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HandlerInfo {
    pub id: String,
    pub port: u16,
    pub status: String,
    pub connections: Vec<ConnectionInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectionInfo {
    pub id: String,
    pub remote_addr: String,
    pub connected_at: String,
    pub status: String,
}

struct Connection {
    id: String,
    remote_addr: String,
    connected_at: String,
    stream: Option<std::net::TcpStream>,
}

pub struct HandlerManager {
    handlers: Arc<Mutex<Vec<HandlerState>>>,
}

struct HandlerState {
    id: String,
    port: u16,
    status: String,
    connections: Vec<Connection>,
    stop_flag: Arc<Mutex<bool>>,
}

impl HandlerManager {
    pub fn new() -> Self {
        Self {
            handlers: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn start_handler(&self, port: u16) -> Result<HandlerInfo, String> {
        let id = uuid::Uuid::new_v4().to_string();
        let stop_flag = Arc::new(Mutex::new(false));

        let addr = format!("0.0.0.0:{}", port);
        let listener = TcpListener::bind(&addr)
            .map_err(|e| format!("Failed to bind to {}: {}", addr, e))?;
        
        listener.set_nonblocking(true)
            .map_err(|e| format!("Failed to set nonblocking: {}", e))?;

        let handler_id = id.clone();
        let stop_flag_clone = Arc::clone(&stop_flag);
        let connections = Arc::new(Mutex::new(Vec::<Connection>::new()));
        let connections_clone = Arc::clone(&connections);

        thread::spawn(move || {
            log::info!("Reverse shell handler started on port {}", port);
            
            for stream in listener.incoming() {
                if *stop_flag_clone.lock().unwrap() {
                    break;
                }

                match stream {
                    Ok(stream) => {
                        let remote_addr = stream.peer_addr()
                            .map(|a| a.to_string())
                            .unwrap_or_else(|_| "unknown".to_string());
                        
                        let conn_id = uuid::Uuid::new_v4().to_string();
                        let now = SystemTime::now()
                            .duration_since(SystemTime::UNIX_EPOCH)
                            .unwrap_or_default()
                            .as_secs();
                        
                        log::info!("New connection from {} (handler: {})", remote_addr, handler_id);

                        let connection = Connection {
                            id: conn_id.clone(),
                            remote_addr: remote_addr.clone(),
                            connected_at: now.to_string(),
                            stream: Some(stream),
                        };

                        connections_clone.lock().unwrap().push(connection);

                        // Emit event to frontend
                        // app_clone.emit("handler-connection", ...).ok();
                    }
                    Err(ref e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                        thread::sleep(std::time::Duration::from_millis(100));
                        continue;
                    }
                    Err(e) => {
                        log::error!("Accept error: {}", e);
                    }
                }
            }

            log::info!("Reverse shell handler stopped on port {}", port);
        });

        let handler = HandlerState {
            id: id.clone(),
            port,
            status: "listening".to_string(),
            connections: Vec::new(),
            stop_flag,
        };

        self.handlers.lock().unwrap().push(handler);

        Ok(HandlerInfo {
            id,
            port,
            status: "listening".to_string(),
            connections: Vec::new(),
        })
    }

    pub fn stop_handler(&self, id: &str) -> Result<(), String> {
        let mut handlers = self.handlers.lock().unwrap();
        let handler = handlers.iter_mut().find(|h| h.id == id)
            .ok_or_else(|| format!("Handler {} not found", id))?;
        
        *handler.stop_flag.lock().unwrap() = true;
        handler.status = "stopped".to_string();
        
        Ok(())
    }

    pub fn list_handlers(&self) -> Vec<HandlerInfo> {
        self.handlers.lock().unwrap()
            .iter()
            .map(|h| HandlerInfo {
                id: h.id.clone(),
                port: h.port,
                status: h.status.clone(),
                connections: h.connections.iter().map(|c| ConnectionInfo {
                    id: c.id.clone(),
                    remote_addr: c.remote_addr.clone(),
                    connected_at: c.connected_at.clone(),
                    status: "connected".to_string(),
                }).collect(),
            })
            .collect()
    }

    pub fn remove_handler(&self, id: &str) -> Result<(), String> {
        let mut handlers = self.handlers.lock().unwrap();
        let pos = handlers.iter().position(|h| h.id == id)
            .ok_or_else(|| format!("Handler {} not found", id))?;
        
        let handler = handlers.remove(pos);
        *handler.stop_flag.lock().unwrap() = true;
        
        Ok(())
    }
}
