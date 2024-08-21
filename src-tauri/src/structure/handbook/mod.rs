use serde::Serialize;

pub mod category;
pub mod commands;
pub mod gi;
pub mod sr;

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
    DE,
    ES,
    IT,
    KR,
    PT,
    TR,
    VI,
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
            Language::DE => write!(f, "de"),
            Language::ES => write!(f, "es"),
            Language::IT => write!(f, "it"),
            Language::KR => write!(f, "kr"),
            Language::PT => write!(f, "pt"),
            Language::TR => write!(f, "tr"),
            Language::VI => write!(f, "vi"),
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
            "DE" => Ok(Language::DE),
            "ES" => Ok(Language::ES),
            "IT" => Ok(Language::IT),
            "KR" => Ok(Language::KR),
            "PT" => Ok(Language::PT),
            "TR" => Ok(Language::TR),
            "VI" => Ok(Language::VI),
            _ => Err(format!("Unsupported language: {}", s)),
        }
    }
}
