# CzCage Chrome Extension

A Chrome extension that randomly replaces images on webpages with Nicolas Cage pictures.

## Features

- Randomly replaces a configurable percentage of images on webpages
- Built with TypeScript and Vite for modern development
- Clean, maintainable codebase with proper separation of concerns

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [pnpm](https://pnpm.io/installation) (preferred package manager)

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Development

Run the development server:
```bash
pnpm dev
```

This will build the extension in watch mode, meaning it will rebuild when you save changes.

### Build for Production

Build the extension for production:
```bash
pnpm build
```

The built extension will be in the `dist` folder.

## Installation in Chrome

1. Build the extension for production
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked" and select the `dist` directory
5. The extension should now be installed and ready to use

## Usage

1. Click the CzCage icon in your Chrome toolbar to open settings
2. Adjust the replacement rate slider (1-100%)
3. Click "Save Settings" to apply changes
4. Use "Reset" to revert to default settings (20%)

## License

MIT