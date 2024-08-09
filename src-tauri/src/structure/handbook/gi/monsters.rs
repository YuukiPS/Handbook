use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use super::{category::Category, commands::Command, Language};

#[derive(Serialize)]
pub struct MonstersResult {
    pub id: i64,
    pub name: HashMap<Language, String>,
    pub image: String,
    pub category: Category,
    pub commands: Command,
}

pub type Monsters = Vec<Monster>;

pub type MonsterDescribe = Vec<MonsterDescribeElement>;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Monster {
    pub describe_id: Option<i64>,
    pub id: i64,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MonsterDescribeElement {
    pub id: i64,
    pub name_text_map_hash: i64,
    pub icon: String,
}
