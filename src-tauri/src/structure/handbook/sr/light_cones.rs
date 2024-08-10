use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct LightCones {
    #[serde(rename = "EquipmentID")]
    pub equipment_id: i64,
    pub equipment_name: Equipment,
    pub rarity: Rarity,
    pub image_path: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct Equipment {
    pub hash: i64,
}

#[derive(Serialize, Deserialize)]
pub enum Rarity {
    #[serde(rename = "CombatPowerLightconeRarity3")]
    CombatPowerLightconeRarity3,
    #[serde(rename = "CombatPowerLightconeRarity4")]
    CombatPowerLightconeRarity4,
    #[serde(rename = "CombatPowerLightconeRarity5")]
    CombatPowerLightconeRarity5,
}

impl std::fmt::Display for Rarity {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Rarity::CombatPowerLightconeRarity3 => write!(f, "3"),
            Rarity::CombatPowerLightconeRarity4 => write!(f, "4"),
            Rarity::CombatPowerLightconeRarity5 => write!(f, "5"),
        }
    }
}
