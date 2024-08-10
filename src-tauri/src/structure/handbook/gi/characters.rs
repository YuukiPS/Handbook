use serde::{Deserialize, Serialize};

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Characters {
    pub icon_name: String,
    pub quality_type: String,
    pub desc_text_map_hash: i64,
    pub id: i64,
    pub name_text_map_hash: i64,
}
