use serde::{Deserialize, Serialize};

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
