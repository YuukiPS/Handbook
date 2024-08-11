use tauri::{command, AppHandle, Runtime};

use crate::models::*;
use crate::HandbookFinderExt;
use crate::Result;

#[command]
pub(crate) async fn request_storage_permission<R: Runtime>(
    app: AppHandle<R>,
    payload: RequestStoragePermissionRequest,
) -> Result<RequestStoragePermissionResponse> {
    app.handbook_finder().request_storage_permission(payload)
}
