use serde::de::DeserializeOwned;
use tauri::{
    plugin::{PluginApi, PluginHandle},
    AppHandle, Runtime,
};

use crate::models::*;

#[cfg(target_os = "android")]
const PLUGIN_IDENTIFIER: &str = "com.plugin.handbook";

#[cfg(target_os = "ios")]
tauri::ios_plugin_binding!(init_plugin_handbook - finder);

// initializes the Kotlin or Swift plugin classes
pub fn init<R: Runtime, C: DeserializeOwned>(
    _app: &AppHandle<R>,
    api: PluginApi<R, C>,
) -> crate::Result<HandbookFinder<R>> {
    #[cfg(target_os = "android")]
    let handle = api.register_android_plugin(PLUGIN_IDENTIFIER, "Plugin")?;
    #[cfg(target_os = "ios")]
    let handle = api.register_ios_plugin(init_plugin_handbook - finder)?;
    Ok(HandbookFinder(handle))
}

/// Access to the handbook-finder APIs.
pub struct HandbookFinder<R: Runtime>(PluginHandle<R>);

impl<R: Runtime> HandbookFinder<R> {
    pub fn request_storage_permission(&self) -> crate::Result<RequestStoragePermissionResponse> {
        self.0
            .run_mobile_plugin("requestStoragePermission", ())
            .map_err(Into::into)
    }

    pub fn check_permissions(&self) -> crate::Result<CheckPermissionsResponse> {
        self.0
            .run_mobile_plugin("checkPermissions", ())
            .map_err(Into::into)
    }

    pub fn select_folder(&self) -> crate::Result<SelectFolderResponse> {
        self.0
            .run_mobile_plugin("openFolderPicker", ())
            .map_err(Into::into)
    }
}
