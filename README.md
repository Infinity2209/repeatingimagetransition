# RepeatingImageTransition

## Overview

This project is a Single Page Application (SPA) built with LitElement and GSAP that showcases a repeating image transition effect. It includes a home page with a grid of images and a product page with interactive controls and a 3D T-shirt preview.

## Features

- Home page with animated grid of images.
- Product page with image selection, height, weight, build controls.
- 3D T-shirt preview with customizable print text.
- Smooth GSAP animations for transitions.
- Routing between home and product pages using browser history API.
- Storybook stories for components.
- Vite build setup.
- Deployment configuration for Cloudflare Pages.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm

### Installation

```bash
npm install
```

### Development

Start the development server with hot reload:

```bash
npm run dev
```

Open your browser at `http://localhost:3000` to view the app.

### Building for Production

Build the app for production:

```bash
npm run build
```

The output will be in the `dist` directory.

### Running Storybook

To view component stories:

```bash
npm run storybook
```

### Deployment

This project is configured for deployment on Cloudflare Pages. Ensure you set your Cloudflare account ID in `cloudflare-pages.toml`.

Build the project and deploy the `dist` directory.

## Project Structure

- `src/` - Source files including components and stories.
- `css/` - Stylesheets.
- `dist/` - Production build output.
- `vite.config.js` - Vite configuration.
- `cloudflare-pages.toml` - Cloudflare Pages deployment config.

## License

This project is licensed under the MIT License.
