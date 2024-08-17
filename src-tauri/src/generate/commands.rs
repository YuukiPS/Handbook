use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

use crate::structure::handbook::{category::Category, commands::Commands};

pub enum GameType {
    GenshinImpact,
    HonkaiStarRail,
}

#[derive(Serialize, Deserialize)]
#[serde(untagged)]
pub enum CommandMap {
    GenshinImpact(BTreeMap<String, BTreeMap<String, Commands>>),
    HonkaiStarRail(BTreeMap<String, Commands>),
}

impl Clone for CommandMap {
    fn clone(&self) -> Self {
        match self {
            CommandMap::GenshinImpact(map) => CommandMap::GenshinImpact(map.clone()),
            CommandMap::HonkaiStarRail(map) => CommandMap::HonkaiStarRail(map.clone()),
        }
    }
}

pub(crate) fn generate_command(
    category: Category,
    id: u32,
    prefix: &str,
    game_type: GameType,
) -> CommandMap {
    match game_type {
        GameType::GenshinImpact => {
            let mut commands_map = BTreeMap::new();
            commands_map.insert(
                "gc".to_string(),
                generate_gc_commands(&category, id, prefix),
            );
            commands_map.insert("gio".to_string(), generate_gio_commands(&category, id));
            CommandMap::GenshinImpact(commands_map)
        }
        GameType::HonkaiStarRail => {
            CommandMap::HonkaiStarRail(generate_hsr_commands(&category, id))
        }
    }
}

fn generate_gc_commands(category: &Category, id: u32, prefix: &str) -> BTreeMap<String, Commands> {
    let commands = match category {
        Category::Characters => vec![
            ("Normal", ""),
            ("With Level", "lv<level>"),
            ("With Constellation", "c<constellation>"),
            ("With Skill Level", "sl<SkillLevel>"),
            (
                "With Level, Constellation, and Skill Level",
                "lv<level> c<constellation> sl<SkillLevel>",
            ),
        ],
        Category::Materials => vec![("Normal", ""), ("With Amount", "x<amount>")],
        Category::Weapons | Category::Artifacts => vec![
            ("Normal", ""),
            ("With Level", "lv<level>"),
            ("With Refinement", "r<refinement>"),
            ("With Amount", "x<amount>"),
            (
                "With Level, Refinement, and Amount",
                "lv<level> r<refinement> x<amount>",
            ),
        ],
        Category::Achievements => vec![("Normal", "")],
        Category::Quests => vec![
            ("Add Quest", "add"),
            ("Remove Quest", "remove"),
            ("Start Quest", "start"),
        ],
        Category::Dungeons | Category::Scenes => vec![("Normal", "")],
        Category::Monsters => vec![
            ("Normal", ""),
            ("With Custom HP", "hp<HealthPoint>"),
            ("With Custom Level", "lv<level>"),
            ("With Amount", "x<amount>"),
            (
                "With Custom HP, Level, and Amount",
                "hp<HealthPoint> lv<level> x<amount>",
            ),
        ],
        _ => vec![("Not Available", "This category is not available for GC")],
    };

    commands
        .into_iter()
        .enumerate()
        .map(|(i, (name, suffix))| {
            let command = match category {
                Category::Quests => format!("{} {} {}", prefix, suffix, id),
                Category::Dungeons | Category::Scenes => format!("{} 0 0 0 {}", prefix, id),
                _ => format!("{} {} {}", prefix, id, suffix.trim()),
            };
            (
                format!("command_{}", i + 1),
                Commands {
                    name: name.to_string(),
                    command: command.trim().to_string(),
                },
            )
        })
        .collect()
}

fn generate_gio_commands(category: &Category, id: u32) -> BTreeMap<String, Commands> {
    let commands = match category {
        Category::Characters => vec![("Normal", format!("avatar add {}", id))],
        Category::Artifacts | Category::Materials | Category::Weapons => vec![
            ("Normal", format!("item add {}", id)),
            ("With Amount", format!("item add {} <amount>", id)),
        ],
        Category::Quests => vec![
            ("Add Quest", format!("quest add {}", id)),
            ("Accept Quest", format!("quest accept {}", id)),
            ("Finish Quest", format!("quest finish {}", id)),
        ],
        _ => vec![(
            "Not Available",
            "This category is not available for GIO".to_string(),
        )],
    };

    commands
        .into_iter()
        .enumerate()
        .map(|(i, (name, command))| {
            (
                format!("command_{}", i + 1),
                Commands {
                    name: name.to_string(),
                    command: command.trim().to_string(),
                },
            )
        })
        .collect()
}

fn generate_hsr_commands(category: &Category, id: u32) -> BTreeMap<String, Commands> {
    let commands = match category {
        Category::Characters => vec![
            ("Normal", format!("/give {}", id)),
            ("With Level", format!("/give {} lv<level>", id)),
            ("With Skill Level", format!("/give {} sl<SkillLevel>", id)),
            ("With Eidolon", format!("/give {} r<eidolon>", id)),
            (
                "With Level, Skill Level, and Eidolon",
                format!("/give {} lv<level> sl<SkillLevel> r<eidolon>", id),
            ),
        ],
        Category::Relics => vec![
            ("Normal", format!("/give {}", id)),
            ("With Level", format!("/give {} lv<level>", id)),
        ],
        Category::LightCones => vec![
            ("Normal", format!("/give {}", id)),
            ("With Level", format!("/give {} lv<level>", id)),
            (
                "With Superimposition",
                format!("/give {} si<superimposition>", id),
            ),
            ("With Amount", format!("/give {} x<amount>", id)),
            (
                "With Level, Superimposition, and Amount",
                format!("/give {} lv<level> si<superimposition> x<amount>", id),
            ),
        ],
        Category::Monsters => vec![
            ("Normal", format!("/spawn {}", id)),
            ("With Amount", format!("/spawn {} x<amount>", id)),
            ("With Staged ID", format!("/spawn {} s<StageID>", id)),
        ],
        _ => vec![(
            "Not Available",
            "This category is not available for Star Rail".to_string(),
        )],
    };

    commands
        .into_iter()
        .enumerate()
        .map(|(i, (name, command))| {
            (
                format!("command_{}", i + 1),
                Commands {
                    name: name.to_string(),
                    command: command.trim().to_string(),
                },
            )
        })
        .collect()
}
