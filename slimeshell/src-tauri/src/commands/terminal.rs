use portable_pty::{CommandBuilder, NativePtySystem, PtySize, PtySystem};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex, LazyLock};
use tauri::{AppHandle, Emitter};

#[derive(Serialize, Deserialize, Clone)]
pub struct TerminalInfo {
    pub id: String,
    pub shell: String,
    pub alive: bool,
}

struct PtySession {
    writer: Box<dyn Write + Send>,
    master: Box<dyn portable_pty::MasterPty + Send>,
    alive: Arc<Mutex<bool>>,
}

static SESSIONS: LazyLock<Mutex<HashMap<String, PtySession>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));

#[tauri::command]
pub fn spawn_terminal(app: AppHandle, id: String, shell: String) -> Result<(), String> {
    let pty_system = NativePtySystem::default();

    let pair = pty_system
        .openpty(PtySize {
            rows: 24,
            cols: 80,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| format!("Failed to open PTY: {}", e))?;

    let shell_path = if shell.is_empty() {
        std::env::var("SHELL").unwrap_or_else(|_| "/bin/bash".to_string())
    } else {
        shell.clone()
    };

    let cmd = CommandBuilder::new(&shell_path);
    let _child = pair
        .slave
        .spawn_command(cmd)
        .map_err(|e| format!("Failed to spawn shell: {}", e))?;

    let mut reader = pair
        .master
        .try_clone_reader()
        .map_err(|e| format!("Failed to clone reader: {}", e))?;

    let writer = pair
        .master
        .take_writer()
        .map_err(|e| format!("Failed to take writer: {}", e))?;

    let alive = Arc::new(Mutex::new(true));
    let alive_clone = alive.clone();
    let event_id = id.clone();

    std::thread::spawn(move || {
        let mut buf = [0u8; 4096];
        loop {
            match reader.read(&mut buf) {
                Ok(0) => {
                    *alive_clone.lock().unwrap() = false;
                    let _ = app.emit(&format!("terminal-exit-{}", event_id), ());
                    break;
                }
                Ok(n) => {
                    let data = String::from_utf8_lossy(&buf[..n]).to_string();
                    let _ = app.emit(&format!("terminal-output-{}", event_id), data);
                }
                Err(_) => {
                    *alive_clone.lock().unwrap() = false;
                    let _ = app.emit(&format!("terminal-exit-{}", event_id), ());
                    break;
                }
            }
        }
    });

    let session = PtySession {
        writer,
        master: pair.master,
        alive,
    };

    SESSIONS.lock().unwrap().insert(id, session);
    Ok(())
}

#[tauri::command]
pub fn write_terminal(id: String, data: String) -> Result<(), String> {
    let mut sessions = SESSIONS.lock().unwrap();
    let session = sessions
        .get_mut(&id)
        .ok_or_else(|| format!("Terminal session '{}' not found", id))?;

    session
        .writer
        .write_all(data.as_bytes())
        .map_err(|e| format!("Failed to write to terminal: {}", e))?;
    session
        .writer
        .flush()
        .map_err(|e| format!("Failed to flush terminal: {}", e))?;
    Ok(())
}

#[tauri::command]
pub fn resize_terminal(id: String, rows: u16, cols: u16) -> Result<(), String> {
    let sessions = SESSIONS.lock().unwrap();
    let session = sessions
        .get(&id)
        .ok_or_else(|| format!("Terminal session '{}' not found", id))?;

    session
        .master
        .resize(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| format!("Failed to resize terminal: {}", e))
}

#[tauri::command]
pub fn kill_terminal(id: String) -> Result<(), String> {
    let mut sessions = SESSIONS.lock().unwrap();
    if let Some(session) = sessions.remove(&id) {
        *session.alive.lock().unwrap() = false;
        drop(session);
    }
    Ok(())
}

#[tauri::command]
pub fn list_terminals() -> Vec<TerminalInfo> {
    let sessions = SESSIONS.lock().unwrap();
    sessions
        .iter()
        .map(|(id, session)| TerminalInfo {
            id: id.clone(),
            shell: String::new(),
            alive: *session.alive.lock().unwrap(),
        })
        .collect()
}
