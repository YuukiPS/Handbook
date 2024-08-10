pub mod achievements;
pub mod artifacts;
pub mod characters;
pub mod commands;
pub mod dungeons;
// pub mod handbook;
pub mod materials;
pub mod monsters;
pub mod quests;
pub mod scenes;
pub mod weapons;

use std::{
    fmt::{self, Formatter},
    fs,
    path::Path,
    str::FromStr,
};

use serde::{de::DeserializeOwned, Deserialize, Serialize};
use tauri::Emitter;

use crate::{
    structure::handbook::Language,
    utility::{format_file_size, read_excel_bin_output, read_text_map, Logger, TextMapError},
};

use self::{
    achievements::{generate_achievements, AchievementResult},
    artifacts::{generate_artifacts, ArtifactResult},
    characters::{generate_character, CharacterResult},
    dungeons::{generate_dungeons, DungeonsResult},
    materials::{generate_materials, MaterialsResult},
    monsters::{generate_monsters, MonstersResult},
    quests::{generate_quests, MainQuestResult},
    scenes::{generate_scenes, ScenesResult},
    weapons::{generate_weapons, WeaponResult},
};

#[derive(Serialize)]
#[serde(untagged)]
pub(crate) enum ResultData {
    Characters(CharacterResult),
    Materials(MaterialsResult),
    Weapons(WeaponResult),
    Artifacts(ArtifactResult),
    Achievements(AchievementResult),
    Quests(MainQuestResult),
    Dungeons(DungeonsResult),
    Scenes(ScenesResult),
    Monsters(MonstersResult),
}

#[derive(Serialize, Deserialize, Clone)]
struct OutputEmit {
    log_level: String,
    message: String,
}

pub fn output_log(app_handle: &tauri::AppHandle, log_level: &str, message: &str) {
    let _ = app_handle.emit(
        "handbook",
        OutputEmit {
            log_level: log_level.to_string(),
            message: message.to_string(),
        },
    );
    match log_level {
        "info" => Logger::info(message),
        "warn" => Logger::warn(message),
        _ => {}
    }
}

pub enum GameExcelReader {
    GenshinImpact(GenshinImpactExcelReader),
    StarRail(StarRailExcelReader),
}

impl GameExcelReader {
    pub fn read_excel_data<T: DeserializeOwned>(
        &self,
        resources: &str,
        file_name: &str,
    ) -> Result<Vec<T>, TextMapError> {
        match self {
            GameExcelReader::GenshinImpact(reader) => {
                reader.read_excel_data::<T>(resources, file_name)
            }
            GameExcelReader::StarRail(reader) => reader.read_excel_data::<T>(resources, file_name),
        }
    }
}

pub struct GenshinImpactExcelReader;
pub struct StarRailExcelReader;

impl GenshinImpactExcelReader {
    pub fn read_excel_data<T: DeserializeOwned>(
        &self,
        resources: &str,
        file_name: &str,
    ) -> Result<Vec<T>, TextMapError> {
        read_excel_bin_output(resources, file_name)
    }
}

impl StarRailExcelReader {
    pub fn read_excel_data<T: DeserializeOwned>(
        &self,
        resources: &str,
        file_name: &str,
    ) -> Result<Vec<T>, TextMapError> {
        read_excel_bin_output(resources, file_name)
    }
}

#[derive(Debug)]
pub enum GameTypeFandom {
    GenshinImpact,
    StarRail,
}

impl fmt::Display for GameTypeFandom {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self {
            GameTypeFandom::GenshinImpact => write!(f, "genshin-impact"),
            GameTypeFandom::StarRail => write!(f, "star-rail"),
        }
    }
}

impl FromStr for GameTypeFandom {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "genshin-impact" => Ok(GameTypeFandom::GenshinImpact),
            "star-rail" => Ok(GameTypeFandom::StarRail),
            _ => Err(s.to_string()),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum SelectHandbookArgs {
    Characters,
    Materials,
    Weapons,
    Artifacts,
    Achievements,
    Quests,
    Dungeons,
    Scenes,
    Monsters,
}

impl fmt::Display for SelectHandbookArgs {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self {
            SelectHandbookArgs::Characters => write!(f, "characters"),
            SelectHandbookArgs::Materials => write!(f, "materials"),
            SelectHandbookArgs::Weapons => write!(f, "weapons"),
            SelectHandbookArgs::Artifacts => write!(f, "artifacts"),
            SelectHandbookArgs::Achievements => write!(f, "achievements"),
            SelectHandbookArgs::Quests => write!(f, "quests"),
            SelectHandbookArgs::Dungeons => write!(f, "dungeons"),
            SelectHandbookArgs::Scenes => write!(f, "scenes"),
            SelectHandbookArgs::Monsters => write!(f, "monsters"),
        }
    }
}

