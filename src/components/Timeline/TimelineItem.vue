<template>
  <div
    class="task"
    @click="handleResizeOpen"
    @dblclick="handleEditOpen"
    @pointerdown.left="handleDragStartTask"
    @pointerup="handleUpdateDate"
    @pointercancel="handleUpdateDate"
    @touchstart.prevent=""
    @dragstart.prevent=""
    ref="task"
    :class="{ dragging }"
  >
    <div class="task__container">
      <div v-if="iconVisible" class="task__icon">
        <div v-if="taskIcon"><i :class="taskIcon" /></div>
        <div v-else><slot name="taskInfo" /></div>
      </div>
      <div
        class="task__resize task_resize--left"
        v-if="showResizes"
        @pointerdown.left="handleDragStartLeft"
        @pointerup="handleUpdateDate"
        @pointercancel="handleUpdateDate"
        @touchstart.prevent=""
        @dragstart.prevent=""
        :class="{ dragging }"
      />

      <div class="task__content prevent-select" :class="`task__state--${state}`">
        <slot name="task_text" />
      </div>

      <div
        class="task__resize task_resize--right"
        v-if="showResizes"
        @pointerdown.left="handleDragStartRight"
        @pointerup="handleUpdateDate"
        @pointercancel="handleUpdateDate"
        @touchstart.prevent=""
        @dragstart.prevent=""
        :class="{ dragging }"
      />
    </div>
  </div>
</template>

<script>
import eventBus from "../eventBus.js";

import dayjs from "dayjs";

import {
  reduceCellSize,
  increaseCellSize,
  resetCellSize,
  cellSize,
  cellSizeInPx,
  headerHeight,
  headerHeightInPx,
  cellHeight,
  cellHeightInPx,
} from "@/contexts/CellSizeContext";

import { mapState, mapMutations, mapGetters } from "vuex";

import { getDiffDays, addDays } from "@/utils/date";
import { clickOutside } from "@/utils/listener";

