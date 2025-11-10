# Vue Timeline Web Component

The Vue Timeline library can be used as a web component in any framework (Angular, React, Vue, or vanilla JavaScript).

## Installation

Build the web component:

```bash
npm run build:wc
```

This creates `dist/vue-timelines-wc.js` which contains everything needed (Vue, Vuex, and the timeline component).

## Basic Usage

### HTML

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

    <script src="./dist/vue-timelines-wc.js"></script>
</body>
</html>
```

### JavaScript API

```javascript
// Wait for custom element to be defined
customElements.whenDefined('vue-timeline').then(() => {
    const timeline = document.querySelector('vue-timeline');

    // Set data programmatically
    timeline.setGroups([
        { id: "1", name: "Group 01" },
        { id: "2", name: "Group 02" }
    ]);

    timeline.setTasks([
        {
            id: "01",
            group_id: "1",
            title: "Task 1",
            creationDate: 1641437099,
            dueDate: 1651805099,
            progress: 0.8,
            priority: 0
        }
    ]);

    timeline.setTitle("My Timeline");

    // Listen for events
    timeline.addEventListener('task-updated', (event) => {
        console.log('Task updated:', event.detail);
    });
});
```

## Attributes

- `height` (String): Height of the timeline component. Default: `"100vh"`
- `title` (String): Title of the timeline
- `groups` (JSON String): Array of group objects
- `tasks` (JSON String): Array of task objects

## Properties

The web component exposes the following properties that can be set programmatically:

- `height`: String - Height of the timeline
- `groups`: Array - Groups array
- `tasks`: Array - Tasks array
- `title`: String - Timeline title

## Methods

- `setGroups(groups)`: Set the groups array
- `setTasks(tasks)`: Set the tasks array
- `setTitle(title)`: Set the timeline title

## Events

- `task-updated`: Fired when a task is updated. Event detail contains the updated task object.

## Angular Integration

### 1. Install and Build

```bash
npm install vue-timelines
npm run build:wc
```

Copy `dist/vue-timelines-wc.js` to your Angular project's `assets` folder.

### 2. Add to angular.json

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "scripts": [
              "src/assets/vue-timelines-wc.js"
            ]
          }
        }
      }
    }
  }
}
```

### 3. Use in Component Template

```typescript
// app.component.ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <vue-timeline
      [attr.height]="'600px'"
      [attr.title]="title"
      [attr.groups]="groupsJson"
      [attr.tasks]="tasksJson"
      (task-updated)="onTaskUpdated($event)"
    ></vue-timeline>
  `
})
export class AppComponent implements OnInit {
  title = 'My Timeline';
  groups = [
    { id: "1", name: "Group 01" },
    { id: "2", name: "Group 02" }
  ];
  tasks = [
    {
      id: "01",
      group_id: "1",
      title: "Task 1",
      creationDate: 1641437099,
      dueDate: 1651805099,
      progress: 0.8,
      priority: 0
    }
  ];

  get groupsJson() {
    return JSON.stringify(this.groups);
  }

  get tasksJson() {
    return JSON.stringify(this.tasks);
  }

  ngOnInit() {
    // Wait for custom element to be defined
    customElements.whenDefined('vue-timeline').then(() => {
      const timeline = document.querySelector('vue-timeline') as any;
      // Use methods if needed
    });
  }

  onTaskUpdated(event: CustomEvent) {
    console.log('Task updated:', event.detail);
    // Update your Angular component state
  }
}
```

### 4. TypeScript Declarations (Optional)

Create `src/typings/vue-timeline.d.ts`:

```typescript
declare namespace JSX {
  interface IntrinsicElements {
    'vue-timeline': {
      height?: string;
      title?: string;
      groups?: string;
      tasks?: string;
      onTaskUpdated?: (event: CustomEvent) => void;
    };
  }
}
```

## React Integration

### 1. Install and Build

```bash
npm install vue-timelines
npm run build:wc
```

Copy `dist/vue-timelines-wc.js` to your React project's `public` folder.

### 2. Use in Component

```jsx
import React, { useEffect, useRef } from 'react';

function TimelineComponent() {
  const timelineRef = useRef(null);

  useEffect(() => {
    // Wait for custom element
    customElements.whenDefined('vue-timeline').then(() => {
      if (timelineRef.current) {
        timelineRef.current.setGroups([
          { id: "1", name: "Group 01" }
        ]);
        timelineRef.current.setTasks([
          {
            id: "01",
            group_id: "1",
            title: "Task 1",
            creationDate: 1641437099,
            dueDate: 1651805099,
            progress: 0.8,
            priority: 0
          }
        ]);

        timelineRef.current.addEventListener('task-updated', (e) => {
          console.log('Task updated:', e.detail);
        });
      }
    });
  }, []);

  return (
    <vue-timeline
      ref={timelineRef}
      height="600px"
      title="My Timeline"
    />
  );
}
```

## Task Object Structure

```typescript
interface Task {
  id: string;
  group_id: string;
  title: string;
  creationDate: number; // Unix timestamp in seconds
  dueDate: number; // Unix timestamp in seconds
  progress: number; // 0.0 to 1.0
  priority: number; // Row priority within group
}
```

## Group Object Structure

```typescript
interface Group {
  id: string;
  name: string;
  color_name?: string; // Optional
}
```

## Notes

- The web component uses Shadow DOM for encapsulation
- Each web component instance has its own Vue app and Vuex store instance
- Attributes must be JSON strings (for complex data like arrays/objects)
- Use methods (`setGroups`, `setTasks`, `setTitle`) for programmatic updates
- Events bubble and are composed, so they can be caught by parent elements