impl FromStr for SelectHandbookArgs {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "achievements" => Ok(SelectHandbookArgs::Achievements),
            "characters" => Ok(SelectHandbookArgs::Characters),
            "materials" => Ok(SelectHandbookArgs::Materials),
            "weapons" => Ok(SelectHandbookArgs::Weapons),
            "artifacts" => Ok(SelectHandbookArgs::Artifacts),
            "quests" => Ok(SelectHandbookArgs::Quests),
            "dungeons" => Ok(SelectHandbookArgs::Dungeons),
            "scenes" => Ok(SelectHandbookArgs::Scenes),
            "monsters" => Ok(SelectHandbookArgs::Monsters),
            _ => Err(s.to_string()),
        }
    }
}

pub trait AllVariants {
    fn all() -> Vec<Self>
    where
        Self: Sized;
}

impl AllVariants for SelectHandbookArgs {
    fn all() -> Vec<Self> {
        vec![
            SelectHandbookArgs::Characters,
            SelectHandbookArgs::Materials,
            SelectHandbookArgs::Weapons,
            SelectHandbookArgs::Artifacts,
            SelectHandbookArgs::Achievements,
            SelectHandbookArgs::Quests,
            SelectHandbookArgs::Dungeons,
            SelectHandbookArgs::Scenes,
            SelectHandbookArgs::Monsters,
        ]
    }
}

impl AllVariants for GameTypeFandom {
    fn all() -> Vec<Self> {
        vec![GameTypeFandom::StarRail, GameTypeFandom::GenshinImpact]
    }
}

impl AllVariants for Language {
    fn all() -> Vec<Self> {
        vec![
            Language::EN,
            Language::FR,
            Language::ID,
            Language::JP,
            Language::RU,
            Language::TH,
            Language::Chs,
            Language::Cht,
        ]
    }
}

fn parse_selections<T>(args: &Option<Vec<String>>) -> Result<Vec<T>, String>
where
    T: FromStr + fmt::Debug + fmt::Display + AllVariants,
    T::Err: fmt::Display + fmt::Debug,
{
    match args {
        Some(select_args) if !select_args.is_empty() => {
            let (valid_selections, invalid_selections): (Vec<_>, Vec<_>) = select_args
                .iter()
                .map(|s| s.parse::<T>())
                .partition(Result::is_ok);

            let valid_selections: Vec<T> =
                valid_selections.into_iter().map(Result::unwrap).collect();
            let invalid_selections: Vec<String> = invalid_selections
                .into_iter()
                .map(|e| e.unwrap_err().to_string())
                .collect();

            if !invalid_selections.is_empty() {
                let available = T::all()
                    .iter()
                    .map(|arg| arg.to_string())
                    .collect::<Vec<_>>()
                    .join(", ");

                let mut error_message = format!(
                    "Error: Invalid selections: {}. Available selections are: {}",
                    invalid_selections.join(", "),
                    available
                );

                if !valid_selections.is_empty() {
                    error_message.push_str(&format!(" Valid selections: {:?}", valid_selections));
                }

                Err(error_message)
            } else {
                Ok(valid_selections)
            }
        }
        _ => Ok(T::all()),
    }
}

// TODO: Change or remove this to use from the user input provide for the path of the images
pub static PATH_IMAGE: &str = "./src/images/";
pub static URL_IMAGE: &str = "https://api.elaxan.com/images/";

fn get_image(game: &str, name: &str, type_image: &str) -> String {
    let path = format!("{}{}/{}/{}.png", PATH_IMAGE, game, type_image, name);
    if Path::new(&path).exists() {
        format!("{}{}/{}/{}.png", URL_IMAGE, game, type_image, name)
    } else {
        format!("{}{}/not-found.png", URL_IMAGE, game)
    }
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateHandbookArgs<'a> {
    excel_path: &'a str,
    text_map_path: &'a str,
    output_path: &'a str,
    output_file_name: &'a str,
}

