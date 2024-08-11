use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Runtime};

use crate::*;

pub fn init<R: Runtime, C: DeserializeOwned>(
    app: &AppHandle<R>,
    _api: PluginApi<R, C>,
) -> crate::Result<HandbookFinder<R>> {
    Ok(HandbookFinder(app.clone()))
}

/// Access to the handbook-finder APIs.
pub struct HandbookFinder<R: Runtime>(AppHandle<R>);

impl<R: Runtime> HandbookFinder<R> {
    pub fn request_storage_permission(
        &self,
        payload: RequestStoragePermissionRequest,
    ) -> crate::Result<RequestStoragePermissionResponse> {
        Ok(RequestStoragePermissionResponse {
            request_code: payload.request_code,
        })
    }
}
