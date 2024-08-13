use std::fs;
use std::path::Path;
use thiserror::Error;

#[derive(Error, Debug)]
enum GetListTextMapError {
    #[error("'{0}' does not exist")]
    NotFound(String),
    #[error("Path '{0}' is not a directory")]
    NotADirectory(String),
}

#[tauri::command]
pub async fn get_list_text_map(path: &str) -> Result<Vec<String>, String> {
    let text_map_dir = Path::new(path);

    if !text_map_dir.exists() {
        return Err(GetListTextMapError::NotFound(path.to_string()).to_string());
    }

    if !text_map_dir.is_dir() {
        return Err(GetListTextMapError::NotADirectory(path.to_string()).to_string());
    }

    let entries = fs::read_dir(text_map_dir).map_err(|e| e.to_string())?;

    let result: Vec<String> = entries
        .filter_map(|entry| {
            let entry = entry.ok()?;
            let file_name = entry.file_name().to_string_lossy().to_string();

            if entry.file_type().ok()?.is_file() && file_name.starts_with("TextMap") && file_name.ends_with(".json") {
                Some(file_name.trim_start_matches("TextMap").trim_end_matches(".json").to_string())
            } else {
                None
            }
        })
        .collect();
    Ok(result)
}