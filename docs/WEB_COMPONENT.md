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
        group-create-enabled="false"
        group-edit-enabled="false"
        row-add-remove-enabled="false"
        status-colors='{"Pending":"#ffb311","Ongoing":"#3c8dbc","Completed":"#00a85d","Overdue":"#ff3636","Cancelled":"#343a40","Reopened":"#9b59b6"}'
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

    // Set custom task edit callback (optional)
    // If not set, double-clicking a task will open the default task data panel
    timeline.setTaskEditCallback((task) => {
        console.log('Task double-clicked:', task);
        // Open your custom modal or handle the edit as needed
        // For example: openCustomModal(task);

        // After editing in your modal, communicate changes back:
        // timeline.updateTask(editedTask);
    });

    // Configure group editing (optional)
    timeline.setGroupCreateEnabled(false); // Hide "New group" button
    timeline.setGroupEditEnabled(false);   // Disable group name editing
    timeline.setRowAddRemoveEnabled(false); // Hide row add/remove buttons (+ and -)

    // Configure status colors (optional)
    timeline.setStatusColors({
        "Pending": "#ffb311",      // Yellow/Warning
        "Ongoing": "#3c8dbc",      // Blue/Info
        "Completed": "#00a85d",    // Green/Success
        "Overdue": "#ff3636",      // Red/Error
        "Cancelled": "#343a40",    // Dark/Gray
        "Reopened": "#9b59b6"      // Purple
    });

    // Listen for events
    timeline.addEventListener('task-updated', (event) => {
        console.log('Task updated:', event.detail);
        // This event is fired when a task is updated through the timeline
        // (e.g., dragging, resizing, or via updateTask method)
    });
});
```

## Attributes

- `height` (String): Height of the timeline component. Default: `"100vh"`
- `title` (String): Title of the timeline
- `groups` (JSON String): Array of group objects
- `tasks` (JSON String): Array of task objects
- `group-create-enabled` (Boolean): Show or hide the "New group" button. Set to `"false"` to hide. Default: `"true"`
- `group-edit-enabled` (Boolean): Enable or disable group name editing. Set to `"false"` to make group names read-only. Default: `"true"`
- `row-add-remove-enabled` (Boolean): Enable or disable the row add/remove buttons (+ and - buttons in timeline rows). Set to `"false"` to hide. Default: `"true"`
- `status-colors` (JSON String): Custom status color mapping. Maps status names to CSS color values. Example: `'{"Pending":"#ffb311","Completed":"#00a85d","Overdue":"#ff3636"}'`. Tasks with a `state` property matching these status names will use the specified colors.

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
- `setTaskEditCallback(callback)`: Set a custom callback function to handle task double-click edit events. If provided, this callback will be called instead of opening the default task data panel. The callback receives the task object as its parameter.
- `updateTask(task)`: Update a task in the timeline. Use this method to communicate task changes back to the timeline after editing in a custom modal. The task object should contain the updated task data.
- `setGroupCreateEnabled(enabled)`: Show or hide the "New group" button. Set to `false` to hide the button.
- `setGroupEditEnabled(enabled)`: Enable or disable group name editing. Set to `false` to make group names read-only.
- `setRowAddRemoveEnabled(enabled)`: Enable or disable the row add/remove buttons (+ and - buttons in timeline rows). Set to `false` to hide these buttons.
- `setStatusColors(statusColors)`: Configure custom status colors. Accepts an object mapping status names to CSS color values (e.g., `{ "Pending": "#ffb311", "Completed": "#00a85d" }`). Tasks with a `state` property matching these status names will use the specified colors.

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

      // Set custom task edit callback (optional)
      timeline.setTaskEditCallback((task: any) => {
        console.log('Task double-clicked:', task);
        // Open your custom modal or handle the edit as needed
        // For example: this.openTaskEditModal(task);

        // After editing in your modal, communicate changes back:
        // timeline.updateTask(editedTask);
      });

      // Configure group editing (optional)
      timeline.setGroupCreateEnabled(false); // Hide "New group" button
      timeline.setGroupEditEnabled(false);   // Disable group name editing
      timeline.setRowAddRemoveEnabled(false); // Hide row add/remove buttons (+ and -)

      // Configure status colors (optional)
      timeline.setStatusColors({
        "Pending": "#ffb311",
        "Ongoing": "#3c8dbc",
        "Completed": "#00a85d",
        "Overdue": "#ff3636",
        "Cancelled": "#343a40",
        "Reopened": "#9b59b6"
      });
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

        // Set custom task edit callback (optional)
        timelineRef.current.setTaskEditCallback((task) => {
          console.log('Task double-clicked:', task);
          // Open your custom modal or handle the edit as needed

          // After editing in your modal, communicate changes back:
          // timelineRef.current.updateTask(editedTask);
        });

        // Configure group editing (optional)
        timelineRef.current.setGroupCreateEnabled(false); // Hide "New group" button
        timelineRef.current.setGroupEditEnabled(false);   // Disable group name editing
        timelineRef.current.setRowAddRemoveEnabled(false); // Hide row add/remove buttons (+ and -)

        // Configure status colors (optional)
        timelineRef.current.setStatusColors({
          "Pending": "#ffb311",
          "Ongoing": "#3c8dbc",
          "Completed": "#00a85d",
          "Overdue": "#ff3636",
          "Cancelled": "#343a40",
          "Reopened": "#9b59b6"
        });

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

## Communicating Changes Back

When using a custom task edit callback, you need to communicate changes back to the timeline after editing:

```javascript
timeline.setTaskEditCallback((task) => {
    // Open your custom modal
    openCustomModal(task, (editedTask) => {
        // After user saves changes in your modal, update the timeline
        timeline.updateTask(editedTask);
        // This will trigger a 'task-updated' event and update the timeline display
    });
});
```

The `updateTask` method:
- Updates the task in the timeline's internal state
- Triggers a `task-updated` event (if you need to listen for it)
- Updates the visual display of the task on the timeline

## Status and Colors

Tasks can have a `state` property that determines their visual appearance. You can configure custom status colors using `setStatusColors()` or the `status-colors` attribute.

### Predefined States

The timeline supports these predefined states with default colors:
- `info` - Blue (#3c8dbc)
- `success` - Green (#00a85d)
- `warning` - Yellow (#ffb311)
- `danger` - Red (#ff3636)
- `dark` - Dark gray (#343a40)

### Custom Status Colors

You can define custom statuses and their colors:

```javascript
timeline.setStatusColors({
    "Pending": "#ffb311",
    "Ongoing": "#3c8dbc",
    "Completed": "#00a85d",
    "Overdue": "#ff3636",
    "Cancelled": "#343a40",
    "Reopened": "#9b59b6"
});
```

Tasks should have a `state` property matching one of these status names:

```javascript
{
    id: "1",
    title: "My Task",
    state: "Pending",  // This will use the color defined for "Pending"
    // ... other task properties
}
```

## Notes

- The web component uses light DOM (not Shadow DOM) for better CSS compatibility
- Each web component instance has its own Vue app and Vuex store instance
- Attributes must be JSON strings (for complex data like arrays/objects)
- Use methods (`setGroups`, `setTasks`, `setTitle`, `updateTask`) for programmatic updates
- Events bubble and are composed, so they can be caught by parent elements
- When using a custom edit callback, you are responsible for calling `updateTask` to sync changes back
- Task colors are applied via inline styles when using custom status colors, or via CSS classes for predefined states

