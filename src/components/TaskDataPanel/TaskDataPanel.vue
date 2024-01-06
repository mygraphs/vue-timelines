<template>
  <div v-if="groupId !== null" class="task__panel">
    <div>
      <TextEdit
        :edit="isEdit"
        :defaultText="title"
        v-model:newValue="title"
        field="title"
      >
        <template v-slot:textFormat>
          <h2>{{ title }}</h2>
        </template>
        <template v-slot:inputFormat> </template>
      </TextEdit>
      <div>
        <div>
          <b>START:</b>
          <div v-if="isEdit">
            <VueDatePicker
              :model-value="compStartDate"
              @update:model-value="setStartDate"
            />
          </div>
          <div v-else>
            {{ creationDateText }}
          </div>
        </div>
        <div>
          <b>END:</b>
          <div v-if="isEdit">
            <VueDatePicker :model-value="compEndDate" @update:model-value="setEndDate" />
          </div>
          <div v-else>
            {{ dueDateText }}
          </div>
        </div>

        <div>
          <b>Progress:</b>
              <VueSlider v-model="progressPct" style=" --tooltip-color: #FFFFFF; --tooltip-text-color: #000000; --min: 0; --max: 100;--height: 10px" color="#FB278D" track-color="#FEFEFE" />
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import slider from "vue3-slider"

import * as localizedFormat from "dayjs/plugin/localizedFormat";

import eventBus from "../eventBus.js";

import { nextTick } from "vue";
import { TextEdit } from "@/components";

import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

dayjs.extend(localizedFormat);
dayjs.locale(navigator.language);

export default {
  name: "TaskDataPanel",
  components: {
    TextEdit,
    VueDatePicker,
    "VueSlider": slider
  },
  inject: {
    updateTask: { from: "updateTask" },
  },
  methods: {
    setStartDate: function (startDate) {
      console.log(" START DATE CHANGED " + startDate);
      this.creationDate = startDate / 1000;
    },
    setEndDate: function (endDate) {
      console.log(" End DATE CHANGED " + endDate);
      this.dueDate = endDate / 1000;
    },
    handleUpdateText: function (element, text) {
      console.log(" TEXT CHANGED " + text);
    },
    handleTaskEditCancel: function (task) {
      console.log(" CANCEL TASK EDIT ");
      this.isEdit = false;
    },
    handleTaskEdit: function (task) {
      console.log(" SET EDIT " + task.title);
      if (this.isEdit) this.isEdit = false;

      this.handleTask(task);

      nextTick(() => {
        this.isEdit = true;
      });
    },
    handleTask: function (task) {
      this.sourceTask = task;

      this.title = task.title;
      this.groupId = task.group_id;
      this.creationDate = task.creationDate;
      this.dueDate = task.dueDate;
      this.progressPct = Math.round(task.progress * 100);
      this.state = task.state;
    },
    commitTask: function () {
      console.log("============ COMMIT TASK " + this.title + "====================");
      let task = {
        ...this.sourceTask,
        title: this.title,
        creationDate: this.creationDate,
        dueDate: this.dueDate,
        progress: this.progressPct / 100,
        state: this.state,
      }

      try {
        this.updateTask(task);
      } catch (error) {
        console.log(" CRASH " + error);
        debugger;
      }
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
  computed: {
    creationDateText() {
      return dayjs(new Date(this.creationDate * 1000)).format("LLL");
    },
    dueDateText() {
      return dayjs(new Date(this.dueDate * 1000)).format("LLL");
    },
    compStartDate() {
      return new Date(this.creationDate * 1000);
    },
    compEndDate() {
      return new Date(this.dueDate * 1000);
    },
  },
  watch: {
    title(newTitle) {
      console.log(" PROPAGATE TITLE CHANGE TO " + newTitle);
      if (this.sourceTask.title != newTitle)
        this.commitTask();
    },
    creationDate(newDate) {
      console.log(" PROPAGATE Start DATE ")
      if (this.sourceTask.creationDate != newDate)
        this.commitTask();
    },
    progressPct(newProgress) {
      console.log(" Progress changed " + newProgress)
      this.commitTask();
    },
    dueDate(newDate) {
      console.log(" PROPAGATE End DATE ");
      if (this.sourceTask.dueDate != newDate)
        this.commitTask();
    },
  },
  provide: function () {
    return {
    };
  },
  data() {
    return {
      isEdit: false,
      title: null,
      groupId: null,
      state: null,

      creationDate: null,
      dueDate: null,

      // Converted from progress which is 0..1
      progressPct: 0,
      sourceTask: null,

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
