# Copying Vue Timeline Web Component to Assets

This document explains how to copy the built vue-timelines web component to the assets folder for use in the application.

## Build Process

### Step 1: Build the Web Component

First, build the web component from the vue-timelines directory:

```bash
# From project root
npm run build:vue-timelines

# Or directly from the vue-timelines directory
cd projects/riskpal-tasking-monitoring/dev-libs/vue-timelines
npm run build:wc
```

This creates the file: `projects/riskpal-tasking-monitoring/dev-libs/vue-timelines/dist/vue-timelines-wc.js`

## Copy Methods

### Method 1: Automatic (Development Server)

When running the development server using the provided script, the file is automatically copied:

```bash
./projects/riskpal-tasking-monitoring/start-dev-tasking.sh
```

This script:
1. Builds the web component (`npm run build:vue-timelines`)
2. Copies it to `projects/riskpal-tasking-monitoring/src/assets/vue-timelines/vue-timelines-wc.js`

### Method 2: Manual Copy (Development)

For manual copying during development:

```bash
# From project root
mkdir -p projects/riskpal-tasking-monitoring/src/assets/vue-timelines
cp projects/riskpal-tasking-monitoring/dev-libs/vue-timelines/dist/vue-timelines-wc.js \
   projects/riskpal-tasking-monitoring/src/assets/vue-timelines/vue-timelines-wc.js
```

### Method 3: Production Build

The production build script automatically copies the web component:

```bash
# From project root
npm run build:tasking-monitoring
```

This script (`scripts/build-tasking-monitoring.js`):
1. Builds the web component
2. Copies it to `public/dist/assets/vue-timelines/vue-timelines-wc.js`

### Method 4: Angular Build (Automatic)

The `angular.json` configuration includes an asset rule that automatically copies the web component during Angular builds:

```json
{
  "glob": "vue-timelines-wc.js",
  "input": "projects/riskpal-tasking-monitoring/dev-libs/vue-timelines/dist",
  "output": "/assets/vue-timelines"
}
```

This means any Angular build will automatically include the web component if it exists in the dist folder.

## File Locations

### Source (After Build)
- `projects/riskpal-tasking-monitoring/dev-libs/vue-timelines/dist/vue-timelines-wc.js`

### Development Assets
- `projects/riskpal-tasking-monitoring/src/assets/vue-timelines/vue-timelines-wc.js`

### Production Assets
- `public/dist/assets/vue-timelines/vue-timelines-wc.js`

## Usage in Code

The web component is loaded in `TaskTimelineComponent`:

```typescript
private readonly WEB_COMPONENT_SCRIPT = '/assets/vue-timelines/vue-timelines-wc.js';
```

## Quick Reference

```bash
# Build and copy for development
npm run build:vue-timelines
mkdir -p projects/riskpal-tasking-monitoring/src/assets/vue-timelines
cp projects/riskpal-tasking-monitoring/dev-libs/vue-timelines/dist/vue-timelines-wc.js \
   projects/riskpal-tasking-monitoring/src/assets/vue-timelines/vue-timelines-wc.js

# Or use the development script (does everything)
./projects/riskpal-tasking-monitoring/start-dev-tasking.sh
```

## Troubleshooting

### File Not Found

If you get errors about the web component not being found:

1. **Check if the build exists:**
   ```bash
   ls -la projects/riskpal-tasking-monitoring/dev-libs/vue-timelines/dist/vue-timelines-wc.js
   ```

2. **Rebuild if needed:**
   ```bash
   npm run build:vue-timelines
   ```

3. **Check if assets directory exists:**
   ```bash
   ls -la projects/riskpal-tasking-monitoring/src/assets/vue-timelines/
   ```

4. **Copy manually if automatic copy failed:**
   ```bash
   mkdir -p projects/riskpal-tasking-monitoring/src/assets/vue-timelines
   cp projects/riskpal-tasking-monitoring/dev-libs/vue-timelines/dist/vue-timelines-wc.js \
      projects/riskpal-tasking-monitoring/src/assets/vue-timelines/vue-timelines-wc.js
   ```

