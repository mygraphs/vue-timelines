# Installation and Usage

## NPM Installation

```bash
npm install vue-timelines
```

or with yarn:

```bash
yarn add vue-timelines
```

or with pnpm:

```bash
pnpm add vue-timelines
```

## Usage as Vue Plugin

### 1. Import and Register

```javascript
import { createApp } from 'vue';
import VueTimelines from 'vue-timelines';
import 'vue-timelines/dist/vue-timelines.css'; // Optional: if CSS is extracted

const app = createApp(App);
app.use(VueTimelines);
app.mount('#app');
```

### 2. Use in Component

```vue
<template>
  <MyTimeline
    :groups="groups"
    :tasks="tasks"
    height="600px"
    @task-updated="handleTaskUpdate"
  />
</template>

<script>
import { MyTimeline } from 'vue-timelines';

export default {
  components: {
    MyTimeline
  },
  data() {
    return {
      groups: [
        { id: "1", name: "Group 01" },
        { id: "2", name: "Group 02" }
      ],
      tasks: [
        {
          id: "01",
          group_id: "1",
          title: "Task 1",
          creationDate: 1641437099,
          dueDate: 1651805099,
          progress: 0.8,
          priority: 0
        }
      ]
    };
  },
  methods: {
    handleTaskUpdate(task) {
      console.log('Task updated:', task);
    }
  }
};
</script>
```

## Usage as Web Component

### 1. Import Web Component Bundle

```html
<!DOCTYPE html>
<html>
<head>
    <title>Vue Timeline</title>
</head>
<body>
    <vue-timeline
        height="600px"
        title="My Timeline"
        groups='[{"id":"1","name":"Group 1"}]'
        tasks='[{"id":"1","group_id":"1","title":"Task 1","creationDate":1641437099,"dueDate":1651805099,"progress":0.8,"priority":0}]'
    ></vue-timeline>

    <script src="node_modules/vue-timelines/dist/vue-timelines-wc.js"></script>
</body>
</html>
```

### 2. Or Import in Module Bundler

```javascript
import 'vue-timelines/web-component';
// The custom element will auto-register
```

### 3. Use in Angular/React/Vue

See [Web Component Documentation](./docs/WEB_COMPONENT.md) for framework-specific integration.

## Package Exports

The package provides multiple entry points:

- **Main entry** (`vue-timelines`): Vue plugin and components
  - ESM: `dist/vue-timelines.esm.js`
  - UMD: `dist/vue-timelines.umd.js`

- **Web Component** (`vue-timelines/web-component`): Standalone web component
  - `dist/vue-timelines-wc.js`

- **Styles** (`vue-timelines/style`): CSS styles (if extracted)
  - `dist/vue-timelines.css`

## CDN Usage

### Via unpkg

```html
<script src="https://unpkg.com/vue-timelines/dist/vue-timelines.min.js"></script>
```

### Via jsDelivr

```html
<script src="https://cdn.jsdelivr.net/npm/vue-timelines/dist/vue-timelines.min.js"></script>
```

## Requirements

- Vue 3.3.0 or higher
- Node.js 18.0.0 or higher (for development)

## Peer Dependencies

- `vue`: >= 3.3.0

The package includes all other dependencies bundled.