export default {
  /* This is a timeline item, it converts between our dates into our virtual screen coordinates

    Our timeline is built with cells, therefore we have to calculate how many cells a particular item uses.
  */
  name: "TimelineItem",
  props: {
    task: {
      type: Object,
      required: true,
    },
  },
  inject: {
    reduceCellSize,
    increaseCellSize,
    resetCellSize,
    cellSize,
    cellSizeInPx,
    headerHeight,
    headerHeightInPx,
    cellHeight,
    cellHeightInPx,
    findConflicts: { from: "findConflicts" },
    updateTask: { from: "updateTask" },
  },
  data: function () {
    return {
      ICON_WIDTH: 25, // Width of the Icon, probably will move to config that is why is all capital letters
      initPosition: null, // Absolute X position from creationDate
      endPosition: null, // Absolute Y position from dueDate
      topPosition: this.task.row, // Absolute Y position from dueDate
      width: null, // Width of the display in pixels
      widthPx: null, // Width in pixels to show or hide the right icon
      showResizes: false, // Displays the resize handlers
      drag: null, // Current drag original information to restore in case of cancelation.
      dragging: false, // Someone clicked on us we are being drag also used for z-index
      dragClientX: null, // Global click on this item,
      dragClientY: null, // we use mouse pointer events so they work on tablet too
      documentEventListener: null, // Invalidate our click and disable resize
      state: "NO_STATE", // State color of the task, with bootstrap color structure
      taskIcon: null,
    };
  },
  computed: {
    ...mapState([
      "calendarInit",
      "calendarEnd",
      "cellDays",

      "timelineMinRow",
      "timelineMaxRow",
    ]),
    ...mapGetters(["totalCells", "todayCell", "isDebug", "getConfig"]),

    iconVisible: function () {
      // Right side icon, if the task is too small we don't display it.
      let widthPx = this.width * this.cellSize;
      if (widthPx < this.ICON_WIDTH) {
        return false;
      }
      return true;
    },

    borderWidth: function () {
      // We don't display the border if the icon is not visible so we can see it well.
      if (!this.iconVisible) return "0px";
      return "5px";
    },

    iconWidth: function () {
      // If the icon is not visible we don't have a width either.
      if (!this.iconVisible) return "0px";
      return this.ICON_WIDTH + "px";
    },

    taskTopPosition: function () {
      // Absolute ROW position calculated on parent
      if (this.showResizes)
        return `${this.headerHeight + this.cellHeight * this.topPosition}px`;

      return `${this.headerHeight + this.cellHeight * this.task.row}px`;
    },

    taskWidth: function () {
      return `${this.cellSize * this.width}px`;
    },

    taskLeftPosition: function () {
      return `${this.cellSize * this.initPosition}px`;
    },
  },
  methods: {
    ...mapMutations(["setCalendarSize", "setCellSizeDays"]),
    convertToRelative: function (start, end = null) {
      if (!end) end = this.calendarInit;

      let df = getDiffDays(start, end);
      let sz = df / this.cellDays;

      if (this.isDebug && sz < 1) {
        console.log("TODO: Check if we want to use a minimum size");
      }
      return sz;
    },

    resetTaskPositions: function () {
      /* Recalculates the position of the task and rerenders it */

      this.initPosition = this.convertToRelative(this.task.creationDate);
      this.endPosition = this.convertToRelative(this.task.dueDate);
      this.width = this.convertToRelative(this.task.creationDate, this.task.dueDate);

      if (this.task.icon) this.taskIcon = "fa fa-" + this.task.icon + " fa-xs";

      if (this.isDebug) {
        console.log("--- resetTaskPositions ------------------- ");
        console.log(
          "POS " +
            this.initPosition +
            " <=> " +
            this.endPosition +
            " DAYS " +
            this.convertToRelative(this.task.creationDate)
        );
        console.log(this.task.title + " WIDTH = " + this.width);
      }
    },

    selectedTimeline: function (task) {
      // We invalidate the current view in case some other timeline item is being selected
      if (!this.showResizes || this.task.id == task.id) return;

      this.handleResizeClose();
    },

    handleEditOpen: function () {
      eventBus.emit("taskdatapanel-edit", this.task);
    },

    handleResizeOpen: function () {
      this.showResizes = true;
      this.dragging = true;
      this.state = "info";

      this.topPosition = this.task.row;
      this.isValidDrop = true;

      if (this.isDebug) {
        console.log(this.task.title + " === CLICKED === ");
        console.log(" START " + new Date(this.task.creationDate * 1000));
        console.log("   END " + new Date(this.task.dueDate * 1000));
      }

      this.resetTaskPositions();

      this.documentEventListener = clickOutside(this.$refs.task, () => {
        this.handleResizeClose();
      });

      eventBus.emit("selected-timeline-item", this.task);
      eventBus.emit("taskdatapanel", this.task);
    },

    handleResizeClose: function () {
      window.removeEventListener("keyup", this.handleKeyUp);

      this.cancelDropCheck();

      this.showResizes = false;
      this.handleUpdateDate();
      this.state = "close";
    },

    clearHandlers: function (e) {
      window.removeEventListener("pointermove", this.handleResizeFunction);
    },

    handleDragStartTask: function (e) {
      if (!this.showResizes) this.handleResizeOpen(e);

      this.handleDragStart(e, this.handleResizeTask.bind(this));
    },

    handleDragStartLeft: function (e) {
      this.handleDragStart(e, this.handleResizeLeft.bind(this));
    },

    handleDragStartRight: function (e) {
      this.handleDragStart(e, this.handleResizeRight.bind(this));
    },

    handleDragStart: function (e, callback) {
      this.clearHandlers();

      e.currentTarget.setPointerCapture(e.pointerId);
      window.addEventListener("pointermove", callback);
      this.handleResizeFunction = callback;

      e.preventDefault();
      e.stopPropagation();

      this.dragging = true;
      this.dragClientX = e.clientX;
      this.dragClientY = e.clientY;

      // We use the following to clamp the dates to start and end of a different task.
      // We might get adjusted by an external task
      this.newStartDate = null;
      this.newEndDate = null;

      this.drag = {
        begin: this.initPosition,
        end: this.endPosition,
        row: Math.round(this.topPosition),
      };

      this.state = "info";
      window.addEventListener("keyup", this.handleKeyUp);
    },

    restoreLastPosition: function (e) {},

    cancelDropCheck: function () {
      this.calculateConflictTask();

      if (this.isValidDrop) return;

      if (this.drag == null) return;

      console.log(this.isValidDrop + " ************* INVALIDATE DROP ******************");

      this.initPosition = this.drag.begin;
      this.endPosition = this.drag.end;
      this.topPosition = this.drag.row;
      this.drag = null;
    },

    handleKeyUp: function (e) {
      // Handles the cancelation and restore of the task position
      if (!this.showResizes) return;

      if (event.key === "Escape") {
        console.log(" PRESSED ESC KEY ");
        this.isValidDrop = false;
        this.handleResizeClose();
      }
    },

    isRowValid: function (newRow) {
      // I don't have brain right now to figure out why it is -1 :(
      // I guess we start counting rows in 1 and that cascades to here ¯\_(ツ)_/¯

      if (newRow < this.timelineMinRow) return false;
      if (newRow > this.timelineMaxRow - 1) return false;

      return true;
    },

    calculateConflictTask: function () {
      let task = {
        id: this.task.id,
        creationDate: this.convertCellToDate(this.initPosition),
        dueDate: this.convertCellToDate(this.endPosition),
        row: Math.round(this.topPosition),
      };

      let conflict = this.findConflicts(task);
      if (conflict != null) {
        this.state = "dark";
        this.isValidDrop = false;
      } else {
        this.state = "info";
        this.isValidDrop = true;
      }

      return conflict;
    },

    handleResizeTask: function (e) {
      if (!this.dragging) return;

      const cellsToMove = (this.dragClientX - e.clientX) / this.cellSize;
      const rowToMove = (this.dragClientY - e.clientY) / this.cellHeight;

      this.dragClientX = e.clientX;
      this.dragClientY = e.clientY;

      this.initPosition -= cellsToMove;
      this.endPosition -= cellsToMove;

      let check = this.topPosition - rowToMove;

      if (this.isRowValid(check)) {
        this.topPosition -= rowToMove;
      }

      this.calculateConflictTask();

      this.width = this.endPosition - this.initPosition;
    },

    handleResizeLeft: function (e) {
      const { layerX, clientX } = e;
      if (!clientX || !this.dragging) return;

      let resize = (clientX - this.dragClientX) / this.cellSize;
      this.dragClientX = clientX;

      if (resize == 0) return;

      // We don't want to make it too small that you cannot grab it.
      if (this.endPosition - resize < this.initPosition) {
        console.log(" End cannot be bigger than Start");
        return;
      }

      // We find a task that has a conflict with this one and we adjust the start to be 1 second before it ends.
      // We adjust our current position so we don't wait until next frame to hit the task
      let old_pos = this.initPosition;
      this.initPosition += resize;

      let conflict = this.calculateConflictTask();
      if (conflict) {
        const s = this.getConfig("TASK_MIN_SEPARATION_S", 1);
        this.newStartDate = conflict.end + s;

        // We cancel the invalidation of the task, otherwise it will go back to the original position
        this.isValidDrop = true;
        this.initPosition = old_pos; // Reset the position to before the conflict
      } else {
        // We don't have a conflict reset any clamp if there is any.
        this.newStartDate = null;
      }

      this.width = this.endPosition - this.initPosition;
      this.updateDataPanel();
    },

    handleResizeRight: function (e) {
      const { layerX, clientX } = e;
      if (!clientX || !this.dragging) return;

      let resize = (clientX - this.dragClientX) / this.cellSize;
      this.dragClientX = clientX;

      if (resize == 0) return;

      // We don't want to make it too small that you cannot grab it.
      if (this.endPosition + resize <= this.initPosition) {
        console.log(" End cannot be bigger than Start");
        return;
      }

      // We find a task that has a conflict with this one and we adjust the end to be 1 second before it starts.
      let old_pos = this.endPosition;
      this.endPosition += resize;

      let conflict = this.calculateConflictTask();
      if (conflict) {
        const s = this.getConfig("TASK_MIN_SEPARATION_S", 1);
        this.newEndDate = conflict.start - s;

        // We cancel the invalidation of the task, otherwise it will go back to the original position
        this.isValidDrop = true;
        this.endPosition = old_pos; // Restore position, we failed to move
      } else {
        this.newEndDate = null;
      }

      this.width = this.endPosition - this.initPosition;

      //console.log(this.initPosition + " END " + this.endPosition + " => " + this.width);
      this.updateDataPanel();
    },

    convertCellToDate: function (interval) {
      // Converts the number of cells into a position in the calendar
      // We append the position to the start of the first cell of the calendar
      // so we can calculate the real start / end date.
      let relative = interval * this.cellDays;
      return addDays(this.calendarInit, relative);
    },

    getMinDay: function () {
      if (this.cellDays > 1) return 0.5;

      return this.cellDays / 5;
    },

    updateDataPanel: function () {
      /*
        Updates the data panel, we also create the final task so we can send it over to update the timeline.
        Might not be the best architectural decision on this application.

        Check if we have to adjust either to a date or to an position relative to the cellsize.
        Giving that our cellsizes might be only be a few pixels for many days, we have to be able to adjust
        to the previous task.

        Here we check if we have to replace our screen coordinates to a real position in time.
      */

      let initDay = this.newStartDate
        ? this.newStartDate
        : this.convertCellToDate(this.initPosition);

      let endDay = this.newEndDate
        ? this.newEndDate
        : this.convertCellToDate(this.endPosition);

      if (this.isDebug) {
        console.log(" START " + new Date(initDay * 1000));
        console.log("   END " + new Date(endDay * 1000));
      }

      let json = this.task;
      let task = {
        ...json,
        creationDate: initDay,
        dueDate: endDay,
        row: this.topPosition,
      };

      if (this.dragging) eventBus.emit("taskdatapanel", task);
      return task;
    },

    handleUpdateDate: function () {
      this.clearHandlers();
      this.cancelDropCheck();

      // Reset position to be the closest so we align the ROW
      this.topPosition = Math.round(this.topPosition);
      let task = this.updateDataPanel();
      try {
        this.updateTask(task);
      } catch (error) {
        debugger;
        console.log(" CRASH " + error);
      }

      this.dragging = false;
    },

    invalidate: function () {
      if (this.isDebug) console.log("Invalidate task " + this.task.title);

      this.resetTaskPositions();
    },
  },
  watch: {
    cellHeight: function() {
      this.invalidate();
    },
    calendarInit: function () {
      this.invalidate();
    },
    calendarEnd: function () {
      this.invalidate();
    },
    // We invalidate the view when the task changes
    // We have to recalculate everything, positions and progress, etc.
    task: function() {
      this.invalidate();
    }
  },
  mounted() {
    this.invalidate();
    eventBus.on("invalidate-timeline-items", this.invalidate);
    eventBus.on("selected-timeline-item", this.selectedTimeline);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.documentEventListener);
    eventBus.off("invalidate-timeline-items", this.invalidate);
    eventBus.off("selected-timeline-item", this.selectedTimeline);
  },
};
</script>

