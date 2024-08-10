use serde::{Deserialize, Serialize};

pub type Achievements = Vec<Achievement>;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Achievement {
    pub title_text_map_hash: i64,
    pub desc_text_map_hash: i64,
    pub id: i64,
}
