use std::collections::HashSet;
use std::fs::File;
use std::io::BufReader;

use crate::structure::gm::{Gmhandbook, NameUnion};
use crate::{HANDBOOK_CONTENT, HANDBOOK_PATH};
use log::{info, warn};
use tauri::ipc::InvokeError;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum GmError {
    #[error("Failed to deserialize JSON: {0}")]
    JsonDeserializeError(String),
    #[error("No results were found with query: {0}")]
    NoResultsFound(String),
    #[error("Search term cannot be empty")]
    EmptySearchTerm,
    #[error("Failed to read handbook content")]
    ReadHandbookContentError,
}

impl From<serde_json::Error> for GmError {
    fn from(error: serde_json::Error) -> Self {
        GmError::JsonDeserializeError(error.to_string())
    }
}

impl From<GmError> for InvokeError {
    fn from(value: GmError) -> Self {
        InvokeError::from(value.to_string())
    }
}

#[tauri::command]
pub fn find(search: &str, language: &str, limit: Option<i64>) -> Result<Gmhandbook, String> {
    if search.is_empty() {
        // return Err(GmError::EmptySearchTerm);
        return Err("Search term cannot be empty".to_string());
    }

    let handbook_content = HANDBOOK_CONTENT
        .read()
        .map_err(|_| "Failed to read handbook content".to_string())?;
    let result: Gmhandbook = handbook_content
        .iter()
        .filter(|item| {
            let name = match &item.name {
                NameUnion::Description(desc) => match language.to_lowercase().as_str() {
                    "jp" => desc.get("EN"),
                    "id" => desc.get("ID"),
                    "cht" => desc.get("CHT"),
                    "th" => desc.get("TH"),
                    "fr" => desc.get("FR"),
                    "ru" => desc.get("RU"),
                    "chs" => desc.get("CHS"),
                    _ => desc.get("EN"),
                },
                NameUnion::String(ref s) => Some(s),
                // Motherfucker error
                // NameUnion::Object(ref s) => Some(&s.to_string()),
            };
            if name.map_or(false, |n| n.to_lowercase().contains(&search.to_lowercase()))
                || (item.id.to_string().to_lowercase() == search && language.to_lowercase() == "EN")
            {
                return true;
            }
            false
        })
        .take(limit.unwrap_or(i64::MAX) as usize)
        .cloned()
        .collect();
    Ok(result)
}

#[tauri::command(async)]
pub fn update_path_handbook(path: &str, force: bool) -> Result<(), String> {
    if path.is_empty() {
        return Err("Path cannot be empty".to_string());
    }
    if !force && path == *HANDBOOK_PATH.read().unwrap() {
        return Err("Path is the same as the current path. No need to update.".to_string());
    }
    if force {
        warn!("Force updating handbook path to: {}", path);
    }
    let mut handbook_content = HANDBOOK_CONTENT
        .write()
        .map_err(|_| "Failed to write handbook content")?;
    let file = File::open(path).map_err(|e| format!("Failed to open file: {}", e))?;
    let reader = BufReader::new(file);
    let parse_json: Gmhandbook =
        serde_json::from_reader(reader).map_err(|e| format!("Failed to parse JSON: {}", e))?;

    *handbook_content = parse_json;
    *HANDBOOK_PATH.write().unwrap() = path.to_string();
    Ok(())
}

#[tauri::command]
pub fn get_path_handbook() -> Result<String, String> {
    let handbook_path = HANDBOOK_PATH.read().map_err(|e| e.to_string())?;
    Ok(handbook_path.to_string())
}

#[tauri::command(async)]
pub fn get_category() -> Result<Vec<String>, String> {
    info!("Attempting to read handbook content...");
    let handbook_content = HANDBOOK_CONTENT.read().unwrap();
    info!("Successfully read handbook content.");
    let unique_categories: HashSet<String> = handbook_content
        .iter()
        .map(|data| data.category.to_string())
        .collect();
    let mut result: Vec<String> = unique_categories.into_iter().collect();

    result.sort();

    Ok(result)
}
