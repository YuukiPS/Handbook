use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use super::{category::Category, commands::Command, Language};

#[derive(Serialize)]
pub struct WeaponResult {
    pub id: i64,
    pub name: HashMap<Language, String>,
    pub description: HashMap<Language, String>,
    pub icon: String,
    pub rarity: i64,
    pub category: Category,
    pub commands: Command,
}

pub type Weapons = Vec<Weapon>;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Weapon {
    pub rank_level: i64,
    pub id: i64,
    pub name_text_map_hash: i64,
    pub desc_text_map_hash: i64,
    pub icon: String,
}
