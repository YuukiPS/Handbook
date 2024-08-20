use std::collections::BTreeMap;

use pretty_assertions::assert_eq;

use crate::generate::commands::{CommandMap, GameType};

#[test]
fn test_generate_command() {
    use crate::generate::commands::generate_command;
    use crate::structure::handbook::{category::Category, commands::Commands};
    // Test for Characters
    let character_commands = generate_command(
        Category::Characters,
        10000007,
        "/give",
        crate::generate::commands::GameType::GenshinImpact,
    );
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
    match character_commands {
        CommandMap::GenshinImpact(map) => {
            assert_eq!(map.len(), 2);
            assert_eq!(map, character_expected);
        }
        CommandMap::HonkaiStarRail(map) => assert_eq!(map.len(), 0),
    }

    // Test for Materials
    let material_commands =
        generate_command(Category::Materials, 123, "/give", GameType::GenshinImpact);
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
    match material_commands {
        CommandMap::GenshinImpact(map) => {
            assert_eq!(map.len(), 2);
            assert_eq!(map, material_expected);
        }
        CommandMap::HonkaiStarRail(map) => assert_eq!(map.len(), 0),
    }

    // Test for Weapons
    let weapon_commands =
        generate_command(Category::Weapons, 456, "/give", GameType::GenshinImpact);
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
                        name: "With Amount".to_string(),
                        command: "/give 456 x<amount>".to_string(),
                    },
                ),
                (
                    "command_4".to_string(),
                    Commands {
                        name: "With Refinement".to_string(),
                        command: "/give 456 r<refinement>".to_string(),
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
    match weapon_commands {
        CommandMap::GenshinImpact(map) => {
            assert_eq!(map.len(), 2);
            assert_eq!(map, weapon_expected);
        }
        CommandMap::HonkaiStarRail(map) => assert_eq!(map.len(), 0),
    }

    // Test for Artifacts
    let artifact_commands =
        generate_command(Category::Artifacts, 789, "/give", GameType::GenshinImpact);
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
                        name: "With Level, Refinement, and Amount".to_string(),
                        command: "/give 789 lv<level> r<refinement> x<amount>".to_string(),
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
    match artifact_commands {
        CommandMap::GenshinImpact(map) => {
            assert_eq!(map.len(), 2);
            assert_eq!(map, artifact_expected);
        }
        CommandMap::HonkaiStarRail(map) => assert_eq!(map.len(), 0),
    }

    // Test for Achievements
    let achievement_commands = generate_command(
        Category::Achievements,
        1000,
        "/am grant",
        GameType::GenshinImpact,
    );
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
    match achievement_commands {
        CommandMap::GenshinImpact(map) => {
            assert_eq!(map.len(), 2);
            assert_eq!(map, achievement_expected);
        }
        CommandMap::HonkaiStarRail(map) => assert_eq!(map.len(), 0),
    }

    // Test for Quests
    let quests_commands = generate_command(Category::Quests, 1, "/q", GameType::GenshinImpact);
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
    match quests_commands {
        CommandMap::GenshinImpact(map) => {
            assert_eq!(map.len(), 2);
            assert_eq!(map, quests_expected);
        }
        CommandMap::HonkaiStarRail(map) => assert_eq!(map.len(), 0),
    }

    // Test for Dungeons
    let dungeons_commands = generate_command(Category::Dungeons, 1, "/tp", GameType::GenshinImpact);
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
    match dungeons_commands {
        CommandMap::GenshinImpact(map) => {
            assert_eq!(map.len(), 2);
            assert_eq!(map, dungeons_expected);
        }
        CommandMap::HonkaiStarRail(map) => assert_eq!(map.len(), 0),
    }

    // Test for Scenes
    let scenes_commands = generate_command(Category::Scenes, 20, "/tp", GameType::GenshinImpact);
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
    match scenes_commands {
        CommandMap::GenshinImpact(map) => {
            assert_eq!(map.len(), 2);
            assert_eq!(map, scenes_expected);
        }
        CommandMap::HonkaiStarRail(map) => assert_eq!(map.len(), 0),
    }

    // Test for Monsters
    let monsters_command =
        generate_command(Category::Monsters, 2000, "/spawn", GameType::GenshinImpact);
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
    match monsters_command {
        CommandMap::GenshinImpact(map) => {
            assert_eq!(map.len(), 2);
            assert_eq!(map, monsters_expected);
        }
        CommandMap::HonkaiStarRail(map) => assert_eq!(map.len(), 0),
    }
}
