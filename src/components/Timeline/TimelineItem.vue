<template>
  <div
    class="task"
    @click="handleResizeOpen"
    @pointerdown.left="handleDragStartTask"
    @pointerup="handleUpdateDate"
    @pointercancel="handleUpdateDate"
    @touchstart.prevent=""
    @dragstart.prevent=""
    ref="task"
    :class="{ dragging }"
  >
    <div class="task__container">
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
        <slot />
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
import weekOfYear from "dayjs/plugin/weekOfYear";
dayjs.extend(weekOfYear);

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
      initPosition: null, // Absolute X position from creationDate
      endPosition: null, // Absolute Y position from dueDate
      topPosition: this.task.row, // Absolute Y position from dueDate
      width: null, // Width of the display in pixels
      showResizes: false, // Displays the resize handlers
      drag: null, // Current drag original information to restore in case of cancelation.
      dragging: false, // Display class
      dragStarted: false, // Someone clicked on us we are being drag
      dragClientX: null, // Global click on this item,
      dragClientY: null, // we use mouse pointer events so they work on tablet too
      documentEventListener: null, // Invalidate our click and disable resize

      state: "NO_STATE", // State color of the task, with bootstrap color structure
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
    ...mapGetters(["totalCells", "todayCell", "isDebug"]),

    // Absolute ROW position calculated on parent
    taskTopPosition: function () {
      if (this.showResizes) {
        return `${this.headerHeight + this.cellHeight * this.topPosition}px`;
      }
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
    handleResizeOpen: function () {
      this.showResizes = true;
      this.dragStarted = false;
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
      window.removeEventListener("pointermove", this.handleResizeRight);
      window.removeEventListener("pointermove", this.handleResizeLeft);
      window.removeEventListener("pointermove", this.handleResizeTask);
    },

    handleDragStartTask: function (e) {
      if (!this.showResizes) this.handleResizeOpen(e);

      this.handleDragStart(e);
      window.addEventListener("pointermove", this.handleResizeTask);
    },

    handleDragStartLeft: function (e) {
      this.handleDragStart(e);
      window.addEventListener("pointermove", this.handleResizeLeft);
    },

    handleDragStartRight: function (e) {
      this.handleDragStart(e);
      window.addEventListener("pointermove", this.handleResizeRight);
    },

    handleDragStart: function (e) {
      e.currentTarget.setPointerCapture(e.pointerId);

      e.preventDefault();
      e.stopPropagation();

      this.clearHandlers();

      this.dragStarted = true;
      this.dragClientX = e.clientX;
      this.dragClientY = e.clientY;

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
      this.isPositionValid();

      if (this.isValidDrop)
        return;

      if (this.drag == null)
        return;

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
    isPositionValid: function (newRow) {
      let task = {
        id: this.task.id,
        creationDate: this.convertCellToDate(this.initPosition),
        dueDate: this.convertCellToDate(this.endPosition),
        row: Math.round(this.topPosition),
      };

      if (this.findConflicts(task)) {
        this.state = "dark";
        this.isValidDrop = false;
      } else {
        this.state = "info";
        this.isValidDrop = true;
      }
      return this.isValidDrop;
    },
    handleResizeTask: function (e) {
      if (!this.dragStarted) return;

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

      if (this.isPositionValid()) {
        //console.log(" IS VALID ");
      }

      this.width = this.endPosition - this.initPosition;
    },
    handlePriorityAndGroup: function (rowToMove) {},
    handleResizeLeft: function (e) {
      const { layerX, clientX } = e;
      if (!clientX || !this.dragStarted) return;

      let resize = (clientX - this.dragClientX) / this.cellSize;
      this.dragClientX = clientX;

      if (resize == 0) return;

      // We don't want to make it too small that you cannot grab it.
      if (this.endPosition - resize - 0.1 < this.initPosition) {
        console.log(" End cannot be bigger than Start");
        return;
      }

      // We keep our drag in the center, otherwise we will lose the event
      if (!this.isPositionValid()) {
        this.isValidDrop = true;
        resize = 0.1;
      }

      this.initPosition += resize;
      this.width = this.endPosition - this.initPosition;

      this.updateDataPanel();
    },
    handleResizeRight: function (e) {
      const { layerX, clientX } = e;
      if (!clientX || !this.dragStarted) return;

      let resize = (clientX - this.dragClientX) / this.cellSize;
      this.dragClientX = clientX;

      if (resize == 0) return;

      if (!this.isPositionValid()) {
        //debugger;
        this.isValidDrop = true;
        resize = -0.1;
      }

      if (this.width + resize >= 0.1) {
        this.endPosition += resize;
        this.width = this.endPosition - this.initPosition;
      }

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
      let initDay = this.convertCellToDate(this.initPosition);
      let endDay = this.convertCellToDate(this.endPosition);

      let d = getDiffDays(initDay, endDay);
      if (d < this.getMinDay()) {
        endDay = addDays(endDay, this.getMinDay());
      }

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

      if (this.dragStarted) eventBus.emit("taskdatapanel", task);

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

      this.dragStarted = false;
    },
    invalidate: function () {
      if (this.isDebug) console.log("Invalidate task " + this.task.title);

      this.resetTaskPositions();
    },
  },
  watch: {
    calendarInit: function () {
      this.invalidate();
    },
    creationDate: function () {
      this.invalidate();
    },
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
  align-items: center;
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
  border-radius: 2px;
  width: 100%;
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
  width: 18px;
  display: flex;
  align-items: center;
  z-index: 10;
  cursor: ew-resize;
  background-color: rgba(160, 160, 160, 0.7);
  border-radius: 1px;
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
  z-index: 4000;
}
</style>
