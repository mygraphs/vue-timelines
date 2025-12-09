# Using Vue Timeline Web Component in Your Project

This document explains how to use the built vue-timelines web component in your application.

## Build the Web Component

First, build the web component from the vue-timelines directory:

```bash
# From vue-timelines project root
npm run build:wc
```

This creates the file: `dist/vue-timelines-wc.js`

## Integration Methods

### Method 1: Direct Script Include (Simple Projects)

Copy the built file to your project's assets directory and include it:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Timeline App</title>
</head>
<body>
    <vue-timeline
        height="600px"
        title="My Project Timeline"
        groups='[{"id":"1","name":"Team A"}]'
        tasks='[{"id":"1","group_id":"1","title":"Task 1","creationDate":1641437099,"dueDate":1651805099}]'
    ></vue-timeline>

    <script src="/assets/vue-timelines/vue-timelines-wc.js"></script>
</body>
</html>
```

### Method 2: Module Bundler (Webpack, Vite, etc.)

Import the web component in your application:

```javascript
// In your main entry file
import 'vue-timelines/web-component';

// The custom element will auto-register
// Now you can use <vue-timeline> in your HTML
```

### Method 3: Framework Integration

#### Angular

Add to `angular.json` assets:

```json
{
  "glob": "vue-timelines-wc.js",
  "input": "node_modules/vue-timelines/dist",
  "output": "/assets/vue-timelines"
}
```

Then load in your component:

```typescript
// In your Angular component
private readonly WEB_COMPONENT_SCRIPT = '/assets/vue-timelines/vue-timelines-wc.js';

ngOnInit() {
  const script = document.createElement('script');
  script.src = this.WEB_COMPONENT_SCRIPT;
  document.body.appendChild(script);
}
```

#### React

```javascript
// In your React component
import { useEffect } from 'react';

function TimelineComponent() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/assets/vue-timelines/vue-timelines-wc.js';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <vue-timeline
      height="600px"
      title="My Timeline"
      groups={JSON.stringify(groups)}
      tasks={JSON.stringify(tasks)}
    />
  );
}
```

## File Locations

### Source (After Build)
- `dist/vue-timelines-wc.js` (in vue-timelines project)

### Typical Project Structure
```
your-project/
├── src/
│   └── assets/
│       └── vue-timelines/
│           └── vue-timelines-wc.js  (copied here)
└── public/
    └── assets/
        └── vue-timelines/
            └── vue-timelines-wc.js  (for production)
```

## Usage in Code

The web component can be used directly in HTML or through framework components:

```html
<vue-timeline
  height="600px"
  title="Project Timeline"
  groups='[{"id":"1","name":"Development"}]'
  tasks='[{"id":"1","group_id":"1","title":"Task 1","creationDate":1641437099,"dueDate":1651805099,"progress":0.8}]'
></vue-timeline>
```

## Quick Reference

```bash
# Build the web component
npm run build:wc

# Copy to your project (example paths - adjust to your project structure)
cp dist/vue-timelines-wc.js /path/to/your/project/src/assets/vue-timelines/
```

## Troubleshooting

### File Not Found

If you get errors about the web component not being found:

1. **Check if the build exists:**
   ```bash
   ls -la dist/vue-timelines-wc.js
   ```

2. **Rebuild if needed:**
   ```bash
   npm run build:wc
   ```

3. **Verify the file path in your application matches where you copied it**

4. **Check browser console for loading errors**

### Component Not Registering

- Ensure the script is loaded before you try to use `<vue-timeline>`
- Check browser console for JavaScript errors
- Verify you're using the correct custom element name: `<vue-timeline>` (kebab-case)

## See Also

- [Web Component Documentation](./WEB_COMPONENT.md) - Detailed web component API
- [Installation Guide](../README_INSTALL.md) - General installation instructions
