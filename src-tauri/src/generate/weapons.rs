use std::collections::HashMap;

use serde::Serialize;

use crate::{
    structure::handbook::{
        category::Category, gi::weapons::Weapon, sr::light_cones::LightCones, Language,
    },
    utility::TextMap,
};

use super::{
    commands::{generate_command, CommandMap},
    output_log, GameExcelReader, ResultData,
};

#[derive(Serialize)]
pub struct WeaponResult {
    pub id: i64,
    pub name: HashMap<Language, String>,
    pub description: HashMap<Language, String>,
    pub icon: String,
    pub rarity: i64,
    pub category: Category,
    pub commands: CommandMap,
}

struct WeaponsData {
    rarity: i64,
    id: i64,
    name: i64,
    description: Option<i64>,
    icon: String,
    category: Category,
    commands: CommandMap,
}

impl WeaponsData {
    fn from_genshin(genshin_weapon: Weapon) -> Self {
        let commands = generate_command(
            Category::Weapons,
            genshin_weapon.id as u32,
            "/give",
            super::commands::GameType::GenshinImpact,
        );
        Self {
            rarity: genshin_weapon.rank_level,
            id: genshin_weapon.id,
            name: genshin_weapon.name_text_map_hash,
            description: Some(genshin_weapon.desc_text_map_hash),
            icon: genshin_weapon.icon,
            category: Category::Weapons,
            commands,
        }
    }

    fn from_star_rail(star_rail_weapon: LightCones) -> Self {
        let commands = generate_command(
            Category::Weapons,
            star_rail_weapon.equipment_id as u32,
            "/give",
            super::commands::GameType::HonkaiStarRail,
        );
        Self {
            rarity: star_rail_weapon.rarity.to_string().parse::<i64>().unwrap(),
            id: star_rail_weapon.equipment_id,
            name: star_rail_weapon.equipment_name.hash,
            description: None,
            icon: star_rail_weapon
                .image_path
                .replace("SpriteOutput/LightConeMaxFigures/", ""),
            category: Category::LightCones,
            commands,
        }
    }
}

pub(crate) fn generate_weapons<G>(
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
    let weapons: Vec<WeaponsData> = match excel_reader {
        GameExcelReader::GenshinImpact(_) => {
            match excel_reader.read_excel_data::<Weapon>(resources, "WeaponExcelConfigData") {
                Ok(data) => data.into_iter().map(WeaponsData::from_genshin).collect(),
                Err(e) => {
                    let error_msg = format!("Failed to read Weapons: {}", e);
                    output_log(app_handle, "error", &error_msg);
                    return Err(error_msg);
                }
            }
        }
        GameExcelReader::StarRail(_) => {
            match excel_reader.read_excel_data::<LightCones>(resources, "EquipmentConfig") {
                Ok(data) => data.into_iter().map(WeaponsData::from_star_rail).collect(),
                Err(e) => {
                    let error_msg = format!("Failed to read Light Cones: {}", e);
                    output_log(app_handle, "error", &error_msg);
                    return Err(error_msg);
                }
            }
        }
    };
    let mut total_weapons = 0;
    for weapon in weapons.iter() {
        total_weapons += 1;

        let name = text_map.get(&weapon.name.to_string()).cloned();
        let desc = weapon
            .description
            .map(|hash| text_map.get(&hash.to_string()).cloned())
            .unwrap_or_default();

        let image = get_image("genshin-impact", &weapon.icon, "weapons");

        let weapon_result = result
            .iter_mut()
            .find(|r| matches!(r, ResultData::Weapons(w) if w.id == weapon.id))
            .and_then(|r| {
                if let ResultData::Weapons(w) = r {
                    Some(w)
                } else {
                    None
                }
            });

        if let Some(existing_weapon) = weapon_result {
            existing_weapon
                .name
                .insert(lang.clone(), name.unwrap_or_default());
            existing_weapon
                .description
                .insert(lang.clone(), desc.unwrap_or_default());
        } else {
            let mut names = HashMap::new();
            names.insert(lang.clone(), name.unwrap_or_default());
            let mut descriptions = HashMap::new();
            descriptions.insert(lang.clone(), desc.unwrap_or_default());
            result.push(ResultData::Weapons(WeaponResult {
                id: weapon.id,
                name: names,
                description: descriptions,
                rarity: weapon.rarity,
                category: weapon.category.clone(),
                commands: weapon.commands.clone(),
                icon: image,
            }))
        }
    }
    output_log(
        app_handle,
        "info",
        &format!("Total Weapons added: {}", total_weapons),
    );
    drop(weapons);
    Ok(())
}
