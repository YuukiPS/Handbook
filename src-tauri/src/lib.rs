// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
mod generate;
mod log;
mod search;
mod structure;
#[cfg(test)]
mod tests;
mod utility;

use crate::generate::handbook::generate_handbook;
use crate::log::{log_error, log_info, log_warn};
use crate::search::gi::{find, get_category, get_path_handbook, update_path_handbook};
use crate::structure::gm::Gmhandbook;
use crate::utility::Logger;
use lazy_static::lazy_static;
use std::fs;
use std::path::Path;
use std::sync::RwLock;
use tauri::Manager;

lazy_static! {
    static ref HANDBOOK_CONTENT: RwLock<Gmhandbook> = RwLock::new(Vec::new());
    static ref HANDBOOK_PATH: RwLock<String> = RwLock::new(String::new());
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            find,
            generate_handbook,
            update_path_handbook,
            get_path_handbook,
            get_category,
            log_error,
            log_info,
            log_warn
        ])
        .setup(|app| {
            let app_dir = app
                .path()
                .resource_dir()
                .expect("Failed to resolve resource directory");

            Logger::init(Path::new(&app_dir).join("logs").to_str().unwrap());

            let handbook_path = app_dir.join("resources").join("gmhandbook.json");
            let handbook_content = fs::read_to_string(&handbook_path).unwrap_or_default();
            let handbook_json: Gmhandbook =
                serde_json::from_str(&handbook_content).unwrap_or_else(|e| {
                    Logger::error(format!(
                        "Failed to parse gmhandbook.json. Using empty vector instead: {}",
                        e
                    ));
                    Vec::new()
                });
            *HANDBOOK_CONTENT.write().unwrap() = handbook_json;
            *HANDBOOK_PATH.write().unwrap() = handbook_path.to_string_lossy().to_string();
            #[cfg(debug_assertions)]
            {
                app.get_webview_window("main").unwrap().open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
