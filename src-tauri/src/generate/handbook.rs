use std::{
    collections::{BTreeMap, HashMap},
    fmt::{self, Formatter},
    fs,
    path::Path,
    str::FromStr,
};

use serde::{Deserialize, Serialize};
use tauri::Emitter;

use crate::{
    structure::handbook::commands::{Command, Commands},
    structure::handbook::gi::{
        achievement::{AchievementResult, Achievements},
        artifacts::{ArtifactResult, Artifacts},
        category::Category,
        characters::{Character, CharactersList},
        dungeons::{Dungeons, DungeonsResult},
        main_quests::{MainQuestResult, MainQuests},
        materials::{Materials, MaterialsResult},
        monsters::{MonsterDescribe, Monsters, MonstersResult},
        scenes::{Scenes, ScenesResult},
        weapons::{WeaponResult, Weapons},
        Language,
    },
    utility::{
        format_file_size, read_excel_bin_output, read_text_map, Logger, TextMap, TextMapError,
    },
};

// TODO: Change or remove this to use from the user input provide for the path of the images
pub static PATH_IMAGE: &str = "./src/images/";
pub static URL_IMAGE: &str = "https://api.elaxan.com/images/";

#[derive(Serialize)]
#[serde(untagged)]
pub(crate) enum ResultData {
    Characters(Character),
    Materials(MaterialsResult),
    Weapons(WeaponResult),
    Artifacts(ArtifactResult),
    Achievements(AchievementResult),
    Quests(MainQuestResult),
    Dungeons(DungeonsResult),
    Scenes(ScenesResult),
    Monsters(MonstersResult),
}

