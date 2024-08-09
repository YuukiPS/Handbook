use serde::Serialize;

pub mod achievement;
pub mod artifacts;
pub mod category;
pub mod characters;
pub mod commands;
pub mod dungeons;
pub mod main_quests;
pub mod materials;
pub mod monsters;
pub mod scenes;
pub mod weapons;

#[derive(Serialize, Debug, Clone, PartialEq, Eq, Hash)]
#[serde(rename_all = "UPPERCASE")]
pub enum Language {
    EN,
    FR,
    ID,
    JP,
    RU,
    TH,
    Chs,
    Cht,
}

impl std::fmt::Display for Language {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Language::EN => write!(f, "en"),
            Language::FR => write!(f, "fr"),
            Language::ID => write!(f, "id"),
            Language::JP => write!(f, "jp"),
            Language::RU => write!(f, "ru"),
            Language::TH => write!(f, "th"),
            Language::Chs => write!(f, "chs"),
            Language::Cht => write!(f, "cht"),
        }
    }
}

impl std::str::FromStr for Language {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_uppercase().as_str() {
            "EN" => Ok(Language::EN),
            "FR" => Ok(Language::FR),
            "ID" => Ok(Language::ID),
            "JP" => Ok(Language::JP),
            "RU" => Ok(Language::RU),
            "TH" => Ok(Language::TH),
            "CHS" => Ok(Language::Chs),
            "CHT" => Ok(Language::Cht),
            _ => Err(format!("Unsupported language: {}", s)),
        }
    }
}
