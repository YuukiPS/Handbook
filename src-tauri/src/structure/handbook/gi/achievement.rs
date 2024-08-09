use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use super::{category::Category, Language};
use crate::structure::handbook::commands::Command;

#[derive(Serialize)]
pub struct AchievementResult {
    pub id: i64,
    pub name: HashMap<Language, String>,
    pub description: HashMap<Language, String>,
    pub commands: Command,
    pub category: Category,
}

pub type Achievements = Vec<Achievement>;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Achievement {
    pub title_text_map_hash: i64,
    pub desc_text_map_hash: i64,
    pub id: i64,
}
