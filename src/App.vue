<template>
  <MyGraphs :groups="groups" @update="handleUpdatedTasks" />
</template>

<script>
import MyGraphs from "./MyGraphs";

var test = {
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
          dueDate: 1652152600,
          progress: 0.5,
          priority: 1,
        },
      ],
    },
  ],
};

var testTask = {
  groups: [
    {
      name: "group 01",
      id: "1",
      tasks: [
        {
          id: "01",
          title: "Test task 01",
          creationDate: 1651802099,
          dueDate: 1651805099,
          progress: 0.8,
          priority: 1,
        },
        {
          id: "02",
          title: "Test task 02",
          creationDate: 1651702099,
          dueDate: 1651912099,
          progress: 0.5,
          priority: 2,
        },
      ],
    },
  ]
};

export default {
  name: "App",
  data() {
    return test;
  },
  methods: {
    handleUpdatedTasks: function ({ tasksUpdated, tasks }) {
      console.log(tasksUpdated);
      console.log(tasks);
    },
  },
  components: {
    MyGraphs,
  },
};
</script>

<style>
* {
  box-sizing: border-box;
}
</style>