#[tauri::command(async)]
pub fn generate_handbook(
    app_handle: tauri::AppHandle,
    args: GenerateHandbookArgs,
    game: &str,
    selections: Option<Vec<String>>,
    languages: Option<Vec<String>>,
) -> Result<String, String> {
    // Validate paths
    if !Path::new(args.excel_path).exists() || !Path::new(args.text_map_path).exists() {
        return Err(format!(
            "Invalid path: {} or {} does not exist",
            args.excel_path, args.text_map_path
        ));
    }

    let parsed_selections = parse_selections::<SelectHandbookArgs>(&selections)?;
    let parsed_languages = parse_selections::<Language>(&languages)?;
    let start = std::time::Instant::now();
    let excel_reader = match game {
        "genshin-impact" => GameExcelReader::GenshinImpact(GenshinImpactExcelReader),
        "star-rail" => GameExcelReader::StarRail(StarRailExcelReader),
        _ => return Err("Unsupported game".to_string()),
    };
    let mut result = Vec::new();

    for lang in &parsed_languages {
        output_log(
            &app_handle,
            "info",
            &format!("Reading TextMap{}.json", lang.to_string().to_uppercase()),
        );
        let text_map =
            read_text_map(args.text_map_path, &lang.to_string()).map_err(|e| e.to_string())?;

        for selection in &parsed_selections {
            let generate_result = match selection {
                SelectHandbookArgs::Characters => generate_character(
                    &app_handle,
                    args.excel_path,
                    lang,
                    &text_map,
                    &mut result,
                    &excel_reader,
                    get_image,
                ),
                SelectHandbookArgs::Materials => generate_materials(
                    &app_handle,
                    args.excel_path,
                    lang,
                    &text_map,
                    &mut result,
                    &excel_reader,
                    get_image,
                ),
                SelectHandbookArgs::Weapons => generate_weapons(
                    &app_handle,
                    args.excel_path,
                    lang,
                    &text_map,
                    &mut result,
                    &excel_reader,
                    get_image,
                ),
                SelectHandbookArgs::Artifacts => generate_artifacts(
                    &app_handle,
                    args.excel_path,
                    lang,
                    &text_map,
                    &mut result,
                    &excel_reader,
                    get_image,
                ),
                SelectHandbookArgs::Achievements => generate_achievements(
                    &app_handle,
                    &args.excel_path.to_string(),
                    lang,
                    &text_map,
                    &mut result,
                    read_excel_bin_output,
                ),
                SelectHandbookArgs::Quests => generate_quests(
                    &app_handle,
                    args.excel_path,
                    lang,
                    &text_map,
                    &mut result,
                    &excel_reader,
                ),
                SelectHandbookArgs::Dungeons => generate_dungeons(
                    &app_handle,
                    &args.excel_path.to_string(),
                    lang,
                    &text_map,
                    &mut result,
                    read_excel_bin_output,
                ),
                SelectHandbookArgs::Scenes => generate_scenes(
                    &app_handle,
                    &args.excel_path.to_string(),
                    &mut result,
                    read_excel_bin_output,
                ),
                SelectHandbookArgs::Monsters => generate_monsters(
                    &app_handle,
                    args.excel_path,
                    lang,
                    &text_map,
                    &mut result,
                    &excel_reader,
                    get_image,
                ),
            };
            generate_result?;
        }
    }

    output_log(
        &app_handle,
        "info",
        &format!("Total all added: {}", result.len()),
    );

    let json = serde_json::to_string_pretty(&result).unwrap();
    let output_path = Path::new(args.output_path).join(args.output_file_name);
    fs::write(&output_path, &json).map_err(|e| e.to_string())?;

    let duration = start.elapsed();
    let metadata = fs::metadata(&output_path).map_err(|e| e.to_string())?;
    let size = format_file_size(metadata.len());

    output_log(
        &app_handle,
        "info",
        &format!("Writing to {}", output_path.display()),
    );
    output_log(
        &app_handle,
        "info",
        &format!("Total time: {:?}, Size: {}", duration, size),
    );

    Ok("Success".to_string())
}
