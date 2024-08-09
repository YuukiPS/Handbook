use crate::utility::Logger;

#[tauri::command]
pub fn log_info(message: &str) -> Result<(), String> {
    Logger::info(message);
    Ok(())
}

#[tauri::command]
pub fn log_error(message: &str) -> Result<(), String> {
    Logger::error(message);
    Ok(())
}

#[tauri::command]
pub fn log_warn(message: &str) -> Result<(), String> {
    Logger::warn(message);
    Ok(())
}
