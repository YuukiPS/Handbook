use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Characters {
    pub icon_name: String,
    pub quality_type: QualityType,
    pub desc_text_map_hash: i64,
    pub id: i64,
    pub name_text_map_hash: i64,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum QualityType {
    QualityOrange,
    QualityPurple,
    #[serde(rename = "QUALITY_ORANGE_SP")]
    QualityOrangeSP,
}

impl std::fmt::Display for QualityType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            QualityType::QualityOrange | QualityType::QualityOrangeSP => write!(f, "5"),
            QualityType::QualityPurple => write!(f, "4"),
        }
    }
}
