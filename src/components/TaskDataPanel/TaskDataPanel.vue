<template>
  <div v-if="groupName !== null" class="task__panel">
    <div>
      <TextEdit :edit="isEdit" :defaultText="title" field="title">Test</TextEdit>
      <div>
        <div>
          <VueDatePicker v-model="date" />
          START: <b>{{ creationDateText }}</b>
        </div>
        <div>
          &nbsp;&nbsp;&nbsp;END: <b>{{ dueDateText }}</b>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import * as localizedFormat from "dayjs/plugin/localizedFormat";

import eventBus from "../eventBus.js";

import { TextEdit } from "@/components";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

dayjs.extend(localizedFormat);
dayjs.locale(navigator.language);

export default {
  name: "TaskDataPanel",
  components: {
    TextEdit,
    VueDatePicker,
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
  padding: 16px;
  display: grid;
  place-items: center;
  background-color: #f8f9fc;
}

.task__title {
  font-weight: 500;
  margin: 1rem 0;
}
</style>
