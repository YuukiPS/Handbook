use std::collections::HashMap;

use serde::Serialize;

use crate::structure::handbook::category::Category;
use crate::structure::handbook::commands::Command;
use crate::structure::handbook::Language;
use crate::structure::handbook::{gi::materials::Material, sr::items::Items};
use crate::utility::TextMap;

use super::commands::generate_command;
use super::{output_log, GameExcelReader, ResultData};

#[derive(Serialize)]
pub struct MaterialsResult {
    pub id: i64,
    pub name: HashMap<Language, String>,
    pub description: HashMap<Language, String>,
    pub image: String,
    pub category: Category,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rarity: Option<i64>,
    pub commands: Command,
}

struct MaterialData {
    rarity: Option<i64>,
    id: i64,
    name: i64,
    description: i64,
    icon: String,
    category: Category,
}

impl MaterialData {
    fn from_genshin(genshin_mat: Material) -> Self {
        MaterialData {
            rarity: genshin_mat.rank_level,
            id: genshin_mat.id,
            name: genshin_mat.name_text_map_hash,
            description: genshin_mat.desc_text_map_hash,
            icon: genshin_mat.icon,
            category: Category::Materials,
        }
    }

    fn from_star_rail(star_rail_mat: Items) -> Self {
        MaterialData {
            rarity: Some(star_rail_mat.rarity.to_string().parse::<i64>().unwrap()),
            id: star_rail_mat.id,
            name: star_rail_mat.item_name.hash,
            description: star_rail_mat.item_desc.hash,
            icon: star_rail_mat
                .item_icon_path
                .replace("SpriteOutput/ItemIcon/", ""),
            category: Category::Items,
        }
    }
}

pub(crate) fn generate_materials<G>(
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
    let materials: Vec<MaterialData> = match excel_reader {
        GameExcelReader::GenshinImpact(_) => {
            match excel_reader.read_excel_data::<Material>(resources, "MaterialExcelConfigData") {
                Ok(data) => data.into_iter().map(MaterialData::from_genshin).collect(),
                Err(e) => {
                    let error_msg = format!("Failed to read Materials: {}", e);
                    output_log(app_handle, "error", &error_msg);
                    return Err(error_msg);
                }
            }
        }
        GameExcelReader::StarRail(_) => {
            match excel_reader.read_excel_data::<Items>(resources, "ItemConfig") {
                Ok(data) => data.into_iter().map(MaterialData::from_star_rail).collect(),
                Err(e) => {
                    let error_msg = format!("Failed to read Items: {}", e);
                    output_log(app_handle, "error", &error_msg);
                    return Err(error_msg);
                }
            }
        }
    };
    let mut total_materials = 0;
    for material in materials.iter() {
        let name = text_map.get(&material.name.to_string()).cloned();
        let desc = text_map.get(&material.description.to_string()).cloned();

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
                rarity: material.rarity,
                image,
                category: material.category.clone(),
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
