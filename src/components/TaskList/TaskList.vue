<template>
  <div class="calendar__row">
    <template v-for="(_, index) in new Array(totalDays)" :key="index">
      <div class="calendar__cell" />
    </template>

    <template v-for="task in tasksData" :key="task.id">
      <Task v-bind="task" @update="handleTasksUpdate" />
    </template>
  </div>
</template>

<script>
import { Task } from "@/components";
import { totalDays, checkCalendarSize } from "@/contexts/CalendarContext";
import { orderTasks } from "@/utils/tasks";
import { initDay } from "@/utils/date";

export default {
  name: "TaskList",
  inject: { totalDays, checkCalendarSize },
  props: {
    id: {
      type: String,
      required: true,
    },
    tasks: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  data() {
    return {
      tasksData: [],
    };
  },
  methods: {
    setTaskData: function () {
      this.tasksData = this.tasks.map((task) => ({
        ...task,
        creationDate: initDay(task.creationDate),
        duedate: initDay(task.duedate),
      }));
    },
    handleTasksUpdate: function (taskUpdated) {
      const taskPosition = this.tasksData.findIndex((task) => {
        return task.id === taskUpdated.id;
      });

      this.tasksData[taskPosition] = {
        ...this.tasksData[taskPosition],
        ...taskUpdated,
      };

      const { tasksUpdated, tasks } = orderTasks(
        [this.tasksData[taskPosition]],
        this.tasksData
      );

      tasksUpdated.forEach((task, index) => {
        console.log(
          `${index + 1}: creation: ${new Date(task.creationDate * 1000)}`
        );
      });

      this.tasksData = tasks;
      this.checkCalendarSize(tasksUpdated);
    },
  },
  mounted() {
    this.setTaskData();
  },
  components: {
    Task,
  },
};
</script>
