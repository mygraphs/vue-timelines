# Development Guide

## Prerequisites

- **Node.js**: >= 18.0.0 (required)
- **npm**: >= 9.0.0 (or yarn/pnpm)

### Check Your Versions

```bash
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
```

If you need to update Node.js, use [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm install 18
nvm use 18
nvm alias default 18
```

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

or with yarn:

```bash
yarn install
```

### 2. Install Submodules (for demo site)

```bash
git submodule update --init --recursive
```

## Development Commands

### Run Development Server

Start the development server with hot-reload:

```bash
npm run serve
```

This will:
- Start the dev server (usually at `http://localhost:8080`)
- Enable hot module replacement (HMR)
- Watch for file changes
- Open browser automatically (if configured)

The development server uses `src/main.js` as entry point and serves `src/App.vue`.

### Lint Code

Check for linting errors:

```bash
npm run lint
```

Auto-fix linting issues:

```bash
npm run lint -- --fix
```

## Project Structure

```
vue-timelines/
├── src/                    # Source code
│   ├── main.js            # Application entry point
│   ├── App.vue            # Main app component
│   ├── MyTimeline.vue     # Main timeline component (library export)
│   ├── components/        # Vue components
│   ├── store/             # Vuex store
│   ├── contexts/          # Vue provide/inject contexts
│   ├── utils/             # Utility functions
│   ├── directives/        # Vue directives
│   └── index.js           # Library entry point
├── public/                 # Static assets
│   └── index.html         # HTML template
├── dist/                   # Build output (generated)
├── rollup.config.js       # Rollup config for library builds
├── rollup.config.wc.js     # Rollup config for web component
└── vue.config.js          # Vue CLI config

```

## Development Workflow

### 1. Start Development

```bash
npm run serve
```

### 2. Make Changes

Edit files in `src/` directory. The dev server will automatically reload.

### 3. Test Your Changes

- The timeline component is in `src/MyTimeline.vue`
- The demo app is in `src/App.vue`
- Components are in `src/components/`

### 4. Build for Testing

Build the library to test the output:

```bash
# Build all formats (UMD, ESM, IIFE)
npm run build

# Build web component
npm run build:wc

# Build everything
npm run build:all
```

### 5. Test Library Build

After building, you can test the library in another project:

```bash
# Create a test package
npm pack

# This creates vue-timelines-0.2.2.tgz
# Install it in a test project:
# cd /path/to/test-project
# npm install /path/to/vue-timelines/vue-timelines-0.2.2.tgz
```

## Building the Demo Site

Build the demo site (outputs to `mygraphs.github.io/`):

```bash
npm run build:demo
```

This builds the production version of the demo app.

## Key Files for Development

### Main Component
- `src/MyTimeline.vue` - The main timeline component (exported as library)

### Demo App
- `src/App.vue` - Demo application using the timeline
- `src/main.js` - Application entry point

### State Management
- `src/store/store.js` - Vuex store configuration
- `src/store/modules/api.js` - API module (needs refactoring - see Phase 2 in docs)

### Components
- `src/components/Timeline/` - Timeline rendering components
- `src/components/List/` - Group list components
- `src/components/TimelineHeader/` - Header with controls
- `src/components/TaskDataPanel/` - Task editing panel

## Environment Variables

Currently, the API module uses environment variables (needs refactoring):

- `VUE_APP_API_BASE_URL` - API base URL
- `VUE_APP_API_TOKEN` - API authentication token

Create a `.env` file for local development:

```env
VUE_APP_API_BASE_URL=http://localhost:3000/api
VUE_APP_API_TOKEN=your-token-here
```

## Common Development Tasks

### Adding a New Component

1. Create component in `src/components/`
2. Export from `src/components/index.js` if needed
3. Import and use in `MyTimeline.vue` or `App.vue`

### Modifying Styles

Styles are in component `<style>` blocks. For theming (future work), see Phase 3 in `docs/251110_complete_library.md`.

### Testing API Changes

The API module is in `src/store/modules/api.js`. Currently hardcoded - see Phase 2 for abstraction plan.

## Troubleshooting

### Port Already in Use

If port 8080 is taken, Vue CLI will automatically try the next available port.

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Clear dist and rebuild
rm -rf dist
npm run build
```

### Submodule Issues

```bash
# Reinitialize submodule
git submodule deinit -f mygraphs.github.io
git submodule update --init --recursive
```

## Next Steps

See `docs/251110_complete_library.md` for the complete development roadmap, including:
- Phase 2: API Service Abstraction
- Phase 3: CSS Theming System
- Phase 4: Web Component (already done!)
- Phase 5: Testing

## Useful Commands Summary

```bash
# Development
npm run serve          # Start dev server
npm run lint           # Check code style

# Building
npm run build          # Build library (all formats)
npm run build:wc       # Build web component
npm run build:all      # Build everything
npm run build:demo     # Build demo site

# Publishing
npm pack               # Create tarball for testing
npm publish            # Publish to npm (requires OTP)
```

