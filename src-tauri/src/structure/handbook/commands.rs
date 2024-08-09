use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Serialize, Deserialize, PartialEq, Eq, Debug, Clone)]
pub struct Commands {
    pub name: String,
    pub command: String,
}

pub type Command = BTreeMap<String, BTreeMap<String, Commands>>;
