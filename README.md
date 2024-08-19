# Handbook Finder

Handbook Finder is a cross-platform desktop and mobile application built with Tauri, React, and TypeScript. It allows users to search for game items, characters, weapons, and more without an internet connection.

**Note: This project is still a work in progress, so expect some rough edges and changes along the way!**

## Features

- Generates GM Handbook
- Multi-language support
- Dark/Light theme
- Command execution for YuukiPS
- Cross-platform support (Desktop, Android and Web)

## Download

You can grab a pre-release version of the app from the [Releases](https://github.com/YuukiPS/Handbook/releases) page.

## Build from source

### What you'll need

- [Node.js](https://nodejs.org/) (v14 or newer)
- [Rust](https://www.rust-lang.org/) (latest stable version)
- [Yarn](https://yarnpkg.com/) package manager
- For Android development:
  - [Android SDK](https://developer.android.com/studio)
  - [Android NDK](https://developer.android.com/ndk)

For detailed information on prerequisites and setup, please refer to the official [Tauri v2 documentation](https://v2.tauri.app/start/prerequisites/)

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

To run the dev version:

- Desktop (Windows):
  ```
  yarn tauri dev
  ```

- Desktop (Linux):
  ```
  yarn tauri dev --target x86_64-unknown-linux-gnu
  ```

- Android:
  ```
  yarn tauri android dev
  ```
  (Make sure you've got the Android SDK set up properly)

### Building

Build the application for production:

- Desktop (Windows):
  ```
  yarn tauri build
  ```

- Desktop (Linux):
  ```
  yarn tauri build --target x86_64-unknown-linux-gnu
  ```

- For Android:
  ```
  yarn tauri android build
  ```

## Project Structure

- `src/`: React frontend code
- `src-tauri/`: Rust backend stuff
- `public/`: Static files and translations
- `tauri-plugin-handbook-finder/`: Custom plugin for Android file operations

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0).
See the [LICENSE](LICENSE) file for details.
