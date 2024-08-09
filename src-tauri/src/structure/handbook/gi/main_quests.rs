use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use super::{category::Category, Language};
use crate::structure::handbook::commands::Command;

#[derive(Serialize)]
pub struct MainQuestResult {
    pub id: i64,
    pub name: HashMap<Language, String>,
    pub description: HashMap<Language, String>,
    pub category: Category,
    pub commands: Command,
}

pub type MainQuests = Vec<MainQuest>;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MainQuest {
    pub id: i64,
    pub title_text_map_hash: i64,
    pub desc_text_map_hash: i64,
}
