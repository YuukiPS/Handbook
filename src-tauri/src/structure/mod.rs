pub mod gm;
pub mod handbook;
pub mod hsr;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct Output {
    pub log_level: String,
    pub message: String,
}
