use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

pub use models::*;

#[cfg(desktop)]
mod desktop;
#[cfg(mobile)]
mod mobile;

mod commands;
mod error;
mod models;

pub use error::{Error, Result};

#[cfg(desktop)]
use desktop::HandbookFinder;
#[cfg(mobile)]
use mobile::HandbookFinder;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the handbook-finder APIs.
pub trait HandbookFinderExt<R: Runtime> {
    fn handbook_finder(&self) -> &HandbookFinder<R>;
}

impl<R: Runtime, T: Manager<R>> crate::HandbookFinderExt<R> for T {
    fn handbook_finder(&self) -> &HandbookFinder<R> {
        self.state::<HandbookFinder<R>>().inner()
    }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("handbook-finder")
        .invoke_handler(tauri::generate_handler![
            commands::request_storage_permission,
            commands::check_permissions,
            commands::select_folder
        ])
        .setup(|app, api| {
            #[cfg(mobile)]
            let handbook_finder = mobile::init(app, api)?;
            #[cfg(desktop)]
            let handbook_finder = desktop::init(app, api)?;
            app.manage(handbook_finder);
            Ok(())
        })
        .build()
}
