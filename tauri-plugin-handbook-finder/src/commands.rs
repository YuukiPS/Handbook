use tauri::{command, AppHandle, Runtime};

use crate::models::*;
use crate::HandbookFinderExt;
use crate::Result;

#[command]
pub(crate) async fn request_storage_permission<R: Runtime>(
    app: AppHandle<R>,
) -> Result<RequestStoragePermissionResponse> {
    app.handbook_finder().request_storage_permission()
}

#[command]
pub(crate) async fn check_permissions<R: Runtime>(
    app: AppHandle<R>,
) -> Result<CheckPermissionsResponse> {
    app.handbook_finder().check_permissions()
}
