use rusqlite::{Connection, Result as SqlResult};
use std::path::PathBuf;
use std::sync::Mutex;

static DB: std::sync::LazyLock<Mutex<Connection>> = std::sync::LazyLock::new(|| {
    let path = get_db_path();
    if let Some(parent) = path.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    let conn = Connection::open(&path).expect("Failed to open database");
    run_migrations(&conn).expect("Failed to run migrations");
    Mutex::new(conn)
});

fn get_db_path() -> PathBuf {
    dirs::data_dir()
        .unwrap_or_else(|| dirs::home_dir().unwrap_or_else(|| PathBuf::from(".")))
        .join("slimeshell")
        .join("slimeshell.db")
}

fn run_migrations(conn: &Connection) -> SqlResult<()> {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS ctfs (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            platform TEXT NOT NULL,
            url TEXT,
            start_date TEXT,
            end_date TEXT,
            status TEXT DEFAULT 'upcoming',
            score INTEGER DEFAULT 0,
            rank INTEGER,
            notes TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS challenges (
            id TEXT PRIMARY KEY,
            ctf_id TEXT NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            difficulty TEXT,
            points INTEGER DEFAULT 0,
            status TEXT DEFAULT 'todo',
            flag TEXT,
            time_spent INTEGER DEFAULT 0,
            solver TEXT,
            notes TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (ctf_id) REFERENCES ctfs(id)
        );

        CREATE TABLE IF NOT EXISTS scripts (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            language TEXT NOT NULL,
            description TEXT,
            tags TEXT,
            run_count INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS writeups (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            ctf_name TEXT,
            challenge_name TEXT,
            category TEXT,
            difficulty TEXT,
            tags TEXT,
            published INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS payloads (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            payload TEXT NOT NULL,
            description TEXT,
            tags TEXT,
            copy_count INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS bookmarks (
            id TEXT PRIMARY KEY,
            url TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            favicon TEXT,
            tags TEXT,
            folder TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            tags TEXT,
            linked_ctf TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS profile (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            username TEXT DEFAULT 'MrGreenSlime',
            level INTEGER DEFAULT 1,
            xp INTEGER DEFAULT 0,
            flags_captured INTEGER DEFAULT 0,
            ctfs_completed INTEGER DEFAULT 0,
            writeups_written INTEGER DEFAULT 0,
            scripts_saved INTEGER DEFAULT 0,
            joined_date TEXT DEFAULT (datetime('now'))
        );

        INSERT OR IGNORE INTO profile (id) VALUES (1);

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS activity_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            details TEXT,
            xp_earned INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        );
        ",
    )?;
    Ok(())
}

pub fn with_db<F, R>(f: F) -> Result<R, String>
where
    F: FnOnce(&Connection) -> SqlResult<R>,
{
    let conn = DB.lock().map_err(|e| format!("Database lock error: {}", e))?;
    f(&conn).map_err(|e| format!("Database error: {}", e))
}

#[tauri::command]
pub fn get_ctfs(status: Option<String>) -> Result<serde_json::Value, String> {
    with_db(|conn| {
        let query = match &status {
            Some(_) => "SELECT id, name, platform, url, start_date, end_date, status, score, rank, notes FROM ctfs WHERE status = ?1 ORDER BY created_at DESC",
            None => "SELECT id, name, platform, url, start_date, end_date, status, score, rank, notes FROM ctfs ORDER BY created_at DESC",
        };
        let mut stmt = conn.prepare(query)?;

        let map_row = |row: &rusqlite::Row| -> rusqlite::Result<serde_json::Value> {
            Ok(serde_json::json!({
                "id": row.get::<_, String>(0)?,
                "name": row.get::<_, String>(1)?,
                "platform": row.get::<_, String>(2)?,
                "url": row.get::<_, Option<String>>(3)?,
                "startDate": row.get::<_, Option<String>>(4)?,
                "endDate": row.get::<_, Option<String>>(5)?,
                "status": row.get::<_, String>(6)?,
                "score": row.get::<_, i64>(7)?,
                "rank": row.get::<_, Option<i64>>(8)?,
                "notes": row.get::<_, Option<String>>(9)?,
            }))
        };

        let results: Vec<serde_json::Value> = match &status {
            Some(s) => stmt.query_map([s.as_str()], map_row)?.filter_map(|r| r.ok()).collect(),
            None => stmt.query_map([], map_row)?.filter_map(|r| r.ok()).collect(),
        };

        Ok(serde_json::json!(results))
    })
}

#[tauri::command]
pub fn save_ctf(ctf: serde_json::Value) -> Result<(), String> {
    with_db(|conn| {
        let generated_id = uuid::Uuid::new_v4().to_string();
        let id = ctf["id"].as_str().unwrap_or(&generated_id);
        conn.execute(
            "INSERT OR REPLACE INTO ctfs (id, name, platform, url, start_date, end_date, status, score, rank, notes, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, datetime('now'))",
            rusqlite::params![
                id,
                ctf["name"].as_str().unwrap_or(""),
                ctf["platform"].as_str().unwrap_or(""),
                ctf["url"].as_str(),
                ctf["startDate"].as_str(),
                ctf["endDate"].as_str(),
                ctf["status"].as_str().unwrap_or("upcoming"),
                ctf["score"].as_i64().unwrap_or(0),
                ctf["rank"].as_i64(),
                ctf["notes"].as_str(),
            ],
        )?;
        Ok(())
    })
}

#[tauri::command]
pub fn get_profile() -> Result<serde_json::Value, String> {
    with_db(|conn| {
        let mut stmt = conn.prepare(
            "SELECT username, level, xp, flags_captured, ctfs_completed, writeups_written, scripts_saved, joined_date FROM profile WHERE id = 1"
        )?;

        let result = stmt.query_row([], |row| {
            Ok(serde_json::json!({
                "username": row.get::<_, String>(0)?,
                "level": row.get::<_, i64>(1)?,
                "xp": row.get::<_, i64>(2)?,
                "flagsCaptured": row.get::<_, i64>(3)?,
                "ctfsCompleted": row.get::<_, i64>(4)?,
                "writeupsWritten": row.get::<_, i64>(5)?,
                "scriptsSaved": row.get::<_, i64>(6)?,
                "joinedDate": row.get::<_, String>(7)?,
            }))
        })?;

        Ok(result)
    })
}

#[tauri::command]
pub fn update_profile(data: serde_json::Value) -> Result<(), String> {
    with_db(|conn| {
        if let Some(username) = data["username"].as_str() {
            conn.execute("UPDATE profile SET username = ?1 WHERE id = 1", [username])?;
        }
        Ok(())
    })
}

#[tauri::command]
pub fn add_xp(amount: i64, action: String) -> Result<serde_json::Value, String> {
    with_db(|conn| {
        conn.execute(
            "UPDATE profile SET xp = xp + ?1 WHERE id = 1",
            [amount],
        )?;

        conn.execute(
            "INSERT INTO activity_log (action, xp_earned) VALUES (?1, ?2)",
            rusqlite::params![action, amount],
        )?;

        let mut stmt = conn.prepare("SELECT xp, level FROM profile WHERE id = 1")?;
        let (xp, current_level): (i64, i64) = stmt.query_row([], |row| {
            Ok((row.get(0)?, row.get(1)?))
        })?;

        let new_level = calculate_level(xp);
        if new_level != current_level {
            conn.execute("UPDATE profile SET level = ?1 WHERE id = 1", [new_level])?;
        }

        Ok(serde_json::json!({
            "xp": xp,
            "level": new_level,
            "leveledUp": new_level > current_level,
        }))
    })
}

fn calculate_level(xp: i64) -> i64 {
    match xp {
        0..=999 => 1,
        1000..=2999 => 2,
        3000..=5999 => 3,
        6000..=9999 => 4,
        10000..=14999 => 5,
        _ => 6 + ((xp - 15000) / 5000),
    }
}

#[tauri::command]
pub fn get_setting(key: String) -> Result<Option<String>, String> {
    with_db(|conn| {
        let mut stmt = conn.prepare("SELECT value FROM settings WHERE key = ?1")?;
        let result = stmt
            .query_row([&key], |row| row.get(0))
            .ok();
        Ok(result)
    })
}

#[tauri::command]
pub fn set_setting(key: String, value: String) -> Result<(), String> {
    with_db(|conn| {
        conn.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)",
            rusqlite::params![key, value],
        )?;
        Ok(())
    })
}
