use serde::{Deserialize, Serialize};

pub type Scenes = Vec<Scene>;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Scene {
    pub id: i64,
    #[serde(rename = "type")]
    pub scene_type: SceneType,
    pub script_data: String,
}

#[derive(Serialize, Deserialize, Clone, PartialEq, Eq, Debug)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum SceneType {
    #[serde(rename = "SCENE_DUNGEON")]
    Dungeon,
    #[serde(rename = "SCENE_HOME_ROOM")]
    HomeRoom,
    #[serde(rename = "SCENE_HOME_WORLD")]
    HomeWorld,
    #[serde(rename = "SCENE_ROOM")]
    Room,
    #[serde(rename = "SCENE_WORLD")]
    World,
}
