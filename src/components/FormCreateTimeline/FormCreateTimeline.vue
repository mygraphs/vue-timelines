<template>
  <div ref="ref_create_timeline_panel">
    <div v-if="groupId === null" class="create__timeline_panel">
      <div class="create__timeline_panel_container">
        <div style="max-width: 300px">
          <h1>HELP</h1>

          <p>
            <i class="fa fa-square fa-xs" />
            Create a new timeline that will contain all the information
          </p>
        </div>
      </div>
    </div>
    <div v-else class="create__timeline_panel">
      <div class="create__timeline_panel_container">
        <div class="create__timeline_panel_header">
          <i
            class="fa fa-close fa-pull-right ml-2"
            @click.stop.prevent="closeParent"
            style="cursor: pointer; padding: 5px"
          />

          <div v-if="!isEdit">
            <i
              class="fa fa-edit fa-pull-right"
              @click.stop.prevent="isEdit = true"
              style="cursor: pointer; padding: 5px"
            />
<!--
            <i
              class="fa fa-thumbtack ml-2"
              @click.stop.prevent="closeParent"
              style="cursor: pointer; padding: 5px"
            />
-->
          </div>
          <div v-else></div>
        </div>
        <br />
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
        <br />
        <div>
          <div class="flex-grid">
            <div class="coll">
              <b> START </b>
            </div>
            <div v-if="isEdit" class="colr">
              <VueDatePicker
                :model-value="compStartDate"
                @update:model-value="setStartDate"
              />
            </div>

            <div v-else class="colr">
              {{ creationDateText }}
            </div>
          </div>
          <div class="flex-grid">
            <div class="coll"><b>END </b></div>
            <div v-if="isEdit" class="colr">
              <VueDatePicker
                :model-value="compEndDate"
                @update:model-value="setEndDate"
              />
            </div>
            <div v-else class="colr">
              {{ dueDateText }}
            </div>
          </div>
          <br />

          <div class="flex-grid">
            <div class="coll">
              <b>Progress:</b>
            </div>
            <div class="colr">
              <VueSlider
                v-model="progressPct"
                style="
                  --tooltip-color: #ffffff;
                  --tooltip-text-color: #000000;
                  --min: 0;
                  --max: 100;
                  --height: 10px;
                "
                :alwaysShowHandle="true"
                color="#FB278D"
                track-color="#FEFEFE"
                @touchstart.stop="console.log('touch')"
                @mousedown.stop="console.log('mousedown')"
                @mouseenter.stop="console.log('mouseenter')"
                @mouseleave.stop="console.log('mouseleave')"
              />
            </div>
          </div>

          <br />

          <div v-if="isEdit">
            <button class="btn btn-success small" @click="handleSubmit">Save</button>
            <button class="btn btn-warning small fa-pull-right" @click="handleCancel">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";

import * as localizedFormat from "dayjs/plugin/localizedFormat";

import eventBus from "../eventBus.js";

import { nextTick } from "vue";
import { TextEdit } from "@/components/TextEdit/";

import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

dayjs.extend(localizedFormat);
dayjs.locale(navigator.language);

export default {
  name: "TaskDataPanel",
  components: {
    TextEdit,
    VueDatePicker,
  },
  inject: {

  },
  methods: {
    openParent: function () {
      this.$emit("OpenParent");
    },
    closeParent: function () {
      this.$emit("CloseParent");
    },
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
      this.closeParent();
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
      this.openParent();

      let newTask = false;

      // We detect if we are being provided with a new task.
      // If we have the editor open, we will remember our tasks to be able to cancel it.
      if (this.sourceTask == null || task.id != this.sourceTask.id) {
        newTask = true;
      }

      // If we are a new task or we are not editing we update our cancel button
      if (newTask || !this.isEdit) {
        this.sourceTask = { ...task };
      }

      this.inEditTask = { ...task };
      this.title = task.title;
      this.groupId = task.group_id;
      this.creationDate = task.creationDate;
      this.dueDate = task.dueDate;
      this.state = task.state;
    },
    handleSubmit: function () {
      // We update our internal reference to know that this task was OK
      console.log(" Submit ");
      this.sourceTask = this.inEditTask;
      this.isEdit = false;
      this.closeParent();
    },
    handleCancel: function () {
      console.log(" Revert into edited task ");
      this.handleTask(this.sourceTask);
      this.commitTask();
      this.isEdit = false;
      this.closeParent();
    },
    commitTask: function () {
      console.log("============ COMMIT TIMELINE " + this.title + "====================");
      let timeline = {
        ...this.inEditTask,
        title: this.title,
        creationDate: this.creationDate,
        dueDate: this.dueDate,
        progress: this.progressPct / 100,
        state: this.state,
      };

      /*
      try {
        this.updateTask(timeline);
      } catch (error) {
        console.log(" CRASH " + error);
        debugger;
      }
      */
    },
    invalidate: function () {
      console.log("Invalidate");
    },
  },
  mounted() {
    this.invalidate();
  },
  beforeUnmount() {
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
      if (this.inEditTask.title != newTitle) this.commitTask();
    },
    creationDate(newDate) {
      console.log(" PROPAGATE Start DATE ");
      if (this.inEditTask.creationDate != newDate) this.commitTask();
    },
    dueDate(newDate) {
      console.log(" PROPAGATE End DATE ");
      if (this.inEditTask.dueDate != newDate) this.commitTask();
    },
  },
  provide: function () {
    return {};
  },
  data() {
    return {
      isEdit: false,
      title: null,
      state: null,

      creationDate: null,
      dueDate: null,

      // Converted from progress which is 0..1
      sourceTask: null,
      inEditTask: null,
    };
  },
};
</script>

<style>
.create__timeline_panel_header {
  height: 10px;
  z-index: 100;
}

.create__timeline_panel:before {
}

.create__timeline_panel {
  margin-left: 12px;
  margin-right: 12px;
  border-radius: 10px;
  padding: 12px;

  border: 1px;
  border-color: #000;
  border-style: solid;

  background-color: #fafafa;

  padding: 12px;
  float: right;

  height: 320px;
  width: 400px;

  position: absolute;

  left: v-bind('pos_x + "px"');
  top: v-bind('pos_y + "px"');

  border: 1px solid black;
}

.create__timeline_panel_container {
  min-width: 150px;
  min-height: 100px;
  margin-top: auto;
}

.task__title {
  font-weight: 500;
  margin: 1rem 0;
}
</style>

<style scoped>
.small {
  padding: 2px;
  padding-left: 10px;
  padding-right: 10px;
}

.flex-grid {
  display: flex;
  justify-content: center;
  align-items: center;
}
.flex-grid .coll {
  width: 20%;
}
.flex-grid .colr {
  width: 80%;
}
</style>
