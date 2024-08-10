use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct CharacterList {
    #[serde(rename = "AvatarID")]
    pub avatar_id: i64,
    pub avatar_name: Avatar,
    pub rarity: Rarity,
    pub damage_type: DamageType,
    pub default_avatar_head_icon_path: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct Avatar {
    pub hash: i64,
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
pub enum Rarity {
    #[serde(rename = "CombatPowerAvatarRarityType4")]
    CombatPowerAvatarRarityType4,
    #[serde(rename = "CombatPowerAvatarRarityType5")]
    CombatPowerAvatarRarityType5,
}

impl std::fmt::Display for Rarity {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{}",
            match self {
                Rarity::CombatPowerAvatarRarityType4 => "4",
                Rarity::CombatPowerAvatarRarityType5 => "5",
            }
        )
    }
}
