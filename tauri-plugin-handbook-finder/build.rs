const COMMANDS: &[&str] = &["requestStoragePermission", "checkPermissions"];

fn main() {
    tauri_plugin::Builder::new(COMMANDS)
        .android_path("android")
        .ios_path("ios")
        .build();
}