<style scoped>
.task__icon {
  display: flex;
  position: absolute;
  right: 0px;
  width: v-bind(iconWidth);
  padding: 0rem 0.2rem;
  align-items: center;
  justify-content: center;
  z-index: 3;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  height: 85%;
  background: rgba(205, 206, 255, 1);
  color: black;
  border-radius: 0px v-bind(borderWidth) v-bind(borderWidth) 0px;
}
</style>

<style>
.task {
  position: absolute;
  border-radius: 5px;
  height: v-bind(cellHeightInPx);
  top: v-bind(taskTopPosition);
  width: v-bind(taskWidth);
  left: v-bind(taskLeftPosition);
}

.task__container {
  position: relative;
  align-items: center;
  color: white;
  width: 100%;
  height: 100%;
  display: flex;
}

.task__content {
  padding: 0rem 0.2rem;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 3;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  height: 85%;
  background-color: tomato;
  border-radius: v-bind(borderWidth) 0px 0px v-bind(borderWidth);
  width: calc(100% - v-bind(iconWidth));
}

.task__content::after {
  content: "";
  position: absolute;
  right: 0;
  top: 0;
  display: block;
  height: 100%;
  width: calc(100% * (1 - v-bind(task.progress)));
  background-color: rgba(255, 255, 255, 0.25);
  z-index: 2;
}

