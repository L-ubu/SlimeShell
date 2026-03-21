use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::process::{Child, Command};
use std::sync::Mutex;

#[derive(Serialize, Deserialize, Clone)]
pub struct VpnStatus {
    pub id: String,
    pub name: String,
    pub connected: bool,
    pub tun_ip: Option<String>,
    pub pid: Option<u32>,
}

static VPN_PROCESSES: std::sync::LazyLock<Mutex<HashMap<String, Child>>> =
    std::sync::LazyLock::new(|| Mutex::new(HashMap::new()));

#[tauri::command]
pub fn connect_vpn(id: String, config_path: String) -> Result<String, String> {
    let child = Command::new("openvpn")
        .arg("--config")
        .arg(&config_path)
        .arg("--daemon")
        .spawn()
        .map_err(|e| format!("Failed to start OpenVPN: {}", e))?;

    let pid = child.id();
    VPN_PROCESSES.lock().unwrap().insert(id.clone(), child);
    Ok(format!("VPN started with PID {}", pid))
}

#[tauri::command]
pub fn disconnect_vpn(id: String) -> Result<(), String> {
    let mut processes = VPN_PROCESSES.lock().unwrap();
    if let Some(mut child) = processes.remove(&id) {
        child
            .kill()
            .map_err(|e| format!("Failed to kill VPN process: {}", e))?;
        child
            .wait()
            .map_err(|e| format!("Failed to wait for VPN process: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
pub fn vpn_status() -> Vec<VpnStatus> {
    let tun_ip = get_tun_ip();
    let processes = VPN_PROCESSES.lock().unwrap();
    processes
        .iter()
        .map(|(id, child)| VpnStatus {
            id: id.clone(),
            name: id.clone(),
            connected: true,
            tun_ip: tun_ip.clone(),
            pid: Some(child.id()),
        })
        .collect()
}

fn get_tun_ip() -> Option<String> {
    let output = Command::new("ip")
        .args(["addr", "show", "tun0"])
        .output()
        .ok()?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    for line in stdout.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("inet ") {
            if let Some(ip) = trimmed.split_whitespace().nth(1) {
                return Some(ip.split('/').next().unwrap_or(ip).to_string());
            }
        }
    }
    None
}
