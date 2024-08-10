use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct Monster {
    #[serde(rename = "MonsterID")]
    pub monster_id: i64,
    pub monster_name: MonsterBattleIntroductionClass,
    pub monster_introduction: MonsterBattleIntroductionClass,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct MonsterBattleIntroductionClass {
    pub hash: i64,
}
