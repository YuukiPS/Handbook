use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MainQuest {
    pub id: i64,
    pub title_text_map_hash: i64,
    pub desc_text_map_hash: i64,
}
