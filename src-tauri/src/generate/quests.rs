use std::collections::HashMap;

use serde::Serialize;

use crate::{
    structure::handbook::{
        category::Category, commands::Command, gi::main_quests::MainQuests, Language,
    },
    utility::{TextMap, TextMapError},
};

use super::{commands::generate_command, output_log, ResultData};

#[derive(Serialize)]
pub struct MainQuestResult {
    pub id: i64,
    pub name: HashMap<Language, String>,
    pub description: HashMap<Language, String>,
    pub category: Category,
    pub commands: Command,
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
