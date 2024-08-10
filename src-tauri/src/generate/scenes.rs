use serde::Serialize;

use crate::{
    structure::handbook::{
        category::Category,
        commands::Command,
        gi::scenes::{SceneType, Scenes},
    },
    utility::TextMapError,
};

use super::{commands::generate_command, output_log, ResultData};

#[derive(Serialize)]
pub struct ScenesResult {
    pub id: i64,
    #[serde(rename = "type")]
    pub scene_type: SceneType,
    pub name: String,
    pub category: Category,
    pub commands: Command,
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
