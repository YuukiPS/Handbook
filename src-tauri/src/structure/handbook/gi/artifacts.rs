use serde::{Deserialize, Serialize};

pub type Artifacts = Vec<Artifact>;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Artifact {
    pub rank_level: i64,
    pub id: i64,
    pub name_text_map_hash: i64,
    pub desc_text_map_hash: i64,
    pub icon: String,
}
