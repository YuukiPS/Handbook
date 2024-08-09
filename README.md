# Handbook

Handbook Finder is a desktop application built with Tauri, React, and TypeScript. Originally designed as a web
application, we are now transitioning to create an offline version that allows users to find id without needing
an internet connection.

## Features

- Search for game items, characters, weapons, and more
- Generate GM Handbooks
- Multi-language support
- Dark/Light theme
- Command execution for YuukiPS

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [Rust](https://www.rust-lang.org/) (latest stable version)

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

3. Run the development server:
   ```
   yarn tauri dev
   ```

### Building

To build the application for production:

```
yarn tauri build
```

## Project Structure

- `src/`: React frontend code
- `src-tauri/`: Rust backend code
- `public/`: Static assets and localization files

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0).
See the [LICENSE](LICENSE).