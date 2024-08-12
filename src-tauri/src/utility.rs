use std::{collections::HashMap, fmt, fs, io, path::Path};

use std::fs::File;
use std::sync::Mutex;

use serde::de::{DeserializeOwned, Error};

pub type TextMap = HashMap<String, String>;

#[derive(Debug)]
pub(crate) enum TextMapError {
    IoError(io::Error),
    JsonError(serde_json::Error),
}

impl fmt::Display for TextMapError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            TextMapError::IoError(e) => write!(f, "IO error: {}", e),
            TextMapError::JsonError(e) => write!(f, "JSON error: {}", e),
        }
    }
}

impl std::error::Error for TextMapError {}

impl From<io::Error> for TextMapError {
    fn from(err: io::Error) -> Self {
        TextMapError::IoError(err)
    }
}

impl From<serde_json::Error> for TextMapError {
    fn from(err: serde_json::Error) -> Self {
        TextMapError::JsonError(err)
    }
}

lazy_static::lazy_static! {
    static ref LOG_FILE: Mutex<Option<File>> = Mutex::new(None);
}

/// Formats a file size in bytes to a human-readable string.
///
/// # Arguments
///
/// * `size` - The file size in bytes as a u64.
///
/// # Returns
///
/// A `String` representing the formatted file size.
///
/// # Examples
///
/// ```
/// use crate::utility::format_file_size;
///
/// assert_eq!(format_file_size(1023), "1023 bytes");
/// assert_eq!(format_file_size(1024), "1.00 KB");
/// assert_eq!(format_file_size(1_048_576), "1.00 MB");
/// assert_eq!(format_file_size(1_073_741_824), "1.00 GB");
/// ```
///
/// # Details
///
/// This function converts the given size in bytes to the most appropriate unit:
/// - Bytes for sizes less than 1 KB
/// - KB (kilobytes) for sizes between 1 KB and 1 MB
/// - MB (megabytes) for sizes between 1 MB and 1 GB
/// - GB (gigabytes) for sizes 1 GB and above
///
/// The function uses binary prefixes (1 KB = 1024 bytes) and formats the result
/// with two decimal places for KB, MB, and GB.
pub fn format_file_size(size: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = KB * 1024;
    const GB: u64 = MB * 1024;

    if size >= GB {
        format!("{:.2} GB", size as f64 / GB as f64)
    } else if size >= MB {
        format!("{:.2} MB", size as f64 / MB as f64)
    } else if size >= KB {
        format!("{:.2} KB", size as f64 / KB as f64)
    } else {
        format!("{} bytes", size)
    }
}

/// Reads and deserializes JSON data from an Excel binary output file.
///
/// # Arguments
///
/// * `path` - A string representing the base path to the game data.
/// * `filename` - The name of the JSON file (without extension) to read from.
///
/// # Type Parameters
///
/// * `T` - The type to deserialize the JSON data into. Must implement `DeserializeOwned`.
///
/// # Returns
///
/// Returns a `Result` containing a `Vec<T>` if successful, or a `TextMapError` if an error occurs.
///
/// # Errors
///
/// This function will return an error if:
/// * The specified file does not exist.
/// * There's an I/O error while reading the file.
/// * The JSON data cannot be parsed into the specified type `T`.
pub(crate) fn read_excel_bin_output<T>(path: &str, filename: &str) -> Result<Vec<T>, TextMapError>
where
    T: DeserializeOwned,
{
    let path_excel = Path::new(&path.to_string()).join(format!("{}.json", filename));
    if !path_excel.exists() {
        return Err(TextMapError::IoError(io::Error::new(
            io::ErrorKind::NotFound,
            format!(
                "ExcelBinOutput file not found at `{}`",
                path_excel.display()
            ),
        )));
    }
    let data = fs::read_to_string(&path_excel)?;
    let excel_bin_output: Vec<T> = serde_json::from_str(&data).map_err(|e| {
        TextMapError::JsonError(serde_json::Error::custom(format!(
            "Failed to parse ExcelBinOutput from {:?} is `{}.json` valid? Error: {}",
            path, filename, e
        )))
    })?;
    Ok(excel_bin_output)
}

/// Reads and deserializes a text map JSON file for a specific language and game.
///
/// # Arguments
///
/// * `path` - A string representing the base path to the game data.
/// * `lang` - The language code for the desired text map.
///
/// # Returns
///
/// Returns a `Result` containing a `TextMap` if successful, or a `TextMapError` if an error occurs.
///
/// # Errors
///
/// This function will return an error if:
/// * The specified text map file does not exist.
/// * There's an I/O error while reading the file.
/// * The JSON data cannot be parsed into a `TextMap` struct.
pub(crate) fn read_text_map(path: &str, lang: &str) -> Result<TextMap, TextMapError> {
    let path = Path::new(&path).join(format!("TextMap{}.json", lang.to_uppercase()));
    if !path.exists() {
        return Err(TextMapError::IoError(io::Error::new(
            io::ErrorKind::NotFound,
            format!("TextMap file not found at `{}`", path.display()),
        )));
    }
    let contents = fs::read_to_string(path)?;
    let data: TextMap = serde_json::from_str(&contents)?;
    Ok(data)
}
