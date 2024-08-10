use std::collections::HashMap;

use serde::Serialize;

use crate::{
    structure::handbook::{
        category::Category, commands::Command, gi::artifacts::Artifacts, Language,
    },
    utility::{TextMap, TextMapError},
};

use super::{commands::generate_command, output_log, ResultData};

#[derive(Serialize)]
pub struct ArtifactResult {
    pub id: i64,
    pub name: HashMap<Language, String>,
    pub description: HashMap<Language, String>,
    pub image: String,
    pub category: Category,
    pub rarity: i64,
    pub commands: Command,
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
