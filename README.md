# Vue Timelines

<div align="center">

**A powerful, interactive timeline and Gantt chart component for Vue 3**

[![npm version](https://img.shields.io/npm/v/vue-timelines.svg)](https://www.npmjs.com/package/vue-timelines)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)](https://vuejs.org/)

[🚀 Live Demo](http://mygraphs.github.io) • [📖 Documentation](./README_INSTALL.md) • [🐛 Report Bug](https://github.com/mygraphs/vue-timelines/issues)

</div>

---

## ✨ Features

Vue Timelines is a comprehensive timeline and Gantt chart component built for Vue 3, designed to help you visualize and manage projects, tasks, and schedules with ease.

### 🎯 Core Capabilities

- **📅 Interactive Timeline View** - Visualize tasks across days, weeks, and months with an intuitive calendar grid
- **🎨 Drag & Drop Tasks** - Resize and reposition tasks directly on the timeline by dragging handles
- **📊 Progress Tracking** - Visual progress indicators with customizable completion percentages
- **👥 Task Grouping** - Organize tasks into groups (teams, projects, categories, etc.)
- **🌳 Hierarchical Tasks** - Support for parent tasks and subtasks with automatic depth calculation
- **🎨 Customizable Themes** - Built-in light/dark themes with CSS custom properties for easy customization
- **📱 Responsive Design** - Adapts to different screen sizes with flexible layouts
- **🔧 Configurable** - Extensive configuration options for behavior, styling, and interactions

### 🚀 Advanced Features

- **Web Component Support** - Use as a custom element in Angular, React, or any framework
- **API Integration** - Flexible API service layer for backend integration
- **Task States & Colors** - Custom status colors and visual states (Pending, Ongoing, Completed, etc.)
- **Lock Completed Tasks** - Prevent editing of completed tasks
- **Conflict Detection** - Visual feedback when tasks overlap
- **Smart Text Rendering** - Automatic text positioning for small tasks with wrapping support
- **Row Management** - Dynamic row allocation and group-based organization

---

## 🚩 Live Demo

Experience Vue Timelines in action:

**[👉 View Live Demo](http://mygraphs.github.io)**

The demo showcases all major features including task management, hierarchical structures, and interactive editing.

---

## 📦 Installation

Install via npm, yarn, or pnpm:

```bash
npm install vue-timelines
```

```bash
yarn add vue-timelines
```

```bash
pnpm add vue-timelines
```

### Requirements

- **Vue**: >= 3.3.0
- **Node.js**: >= 18.0.0 (for development)
- **npm**: >= 9.0.0 (for development)

---

## 🚀 Quick Start

### Basic Usage

```vue
<template>
  <MyTimeline
    :groups="groups"
    :tasks="tasks"
    @update="handleTaskUpdate"
  />
</template>

<script>
import { MyTimeline } from 'vue-timelines';
import 'vue-timelines/dist/vue-timelines.css';

export default {
  components: {
    MyTimeline
  },
  data() {
    return {
      groups: [
        { id: "1", name: "Frontend Team" },
        { id: "2", name: "Backend Team" }
      ],
      tasks: [
        {
          id: "task-1",
          group_id: "1",
          title: "Design System",
          creationDate: 1641437099,  // Unix timestamp
          dueDate: 1651805099,
          progress: 0.75,
          priority: 0,
          state: "Ongoing"
        },
        {
          id: "task-2",
          group_id: "1",
          title: "Component Library",
          creationDate: 1643856299,
          dueDate: 1649126699,
          progress: 0.5,
          priority: 1,
          state: "Pending"
        }
      ]
    };
  },
  methods: {
    handleTaskUpdate(task) {
      console.log('Task updated:', task);
      // Update your data store or API
    }
  }
};
</script>
```

### Task Data Structure

```javascript
{
  id: "unique-task-id",           // Required: Unique identifier
  group_id: "group-id",           // Required: Group this task belongs to
  title: "Task Name",              // Required: Display name
  creationDate: 1641437099,        // Required: Start date (Unix timestamp)
  dueDate: 1651805099,             // Required: End date (Unix timestamp)
  progress: 0.75,                   // Optional: 0.0 to 1.0 (0% to 100%)
  priority: 0,                     // Optional: Priority level
  state: "Ongoing",                // Optional: Task state (Pending, Ongoing, Completed, etc.)
  parentTaskId: null,              // Optional: Parent task ID for subtasks
  isSubtask: false,                // Optional: Mark as subtask
  icon: "eye",                     // Optional: FontAwesome icon name
  depth: 0                         // Auto-calculated: Hierarchy depth
}
```

---

## 📚 Documentation

- **[📖 Installation & Usage Guide](./README_INSTALL.md)** - Detailed setup instructions
- **[🌳 Task Dependencies & Hierarchy](./docs/TASK_DEPENDENCIES.md)** - Working with parent/child tasks
- **[🎨 Theming Guide](./docs/THEMING.md)** - Customizing colors and styles
- **[🌐 Web Component Usage](./docs/WEB_COMPONENT.md)** - Using in Angular, React, or vanilla JS
- **[🔌 API Service Integration](./docs/API_SERVICE.md)** - Backend integration guide

---

## 🎨 Key Features in Detail

### Hierarchical Tasks

Create parent-child relationships between tasks for better organization:

```javascript
{
  id: "parent-1",
  title: "Project Setup",
  // ... other fields
},
{
  id: "child-1",
  title: "Install Dependencies",
  parentTaskId: "parent-1",
  isSubtask: true,
  // ... other fields
}
```

The component automatically calculates depth, handles indentation, and maintains hierarchy during sorting.

### Task States & Colors

Customize task appearance with states and colors:

```javascript
// In your Vuex store or component config
config: {
  STATUS_COLORS: {
    "Pending": "#ffb311",
    "Ongoing": "#3c8dbc",
    "Completed": "#00a85d",
    "Overdue": "#ff3636"
  }
}
```

### Interactive Editing

- **Drag to Resize**: Click and drag the left/right handles to adjust task duration
- **Drag to Move**: Click and drag the task bar to change start date
- **Double Click**: Open task editor panel
- **Visual Feedback**: Color-coded states for conflicts, selections, and interactions

### Smart Text Rendering

Tasks automatically handle text display:
- Small tasks (< 100px): Text appears outside the task for readability
- Limited space: Text wraps with word boundaries and ellipsis
- Vertical centering: Text stays centered even when wrapping

---

## 🔧 Configuration

The component supports extensive configuration through Vuex store or component props:

```javascript
config: {
  // Task behavior
  TASK_DRAGGING_ENABLED: true,
  TASK_CONSTRAINED_TO_GROUP: true,
  COMPLETED_TASKS_FIXED: true,
  DUE_DATE_MIN_TODAY: true,

  // Visual
  STATUS_COLORS: {},
  TASK_MIN_SEPARATION_S: 300,

  // UI controls
  GROUP_CREATE_ENABLED: true,
  GROUP_EDIT_ENABLED: true,
  ROW_ADD_REMOVE_ENABLED: true
}
```

---

## 🌐 Web Component Usage

Use Vue Timelines in any framework as a web component:

```html
<vue-timeline
  height="600px"
  title="My Project Timeline"
  groups='[{"id":"1","name":"Team A"}]'
  tasks='[{"id":"1","group_id":"1","title":"Task 1","creationDate":1641437099,"dueDate":1651805099}]'
></vue-timeline>

<script src="https://unpkg.com/vue-timelines/dist/vue-timelines-wc.js"></script>
```

See [Web Component Documentation](./docs/WEB_COMPONENT.md) for framework-specific examples.

---

## 🛠️ Development

### Setup

```bash
# Clone the repository
git clone https://github.com/mygraphs/vue-timelines.git
cd vue-timelines

# Install dependencies
npm install

# Start development server
npm run serve
```

### Build

```bash
# Build library (UMD, ESM, IIFE)
npm run build

# Build web component
npm run build:wc

# Build everything
npm run build:all

# Build demo for GitHub Pages
npm run build:demo
```

For detailed development instructions, see [DEVELOPMENT.md](./DEVELOPMENT.md).

---

## 📋 Project Structure

```
vue-timelines/
├── src/
│   ├── components/          # Vue components
│   │   ├── Timeline/        # Timeline components
│   │   ├── Calendar/        # Calendar grid
│   │   └── ...
│   ├── store/               # Vuex store modules
│   ├── contexts/            # React-style contexts
│   ├── utils/               # Utility functions
│   └── styles/              # Theme files
├── dist/                    # Build output
├── docs/                    # Documentation
└── examples/                # Example implementations
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Vue 3](https://vuejs.org/)
- Uses [Vuex](https://vuex.vuejs.org/) for state management
- Icons provided by [Font Awesome](https://fontawesome.com/)

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/mygraphs/vue-timelines/issues)
- **Documentation**: [Installation Guide](./README_INSTALL.md)
- **Demo**: [Live Demo](http://mygraphs.github.io)

---

<div align="center">

**Made with ❤️ by [mygraphs](https://github.com/mygraphs)**

[⭐ Star us on GitHub](https://github.com/mygraphs/vue-timelines) if you find this project helpful!

</div>
