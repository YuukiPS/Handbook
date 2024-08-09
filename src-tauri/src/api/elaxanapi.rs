use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;

use crate::types::gm::Gm;

#[derive(Serialize)]
struct HandbookGi {
    search: String,
    limit: u32,
    category: Option<String>,
    language: Option<String>,
    command: Option<bool>,
    image: Option<bool>,
}

#[derive(Serialize)]
struct HandbookSr {
    search: String,
    limit: u32,
    category: Option<String>,
    language: Option<String>,
}

const BASE_URL: &str = "https://api.elaxan.com";
const ENDPOINTS: phf::Map<&'static str, &'static str> = phf::phf_map! {
    "gi" => "/v3/gm",
    "sr" => "/v1/sr",
    "category" => "/v2/category"
};

struct ElaxanApi {
    client: Client,
}

impl ElaxanApi {
    pub fn new() -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(10))
            .build()
            .expect("Failed to create HTTP client");

        ElaxanApi { client }
    }

    pub async fn get_handbook_gi(&self, data: HandbookGi) -> Result<Vec<Gm>, reqwest::Error> {
        let endpoint = format!("{}{}", BASE_URL, ENDPOINTS["gi"]);
        let response = self.client.post(&endpoint).json(&data).send().await?;
        response.json().await
    }
}
