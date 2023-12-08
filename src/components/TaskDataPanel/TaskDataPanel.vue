<template>
  <div v-if="groupName !== null" class="task__panel">
    <h2 class="task__title">{{ title }}</h2>
    <div>
      <div>START: <b>{{ creationDate }}</b></div>
      <div>&nbsp;&nbsp;&nbsp;END: <b>{{ dueDate }}</b></div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

import eventBus from '../eventBus.js';

dayjs.extend(localizedFormat);
dayjs.locale(navigator.language);

export default {
  name: "TaskDataPanel",
  inject: {
  },
  methods: {
    handleTask: function (task) {
      console.log("Display TASK")
      this.groupName = task.groupName;
      this.title = task.title;
      this.state = task.state;

      this.creationDate = dayjs(new Date(task.creationDate * 1000)).format('LLL');
      this.dueDate = dayjs(new Date(task.dueDate * 1000)).format('LLL');
    },
    invalidate: function() {
      console.log("Invalidate")
    },
  },
  mounted() {
    this.invalidate();
    eventBus.on('taskdatapanel', this.handleTask);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.documentEventListener);
    eventBus.off('taskdatapanel', this.handleTask);
  },
  data() {
    return {
      title: null,
      groupName: null,
      state: null,
      creationDate: null,
      dueDate: null,
      progress: null,
    };
  },
};
</script>

<style>
.task__panel {
  padding: 32px;
  display: block;
  justify-content: space-between;
  background-color: #f8f9fc;
}

.task__title {
  font-weight: 500;
  margin: 1rem 0;
}

</style>
