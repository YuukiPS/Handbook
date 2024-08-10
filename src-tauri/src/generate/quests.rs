use std::collections::HashMap;

use serde::Serialize;

use crate::{
    structure::handbook::{
        category::Category, commands::Command, gi::main_quests::MainQuest,
        sr::mission::MissionElement, Language,
    },
    utility::TextMap,
};

use super::{commands::generate_command, output_log, GameExcelReader, ResultData};

#[derive(Serialize)]
pub struct MainQuestResult {
    pub id: i64,
    pub name: HashMap<Language, String>,
    pub description: HashMap<Language, String>,
    pub category: Category,
    pub commands: Command,
}

struct MissionData {
    id: i64,
    name: i64,
    description: Option<i64>,
}

impl MissionData {
    fn from_genshin(genshin_quest: MainQuest) -> Self {
        Self {
            id: genshin_quest.id,
            name: genshin_quest.title_text_map_hash,
            description: Some(genshin_quest.desc_text_map_hash),
        }
    }

    fn from_star_rail(star_rail_mission: MissionElement) -> Self {
        Self {
            id: star_rail_mission.main_mission_id,
            name: star_rail_mission.name.hash,
            description: None,
        }
    }
}

pub(crate) fn generate_quests(
    app_handle: &tauri::AppHandle,
    resources: &str,
    lang: &Language,
    text_map: &TextMap,
    result: &mut Vec<ResultData>,
    excel_reader: &GameExcelReader,
) -> Result<(), String> {
    let main_quests: Vec<MissionData> = match excel_reader {
        GameExcelReader::GenshinImpact(_) => {
            match excel_reader.read_excel_data::<MainQuest>(resources, "MainQuestExcelConfigData") {
                Ok(data) => data.into_iter().map(MissionData::from_genshin).collect(),
                Err(e) => {
                    let error_msg = format!("Failed to read Main Quests: {}", e);
                    output_log(app_handle, "error", &error_msg);
                    return Err(error_msg);
                }
            }
        }
        GameExcelReader::StarRail(_) => {
            match excel_reader.read_excel_data::<MissionElement>(resources, "MainMission") {
                Ok(data) => data.into_iter().map(MissionData::from_star_rail).collect(),
                Err(e) => {
                    let error_msg = format!("Failed to read Main Mission: {}", e);
                    output_log(app_handle, "error", &error_msg);
                    return Err(error_msg);
                }
            }
        }
    };

    let mut total_main_quests = 0;
    for main_quest in main_quests.iter() {
        total_main_quests += 1;

        let name = text_map.get(&main_quest.name.to_string()).cloned();
        let desc = main_quest
            .description
            .as_ref()
            .and_then(|desc| text_map.get(&desc.to_string()).cloned());

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
