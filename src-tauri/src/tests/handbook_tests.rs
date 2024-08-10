use std::collections::BTreeMap;

use pretty_assertions::assert_eq;

#[test]
fn test_generate_command() {
    use crate::generate::commands::generate_command;
    use crate::structure::handbook::{category::Category, commands::Commands};
    // Test for Characters
    let character_commands = generate_command(Category::Characters, 10000007, "/give");
    let character_expected = BTreeMap::from([
        (
            "gc".to_string(),
            BTreeMap::from([
                (
                    "command_1".to_string(),
                    Commands {
                        name: "Normal".to_string(),
                        command: "/give 10000007".to_string(),
                    },
                ),
                (
                    "command_2".to_string(),
                    Commands {
                        name: "With Level".to_string(),
                        command: "/give 10000007 lv<level>".to_string(),
                    },
                ),
                (
                    "command_3".to_string(),
                    Commands {
                        name: "With Constellation".to_string(),
                        command: "/give 10000007 c<constellation>".to_string(),
                    },
                ),
                (
                    "command_4".to_string(),
                    Commands {
                        name: "With Skill Level".to_string(),
                        command: "/give 10000007 sl<SkillLevel>".to_string(),
                    },
                ),
                (
                    "command_5".to_string(),
                    Commands {
                        name: "With Level, Constellation, and Skill Level".to_string(),
                        command: "/give 10000007 lv<level> c<constellation> sl<SkillLevel>"
                            .to_string(),
                    },
                ),
            ]),
        ),
        (
            "gio".to_string(),
            BTreeMap::from([(
                "command_1".to_string(),
                Commands {
                    name: "Normal".to_string(),
                    command: "avatar add 10000007".to_string(),
                },
            )]),
        ),
    ]);
    assert_eq!(character_commands.len(), 2);
    assert_eq!(character_commands, character_expected);

    // Test for Materials
    let material_commands = generate_command(Category::Materials, 123, "/give");
    let material_expected = BTreeMap::from([
        (
            "gc".to_string(),
            BTreeMap::from([
                (
                    "command_1".to_string(),
                    Commands {
                        name: "Normal".to_string(),
                        command: "/give 123".to_string(),
                    },
                ),
                (
                    "command_2".to_string(),
                    Commands {
                        name: "With Amount".to_string(),
                        command: "/give 123 x<amount>".to_string(),
                    },
                ),
            ]),
        ),
        (
            "gio".to_string(),
            BTreeMap::from([
                (
                    "command_1".to_string(),
                    Commands {
                        name: "Normal".to_string(),
                        command: "item add 123".to_string(),
                    },
                ),
                (
                    "command_2".to_string(),
                    Commands {
                        name: "With Amount".to_string(),
                        command: "item add 123 <amount>".to_string(),
                    },
                ),
            ]),
        ),
    ]);
    assert_eq!(material_commands.len(), 2);
    assert_eq!(material_commands, material_expected);

    // Test for Weapons
    let weapon_commands = generate_command(Category::Weapons, 456, "/give");
    let weapon_expected = BTreeMap::from([
        (
            "gc".to_string(),
            BTreeMap::from([
                (
                    "command_1".to_string(),
                    Commands {
                        name: "Normal".to_string(),
                        command: "/give 456".to_string(),
                    },
                ),
                (
                    "command_2".to_string(),
                    Commands {
                        name: "With Level".to_string(),
                        command: "/give 456 lv<level>".to_string(),
                    },
                ),
                (
                    "command_3".to_string(),
                    Commands {
                        name: "With Refinement".to_string(),
                        command: "/give 456 r<refinement>".to_string(),
                    },
                ),
                (
                    "command_4".to_string(),
                    Commands {
                        name: "With Amount".to_string(),
                        command: "/give 456 x<amount>".to_string(),
                    },
                ),
                (
                    "command_5".to_string(),
                    Commands {
                        name: "With Level, Refinement, and Amount".to_string(),
                        command: "/give 456 lv<level> r<refinement> x<amount>".to_string(),
                    },
                ),
            ]),
        ),
        (
            "gio".to_string(),
            BTreeMap::from([
                (
                    "command_1".to_string(),
                    Commands {
                        name: "Normal".to_string(),
                        command: "item add 456".to_string(),
                    },
                ),
                (
                    "command_2".to_string(),
                    Commands {
                        name: "With Amount".to_string(),
                        command: "item add 456 <amount>".to_string(),
                    },
                ),
            ]),
        ),
    ]);
    assert_eq!(weapon_commands.len(), 2);
    assert_eq!(weapon_commands, weapon_expected);

    // Test for Artifacts
    let artifact_commands = generate_command(Category::Artifacts, 789, "/give");
    let artifact_expected = BTreeMap::from([
        (
            "gc".to_string(),
            BTreeMap::from([
                (
                    "command_1".to_string(),
                    Commands {
                        name: "Normal".to_string(),
                        command: "/give 789".to_string(),
                    },
                ),
                (
                    "command_2".to_string(),
                    Commands {
                        name: "With Level".to_string(),
                        command: "/give 789 lv<level>".to_string(),
                    },
                ),
                (
                    "command_3".to_string(),
                    Commands {
                        name: "With Amount".to_string(),
                        command: "/give 789 x<amount>".to_string(),
                    },
                ),
                (
                    "command_4".to_string(),
                    Commands {
                        name: "With Refinement".to_string(),
                        command: "/give 789 r<refinement>".to_string(),
                    },
                ),
                (
                    "command_5".to_string(),
                    Commands {
                        name: "With Level, Amount, and Refinement".to_string(),
                        command: "/give 789 lv<level> x<amount> r<refinement>".to_string(),
                    },
                ),
            ]),
        ),
        (
            "gio".to_string(),
            BTreeMap::from([
                (
                    "command_1".to_string(),
                    Commands {
                        name: "Normal".to_string(),
                        command: "item add 789".to_string(),
                    },
                ),
                (
                    "command_2".to_string(),
                    Commands {
                        name: "With Amount".to_string(),
                        command: "item add 789 <amount>".to_string(),
                    },
                ),
            ]),
        ),
    ]);
    assert_eq!(artifact_commands.len(), 2);
    assert_eq!(artifact_commands, artifact_expected);

    // Test for Achievements
    let achievement_commands = generate_command(Category::Achievements, 1000, "/am grant");
    let achievement_expected = BTreeMap::from([
        (
            "gc".to_string(),
            BTreeMap::from([(
                "command_1".to_string(),
                Commands {
                    name: "Normal".to_string(),
                    command: "/am grant 1000".to_string(),
                },
            )]),
        ),
        (
            "gio".to_string(),
            BTreeMap::from([(
                "command_1".to_string(),
                Commands {
                    name: "Not Available".to_string(),
                    command: "This category is not available for GIO".to_string(),
                },
            )]),
        ),
    ]);
    assert_eq!(achievement_commands.len(), 2);
    assert_eq!(achievement_commands, achievement_expected);

    // Test for Quests
    let quests_commands = generate_command(Category::Quests, 1, "/q");
    let quests_expected = BTreeMap::from([
        (
            "gc".to_string(),
            BTreeMap::from([
                (
                    "command_1".to_string(),
                    Commands {
                        name: "Add Quest".to_string(),
                        command: "/q add 1".to_string(),
                    },
                ),
                (
                    "command_2".to_string(),
                    Commands {
                        name: "Remove Quest".to_string(),
                        command: "/q remove 1".to_string(),
                    },
                ),
                (
                    "command_3".to_string(),
                    Commands {
                        name: "Start Quest".to_string(),
                        command: "/q start 1".to_string(),
                    },
                ),
            ]),
        ),
        (
            "gio".to_string(),
            BTreeMap::from([
                (
                    "command_1".to_string(),
                    Commands {
                        name: "Add Quest".to_string(),
                        command: "quest add 1".to_string(),
                    },
                ),
                (
                    "command_2".to_string(),
                    Commands {
                        name: "Accept Quest".to_string(),
                        command: "quest accept 1".to_string(),
                    },
                ),
                (
                    "command_3".to_string(),
                    Commands {
                        name: "Finish Quest".to_string(),
                        command: "quest finish 1".to_string(),
                    },
                ),
            ]),
        ),
    ]);
    assert_eq!(quests_commands.len(), 2);
    assert_eq!(quests_commands, quests_expected);

    // Test for Dungeons
    let dungeons_commands = generate_command(Category::Dungeons, 1, "/tp");
    let dungeons_expected = BTreeMap::from([
        (
            "gc".to_string(),
            BTreeMap::from([(
                "command_1".to_string(),
                Commands {
                    name: "Normal".to_string(),
                    command: "/tp 0 0 0 1".to_string(),
                },
            )]),
        ),
        (
            "gio".to_string(),
            BTreeMap::from([(
                "command_1".to_string(),
                Commands {
                    name: "Not Available".to_string(),
                    command: "This category is not available for GIO".to_string(),
                },
            )]),
        ),
    ]);
    assert_eq!(dungeons_commands.len(), 2);
    assert_eq!(dungeons_commands, dungeons_expected);

    // Test for Scenes
    let scenes_commands = generate_command(Category::Scenes, 20, "/tp");
    let scenes_expected = BTreeMap::from([
        (
            "gc".to_string(),
            BTreeMap::from([(
                "command_1".to_string(),
                Commands {
                    name: "Normal".to_string(),
                    command: "/tp 0 0 0 20".to_string(),
                },
            )]),
        ),
        (
            "gio".to_string(),
            BTreeMap::from([(
                "command_1".to_string(),
                Commands {
                    name: "Not Available".to_string(),
                    command: "This category is not available for GIO".to_string(),
                },
            )]),
        ),
    ]);
    assert_eq!(scenes_commands.len(), 2);
    assert_eq!(scenes_commands, scenes_expected);

    // Test for Monsters
    let monsters_command = generate_command(Category::Monsters, 2000, "/spawn");
    let monsters_expected = BTreeMap::from([
        (
            "gc".to_string(),
            BTreeMap::from([
                (
                    "command_1".to_string(),
                    Commands {
                        name: "Normal".to_string(),
                        command: "/spawn 2000".to_string(),
                    },
                ),
                (
                    "command_2".to_string(),
                    Commands {
                        name: "With Custom HP".to_string(),
                        command: "/spawn 2000 hp<HealthPoint>".to_string(),
                    },
                ),
                (
                    "command_3".to_string(),
                    Commands {
                        name: "With Custom Level".to_string(),
                        command: "/spawn 2000 lv<level>".to_string(),
                    },
                ),
                (
                    "command_4".to_string(),
                    Commands {
                        name: "With Amount".to_string(),
                        command: "/spawn 2000 x<amount>".to_string(),
                    },
                ),
                (
                    "command_5".to_string(),
                    Commands {
                        name: "With Custom HP, Level, and Amount".to_string(),
                        command: "/spawn 2000 hp<HealthPoint> lv<level> x<amount>".to_string(),
                    },
                ),
            ]),
        ),
        (
            "gio".to_string(),
            BTreeMap::from([(
                "command_1".to_string(),
                Commands {
                    name: "Not Available".to_string(),
                    command: "This category is not available for GIO".to_string(),
                },
            )]),
        ),
    ]);
    assert_eq!(monsters_command.len(), 2);
    assert_eq!(monsters_command, monsters_expected);
}
