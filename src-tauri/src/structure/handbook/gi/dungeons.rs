use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use super::{category::Category, Language};
use crate::structure::handbook::commands::Command;

#[derive(Serialize)]
pub struct DungeonsResult {
    pub id: i64,
    pub name: HashMap<Language, String>,
    pub description: HashMap<Language, String>,
    pub category: Category,
    pub commands: Command,
}

pub type Dungeons = Vec<Dungeon>;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Dungeon {
    pub id: i64,
    pub name_text_map_hash: i64,
    pub desc_text_map_hash: i64,
}
