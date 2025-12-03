<template>
  <!-- Custom floating panel - no modal dependency -->
  <div v-if="isModalOpen" class="task__panel_overlay" @click.self="closeParent">
    <div
      v-if="groupId === null"
      class="task__panel"
      style="display: none;"
      :style="panelStyle"
    >
      <div class="task__panel_container">
        <div style="max-width: 300px">
          <h1>HELP</h1>

          <p>
            <i class="fa fa-square fa-xs" />
            Select a task to resize.
          </p>
          <p>
            <i class="fa fa-square fa-xs" />
            Double click edits the task.
          </p>
          <p>
            <i class="fa fa-square fa-xs" />
            Double click on an empty space creates a new task.
          </p>
        </div>
      </div>
    </div>
    <div
      v-else
      class="task__panel"
      :style="panelStyle"
      @mousedown="handlePanelMouseDown"
    >
      <div class="task__panel_container">
        <div class="task__panel_header">
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
                placeholder="Start date ..."
                text-input
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
                placeholder="End date ..."
                text-input
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
                  --tooltip-color: var(--vt-bg-primary, #ffffff);
                  --tooltip-text-color: var(--vt-text-primary, #000000);
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
import vue3slider from "vue3-slider";

import localizedFormat from "dayjs/plugin/localizedFormat";

import eventBus from "../eventBus.js";

import { nextTick } from "vue";
import { TextEdit } from "@/components/TextEdit/";

import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

import { mainHeaderHeight, cellHeight, cellSize } from "@/contexts/CellSizeContext";

// Wrap dayjs.extend in try-catch to handle initialization issues
try {
  if (dayjs && typeof dayjs.extend === 'function' && localizedFormat) {
    dayjs.extend(localizedFormat);
    if (typeof navigator !== 'undefined' && navigator.language) {
      dayjs.locale(navigator.language);
    }
  } else {
    console.warn('[vue-timelines] dayjs.extend failed: dayjs or plugin not available');
  }
} catch (error) {
  console.error('[vue-timelines] Error initializing dayjs:', error);
}

export default {
  name: "TaskDataPanel",
  components: {
    TextEdit,
    VueDatePicker,
    VueSlider: vue3slider,
  },
  inject: {
    mainHeaderHeight,
    cellHeight,
    cellSize,
    updateTask: { from: "updateTask" },
  },
  methods: {
    openParent: function () {
      console.log("[TaskDataPanel] openParent called, opening panel");
      // Center panel if no position is set
      if (this.pos_x === 0 && this.pos_y === 0) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        this.pos_x = (viewportWidth - 400) / 2;
        this.pos_y = (viewportHeight - 320) / 2;
      }
      this.isModalOpen = true;
      this.$emit("openParent");
    },
    closeParent: function () {
      console.log("[TaskDataPanel] closeParent called, closing modal");
      this.isModalOpen = false;
      this.$emit("closeParent");
    },
    validateDates: function () {
      if (this.dueDate > this.creationDate) return;
      // Due date before creation date
      let t = this.creationDate;
      this.creationDate = this.dueDate;
      this.dueDate = t;
    },
    setStartDate: function (startDate) {
      console.log(" START DATE CHANGED " + startDate);
      this.creationDate = startDate / 1000;
      this.validateDates();
    },
    setEndDate: function (endDate) {
      console.log(" End DATE CHANGED " + endDate);
      this.dueDate = endDate / 1000;
      this.validateDates();
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
      console.log("[TaskDataPanel] handleTask called with task:", task);
      console.log("[TaskDataPanel] Task ID:", task.id, "Title:", task.title);

      // Set task data first
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
      this.progressPct = Math.round((task.progress ?? 0) * 100);
      this.state = task.state;

      console.log("[TaskDataPanel] Task data set, groupId:", this.groupId, "title:", this.title);

      // Now open the modal
      this.openParent();
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
    handleTaskPosition: function (e) {
      // Set initial position near click, but center if no position specified
      if (e && e.clientX && e.clientY) {
        const modalWidth = 400;
        const modalHeight = 320;
        this.pos_x = e.clientX - modalWidth / 2;
        this.pos_y = e.clientY - modalHeight / 2;

        // Clamp to viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        this.pos_x = Math.max(20, Math.min(this.pos_x, viewportWidth - modalWidth - 20));
        this.pos_y = Math.max(20, Math.min(this.pos_y, viewportHeight - modalHeight - 20));
      } else {
        // Center by default
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        this.pos_x = (viewportWidth - 400) / 2;
        this.pos_y = (viewportHeight - 320) / 2;
      }
    },
    handlePanelMouseDown: function (e) {
      // Only start drag if clicking on the header
      if (e.target.closest('.task__panel_header')) {
        this.isDragging = true;
        this.dragStartX = e.clientX - this.pos_x;
        this.dragStartY = e.clientY - this.pos_y;
        document.addEventListener('mousemove', this.handleDrag);
        document.addEventListener('mouseup', this.handleDragEnd);
        e.preventDefault();
      }
    },
    handleDrag: function (e) {
      if (!this.isDragging) return;

      const modalWidth = 400;
      const modalHeight = 320;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      this.pos_x = e.clientX - this.dragStartX;
      this.pos_y = e.clientY - this.dragStartY;

      // Clamp to viewport
      this.pos_x = Math.max(0, Math.min(this.pos_x, viewportWidth - modalWidth));
      this.pos_y = Math.max(0, Math.min(this.pos_y, viewportHeight - modalHeight));
    },
    handleDragEnd: function () {
      this.isDragging = false;
      document.removeEventListener('mousemove', this.handleDrag);
      document.removeEventListener('mouseup', this.handleDragEnd);
    },
    commitTask: function () {
      console.log("============ COMMIT TASK " + this.title + "====================");
      let task = {
        ...this.inEditTask,
        title: this.title,
        creationDate: this.creationDate,
        dueDate: this.dueDate,
        progress: this.progressPct / 100,
        state: this.state,
      };

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
    console.log("[TaskDataPanel] Component mounted, setting up event listeners");
    this.invalidate();

    // Wrap handlers to add logging
    const wrappedHandleTask = (task) => {
      console.log("[TaskDataPanel] Event 'taskdatapanel' received with task:", task);
      this.handleTask(task);
    };
    const wrappedHandleTaskEdit = (task) => {
      console.log("[TaskDataPanel] Event 'taskdatapanel-edit' received with task:", task);
      this.handleTaskEdit(task);
    };
    const wrappedHandleTaskEditCancel = (task) => {
      console.log("[TaskDataPanel] Event 'taskdatapanel-edit-cancel' received");
      this.handleTaskEditCancel(task);
    };
    const wrappedHandleTaskPosition = (e) => {
      console.log("[TaskDataPanel] Event 'taskdatapanel-position' received with event:", e);
      this.handleTaskPosition(e);
    };

    eventBus.on("taskdatapanel", wrappedHandleTask);
    eventBus.on("taskdatapanel-edit", wrappedHandleTaskEdit);
    eventBus.on("taskdatapanel-edit-cancel", wrappedHandleTaskEditCancel);
    eventBus.on("taskdatapanel-position", wrappedHandleTaskPosition);

    // Store wrapped handlers for cleanup
    this._wrappedHandlers = {
      taskdatapanel: wrappedHandleTask,
      "taskdatapanel-edit": wrappedHandleTaskEdit,
      "taskdatapanel-edit-cancel": wrappedHandleTaskEditCancel,
      "taskdatapanel-position": wrappedHandleTaskPosition
    };

    console.log("[TaskDataPanel] Event listeners registered, eventBus:", eventBus);
  },
  beforeUnmount() {
    document.removeEventListener('mousemove', this.handleDrag);
    document.removeEventListener('mouseup', this.handleDragEnd);

    console.log("[TaskDataPanel] Component unmounting, removing event listeners");
    if (this._wrappedHandlers) {
      eventBus.off("taskdatapanel", this._wrappedHandlers.taskdatapanel);
      eventBus.off("taskdatapanel-edit", this._wrappedHandlers["taskdatapanel-edit"]);
      eventBus.off("taskdatapanel-edit-cancel", this._wrappedHandlers["taskdatapanel-edit-cancel"]);
      eventBus.off("taskdatapanel-position", this._wrappedHandlers["taskdatapanel-position"]);
    } else {
      // Fallback to original handlers if wrapped handlers don't exist
      eventBus.off("taskdatapanel", this.handleTask);
      eventBus.off("taskdatapanel-edit", this.handleTaskEdit);
      eventBus.off("taskdatapanel-edit-cancel", this.handleTaskEditCancel);
      eventBus.off("taskdatapanel-position", this.handleTaskPosition);
    }
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
    panelStyle() {
      return {
        left: `${this.pos_x}px`,
        top: `${this.pos_y}px`,
      };
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
    progressPct(newProgress) {
      console.log(" Progress changed " + newProgress);
      this.commitTask();
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
      isModalOpen: false,
      title: null,
      groupId: null,
      state: null,

      creationDate: null,
      dueDate: null,

      pos_x: 0,
      pos_y: 0,

      // Converted from progress which is 0..1
      progressPct: 0,
      sourceTask: null,
      inEditTask: null,

      // Drag state
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
    };
  },
};
</script>

<style>
.task__panel_header {
  height: 30px;
  z-index: 100;
  cursor: move;
  user-select: none;
  padding: 5px;
  margin: -12px -12px 0 -12px;
  border-bottom: 1px solid var(--vt-border-primary, rgb(226, 226, 226));
  background-color: var(--vt-bg-secondary, #f8f9fc);
  border-radius: var(--vt-radius-md, 10px) var(--vt-radius-md, 10px) 0 0;
}

.task__panel:before {
}

.task__panel_overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  background-color: rgba(0, 0, 0, 0.3);
}

.task__panel {
  border-radius: var(--vt-radius-md, 10px);
  padding: var(--vt-spacing-lg, 12px);

  border: 1px solid var(--vt-form-border, #000);
  background-color: var(--vt-bg-modal, #fafafa);
  box-shadow: var(--vt-shadow-lg, 0px 0px 10px 0px rgba(0, 0, 0, 0.2));

  height: 350px;
  width: 450px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: visible;

  position: fixed;
  z-index: 10001;
  margin: 0;
}

.task__panel_container {
  min-width: 250px;
  min-height: 150px;
  margin-top: auto;
  position: relative;
  max-height: calc(420px - 24px);
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

/* Ensure date picker dropdown floats outside the panel */
:deep(.dp__outer_menu_wrap) {
  z-index: 10002 !important;
  position: fixed !important;
}

:deep(.dp__menu) {
  z-index: 10002 !important;
}

</style>
