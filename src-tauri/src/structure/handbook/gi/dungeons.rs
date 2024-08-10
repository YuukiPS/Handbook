use serde::{Deserialize, Serialize};

pub type Dungeons = Vec<Dungeon>;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Dungeon {
    pub id: i64,
    pub name_text_map_hash: i64,
    pub desc_text_map_hash: i64,
}
