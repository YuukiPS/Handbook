use crate::structure::Output;
use futures::StreamExt;
use std::io::Write;
use std::path::Path;
use std::time::Duration;
use std::{fs::File, time::Instant};
use tauri::{AppHandle, Emitter};
use tauri_plugin_http::reqwest;

#[tauri::command(async)]
pub async fn download_resources(
    app_handle: AppHandle,
    url: &str,
    output: &str,
    file_name: &str,
) -> Result<String, String> {
    let response = reqwest::get(url).await.map_err(|e| e.to_string())?;
    let total_size = response.content_length().unwrap_or(0);
    let path_download = Path::new(output).join(file_name);

    if let Some(parent) = path_download.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let mut dest = File::create(&path_download).map_err(|e| e.to_string())?;
    let mut downloaded = 0;
    let mut stream = response.bytes_stream();
    let start_time = Instant::now();
    let mut last_update = Instant::now();

    app_handle
        .emit(
            "download-output",
            Output {
                log_level: "info".to_string(),
                message: format!("Starting download from {}", url),
            },
        )
        .map_err(|e| e.to_string())?;

    while let Some(item) = stream.next().await {
        let chunk = item.map_err(|e| e.to_string())?;
        dest.write_all(&chunk).map_err(|e| e.to_string())?;
        downloaded += chunk.len();
        let now = Instant::now();

        if now.duration_since(last_update) >= Duration::from_millis(100) {
            let progress = if total_size > 0 {
                ((downloaded as f64 / total_size as f64) * 100.0).min(100.0) as u8
            } else {
                0
            };
            let elapsed = now.duration_since(start_time).as_secs_f64();
            let speed = downloaded as f64 / elapsed / 1024.0 / 1024.0;

            app_handle
                .emit("download-progress-resources", (progress, speed))
                .map_err(|e| e.to_string())?;

            last_update = now;
        }
    }

    let progress = 100;
    let elapsed = Instant::now().duration_since(start_time).as_secs_f64();
    let speed = downloaded as f64 / elapsed / 1024.0 / 1024.0;
    app_handle
        .emit("download-progress-resources", (progress, speed))
        .map_err(|e| e.to_string())?;

    app_handle
        .emit(
            "download-output",
            Output {
                log_level: "info".to_string(),
                message: format!(
                    "Download complete. Total size: {:.2} MB, Average speed: {:.2} MB/s",
                    downloaded as f64 / 1024.0 / 1024.0,
                    speed
                ),
            },
        )
        .map_err(|e| e.to_string())?;

    Ok("Download complete".to_string())
}
