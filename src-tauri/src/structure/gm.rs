use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fmt;
use std::fmt::Formatter;
use std::str::FromStr;
pub type Gmhandbook = Vec<GmhandbookElement>;

#[derive(Serialize, Deserialize, Clone)]
pub struct GmhandbookElement {
    pub id: i64,
    pub name: NameUnion,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<HashMap<String, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub image: Option<String>,
    pub category: Category,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rarity: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub commands: Option<Commands>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
    #[serde(rename = "type")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub gmhandbook_type: Option<Type>,
}

#[derive(Serialize, Deserialize, Clone, PartialEq, Eq, Hash)]
pub enum Category {
    Achievements,
    Artifacts,
    Characters,
    Dungeons,
    Materials,
    Monsters,
    Quests,
    Scenes,
    Weapons,
    Avatars,
    Items,
    #[serde(rename = "Props (Spawnable)")]
    PropsLC,
    #[serde(rename = "NPC Monsters (Spawnable)")]
    NPCMonstersLC,
    #[serde(rename = "Battle Stages")]
    BattleStages,
    #[serde(rename = "Battle Monsters")]
    BattleMonsters,
    Mazes,
    Gadgets,
    Unknown,
}

impl fmt::Display for Category {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        let category_str = match self {
            Category::Achievements => "Achievements",
            Category::Artifacts => "Artifacts",
            Category::Characters => "Characters",
            Category::Avatars => "Characters",
            Category::Dungeons => "Dungeons",
            Category::Materials => "Materials",
            Category::Monsters => "Monsters",
            Category::Quests => "Quests",
            Category::Scenes => "Scenes",
            Category::Weapons => "Weapons",
            Category::Items => "Items",
            Category::PropsLC => "Props (Spawnable)",
            Category::NPCMonstersLC => "NPC Monsters (Spawnable)",
            Category::BattleStages => "Battle Stages",
            Category::BattleMonsters => "Battle Monsters",
            Category::Mazes => "Mazes",
            Category::Gadgets => "Gadgets",
            Category::Unknown => "Unknown",
        };
        write!(f, "{}", category_str)
    }
}

impl FromStr for Category {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Achievements" => Ok(Category::Achievements),
            "Artifacts" => Ok(Category::Artifacts),
            "Characters" => Ok(Category::Characters),
            "Avatars" => Ok(Category::Avatars),
            "Dungeons" => Ok(Category::Dungeons),
            "Materials" => Ok(Category::Materials),
            "Monsters" => Ok(Category::Monsters),
            "Quests" => Ok(Category::Quests),
            "Scenes" => Ok(Category::Scenes),
            "Weapons" => Ok(Category::Weapons),
            "Items" => Ok(Category::Items),
            "Props (Spawnable)" => Ok(Category::PropsLC),
            "NPC Monsters (Spawnable)" => Ok(Category::NPCMonstersLC),
            "Battle Stages" => Ok(Category::BattleStages),
            "Battle Monsters" => Ok(Category::BattleMonsters),
            "Mazes" => Ok(Category::Mazes),
            "Gadgets" => Ok(Category::Gadgets),
            _ => Err(()),
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Commands {
    // pub gc: GcCommand,
    pub gc: HashMap<String, Command>,
    pub gio: HashMap<String, Command>,
}

// #[derive(Serialize, Deserialize, Clone)]
// pub struct GcCommand {
//     pub command_1: Command,
//     #[serde(skip_serializing_if = "Option::is_none")]
//     pub command_2: Option<Command>,
//     #[serde(skip_serializing_if = "Option::is_none")]
//     pub command_3: Option<Command>,
//     #[serde(skip_serializing_if = "Option::is_none")]
//     pub command_4: Option<Command>,
//     #[serde(skip_serializing_if = "Option::is_none")]
//     pub command_5: Option<Command>,
// }

// #[derive(Serialize, Deserialize, Clone)]
// pub struct GioCommand {
//     pub command_1: Command,
//     #[serde(skip_serializing_if = "Option::is_none")]
//     pub command_2: Option<Command>,
//     #[serde(skip_serializing_if = "Option::is_none")]
//     pub command_3: Option<Command>,
// }

#[derive(Serialize, Deserialize, Clone)]
pub struct Command {
    pub name: String,
    pub command: String,
}

// #[derive(Serialize, Deserialize, Clone)]
// pub enum NameEnum {
//     #[serde(rename = "Add Quest")]
//     AddQuest,
//     Normal,
//     #[serde(rename = "Remove Quest")]
//     RemoveQuest,
//     #[serde(rename = "Start Quest")]
//     StartQuest,
//     #[serde(rename = "With Amount")]
//     WithAmount,
//     #[serde(rename = "With Constellation")]
//     WithConstellation,
//     #[serde(rename = "With Custom HP")]
//     WithCustomHp,
//     #[serde(rename = "With Custom HP, Level, and Amount")]
//     WithCustomHpLevelAndAmount,
//     #[serde(rename = "With Custom Level")]
//     WithCustomLevel,
//     #[serde(rename = "With Level")]
//     WithLevel,
//     #[serde(rename = "With Level, Constellation, and Skill Level")]
//     WithLevelConstellationAndSkillLevel,
//     #[serde(rename = "With Level, Refinement, and Amount")]
//     WithLevelRefinementAndAmount,
//     #[serde(rename = "With Refinement")]
//     WithRefinement,
//     #[serde(rename = "With Skill Level")]
//     WithSkillLevel,
//     #[serde(rename = "Not Available")]
//     NotAvailable,
//     #[serde(rename = "Accept Quest")]
//     AcceptQuest,
//     #[serde(rename = "Finish Quest")]
//     FinishQuest,
// }

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub struct Description {
    pub jp: String,
    pub id: String,
    pub cht: String,
    pub th: String,
    pub fr: String,
    pub ru: String,
    pub en: String,
    pub chs: String,
}

impl fmt::Display for Description {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.en)
    }
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum Type {
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

#[derive(Serialize, Deserialize, Clone)]
#[serde(untagged)]
pub enum NameUnion {
    Description(HashMap<String, String>),
    String(String),
    // Object(serde_json::Value),
}
