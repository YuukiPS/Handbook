use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use super::{category::Category, commands::Command, Language};

#[derive(Serialize)]
pub struct MaterialsResult {
    pub id: i64,
    pub name: HashMap<Language, String>,
    pub description: HashMap<Language, String>,
    pub image: String,
    pub category: Category,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rarity: Option<i64>,
    pub commands: Command,
}

pub type Materials = Vec<Material>;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Material {
    pub rank_level: Option<i64>,
    pub id: i64,
    pub name_text_map_hash: i64,
    pub desc_text_map_hash: i64,
    pub icon: String,
}
