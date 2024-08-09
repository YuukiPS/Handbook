use std::collections::HashMap;

use super::{category::Category, commands::Command, Language};
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct Character {
    pub id: i64,
    pub name: HashMap<Language, String>,
    pub description: HashMap<Language, String>,
    pub image: String,
    pub category: Category,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rarity: Option<u8>,
    pub commands: Command,
}

pub type CharactersList = Vec<Characters>;

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Characters {
    pub icon_name: String,
    pub quality_type: String,
    pub desc_text_map_hash: i64,
    pub id: i64,
    pub name_text_map_hash: i64,
}