.task__content:active {
  box-shadow: 0px 0px 10px 0px #000;
  pointer-events: none;
  z-index: 100;
}

.task__resize {
  position: absolute;
  margin: 3px 0;
  top: -4px;
  height: 110%;
  width: 12px;
  display: flex;
  align-items: center;
  z-index: 10;
  cursor: ew-resize;
  background-color: rgba(160, 160, 160, 0.7);
  border-radius: 1px;
  z-index: 10001 !important;
}

.task__resize:hover {
  background-color: rgba(160, 160, 160, 0.85);
}

.task__resize::after,
.task__resize::before {
  content: "";
  position: absolute;
  width: 0.1rem;
  height: 50%;
  background-color: #fff;
  margin: 1rem 0.2rem;
  border-radius: 100px;
}

.task__resize::after {
  left: 0;
}

.task__resize::before {
  right: 0;
}

.task_resize--left {
  left: -16px;
}

.task_resize--right {
  right: -16px;
}

.task__state--info {
  background-color: #3c8dbc;
}

.task__state--success {
  background-color: #00a85d;
}

.task__state--warning {
  background-color: #ffb311;
}

.task__state--danger {
  background-color: #ff3636;
}

.task__state--dark {
  background-color: #343a40;
}

.prevent-select {
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}

.task {
  cursor: grab;
}

.task.dragging {
  user-select: none;
  cursor: grabbing;
  z-index: 4000 !important;
}
</style>
