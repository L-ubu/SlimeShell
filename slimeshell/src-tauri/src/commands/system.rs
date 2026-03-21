use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Serialize, Deserialize)]
pub struct SystemInfo {
    pub hostname: String,
    pub os: String,
    pub kernel: String,
    pub arch: String,
    pub uptime: String,
    pub username: String,
    pub shell: String,
    pub home_dir: String,
}

#[tauri::command]
pub fn get_system_info() -> Result<SystemInfo, String> {
    let hostname = run_cmd("hostname", &[]);
    let kernel = run_cmd("uname", &["-r"]);
    let arch = run_cmd("uname", &["-m"]);
    let uptime = run_cmd("uptime", &["-p"]);
    let username = std::env::var("USER").unwrap_or_else(|_| "unknown".to_string());
    let shell = std::env::var("SHELL").unwrap_or_else(|_| "/bin/bash".to_string());
    let home_dir = dirs::home_dir()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_else(|| "~".to_string());

    let os_info = if std::path::Path::new("/etc/os-release").exists() {
        let content = std::fs::read_to_string("/etc/os-release").unwrap_or_default();
        content
            .lines()
            .find(|l| l.starts_with("PRETTY_NAME="))
            .map(|l| l.trim_start_matches("PRETTY_NAME=").trim_matches('"').to_string())
            .unwrap_or_else(|| "Linux".to_string())
    } else {
        run_cmd("uname", &["-s"])
    };

    Ok(SystemInfo {
        hostname,
        os: os_info,
        kernel,
        arch,
        uptime,
        username,
        shell,
        home_dir,
    })
}

#[tauri::command]
pub fn open_external_url(url: String) -> Result<(), String> {
    let opener = if cfg!(target_os = "macos") {
        "open"
    } else if cfg!(target_os = "windows") {
        "explorer"
    } else {
        "xdg-open"
    };

    Command::new(opener)
        .arg(&url)
        .spawn()
        .map_err(|e| format!("Failed to open URL: {}", e))?;

    Ok(())
}

fn run_cmd(program: &str, args: &[&str]) -> String {
    Command::new(program)
        .args(args)
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_default()
}
