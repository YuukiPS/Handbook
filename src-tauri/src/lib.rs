// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
mod download;
mod generate;
mod search;
mod structure;
#[cfg(test)]
mod tests;
mod utility;

use crate::download::download_resources;
use crate::generate::generate_handbook;
use crate::generate::list::get_list_text_map;
use crate::search::gi::{find, get_category, get_path_handbook, update_path_handbook};
use crate::structure::gm::Gmhandbook;
use lazy_static::lazy_static;
use log::error;
use std::sync::RwLock;
use tauri::Manager;

lazy_static! {
    static ref HANDBOOK_CONTENT: RwLock<Gmhandbook> = RwLock::new(Vec::new());
    static ref HANDBOOK_PATH: RwLock<String> = RwLock::new(String::new());
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[allow(unused_mut)]
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::LogDir {
                        file_name: Some("logs.txt".to_string()),
                    }),
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stdout),
                ])
                .timezone_strategy(tauri_plugin_log::TimezoneStrategy::UseLocal)
                .build(),
        )
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            find,
            generate_handbook,
            update_path_handbook,
            get_path_handbook,
            get_category,
            get_list_text_map,
            download_resources,
        ])
        .setup(|app| {
            let handbook_path = app.path().resolve(
                "resources/gmhandbook.json",
                tauri::path::BaseDirectory::Resource,
            );
            match handbook_path {
                Ok(path) => {
                    *HANDBOOK_PATH.write().unwrap() = path.to_string_lossy().to_string();
                }
                Err(e) => {
                    error!("Failed to resolve gmhandbook.json: {}", e);
                }
            }
            #[cfg(debug_assertions)]
            {
                app.get_webview_window("main").unwrap().open_devtools();
            }
            Ok(())
        });

    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        builder = builder.plugin(tauri_plugin_updater::Builder::new().build());
    }
    #[cfg(target_os = "android")]
    {
        builder = builder.plugin(tauri_plugin_handbook_finder::init());
    }

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
