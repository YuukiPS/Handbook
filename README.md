# Handbook Finder

Handbook Finder is a cross-platform desktop and mobile application built with Tauri, React, and TypeScript. It allows users to search for game items, characters, weapons, and more without an internet connection.

**Note: This project is under active development and not yet ready for production use. Some features may be incomplete or subject to change.**

## Features

- GM Handbook generation
- Multi-language support
- Dark/Light theme
- Command execution for YuukiPS
- Cross-platform support (Desktop and Android)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [Rust](https://www.rust-lang.org/) (latest stable version)
- [Yarn](https://yarnpkg.com/) package manager
- For Android development:
  - [Android SDK](https://developer.android.com/studio)
  - [Android NDK](https://developer.android.com/ndk)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/YuukiPS/Handbook.git
   cd Handbook
   ```

2. Install dependencies:
   ```
   yarn install
   ```

### Development

Run the development version:

- For desktop:
  ```
  yarn tauri dev
  ```

- For Android:
  ```
  yarn tauri android dev
  ```
  Ensure that the Android SDK is installed and properly configured in your environment variables.

### Building

Build the application for production:

- For desktop:
  ```
  yarn tauri build
  ```

- For Android:
  ```
  yarn tauri android build
  ```

## Project Structure

- `src/`: React frontend code
- `src-tauri/`: Rust backend code
- `public/`: Static assets and localization files
- `tauri-plugin-handbook-finder/`: Custom Tauri Plugin for efficient file system operations on Android devices, enabling secure read/write access to storage

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0).
See the [LICENSE](LICENSE) file for details.
