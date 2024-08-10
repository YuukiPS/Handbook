use std::collections::HashMap;

use serde::Serialize;

use crate::{
    structure::handbook::{
        category::Category, commands::Command, gi::artifacts::Artifact, sr::relics::RelicElement,
        Language,
    },
    utility::TextMap,
};

use super::{commands::generate_command, output_log, GameExcelReader, ResultData};

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

struct ArtifactData {
    id: i64,
    name: i64,
    description: i64,
    rarity: String,
    icon: String,
    category: Category,
}

impl ArtifactData {
    fn from_genshin(genshin_art: Artifact) -> Self {
        Self {
            id: genshin_art.id,
            name: genshin_art.name_text_map_hash,
            description: genshin_art.desc_text_map_hash,
            icon: genshin_art.icon,
            rarity: genshin_art.rank_level.to_string(),
            category: Category::Artifacts,
        }
    }

    fn from_star_rail(star_rail_relic: RelicElement) -> Self {
        Self {
            id: star_rail_relic.id,
            name: star_rail_relic.item_name.hash,
            description: star_rail_relic.item_bg_desc.hash,
            icon: star_rail_relic
                .item_icon_path
                .replace("SpriteOutput/ItemIcon/RelicIcons/", ""),
            rarity: star_rail_relic.rarity.to_string(),
            category: Category::Relics,
        }
    }
}

pub(crate) fn generate_artifacts<G>(
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
    let artifacts: Vec<ArtifactData> = match excel_reader {
        GameExcelReader::GenshinImpact(_) => {
            match excel_reader.read_excel_data::<Artifact>(resources, "ReliquaryExcelConfigData") {
                Ok(data) => data.into_iter().map(ArtifactData::from_genshin).collect(),
                Err(e) => {
                    let error_msg = format!("Failed to read Artifacts: {}", e);
                    output_log(app_handle, "error", &error_msg);
                    return Err(error_msg);
                }
            }
        }
        GameExcelReader::StarRail(_) => {
            match excel_reader.read_excel_data(resources, "ItemConfigRelic") {
                Ok(data) => data.into_iter().map(ArtifactData::from_star_rail).collect(),
                Err(e) => {
                    let error_msg = format!("Failed to read Relics: {}", e);
                    output_log(app_handle, "error", &error_msg);
                    return Err(error_msg);
                }
            }
        }
    };

    let mut total_artifacts = 0;
    for artifact in artifacts.iter() {
        total_artifacts += 1;

        let name = text_map.get(&artifact.name.to_string()).cloned();
        let desc = text_map.get(&artifact.description.to_string()).cloned();

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
                rarity: artifact.rarity.parse::<i64>().unwrap_or(0),
                image,
                category: artifact.category.clone(),
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
