use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct MissionElement {
    #[serde(rename = "MainMissionID")]
    pub main_mission_id: i64,
    #[serde(rename = "Type")]
    pub mission_type: MissionType,
    pub name: Name,
    pub next_track_main_mission: Option<i64>,
}

#[derive(Serialize, Deserialize)]
pub enum MissionType {
    Branch,
    Companion,
    Daily,
    Gap,
    Main,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct Name {
    pub hash: i64,
}
