use std::collections::HashMap;

use serde::Serialize;

use crate::{
    structure::handbook::{
        category::Category, commands::Command, gi::achievement::Achievements, Language,
    },
    utility::{TextMap, TextMapError},
};

use super::{commands::generate_command, output_log, ResultData};

#[derive(Serialize)]
pub struct AchievementResult {
    pub id: i64,
    pub name: HashMap<Language, String>,
    pub description: HashMap<Language, String>,
    pub commands: Command,
    pub category: Category,
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
