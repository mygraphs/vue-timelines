<h1 style="text-align: center;">My Timeline</h1>

## 🚩DEMO

Visit our demo!
[http://mygraphs.github.io](http://mygraphs.github.io)

## 📦 Install

```
npm install vue-timelines --save
```

```html
// component.vue
<script>
  import MyTimeline from "vue-timelines";

  export default {
    // ...
    components: {
      Timeline,
    },
    // ...
  };
</script>
```

## Description

#### Timeline and Calendar Grid

The top of the interface features a timeline, marked with dates and days, that spans across several months. The calendar's grid allows for a visual representation of time, with vertical lines indicating days and thicker lines denoting the start of a new week.

#### Task Bars
Tasks are represented by horizontal bars that span the width of the timeline correlating to the task's duration. Each task bar is color-coded, possibly to represent different project stages or priorities.

#### Grouping
The tasks are organized into groups, as indicated by the headers on the left side (e.g., "group 01," "group 02"). This could represent different teams, project categories, or other organizational divisions.

#### Progress Indicators
Some tasks have a percentage completion indicator on the bar, such as "50%" or "80%," showing how much of the task has been completed.

#### Task Interaction
There are circular handles on either end of the task bars, suggesting that users can click and drag to adjust the start and end dates of each task. Additionally, hovering over a task bar reveals a tooltip with more details and further interaction options, such as editing task properties or progress.

#### Control Panel
On the top right, there is a control panel with various buttons, including "Daily," "Zoom -/+," "Reset," "Height -/+," and "Today," which provide different ways to view and navigate the timeline.

#### Task Details Sidebar
To the right, there's a sidebar with details about a selected task. This sidebar includes fields for the task name, start and end times, and a progress bar. There are "Update" and "Cancel" buttons, presumably to confirm or discard changes made to the task details.

#### Design Aesthetics
The interface has a simple and clean design, using a contrasting color palette where the tasks stand out against the lighter background of the calendar.

#### Application Branding
The top left corner features the application name "vue-timelines," suggesting that this interface may be built using the Vue.js framework.

Overall, the interface appears to be a web-based tool designed for tracking project timelines and tasks, providing users with an intuitive and interactive way to manage work over a period.

(according to chatGPT by uploading a picture to it)

## 🔧 Requirements

Needed node 18.12 for vue3datepicker

You can update your node version using nvm and make it persistent like this:
```
nvm install 18.12
nvm alias default 18.12
```

Update packages
```
npm i -g npm-check-updates
ncu -u
npm install
```

## 🔧 Usage

```html
<template>
  <MyTimeline
    :groups="taskGroups"
    :tasks="tasks"
    @update="handleUpdatedTasks"
  />
</template>

<script>
import MyGraphs from "./MyGraphs";

export default {
  name: "App",
  data() {
    return {
      groups: [
        {
          name: "group 01",
          id: "1",
          tasks: [
            {
              id: "01",
              title: "Test task 01",
              creationDate: 1641437099,
              dueDate: 1651805099,
              progress: 0.8,
              priority: 1,
            },
            {
              id: "02",
              title: "Test task 02",
              creationDate: 1643856299,
              dueDate: 1649126699,
              progress: 0.5,
              priority: 2,
            },
          ],
        },
        {
          name: "group 02",
          id: "2",
          tasks: [
            {
              id: "03",
              title: "Test task 03",
              creationDate: 1649041200,
              dueDate: 1650510000,
              progress: 0.8,
              priority: 1,
            },
            {
              id: "04",
              title: "Test task 04",
              creationDate: 1650596400,
              dueDate: 1651374000,
              progress: 0.5,
              priority: 2,
            },
            {
              id: "05",
              title: "Test task 05",
              creationDate: 1651719600,
              dueDate: 1651892400,
              progress: 0.5,
              priority: 2,
            },
            {
              id: "06",
              title: "Test task 06",
              creationDate: 1652151600,
              dueDate: 1652324400,
              progress: 0.5,
              priority: 1,
            },
          ],
        },
      ],
    };
  },
  methods: {
    handleUpdatedTasks: function ({ tasksUpdated, tasks }) {
      console.log(tasksUpdated);
      console.log(tasks);
      //... Perform your tasks
    },
  },
  components: {
    MyGraphs,
  },
};
</script>
```

