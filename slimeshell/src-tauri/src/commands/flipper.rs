use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Serialize, Deserialize, Clone)]
pub struct SerialPortInfo {
    pub name: String,
    pub path: String,
    pub description: Option<String>,
}

#[tauri::command]
pub fn list_serial_ports() -> Result<Vec<SerialPortInfo>, String> {
    let output = Command::new("ls")
        .arg("/dev")
        .output()
        .map_err(|e| format!("Failed to list devices: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let ports: Vec<SerialPortInfo> = stdout
        .lines()
        .filter(|line| {
            line.starts_with("ttyACM")
                || line.starts_with("ttyUSB")
                || line.starts_with("tty.usbmodem")
        })
        .map(|name| {
            let path = format!("/dev/{}", name);
            let description = if name.contains("ACM") || name.contains("usbmodem") {
                Some("Flipper Zero (likely)".to_string())
            } else {
                Some("USB Serial Device".to_string())
            };
            SerialPortInfo {
                name: name.to_string(),
                path,
                description,
            }
        })
        .collect();

    Ok(ports)
}

#[tauri::command]
pub fn serial_read(port: String, timeout_ms: u64) -> Result<String, String> {
    let output = Command::new("timeout")
        .arg(format!("{}ms", timeout_ms))
        .arg("cat")
        .arg(&port)
        .output()
        .map_err(|e| format!("Failed to read serial port: {}", e))?;

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

#[tauri::command]
pub fn serial_write(port: String, data: String) -> Result<(), String> {
    use std::fs::OpenOptions;
    use std::io::Write;

    let mut file = OpenOptions::new()
        .write(true)
        .open(&port)
        .map_err(|e| format!("Failed to open serial port: {}", e))?;

    file.write_all(data.as_bytes())
        .map_err(|e| format!("Failed to write to serial port: {}", e))?;

    file.flush()
        .map_err(|e| format!("Failed to flush serial port: {}", e))?;

    Ok(())
}
