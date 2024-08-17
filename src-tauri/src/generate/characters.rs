use std::collections::HashMap;

use serde::Serialize;

use crate::{
    structure::handbook::category::Category,
    structure::handbook::gi::characters::Characters as CharactersGI,
    structure::handbook::sr::characters::CharacterList as CharacterListSR,
    structure::handbook::Language, utility::TextMap,
};

use super::{
    commands::{generate_command, CommandMap},
    output_log, GameExcelReader, ResultData,
};

struct CharacterData {
    id: i64,
    name: i64,
    description: Option<i64>,
    rarity: String,
    icon: String,
    category: Category,
    commands: CommandMap,
}

impl CharacterData {
    fn from_genshin(genshin_char: CharactersGI) -> Self {
        let command = generate_command(
            Category::Characters,
            genshin_char.id as u32,
            "/give",
            super::commands::GameType::GenshinImpact,
        );
        CharacterData {
            id: genshin_char.id,
            name: genshin_char.name_text_map_hash,
            description: Some(genshin_char.desc_text_map_hash),
            rarity: genshin_char.quality_type.to_string(),
            icon: genshin_char.icon_name,
            category: Category::Characters,
            commands: command,
        }
    }

    fn from_star_rail(star_rail_char: CharacterListSR) -> Self {
        let command = generate_command(
            Category::Characters,
            star_rail_char.avatar_id as u32,
            "/give",
            super::commands::GameType::HonkaiStarRail,
        );
        CharacterData {
            id: star_rail_char.avatar_id,
            name: star_rail_char.avatar_name.hash,
            description: None,
            rarity: star_rail_char.rarity.to_string(),
            icon: star_rail_char
                .default_avatar_head_icon_path
                .replace("SpriteOutput/AvatarIcon/Avatar/", ""),
            category: Category::Characters,
            commands: command,
        }
    }
}

#[derive(Serialize)]
pub struct CharacterResult {
    pub id: i64,
    pub name: HashMap<Language, String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<HashMap<Language, String>>,
    pub image: String,
    pub category: Category,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rarity: Option<u8>,
    pub commands: CommandMap,
}

pub(crate) fn generate_character<G>(
    app_handle: &tauri::AppHandle,
    resources: &str,
    lang: &Language,
    text_map: &TextMap,
    result: &mut Vec<ResultData>,
    excel_reader: &GameExcelReader,
    get_image: G,
) -> Result<(), String>
where
    G: Fn(&str, &str, &str) -> String,
{
    let characters: Vec<CharacterData> = match excel_reader {
        GameExcelReader::GenshinImpact(_) => {
            match excel_reader.read_excel_data::<CharactersGI>(resources, "AvatarExcelConfigData") {
                Ok(data) => data.into_iter().map(CharacterData::from_genshin).collect(),
                Err(e) => {
                    let error_msg = format!("Failed to read Characters: {}", e);
                    output_log(app_handle, "error", &error_msg);
                    return Err(error_msg);
                }
            }
        }
        GameExcelReader::StarRail(_) => {
            match excel_reader.read_excel_data::<CharacterListSR>(resources, "AvatarConfig") {
                Ok(data) => data
                    .into_iter()
                    .map(CharacterData::from_star_rail)
                    .collect(),
                Err(e) => {
                    let error_msg = format!("Failed to read Characters: {}", e);
                    output_log(app_handle, "error", &error_msg);
                    return Err(error_msg);
                }
            }
        }
    };
    let mut total_characters = 0;
    for character in characters.iter() {
        if character.id == 10000001 || character.id > 11000000 {
            continue;
        }
        total_characters += 1;
        let name = text_map.get(&character.name.to_string()).cloned();
        if name.is_none() {
            continue;
        }
        let desc = text_map
            .get(&character.description.unwrap_or_default().to_string())
            .cloned()
            .unwrap_or_default();

        let image = get_image("genshin-impact", &character.icon, "characters");

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
            if !desc.is_empty() {
                existing_character
                    .description
                    .clone()
                    .unwrap()
                    .insert(lang.clone(), desc);
            }
        } else {
            let mut names = HashMap::new();
            names.insert(lang.clone(), name.unwrap_or_default());
            let mut descriptions = HashMap::new();
            if !desc.is_empty() {
                descriptions.insert(lang.clone(), desc);
            }

            result.push(ResultData::Characters(CharacterResult {
                id: character.id,
                name: names,
                description: Some(descriptions),
                rarity: Some(character.rarity.parse::<u8>().unwrap_or_default()),
                image,
                category: character.category.clone(),
                commands: character.commands.clone(),
            }))
        }
    }
    output_log(
        app_handle,
        "info",
        &format!("Total Characters added: {}", total_characters),
    );
    drop(characters);
    Ok(())
}
