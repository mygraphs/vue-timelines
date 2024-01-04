<template>
  <div v-if="groupName !== null" class="task__panel">
    <TextEdit :edit="isEdit" :defaultText="title" field="title">Test</TextEdit>
    <div>
      <div>
        START: <b>{{ creationDate }}</b>
      </div>
      <div>
        &nbsp;&nbsp;&nbsp;END: <b>{{ dueDate }}</b>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import * as localizedFormat from "dayjs/plugin/localizedFormat";

import eventBus from "../eventBus.js";
import { TextEdit } from "../TextEdit/index.js";

dayjs.extend(localizedFormat);
dayjs.locale(navigator.language);

export default {
  name: "TaskDataPanel",
  components: {
    TextEdit,
  },
  inject: {},
  methods: {
    handleUpdateText: function (element, text) {
      console.log(" TEXT CHANGED " + text);
    },
    handleTaskEditCancel: function (task) {
      console.log(" CANCEL TASK EDIT ");
      this.isEdit = false;
    },
    handleTaskEdit: function (task) {
      console.log(" SET EDIT " + task.title);
      this.handleTask(task);
      this.isEdit = true;
    },
    handleTask: function (task) {
      this.isEdit = false;
      this.title = task.title;
      this.groupName = task.groupName;

      this.creationDate = task.creationDate;
      this.creationDateText = dayjs(new Date(task.creationDate * 1000)).format("LLL");

      this.dueDate = task.dueDate;
      this.dueDateText = dayjs(new Date(task.dueDate * 1000)).format("LLL");
    },
    invalidate: function () {
      console.log("Invalidate");
    },
  },
  mounted() {
    this.invalidate();
    eventBus.on("taskdatapanel", this.handleTask);
    eventBus.on("taskdatapanel-edit", this.handleTaskEdit);
    eventBus.on("taskdatapanel-edit-cancel", this.handleTaskEditCancel);
  },
  beforeUnmount() {
    eventBus.off("taskdatapanel", this.handleTask);
    eventBus.off("taskdatapanel-edit", this.handleTaskEdit);
    eventBus.off("taskdatapanel-edit-cancel", this.handleTaskEditCancel);
  },
  provide: function () {
    return {
      handleUpdateText: this.handleUpdateText,
    };
  },
  data() {
    return {
      isEdit: false,
      title: null,
      groupName: null,
      state: null,

      creationDate: null,
      dueDate: null,

      creationDateText: "",
      dueDateText: "",

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
