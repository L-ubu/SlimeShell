use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Ctf {
    pub id: String,
    pub name: String,
    pub platform: String,
    pub url: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub status: String,
    pub score: i64,
    pub rank: Option<i64>,
    pub notes: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Challenge {
    pub id: String,
    pub ctf_id: String,
    pub name: String,
    pub category: String,
    pub difficulty: Option<String>,
    pub points: i64,
    pub status: String,
    pub flag: Option<String>,
    pub time_spent: i64,
    pub solver: Option<String>,
    pub notes: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Script {
    pub id: String,
    pub filename: String,
    pub language: String,
    pub description: Option<String>,
    pub tags: Vec<String>,
    pub run_count: i64,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Writeup {
    pub id: String,
    pub title: String,
    pub ctf_name: Option<String>,
    pub challenge_name: Option<String>,
    pub category: Option<String>,
    pub difficulty: Option<String>,
    pub tags: Vec<String>,
    pub published: bool,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Payload {
    pub id: String,
    pub title: String,
    pub category: String,
    pub payload: String,
    pub description: Option<String>,
    pub tags: Vec<String>,
    pub copy_count: i64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Profile {
    pub username: String,
    pub level: i64,
    pub xp: i64,
    pub flags_captured: i64,
    pub ctfs_completed: i64,
    pub writeups_written: i64,
    pub scripts_saved: i64,
    pub joined_date: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Bookmark {
    pub id: String,
    pub url: String,
    pub title: String,
    pub description: Option<String>,
    pub favicon: Option<String>,
    pub tags: Vec<String>,
    pub folder: Option<String>,
    pub created_at: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub tags: Vec<String>,
    pub linked_ctf: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}
