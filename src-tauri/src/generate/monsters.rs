use std::collections::HashMap;

use serde::Serialize;

use crate::{
    structure::handbook::{
        category::Category,
        commands::Command,
        gi::monsters::{MonsterDescribe, Monsters},
        Language,
    },
    utility::{TextMap, TextMapError},
};

use super::{commands::generate_command, output_log, ResultData};

#[derive(Serialize)]
pub struct MonstersResult {
    pub id: i64,
    pub name: HashMap<Language, String>,
    pub image: String,
    pub category: Category,
    pub commands: Command,
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
