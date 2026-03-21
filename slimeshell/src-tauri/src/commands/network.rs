use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Serialize, Deserialize)]
pub struct PingResult {
    pub host: String,
    pub alive: bool,
    pub latency_ms: Option<f64>,
}

#[derive(Serialize, Deserialize)]
pub struct NmapHost {
    pub ip: String,
    pub hostname: Option<String>,
    pub ports: Vec<NmapPort>,
    pub status: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct NmapPort {
    pub port: u16,
    pub protocol: String,
    pub state: String,
    pub service: String,
}

#[tauri::command]
pub fn ping_host(host: String) -> Result<PingResult, String> {
    let output = Command::new("ping")
        .args(["-c", "1", "-W", "2", &host])
        .output()
        .map_err(|e| format!("Failed to ping: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let alive = output.status.success();

    let latency = stdout.lines().find_map(|line| {
        if line.contains("time=") {
            line.split("time=")
                .nth(1)
                .and_then(|s| s.split_whitespace().next())
                .and_then(|s| s.parse::<f64>().ok())
        } else {
            None
        }
    });

    Ok(PingResult {
        host,
        alive,
        latency_ms: latency,
    })
}

#[tauri::command]
pub fn get_tun0_ip() -> Result<String, String> {
    let output = Command::new("ip")
        .args(["addr", "show", "tun0"])
        .output()
        .map_err(|e| format!("Failed to get tun0 IP: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    for line in stdout.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("inet ") {
            if let Some(ip) = trimmed.split_whitespace().nth(1) {
                return Ok(ip.split('/').next().unwrap_or(ip).to_string());
            }
        }
    }
    Err("tun0 interface not found or has no IP".to_string())
}

#[tauri::command]
pub fn parse_nmap_xml(xml_content: String) -> Result<Vec<NmapHost>, String> {
    let mut hosts = Vec::new();
    let mut current_ip = String::new();
    let mut current_hostname: Option<String> = None;
    let mut current_ports: Vec<NmapPort> = Vec::new();
    let mut current_status = String::from("unknown");

    for line in xml_content.lines() {
        let trimmed = line.trim();

        if trimmed.contains("<host") {
            current_ip.clear();
            current_hostname = None;
            current_ports.clear();
            current_status = String::from("unknown");
        }

        if trimmed.contains("<status") {
            if let Some(state) = extract_attr(trimmed, "state") {
                current_status = state;
            }
        }

        if trimmed.contains("<address") && trimmed.contains("addrtype=\"ipv4\"") {
            if let Some(addr) = extract_attr(trimmed, "addr") {
                current_ip = addr;
            }
        }

        if trimmed.contains("<hostname") {
            if let Some(name) = extract_attr(trimmed, "name") {
                current_hostname = Some(name);
            }
        }

        if trimmed.contains("<port") {
            let port_num = extract_attr(trimmed, "portid")
                .and_then(|p| p.parse::<u16>().ok())
                .unwrap_or(0);
            let protocol = extract_attr(trimmed, "protocol").unwrap_or_default();
            let state = String::new();
            let service = String::new();

            current_ports.push(NmapPort {
                port: port_num,
                protocol,
                state,
                service,
            });
        }

        if trimmed.contains("<state") && !current_ports.is_empty() {
            if let Some(state) = extract_attr(trimmed, "state") {
                if let Some(last) = current_ports.last_mut() {
                    last.state = state;
                }
            }
        }

        if trimmed.contains("<service") && !current_ports.is_empty() {
            if let Some(name) = extract_attr(trimmed, "name") {
                if let Some(last) = current_ports.last_mut() {
                    last.service = name;
                }
            }
        }

        if trimmed.contains("</host>") && !current_ip.is_empty() {
            hosts.push(NmapHost {
                ip: current_ip.clone(),
                hostname: current_hostname.clone(),
                ports: current_ports.clone(),
                status: current_status.clone(),
            });
        }
    }

    Ok(hosts)
}

fn extract_attr(line: &str, attr: &str) -> Option<String> {
    let pattern = format!("{}=\"", attr);
    line.find(&pattern).map(|start| {
        let value_start = start + pattern.len();
        let end = line[value_start..].find('"').unwrap_or(0) + value_start;
        line[value_start..end].to_string()
    })
}
