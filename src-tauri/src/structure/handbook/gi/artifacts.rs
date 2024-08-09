use super::{category::Category, commands::Command, Language};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize)]
pub struct ArtifactResult {
    pub id: i64,
    pub name: HashMap<Language, String>,
    pub description: HashMap<Language, String>,
    pub image: String,
    pub category: Category,
    pub rarity: i64,
    pub commands: Command,
}

pub type Artifacts = Vec<Artifact>;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Artifact {
    pub rank_level: i64,
    pub id: i64,
    pub name_text_map_hash: i64,
    pub desc_text_map_hash: i64,
    pub icon: String,
}