pub(crate) fn convert_rarity_to_number(rarity: &str) -> u8 {
    match rarity {
        "QUALITY_ORANGE" => 5,
        "QUALITY_PURPLE" => 4,
        _ => 0,
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

#[derive(Serialize, Deserialize, Clone)]
struct OutputEmit {
    log_level: String,
    message: String,
}

fn output_log(app_handle: &tauri::AppHandle, log_level: &str, message: &str) {
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

pub(crate) fn generate_command(category: Category, id: u32, prefix: &str) -> Command {
    let mut commands_map: BTreeMap<String, BTreeMap<String, Commands>> = BTreeMap::new();
    let mut commands_map_gc = BTreeMap::new();
    let mut commands_map_gio = BTreeMap::new();

    let commands_gc = match category {
        Category::Characters => vec![
            ("Normal", ""),
            ("With Level", "lv<level>"),
            ("With Constellation", "c<constellation>"),
            ("With Skill Level", "sl<SkillLevel>"),
            (
                "With Level, Constellation, and Skill Level",
                "lv<level> c<constellation> sl<SkillLevel>",
            ),
        ],
        Category::Materials => vec![("Normal", ""), ("With Amount", "x<amount>")],
        Category::Weapons => vec![
            ("Normal", ""),
            ("With Level", "lv<level>"),
            ("With Refinement", "r<refinement>"),
            ("With Amount", "x<amount>"),
            (
                "With Level, Refinement, and Amount",
                "lv<level> r<refinement> x<amount>",
            ),
        ],
        Category::Artifacts => vec![
            ("Normal", ""),
            ("With Level", "lv<level>"),
            ("With Amount", "x<amount>"),
            ("With Refinement", "r<refinement>"),
            (
                "With Level, Amount, and Refinement",
                "lv<level> x<amount> r<refinement>",
            ),
        ],
        Category::Achievements => vec![("Normal", "")],
        Category::Quests => vec![
            ("Add Quest", "add"),
            ("Remove Quest", "remove"),
            ("Start Quest", "start"),
        ],
        Category::Dungeons => vec![("Normal", "")],
        Category::Scenes => vec![("Normal", "")],
        Category::Monsters => vec![
            ("Normal", ""),
            ("With Custom HP", "hp<HealthPoint>"),
            ("With Custom Level", "lv<level>"),
            ("With Amount", "x<amount>"),
            (
                "With Custom HP, Level, and Amount",
                "hp<HealthPoint> lv<level> x<amount>",
            ),
        ],
    };

    let commands_gio = match category {
        Category::Characters => vec![("Normal", format!("avatar add {}", id))],
        Category::Artifacts => vec![
            ("Normal", format!("item add {}", id)),
            ("With Amount", format!("item add {} <amount>", id)),
        ],
        Category::Quests => vec![
            ("Add Quest", format!("quest add {}", id)),
            ("Accept Quest", format!("quest accept {}", id)),
            ("Finish Quest", format!("quest finish {}", id)),
        ],
        Category::Materials => vec![
            ("Normal", format!("item add {}", id)),
            ("With Amount", format!("item add {} <amount>", id)),
        ],
        Category::Achievements => vec![(
            "Not Available",
            "This category is not available for GIO".to_string(),
        )],
        Category::Scenes => vec![(
            "Not Available",
            "This category is not available for GIO".to_string(),
        )],
        Category::Dungeons => vec![(
            "Not Available",
            "This category is not available for GIO".to_string(),
        )],
        Category::Monsters => vec![(
            "Not Available",
            "This category is not available for GIO".to_string(),
        )],
        Category::Weapons => vec![
            ("Normal", format!("item add {}", id)),
            ("With Amount", format!("item add {} <amount>", id)),
        ],
    };

    for (i, (name, command_suffix)) in commands_gc.into_iter().enumerate() {
        let command = Commands {
            name: name.to_string(),
            command: match category {
                Category::Quests => format!("{} {} {}", prefix, command_suffix, id),
                Category::Dungeons | Category::Scenes => format!("{} 0 0 0 {}", prefix, id),
                _ => format!("{} {} {}", prefix, id, command_suffix.trim()),
            }
            .trim()
            .to_string(),
        };
        commands_map_gc.insert(format!("command_{}", i + 1), command);
    }

    for (i, (name, command_suffix)) in commands_gio.into_iter().enumerate() {
        let command = Commands {
            name: name.to_string(),
            command: command_suffix.trim().to_string(),
        };
        commands_map_gio.insert(format!("command_{}", i + 1), command);
    }

    commands_map.insert("gc".to_string(), commands_map_gc);
    commands_map.insert("gio".to_string(), commands_map_gio);

    commands_map
}

fn get_image(game: &str, name: &str, type_image: &str) -> String {
    let path = format!("{}{}/{}/{}.png", PATH_IMAGE, game, type_image, name);
    if Path::new(&path).exists() {
        format!("{}{}/{}/{}.png", URL_IMAGE, game, type_image, name)
    } else {
        format!("{}{}/not-found.png", URL_IMAGE, game)
    }
}

pub(crate) fn generate_character<F, G>(
    app_handle: &tauri::AppHandle,
    resources: &String,
    lang: &Language,
    text_map: &TextMap,
    result: &mut Vec<ResultData>,
    read_excel_bin_output: F,
    get_image: G,
) -> Result<(), String>
where
    F: Fn(&str, &str) -> Result<CharactersList, TextMapError>,
    G: Fn(&str, &str, &str) -> String,
{
    let character: CharactersList =
        match read_excel_bin_output(&resources.to_string(), "AvatarExcelConfigData") {
            Ok(data) => data,
            Err(e) => {
                let error_msg = format!("Failed to read Characters: {}", e);
                output_log(app_handle, "error", &error_msg);
                return Err(error_msg);
            }
        };
    let mut total_characters = 0;
    for character in character.iter() {
        if character.id == 10000001 || character.id > 11000000 {
            continue;
        }
        total_characters += 1;
        let name = text_map
            .get(&character.name_text_map_hash.to_string())
            .cloned();
        if name.is_none() {
            continue;
        }
        let desc = text_map
            .get(&character.desc_text_map_hash.to_string())
            .cloned();

        let command = generate_command(Category::Characters, character.id as u32, "/give");
        let image = get_image("genshin-impact", &character.icon_name, "characters");

        let character_result = result
            .iter_mut()
            .find(|r| matches!(r, ResultData::Characters(c) if c.id == character.id))
            .and_then(|r| {
                if let ResultData::Characters(c) = r {
                    Some(c)
                } else {
                    None
                }
            });

        if let Some(existing_character) = character_result {
            existing_character
                .name
                .insert(lang.clone(), name.unwrap_or_default());
            existing_character
                .description
                .insert(lang.clone(), desc.unwrap_or_default());
        } else {
            let mut names = HashMap::new();
            names.insert(lang.clone(), name.unwrap_or_default());
            let mut descriptions = HashMap::new();
            descriptions.insert(lang.clone(), desc.unwrap_or_default());

            result.push(ResultData::Characters(Character {
                id: character.id,
                name: names,
                description: descriptions,
                rarity: Some(convert_rarity_to_number(&character.quality_type)),
                image,
                category: Category::Characters,
                commands: command,
            }))
        }
    }
    output_log(
        app_handle,
        "info",
        &format!("Total Characters added: {}", total_characters),
    );
    drop(character);
    Ok(())
}

pub(crate) fn generate_materials<F, G>(
    app_handle: &tauri::AppHandle,
    resources: &String,
    lang: &Language,
    text_map: &TextMap,
    result: &mut Vec<ResultData>,
    read_excel_bin_output: F,
    get_image: G,
) -> Result<(), String>
where
    F: Fn(&str, &str) -> Result<Materials, TextMapError>,
    G: Fn(&str, &str, &str) -> String,
{
    let materials: Materials =
        match read_excel_bin_output(&resources.to_string(), "MaterialExcelConfigData") {
            Ok(data) => data,
            Err(e) => {
                let error_msg = format!("Failed to read Materials: {}", e);
                output_log(app_handle, "error", &error_msg);
                return Err(error_msg);
            }
        };
    let mut total_materials = 0;
    for material in materials.iter() {
        let name = text_map
            .get(&material.name_text_map_hash.to_string())
            .cloned();
        let desc = text_map
            .get(&material.desc_text_map_hash.to_string())
            .cloned();

        total_materials += 1;

        let command = generate_command(Category::Materials, material.id as u32, "/give");
        let image = get_image("genshin-impact", &material.icon, "materials");

        let material_result = result
            .iter_mut()
            .find(|r| matches!(r, ResultData::Materials(m) if m.id == material.id))
            .and_then(|r| {
                if let ResultData::Materials(m) = r {
                    Some(m)
                } else {
                    None
                }
            });

        if let Some(existing_material) = material_result {
            existing_material
                .name
                .insert(lang.clone(), name.unwrap_or_default());
            existing_material
                .description
                .insert(lang.clone(), desc.unwrap_or_default());
        } else {
            let mut names = HashMap::new();
            names.insert(lang.clone(), name.unwrap_or_default());
            let mut descriptions = HashMap::new();
            descriptions.insert(lang.clone(), desc.unwrap_or_default());
            result.push(ResultData::Materials(MaterialsResult {
                id: material.id,
                name: names,
                description: descriptions,
                rarity: material.rank_level,
                image,
                category: Category::Materials,
                commands: command,
            }))
        }
    }
    output_log(
        app_handle,
        "info",
        &format!("Total Materials added: {}", total_materials),
    );
    drop(materials);
    Ok(())
}

pub(crate) fn generate_weapons<F, G>(
    app_handle: &tauri::AppHandle,
    resources: &String,
    lang: &Language,
    text_map: &TextMap,
    result: &mut Vec<ResultData>,
    read_excel_bin_output: F,
    get_image: G,
) -> Result<(), String>
where
    F: Fn(&str, &str) -> Result<Weapons, TextMapError>,
    G: Fn(&str, &str, &str) -> String,
{
    let weapons: Weapons =
        match read_excel_bin_output(&resources.to_string(), "WeaponExcelConfigData") {
            Ok(data) => data,
            Err(e) => {
                let error_msg = format!("Failed to read Weapons: {}", e);
                output_log(app_handle, "error", &error_msg);
                return Err(error_msg);
            }
        };
    let mut total_weapons = 0;
    for weapon in weapons.iter() {
        total_weapons += 1;

        let name = text_map
            .get(&weapon.name_text_map_hash.to_string())
            .cloned();
        let desc = text_map
            .get(&weapon.desc_text_map_hash.to_string())
            .cloned();

        let command = generate_command(Category::Weapons, weapon.id as u32, "/give");
        let image = get_image("genshin-impact", &weapon.icon, "weapons");

        let weapon_result = result
            .iter_mut()
            .find(|r| matches!(r, ResultData::Weapons(w) if w.id == weapon.id))
            .and_then(|r| {
                if let ResultData::Weapons(w) = r {
                    Some(w)
                } else {
                    None
                }
            });

        if let Some(existing_weapon) = weapon_result {
            existing_weapon
                .name
                .insert(lang.clone(), name.unwrap_or_default());
            existing_weapon
                .description
                .insert(lang.clone(), desc.unwrap_or_default());
        } else {
            let mut names = HashMap::new();
            names.insert(lang.clone(), name.unwrap_or_default());
            let mut descriptions = HashMap::new();
            descriptions.insert(lang.clone(), desc.unwrap_or_default());
            result.push(ResultData::Weapons(WeaponResult {
                id: weapon.id,
                name: names,
                description: descriptions,
                rarity: weapon.rank_level,
                category: Category::Weapons,
                commands: command,
                icon: image,
            }))
        }
    }
    output_log(
        app_handle,
        "info",
        &format!("Total Weapons added: {}", total_weapons),
    );
    drop(weapons);
    Ok(())
}

pub(crate) fn generate_artifacts<F, G>(
    app_handle: &tauri::AppHandle,
    resources: &String,
    lang: &Language,
    text_map: &TextMap,
    result: &mut Vec<ResultData>,
    read_excel_bin_output: F,
    get_image: G,
) -> Result<(), String>
where
    F: Fn(&str, &str) -> Result<Artifacts, TextMapError>,
    G: Fn(&str, &str, &str) -> String,
{
    let artifacts: Artifacts =
        match read_excel_bin_output(&resources.to_string(), "ReliquaryExcelConfigData") {
            Ok(data) => data,
            Err(e) => {
                let error_msg = format!("Failed to read Artifacts: {}", e);
                output_log(app_handle, "error", &error_msg);
                return Err(error_msg);
            }
        };

    let mut total_artifacts = 0;
    for artifact in artifacts.iter() {
        total_artifacts += 1;

        let name = text_map
            .get(&artifact.name_text_map_hash.to_string())
            .cloned();
        let desc = text_map
            .get(&artifact.desc_text_map_hash.to_string())
            .cloned();

        let command = generate_command(Category::Materials, artifact.id as u32, "/give");
        let image = get_image("genshin-impact", &artifact.icon, "artifacts");

        let artifact_result = result
            .iter_mut()
            .find(|r| matches!(r, ResultData::Artifacts(a) if a.id == artifact.id))
            .and_then(|r| {
                if let ResultData::Artifacts(a) = r {
                    Some(a)
                } else {
                    None
                }
            });

        if let Some(existing_artifact) = artifact_result {
            existing_artifact
                .name
                .insert(lang.clone(), name.unwrap_or_default());
            existing_artifact
                .description
                .insert(lang.clone(), desc.unwrap_or_default());
        } else {
            let mut names = HashMap::new();
            names.insert(lang.clone(), name.unwrap_or_default());
            let mut descriptions = HashMap::new();
            descriptions.insert(lang.clone(), desc.unwrap_or_default());
            result.push(ResultData::Artifacts(ArtifactResult {
                id: artifact.id,
                name: names,
                description: descriptions,
                rarity: artifact.rank_level,
                image,
                category: Category::Artifacts,
                commands: command,
            }))
        }
    }

    output_log(
        app_handle,
        "info",
        &format!("Total Artifacts added: {}", total_artifacts),
    );
    drop(artifacts);
    Ok(())
}

pub(crate) fn generate_achievements<F>(
    app_handle: &tauri::AppHandle,
    resources: &String,
    lang: &Language,
    text_map: &TextMap,
    result: &mut Vec<ResultData>,
    read_excel_bin_output: F,
) -> Result<(), String>
where
    F: Fn(&str, &str) -> Result<Achievements, TextMapError>,
{
    let achievements: Achievements =
        match read_excel_bin_output(&resources.to_string(), "AchievementExcelConfigData") {
            Ok(data) => data,
            Err(e) => {
                let error_msg = format!("Failed to read Achievements: {}", e);
                output_log(app_handle, "error", &error_msg);
                return Err(error_msg);
            }
        };
    let mut total_achievements = 0;
    for achievement in achievements.iter() {
        total_achievements += 1;

        let name = text_map
            .get(&achievement.title_text_map_hash.to_string())
            .cloned();
        let desc = text_map
            .get(&achievement.desc_text_map_hash.to_string())
            .cloned();

        let command = generate_command(Category::Achievements, achievement.id as u32, "/am grant");

        let achievement_result = result
            .iter_mut()
            .find(|r| matches!(r, ResultData::Achievements(a) if a.id == achievement.id))
            .and_then(|r| {
                if let ResultData::Achievements(a) = r {
                    Some(a)
                } else {
                    None
                }
            });

        if let Some(existing_achievement) = achievement_result {
            existing_achievement
                .name
                .insert(lang.clone(), name.unwrap_or_default());
            existing_achievement
                .description
                .insert(lang.clone(), desc.unwrap_or_default());
        } else {
            let mut names = HashMap::new();
            names.insert(lang.clone(), name.unwrap_or_default());
            let mut descriptions = HashMap::new();
            descriptions.insert(lang.clone(), desc.unwrap_or_default());

            result.push(ResultData::Achievements(AchievementResult {
                id: achievement.id,
                name: names,
                description: descriptions,
                category: Category::Achievements,
                commands: command,
            }))
        }
    }
    output_log(
        app_handle,
        "info",
        &format!("Total Achievements added: {}", total_achievements),
    );
    drop(achievements);
    Ok(())
}

pub(crate) fn generate_quests<F>(
    app_handle: &tauri::AppHandle,
    resources: &String,
    lang: &Language,
    text_map: &TextMap,
    result: &mut Vec<ResultData>,
    read_excel_bin_output: F,
) -> Result<(), String>
where
    F: Fn(&str, &str) -> Result<MainQuests, TextMapError>,
{
    let main_quests: MainQuests =
        match read_excel_bin_output(&resources.to_string(), "MainQuestExcelConfigData") {
            Ok(data) => data,
            Err(e) => {
                let error_msg = format!("Failed to read Main Quests: {}", e);
                output_log(app_handle, "error", &error_msg);
                return Err(error_msg);
            }
        };

    let mut total_main_quests = 0;
    for main_quest in main_quests.iter() {
        total_main_quests += 1;

        let name = text_map
            .get(&main_quest.title_text_map_hash.to_string())
            .cloned();
        let desc = text_map
            .get(&main_quest.desc_text_map_hash.to_string())
            .cloned();

        let command = generate_command(Category::Quests, main_quest.id as u32, "/q");

        let main_quest_result = result
            .iter_mut()
            .find(|r| matches!(r, ResultData::Quests(m) if m.id == main_quest.id))
            .and_then(|r| {
                if let ResultData::Quests(m) = r {
                    Some(m)
                } else {
                    None
                }
            });

        if let Some(existing_main_quest) = main_quest_result {
            existing_main_quest
                .name
                .insert(lang.clone(), name.unwrap_or_default());
            existing_main_quest
                .description
                .insert(lang.clone(), desc.unwrap_or_default());
        } else {
            let mut names = HashMap::new();
            names.insert(lang.clone(), name.unwrap_or_default());
            let mut descriptions = HashMap::new();
            descriptions.insert(lang.clone(), desc.unwrap_or_default());
            result.push(ResultData::Quests(MainQuestResult {
                id: main_quest.id,
                name: names,
                description: descriptions,
                category: Category::Quests,
                commands: command,
            }))
        }
    }
    output_log(
        app_handle,
        "info",
        &format!("Total Main Quests added: {}", total_main_quests),
    );
    drop(main_quests);
    Ok(())
}

pub fn generate_dungeons<F>(
    app_handle: &tauri::AppHandle,
    resources: &String,
    lang: &Language,
    text_map: &TextMap,
    result: &mut Vec<ResultData>,
    read_excel_bin_output: F,
) -> Result<(), String>
where
    F: Fn(&str, &str) -> Result<Dungeons, TextMapError>,
{
    let dungeons: Dungeons =
        match read_excel_bin_output(&resources.to_string(), "DungeonExcelConfigData") {
            Ok(data) => data,
            Err(e) => {
                let error_msg = format!("Failed to read Dungeons: {}", e);
                output_log(app_handle, "error", &error_msg);
                return Err(error_msg);
            }
        };

    let mut total_dungeons = 0;
    for dungeon in dungeons.iter() {
        total_dungeons += 1;

        let name = text_map
            .get(&dungeon.name_text_map_hash.to_string())
            .cloned();
        let desc = text_map
            .get(&dungeon.desc_text_map_hash.to_string())
            .cloned();

        let command = generate_command(Category::Dungeons, dungeon.id as u32, "/tp");

        let dungeon_result = result
            .iter_mut()
            .find(|r| matches!(r, ResultData::Dungeons(d) if d.id == dungeon.id))
            .and_then(|r| {
                if let ResultData::Dungeons(d) = r {
                    Some(d)
                } else {
                    None
                }
            });

        if let Some(existing_dungeon) = dungeon_result {
            existing_dungeon
                .name
                .insert(lang.clone(), name.unwrap_or_default());
            existing_dungeon
                .description
                .insert(lang.clone(), desc.unwrap_or_default());
        } else {
            let mut names = HashMap::new();
            names.insert(lang.clone(), name.unwrap_or_default());
            let mut descriptions = HashMap::new();
            descriptions.insert(lang.clone(), desc.unwrap_or_default());
            result.push(ResultData::Dungeons(DungeonsResult {
                id: dungeon.id,
                name: names,
                description: descriptions,
                category: Category::Dungeons,
                commands: command,
            }))
        }
    }
    output_log(
        app_handle,
        "info",
        &format!("Total Dungeons added: {}", total_dungeons),
    );
    drop(dungeons);
    Ok(())
}

pub fn generate_scenes<F>(
    app_handle: &tauri::AppHandle,
    resources: &String,
    result: &mut Vec<ResultData>,
    read_excel_bin_output: F,
) -> Result<(), String>
where
    F: Fn(&str, &str) -> Result<Scenes, TextMapError>,
{
    let scenes: Scenes = match read_excel_bin_output(&resources.to_string(), "SceneExcelConfigData")
    {
        Ok(data) => data,
        Err(e) => {
            let error_msg = format!("Failed to read Scenes: {}", e);
            output_log(app_handle, "error", &error_msg);
            return Err(error_msg);
        }
    };

    let mut total_scenes = 0;
    for scene in scenes.iter() {
        total_scenes += 1;
        let name = scene.script_data.clone();
        let command = generate_command(Category::Scenes, scene.id as u32, "/tp");
        result.push(ResultData::Scenes(ScenesResult {
            id: scene.id,
            name,
            scene_type: scene.scene_type.clone(),
            category: Category::Scenes,
            commands: command,
        }))
    }
    output_log(
        app_handle,
        "info",
        &format!("Total Scenes added: {}", total_scenes),
    );
    drop(scenes);
    Ok(())
}

#[allow(clippy::too_many_arguments)]
pub fn generate_monsters<F, D, G>(
    app_handle: &tauri::AppHandle,
    resources: &String,
    lang: &Language,
    text_map: &TextMap,
    result: &mut Vec<ResultData>,
    read_excel_bin_output: F,
    read_excel_bin_output_describe: D,
    get_image: G,
) -> Result<(), String>
where
    F: Fn(&str, &str) -> Result<Monsters, TextMapError>,
    D: Fn(&str, &str) -> Result<MonsterDescribe, TextMapError>,
    G: Fn(&str, &str, &str) -> String,
{
    let monsters: Monsters =
        match read_excel_bin_output(&resources.to_string(), "MonsterExcelConfigData") {
            Ok(data) => data,
            Err(e) => {
                let error_msg = format!("Failed to read Monsters: {}", e);
                output_log(app_handle, "error", &error_msg);
                return Err(error_msg);
            }
        };
    let monsters_describe: MonsterDescribe = match read_excel_bin_output_describe(
        &resources.to_string(),
        "MonsterDescribeExcelConfigData",
    ) {
        Ok(data) => data,
        Err(e) => {
            let error_msg = format!("Failed to read Monsters Describe: {}", e);
            output_log(app_handle, "error", &error_msg);
            return Err(error_msg);
        }
    };
    let mut total_monsters = 0;
    for monster in monsters.iter() {
        total_monsters += 1;
        let describe = monster
            .describe_id
            .and_then(|id| monsters_describe.iter().find(|describe| describe.id == id));

        let name =
            describe.and_then(|desc| text_map.get(&desc.name_text_map_hash.to_string()).cloned());

        // total_monsters += 1;

        let icon: Option<String> = describe.map(|desc| desc.icon.clone());
        let image = get_image(
            "genshin-impact",
            icon.as_deref().unwrap_or_default(),
            "monsters",
        );
        let commands = generate_command(Category::Monsters, monster.id as u32, "/spawn");

        let monster_result = result
            .iter_mut()
            .find(|r| matches!(r, ResultData::Monsters(m) if m.id == monster.id))
            .and_then(|r| {
                if let ResultData::Monsters(m) = r {
                    Some(m)
                } else {
                    None
                }
            });

        if let Some(existing_monster) = monster_result {
            existing_monster
                .name
                .insert(lang.clone(), name.unwrap_or_default());
        } else {
            let mut names = HashMap::new();
            names.insert(lang.clone(), name.unwrap_or_default());
            result.push(ResultData::Monsters(MonstersResult {
                id: monster.id,
                name: names,
                category: Category::Monsters,
                image,
                commands,
            }))
        }
    }
    output_log(
        app_handle,
        "info",
        &format!("Total Monsters added: {}", total_monsters),
    );
    drop(monsters_describe);
    drop(monsters);
    Ok(())
}

#[tauri::command(async)]
pub fn generate_handbook(
    app_handle: tauri::AppHandle,
    path: &str,
    path_text_map: &str,
    selections: Option<Vec<String>>,
    languages: Option<Vec<String>>,
    output: &str,
    output_file_name: &str,
) -> Result<String, String> {
    if !Path::new(path).exists() {
        return Err("Path does not exist".to_string());
    }
    let path_text_map = Path::new(path_text_map);
    if !path_text_map.exists() {
        return Err("Path does not exist".to_string());
    }
    let parsed_selections = match parse_selections::<SelectHandbookArgs>(&selections) {
        Ok(selections) => selections,
        Err(e) => return Err(e.to_string()),
    };
    let parsed_language = match parse_selections::<Language>(&languages) {
        Ok(languages) => languages,
        Err(e) => return Err(e.to_string()),
    };
    let selections_slice: &[SelectHandbookArgs] = &parsed_selections;
    let language_slice: &[Language] = &parsed_language;
    let start = std::time::Instant::now();
    let mut result: Vec<ResultData> = Vec::new();
    for lang in language_slice {
        output_log(
            &app_handle,
            "info",
            &format!(
                "Reading {}/TextMap{}.json",
                path_text_map.to_str().unwrap(),
                lang.to_string().to_uppercase()
            ),
        );
        let text_map = match read_text_map(path_text_map.to_str().unwrap(), &lang.to_string()) {
            Ok(text_map) => text_map,
            Err(e) => return Err(e.to_string()),
        };

        for selection in selections_slice {
            match selection {
                SelectHandbookArgs::Characters => generate_character(
                    &app_handle,
                    &path.to_string(),
                    lang,
                    &text_map,
                    &mut result,
                    read_excel_bin_output,
                    get_image,
                )?,
                SelectHandbookArgs::Materials => generate_materials(
                    &app_handle,
                    &path.to_string(),
                    lang,
                    &text_map,
                    &mut result,
                    read_excel_bin_output,
                    get_image,
                )?,
                SelectHandbookArgs::Weapons => generate_weapons(
                    &app_handle,
                    &path.to_string(),
                    lang,
                    &text_map,
                    &mut result,
                    read_excel_bin_output,
                    get_image,
                )?,
                SelectHandbookArgs::Artifacts => generate_artifacts(
                    &app_handle,
                    &path.to_string(),
                    lang,
                    &text_map,
                    &mut result,
                    read_excel_bin_output,
                    get_image,
                )?,
                SelectHandbookArgs::Achievements => generate_achievements(
                    &app_handle,
                    &path.to_string(),
                    lang,
                    &text_map,
                    &mut result,
                    read_excel_bin_output,
                )?,
                SelectHandbookArgs::Quests => generate_quests(
                    &app_handle,
                    &path.to_string(),
                    lang,
                    &text_map,
                    &mut result,
                    read_excel_bin_output,
                )?,
                SelectHandbookArgs::Dungeons => generate_dungeons(
                    &app_handle,
                    &path.to_string(),
                    lang,
                    &text_map,
                    &mut result,
                    read_excel_bin_output,
                )?,
                SelectHandbookArgs::Scenes => generate_scenes(
                    &app_handle,
                    &path.to_string(),
                    &mut result,
                    read_excel_bin_output,
                )?,
                SelectHandbookArgs::Monsters => generate_monsters(
                    &app_handle,
                    &path.to_string(),
                    lang,
                    &text_map,
                    &mut result,
                    read_excel_bin_output,
                    read_excel_bin_output,
                    get_image,
                )?,
            }
        }
        drop(text_map);
    }
    output_log(
        &app_handle,
        "info",
        &format!("Total all added: {}", result.len()),
    );
    let json = serde_json::to_string_pretty(&result).unwrap();
    let output_path = Path::new(output).join(output_file_name);
    output_log(
        &app_handle,
        "info",
        &format!("Writing to {}", output_path.to_str().unwrap()),
    );
    fs::write(output_path.clone(), json).unwrap();
    let duration = start.elapsed();
    let metadata_file = match fs::metadata(output_path) {
        Ok(metadata) => metadata,
        Err(e) => return Err(e.to_string()),
    };
    let size = format_file_size(metadata_file.len());
    output_log(
        &app_handle,
        "info",
        &format!("Total time: {:?}, Size: {}", duration, size),
    );
    Ok("Success".to_string())
}
