use serde::Serialize;
use std::collections::HashMap;

use crate::{
    structure::handbook::{
        category::Category,
        gi::monsters::{Monster as GIMonster, MonsterDescribeElement},
        sr::monster::Monster as SRMonster,
        Language,
    },
    utility::TextMap,
};

use super::{commands::CommandMap, output_log, GameExcelReader, ResultData};

#[derive(Serialize)]
pub struct MonstersResult {
    pub id: i64,
    pub name: HashMap<Language, String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<HashMap<Language, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub image: Option<String>,
    pub category: Category,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub commands: Option<CommandMap>,
}

struct MonsterData {
    id: i64,
    name: i64,
    description: Option<i64>,
    icon: Option<String>,
    category: Category,
    commands: Option<CommandMap>,
}

impl MonsterData {
    fn from_genshin(gi_monster: &GIMonster, gi_describe: &Option<&MonsterDescribeElement>) -> Self {
        Self {
            id: gi_monster.id,
            name: gi_describe.map(|desc| desc.name_text_map_hash).unwrap_or(0),
            description: None,
            icon: gi_describe.and_then(|desc| Some(desc.icon.clone())),
            category: Category::Monsters,
            commands: None,
        }
    }

    fn from_star_rail(sr_monster: &SRMonster) -> Self {
        Self {
            id: sr_monster.monster_id,
            name: sr_monster.monster_name.hash,
            description: Some(sr_monster.monster_introduction.hash),
            icon: None,
            category: Category::Monsters,
            commands: None,
        }
    }
}

#[allow(clippy::too_many_arguments)]
pub fn generate_monsters<G>(
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
    let monsters: Vec<MonsterData> = match excel_reader {
        GameExcelReader::GenshinImpact(_) => {
            let monsters = match excel_reader
                .read_excel_data::<GIMonster>(resources, "MonsterExcelConfigData")
            {
                Ok(data) => data,
                Err(e) => return Err(e.to_string()),
            };
            let monsters_describe = match excel_reader.read_excel_data::<MonsterDescribeElement>(
                resources,
                "MonsterDescribeExcelConfigData",
            ) {
                Ok(data) => data,
                Err(e) => return Err(e.to_string()),
            };
            monsters
                .iter()
                .map(|monster| {
                    let describe = monster
                        .describe_id
                        .and_then(|id| monsters_describe.iter().find(|describe| describe.id == id));
                    MonsterData::from_genshin(monster, &describe)
                })
                .collect()
        }
        GameExcelReader::StarRail(_) => {
            let monsters =
                match excel_reader.read_excel_data::<SRMonster>(resources, "MonsterConfig") {
                    Ok(data) => data,
                    Err(e) => return Err(e.to_string()),
                };
            monsters.iter().map(MonsterData::from_star_rail).collect()
        }
    };

    let mut total_monsters = 0;
    for monster in monsters.iter() {
        let name = text_map.get(&monster.name.to_string()).cloned();
        if name.is_none() {
            continue;
        }
        total_monsters += 1;

        let description = monster
            .description
            .and_then(|desc| text_map.get(&desc.to_string()).cloned());
        let image = monster
            .icon
            .as_ref()
            .map(|icon| get_image("genshin-impact", icon, "monsters"));

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
            if let Some(desc) = description {
                existing_monster
                    .description
                    .get_or_insert_with(HashMap::new)
                    .insert(lang.clone(), desc);
            }
        } else {
            let mut names = HashMap::new();
            names.insert(lang.clone(), name.unwrap_or_default());
            let descriptions = description.map(|desc| {
                let mut map = HashMap::new();
                map.insert(lang.clone(), desc);
                map
            });
            result.push(ResultData::Monsters(MonstersResult {
                id: monster.id,
                name: names,
                description: descriptions,
                image,
                category: monster.category.clone(),
                commands: monster.commands.clone(),
            }))
        }
    }
    output_log(
        app_handle,
        "info",
        &format!("Total Monsters added: {}", total_monsters),
    );
    Ok(())
}
