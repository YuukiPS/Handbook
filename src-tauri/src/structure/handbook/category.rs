use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub enum Category {
    Characters,
    Materials,
    Weapons,
    Artifacts,
    Achievements,
    Quests,
    Dungeons,
    Scenes,
    Monsters,
    Items,
    #[serde(rename = "Light Cones")]
    LightCones,
    Relics,
}
