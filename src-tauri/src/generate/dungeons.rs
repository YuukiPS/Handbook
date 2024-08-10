use std::collections::HashMap;

use serde::Serialize;

use crate::{
    structure::handbook::{
        category::Category, commands::Command, gi::dungeons::Dungeons, Language,
    },
    utility::{TextMap, TextMapError},
};

use super::{commands::generate_command, output_log, ResultData};

#[derive(Serialize)]
pub struct DungeonsResult {
    pub id: i64,
    pub name: HashMap<Language, String>,
    pub description: HashMap<Language, String>,
    pub category: Category,
    pub commands: Command,
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
