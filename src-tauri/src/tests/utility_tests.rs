use pretty_assertions::assert_eq;
use serde::Deserialize;
use serde_json::json;
use std::fs;
use tempfile::TempDir;

use crate::utility::TextMapError;

#[test]
fn test_format_file_size() {
    use crate::utility::format_file_size;
    assert_eq!(format_file_size(0), "0 bytes");
    assert_eq!(format_file_size(1023), "1023 bytes");
    assert_eq!(format_file_size(1024), "1.00 KB");
    assert_eq!(format_file_size(1500), "1.46 KB");
    assert_eq!(format_file_size(1_048_576), "1.00 MB");
    assert_eq!(format_file_size(1_500_000), "1.43 MB");
    assert_eq!(format_file_size(1_073_741_824), "1.00 GB");
    assert_eq!(format_file_size(1_500_000_000), "1.40 GB");
}

#[test]
fn test_read_text_map() {
    use crate::utility::read_text_map;
    // Create a temporary directory for testing
    let temp_dir = TempDir::new().unwrap();
    let temp_path = temp_dir.path();

    // Create mock TextMap directory
    let text_map_path = temp_path.join("TextMap");
    fs::create_dir_all(&text_map_path).unwrap();

    // Create a mock TextMap file
    let text_map_content = json!({
        "key1": "value1",
        "key2": "value2"
    });
    let text_map_file_path = text_map_path.join("TextMapEN.json");
    fs::write(&text_map_file_path, text_map_content.to_string()).unwrap();

    // Test case 1: Successful read
    let result = read_text_map(text_map_path.to_str().unwrap(), "EN");
    assert!(result.is_ok());
    let text_map = result.unwrap();
    assert_eq!(text_map.get("key1"), Some(&"value1".to_string()));
    assert_eq!(text_map.get("key2"), Some(&"value2".to_string()));

    // Test case 2: Non-existent language file
    let result = read_text_map(text_map_path.to_str().unwrap(), "FR");
    assert!(result.is_err());

    // Test case 3: Invalid JSON content
    let invalid_json_path = text_map_path.join("TextMapInvalid.json");
    fs::write(&invalid_json_path, "invalid json content").unwrap();
    let result = read_text_map(text_map_path.to_str().unwrap(), "Invalid");
    assert!(result.is_err());

    // Test case 4: Non-existent TextMap directory
    let non_existent_path = temp_path.join("non_existent");
    let result = read_text_map(non_existent_path.to_str().unwrap(), "EN");
    assert!(result.is_err());
}

#[derive(Debug, Deserialize, PartialEq)]
struct TestData {
    id: u32,
    name: String,
}

#[test]
fn test_read_excel_bin_output() {
    use crate::utility::read_excel_bin_output;
    // Create a temporary directory for testing
    let temp_dir = TempDir::new().unwrap();
    let temp_path = temp_dir.path();

    // Create mock game and ExcelBinOutput directories
    let game_path = temp_path.join("test_game").join("ExcelBinOutput");
    fs::create_dir_all(&game_path).unwrap();

    // Create a mock ExcelBinOutput file
    let excel_bin_content = json!([
        {"id": 1, "name": "Item 1"},
        {"id": 2, "name": "Item 2"}
    ]);
    let excel_bin_path = game_path.join("TestData.json");
    fs::write(&excel_bin_path, excel_bin_content.to_string()).unwrap();

    // Test case 1: Successful read
    let result: Result<Vec<TestData>, TextMapError> =
        read_excel_bin_output(game_path.to_str().unwrap(), "TestData");
    assert!(result.is_ok());
    let data = result.unwrap();
    assert_eq!(data.len(), 2);
    assert_eq!(
        data[0],
        TestData {
            id: 1,
            name: "Item 1".to_string()
        }
    );
    assert_eq!(
        data[1],
        TestData {
            id: 2,
            name: "Item 2".to_string()
        }
    );

    // Test case 2: Non-existent file
    let result: Result<Vec<TestData>, TextMapError> =
        read_excel_bin_output(game_path.to_str().unwrap(), "NonExistentFile");
    assert!(matches!(result, Err(TextMapError::IoError(_))));

    // Test case 3: Invalid JSON content
    let invalid_json_path = game_path.join("InvalidData.json");
    fs::write(&invalid_json_path, "invalid json content").unwrap();
    let result: Result<Vec<TestData>, TextMapError> =
        read_excel_bin_output(game_path.to_str().unwrap(), "InvalidData");
    assert!(matches!(result, Err(TextMapError::JsonError(_))));

    // Test case 4: Non-existent game directory
    let result: Result<Vec<TestData>, TextMapError> =
        read_excel_bin_output(game_path.to_str().unwrap(), "non_existent_game");
    assert!(matches!(result, Err(TextMapError::IoError(_))));
}
