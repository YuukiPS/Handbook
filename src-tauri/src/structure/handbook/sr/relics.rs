use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct RelicElement {
    #[serde(rename = "ID")]
    pub id: i64,
    pub rarity: Rarity,
    pub item_name: Item,
    #[serde(rename = "ItemBGDesc")]
    pub item_bg_desc: Item,
    pub item_icon_path: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct Item {
    pub hash: i64,
}

#[derive(Serialize, Deserialize)]
pub enum Rarity {
    #[serde(rename = "NotNormal")]
    NotNormal,
    Rare,
    #[serde(rename = "SuperRare")]
    SuperRare,
    #[serde(rename = "VeryRare")]
    VeryRare,
}

impl std::fmt::Display for Rarity {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Rarity::NotNormal => write!(f, "2"),
            Rarity::Rare => write!(f, "3"),
            Rarity::VeryRare => write!(f, "4"),
            Rarity::SuperRare => write!(f, "5"),
        }
    }
}
