use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Serialize, Deserialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
    pub modified: Option<String>,
}

fn get_slimeshell_dir() -> PathBuf {
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join(".slimeshell")
}

fn ensure_dir(dir: &Path) {
    if !dir.exists() {
        let _ = fs::create_dir_all(dir);
    }
}

#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    let full_path = get_slimeshell_dir().join(&path);
    fs::read_to_string(&full_path).map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
pub fn write_file(path: String, content: String) -> Result<(), String> {
    let full_path = get_slimeshell_dir().join(&path);
    if let Some(parent) = full_path.parent() {
        ensure_dir(parent);
    }
    fs::write(&full_path, content).map_err(|e| format!("Failed to write file: {}", e))
}

#[tauri::command]
pub fn delete_file(path: String) -> Result<(), String> {
    let full_path = get_slimeshell_dir().join(&path);
    if full_path.is_dir() {
        fs::remove_dir_all(&full_path).map_err(|e| format!("Failed to delete directory: {}", e))
    } else {
        fs::remove_file(&full_path).map_err(|e| format!("Failed to delete file: {}", e))
    }
}

#[tauri::command]
pub fn list_dir(path: String) -> Result<Vec<FileEntry>, String> {
    let full_path = if path.is_empty() {
        get_slimeshell_dir()
    } else {
        get_slimeshell_dir().join(&path)
    };

    ensure_dir(&full_path);

    let entries = fs::read_dir(&full_path).map_err(|e| format!("Failed to read directory: {}", e))?;

    let mut files: Vec<FileEntry> = Vec::new();
    for entry in entries.flatten() {
        let metadata = entry.metadata().ok();
        let modified = metadata
            .as_ref()
            .and_then(|m| m.modified().ok())
            .map(|t| {
                let datetime: chrono::DateTime<chrono::Utc> = t.into();
                datetime.format("%Y-%m-%d %H:%M:%S").to_string()
            });

        files.push(FileEntry {
            name: entry.file_name().to_string_lossy().to_string(),
            path: entry.path().to_string_lossy().to_string(),
            is_dir: entry.file_type().map(|ft| ft.is_dir()).unwrap_or(false),
            size: metadata.as_ref().map(|m| m.len()).unwrap_or(0),
            modified,
        });
    }

    files.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(files)
}

#[tauri::command]
pub fn create_dir(path: String) -> Result<(), String> {
    let full_path = get_slimeshell_dir().join(&path);
    fs::create_dir_all(&full_path).map_err(|e| format!("Failed to create directory: {}", e))
}

#[tauri::command]
pub fn file_exists(path: String) -> bool {
    get_slimeshell_dir().join(&path).exists()
}
