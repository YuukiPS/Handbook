use std::collections::BTreeMap;

use crate::structure::handbook::{
    category::Category,
    commands::{Command, Commands},
};

pub(crate) fn generate_command(category: Category, id: u32, prefix: &str) -> Command {
    let mut commands_map: BTreeMap<String, BTreeMap<String, Commands>> = BTreeMap::new();
    let mut commands_map_gc = BTreeMap::new();
    let mut commands_map_gio = BTreeMap::new();

    let commands_gc = match category {
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
        Category::Weapons => vec![
            ("Normal", ""),
            ("With Level", "lv<level>"),
            ("With Refinement", "r<refinement>"),
            ("With Amount", "x<amount>"),
            (
                "With Level, Refinement, and Amount",
                "lv<level> r<refinement> x<amount>",
            ),
        ],
        Category::Artifacts => vec![
            ("Normal", ""),
            ("With Level", "lv<level>"),
            ("With Amount", "x<amount>"),
            ("With Refinement", "r<refinement>"),
            (
                "With Level, Amount, and Refinement",
                "lv<level> x<amount> r<refinement>",
            ),
        ],
        Category::Achievements => vec![("Normal", "")],
        Category::Quests => vec![
            ("Add Quest", "add"),
            ("Remove Quest", "remove"),
            ("Start Quest", "start"),
        ],
        Category::Dungeons => vec![("Normal", "")],
        Category::Scenes => vec![("Normal", "")],
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
        _ => vec![],
    };

    let commands_gio = match category {
        Category::Characters => vec![("Normal", format!("avatar add {}", id))],
        Category::Artifacts => vec![
            ("Normal", format!("item add {}", id)),
            ("With Amount", format!("item add {} <amount>", id)),
        ],
        Category::Quests => vec![
            ("Add Quest", format!("quest add {}", id)),
            ("Accept Quest", format!("quest accept {}", id)),
            ("Finish Quest", format!("quest finish {}", id)),
        ],
        Category::Materials => vec![
            ("Normal", format!("item add {}", id)),
            ("With Amount", format!("item add {} <amount>", id)),
        ],
        Category::Achievements => vec![(
            "Not Available",
            "This category is not available for GIO".to_string(),
        )],
        Category::Scenes => vec![(
            "Not Available",
            "This category is not available for GIO".to_string(),
        )],
        Category::Dungeons => vec![(
            "Not Available",
            "This category is not available for GIO".to_string(),
        )],
        Category::Monsters => vec![(
            "Not Available",
            "This category is not available for GIO".to_string(),
        )],
        Category::Weapons => vec![
            ("Normal", format!("item add {}", id)),
            ("With Amount", format!("item add {} <amount>", id)),
        ],
        _ => vec![],
    };

    for (i, (name, command_suffix)) in commands_gc.into_iter().enumerate() {
        let command = Commands {
            name: name.to_string(),
            command: match category {
                Category::Quests => format!("{} {} {}", prefix, command_suffix, id),
                Category::Dungeons | Category::Scenes => format!("{} 0 0 0 {}", prefix, id),
                _ => format!("{} {} {}", prefix, id, command_suffix.trim()),
            }
            .trim()
            .to_string(),
        };
        commands_map_gc.insert(format!("command_{}", i + 1), command);
    }

    for (i, (name, command_suffix)) in commands_gio.into_iter().enumerate() {
        let command = Commands {
            name: name.to_string(),
            command: command_suffix.trim().to_string(),
        };
        commands_map_gio.insert(format!("command_{}", i + 1), command);
    }

    commands_map.insert("gc".to_string(), commands_map_gc);
    commands_map.insert("gio".to_string(), commands_map_gio);

    commands_map
}
