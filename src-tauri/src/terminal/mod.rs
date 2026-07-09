use portable_pty::{CommandBuilder, NativePtySystem, PtySize, PtySystem, MasterPty};
use serde::{Deserialize, Serialize};
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PtyEvent {
    pub id: String,
    pub data: String,
}

pub struct PtySession {
    pub id: String,
    pub writer: Arc<Mutex<Box<dyn Write + Send>>>,
    pub reader: Option<Box<dyn Read + Send>>,
    pub child: Box<dyn portable_pty::Child + Send>,
    pub master: Box<dyn MasterPty + Send>,
}

impl PtySession {
    pub fn new(
        id: String,
        shell: Option<String>,
        cwd: Option<String>,
    ) -> Result<Self, String> {
        let pty_system = NativePtySystem::default();
        let pair = pty_system
            .openpty(PtySize {
                rows: 24,
                cols: 80,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| e.to_string())?;

        let shell_path = shell.unwrap_or_else(|| {
            std::env::var("SHELL").unwrap_or_else(|_| "/bin/sh".to_string())
        });

        let mut cmd = CommandBuilder::new(&shell_path);
        cmd.env("TERM", "xterm-256color");
        cmd.env("COLORTERM", "truecolor");
        if let Some(dir) = &cwd {
            cmd.cwd(dir);
        }

        let child = pair
            .slave
            .spawn_command(cmd)
            .map_err(|e| e.to_string())?;

        // Drop the slave side so reads on master get EOF when child exits
        drop(pair.slave);

        let reader = pair.master.try_clone_reader().map_err(|e| e.to_string())?;
        let writer = pair.master.take_writer().map_err(|e| e.to_string())?;

        Ok(Self {
            id,
            writer: Arc::new(Mutex::new(writer)),
            reader: Some(reader),
            child,
            master: pair.master,
        })
    }

    pub fn resize(&self, cols: u16, rows: u16) -> Result<(), String> {
        self.master
            .resize(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| e.to_string())
    }

    pub fn kill(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}

impl Drop for PtySession {
    fn drop(&mut self) {
        self.kill();
    }
}
