use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Types {
    pub name: String,
    pub version: String,
    pub author: String,
    pub data: Vec<Datum>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Datum {
    pub id: i64,
    pub name: NameClass,
    pub image: Option<ImageUnion>,
    pub rarity: Option<i64>,
    pub base_type: Option<BaseType>,
    pub damage_type: Option<DamageType>,
    pub command: Command,
    pub category: Category,
    pub description: Option<NameClass>,
    pub next_mission: Option<i64>,
    #[serde(rename = "type")]
    pub datum_type: Option<Type>,
}

#[derive(Serialize, Deserialize)]
pub enum BaseType {
    Knight,
    Mage,
    Priest,
    Rogue,
    Shaman,
    Warlock,
    Warrior,
}

#[derive(Serialize, Deserialize)]
pub enum Category {
    Avatars,
    Items,
    #[serde(rename = "Light Cones")]
    LightCones,
    Missions,
    Monsters,
    Props,
    Relics,
}

#[derive(Serialize, Deserialize)]
pub struct Command {
    pub command_1: Command1Class,
    pub command_2: Option<Command1Class>,
    pub command_3: Option<Command1Class>,
    pub command_4: Option<Command1Class>,
    pub command_5: Option<Command1Class>,
    pub command_6: Option<Command1Class>,
}

#[derive(Serialize, Deserialize)]
pub struct Command1Class {
    pub name: NameEnum,
    pub value: String,
}

#[derive(Serialize, Deserialize)]
pub enum NameEnum {
    #[serde(rename = "With level")]
    NameWithLevel,
    Normal,
    #[serde(rename = "With Amount")]
    WithAmount,
    #[serde(rename = "With Amount, Level, and Superimposition")]
    WithAmountLevelAndSuperimposition,
    #[serde(rename = "With Ascension")]
    WithAscension,
    #[serde(rename = "With Eidolon")]
    WithEidolon,
    #[serde(rename = "With Level")]
    WithLevel,
    #[serde(rename = "With Level, Amount, Rank, and Promotion")]
    WithLevelAmountRankAndPromotion,
    #[serde(rename = "With Level, Ascension, Eidolon, and Skill level")]
    WithLevelAscensionEidolonAndSkillLevel,
    #[serde(rename = "With Promotion")]
    WithPromotion,
    #[serde(rename = "With Rank")]
    WithRank,
    #[serde(rename = "With Skill Level")]
    WithSkillLevel,
    #[serde(rename = "With Staged ID")]
    WithStagedId,
    #[serde(rename = "With Superimposition")]
    WithSuperimposition,
}

#[derive(Serialize, Deserialize)]
pub enum DamageType {
    Fire,
    Ice,
    Imaginary,
    Physical,
    Quantum,
    Thunder,
    Wind,
}

#[derive(Serialize, Deserialize)]
pub enum Type {
    Branch,
    Companion,
    Daily,
    Gap,
    Main,
}

#[derive(Serialize, Deserialize)]
pub struct NameClass {
    pub en: Option<String>,
    pub id: Option<String>,
    pub jp: Option<String>,
    pub ru: Option<String>,
    pub th: Option<String>,
    pub chs: Option<String>,
    pub cht: Option<String>,
    pub fr: Option<String>,
}

#[derive(Serialize, Deserialize)]
#[serde(untagged)]
pub enum ImageUnion {
    ImageClass(ImageClass),
    String(String),
}

#[derive(Serialize, Deserialize)]
pub struct ImageClass {
    pub icon: String,
    pub card: String,
}
