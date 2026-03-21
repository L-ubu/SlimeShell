use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct ShodanResult {
    pub ip: String,
    pub ports: Vec<u16>,
    pub hostnames: Vec<String>,
    pub org: Option<String>,
    pub os: Option<String>,
    pub data: Vec<ShodanService>,
}

#[derive(Serialize, Deserialize)]
pub struct ShodanService {
    pub port: u16,
    pub transport: String,
    pub product: Option<String>,
    pub version: Option<String>,
    pub banner: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct WhoisResult {
    pub domain: String,
    pub registrar: Option<String>,
    pub creation_date: Option<String>,
    pub expiration_date: Option<String>,
    pub nameservers: Vec<String>,
    pub status: Vec<String>,
    pub raw: String,
}

#[derive(Serialize, Deserialize)]
pub struct DnsRecord {
    pub record_type: String,
    pub name: String,
    pub value: String,
    pub ttl: Option<u32>,
}

#[tauri::command]
pub async fn shodan_search(query: String, api_key: String) -> Result<serde_json::Value, String> {
    let url = format!(
        "https://api.shodan.io/shodan/host/search?key={}&query={}",
        api_key,
        urlencoding::encode(&query)
    );

    let client = reqwest::Client::new();
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Shodan request failed: {}", e))?;

    let json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Shodan response: {}", e))?;

    Ok(json)
}

#[tauri::command]
pub async fn shodan_host(ip: String, api_key: String) -> Result<serde_json::Value, String> {
    let url = format!("https://api.shodan.io/shodan/host/{}?key={}", ip, api_key);

    let client = reqwest::Client::new();
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Shodan request failed: {}", e))?;

    let json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Shodan response: {}", e))?;

    Ok(json)
}

#[tauri::command]
pub async fn whois_lookup(domain: String) -> Result<WhoisResult, String> {
    let output = tokio::process::Command::new("whois")
        .arg(&domain)
        .output()
        .await
        .map_err(|e| format!("WHOIS lookup failed: {}", e))?;

    let raw = String::from_utf8_lossy(&output.stdout).to_string();

    let mut result = WhoisResult {
        domain: domain.clone(),
        registrar: None,
        creation_date: None,
        expiration_date: None,
        nameservers: Vec::new(),
        status: Vec::new(),
        raw: raw.clone(),
    };

    for line in raw.lines() {
        let line_lower = line.to_lowercase();
        if line_lower.starts_with("registrar:") {
            result.registrar = Some(line.split(':').skip(1).collect::<Vec<_>>().join(":").trim().to_string());
        } else if line_lower.starts_with("creation date:") || line_lower.starts_with("created:") {
            result.creation_date = Some(line.split(':').skip(1).collect::<Vec<_>>().join(":").trim().to_string());
        } else if line_lower.starts_with("registry expiry date:") || line_lower.starts_with("expiry date:") {
            result.expiration_date = Some(line.split(':').skip(1).collect::<Vec<_>>().join(":").trim().to_string());
        } else if line_lower.starts_with("name server:") || line_lower.starts_with("nserver:") {
            let ns = line.split(':').skip(1).collect::<Vec<_>>().join(":").trim().to_string();
            if !ns.is_empty() {
                result.nameservers.push(ns);
            }
        } else if line_lower.starts_with("domain status:") || line_lower.starts_with("status:") {
            let status = line.split(':').skip(1).collect::<Vec<_>>().join(":").trim().to_string();
            if !status.is_empty() {
                result.status.push(status);
            }
        }
    }

    Ok(result)
}

#[tauri::command]
pub async fn dns_enum(domain: String) -> Result<Vec<DnsRecord>, String> {
    let mut records = Vec::new();

    for record_type in &["A", "AAAA", "MX", "NS", "TXT", "CNAME"] {
        let output = tokio::process::Command::new("dig")
            .args([domain.as_str(), *record_type, "+short"])
            .output()
            .await
            .map_err(|e| format!("DNS lookup failed: {}", e))?;

        let stdout = String::from_utf8_lossy(&output.stdout);
        for line in stdout.lines() {
            let value = line.trim().to_string();
            if !value.is_empty() {
                records.push(DnsRecord {
                    record_type: record_type.to_string(),
                    name: domain.clone(),
                    value,
                    ttl: None,
                });
            }
        }
    }

    Ok(records)
}

mod urlencoding {
    pub fn encode(s: &str) -> String {
        let mut result = String::new();
        for byte in s.bytes() {
            match byte {
                b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                    result.push(byte as char);
                }
                _ => {
                    result.push_str(&format!("%{:02X}", byte));
                }
            }
        }
        result
    }
}
