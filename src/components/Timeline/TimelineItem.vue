<template>
  <div class="task" @click="handleResizeOpen" ref="task">
    <div class="task__container">

        <div class="task__resize task_resize--left" v-if="showResizes"
            @pointerdown.left="handleDragStart"
            @pointerup="handleUpdateDate"
            @pointercancel="handleUpdateDate"
            @pointermove="dragLayerX ? handleDrag($event) : null"
            @touchstart.prevent=""
            @dragstart.prevent=""
            :class="{ dragLayerX }"
        />

      <div class="task__content" :class="`task__state--${state}`">
        <slot />
      </div>

      <div
        class="task__resize task_resize--right"
        v-if="showResizes"
        draggable="true"
        @drag.stop="handleResizeRight"
        @dragend="handleUpdateDate"
        @dragover.prevent=""
        @dragleave.prevent=""
        @touchstart="touchResizeRight"
        @touchend="handleTouchEnd"
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
  cellHeight,
  cellHeightInPx,
} from "@/contexts/CellSizeContext";

import { mapState, mapMutations, mapGetters } from "vuex";

import { Draggable } from "@/components";
import { getDiffDays, addDays } from "@/utils/date";
import { clickOutside } from "@/utils/listener";

export default {
  /* This is a timeline item, it converts between our dates into our virtual screen coordinates

    Our timeline is built with cells, therefore we have to calculate how many cells a particular item uses.
  */
  name: "TimelineItem",
  props: {
    id: String,
    title: String,
    creationDate: Number,
    dueDate: Number,
    progress: Number,
    groupName: String,
    priority: Number,
    state: String,
  },
/*
  components: {
    Draggable,
  },
*/
  inject: {
    reduceCellSize,
    increaseCellSize,
    resetCellSize,
    cellSize,
    cellSizeInPx,
    cellHeight,
    cellHeightInPx,
    updateTask: { from: "updateTask" },
    rows: { from: "rows" },
    setRows: { from: "setRows" },
  },
  data: function () {
    return {
      initPosition: null,
      endPosition: null,
      topPosition: this.priority - 1,
      showResizes: false,
      width: null,
      dragLayerX: null,
      dragLayerY: null,
      topLimit: null,
      bottomLimit: 0,
      taskPriority: this.priority,
      taskGroupName: this.groupName,
      currentRowIndex: null,
      documentEventListener: null,
      currentRows: this.rows,
      ongoingTouches: [],
      dragging: false,
    };
  },
  computed: {
    ...mapState(["calendarInit", "calendarEnd", "cellDays"]),
    ...mapGetters(["totalCells", "todayCell"]),
    taskTopPosition: function () {
      return `${this.cellHeight * this.topPosition}px`;
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
      if (sz < 1) {
        console.log("Too small to be displayed");
      }
      return sz;
    },
    resetTaskPositions: function () {
      /* Recalculates the position of the task and rerenders it */

      this.initPosition = this.convertToRelative(this.creationDate);
      this.endPosition = this.convertToRelative(this.dueDate);

      console.log("--- resetTaskPositions ------------------- ");
      console.log(
        "POS " +
          this.initPosition +
          " <=> " +
          this.endPosition +
          " DAYS " +
          this.convertToRelative(this.creationDate)
      );

      const taskElement = this.$refs.task;
      if (taskElement) {
        const row = taskElement.closest(".cal__row");
        this.currentRowIndex = Array.from(row.parentNode.children).indexOf(row);
      }

      this.getTopLimit();
      this.getBottomLimit();

      let w = this.convertToRelative(this.creationDate, this.dueDate);

      if (w < 1)
        // Check why click doesn't work when width is 0
        w = 1.0;

      this.width = w;

      console.log(this.title + " WIDTH = " + this.width);
    },
    getTopLimit: function () {
      const taskElement = this.$refs.task;
      const row = taskElement.closest(".cal__row");
      const rowIndex = Array.from(row.parentNode.children).indexOf(row);

      const timelineGroups = Array.from(row.parentNode.children);
      const prevTimelineGroups = timelineGroups.slice(0, rowIndex);

      this.$nextTick(() => {
        const prevRowsLimit = prevTimelineGroups.reduce((prev, curr) => {
          return prev + curr.offsetHeight / this.cellHeight;
        }, 0);

        this.topLimit = prevRowsLimit + this.priority - 1;
      });
    },
    getBottomLimit: function () {
      const taskElement = this.$refs.task;
      const row = taskElement.closest(".cal__row");
      const rowIndex = Array.from(row.parentNode.children).indexOf(row);

      const timelineGroups = Array.from(row.parentNode.children);
      const nextTimelineRows = timelineGroups.slice(rowIndex + 1, timelineGroups.length);

      this.$nextTick(() => {
        const prevRowsLimit = nextTimelineRows.reduce((prev, curr) => {
          return prev + curr.offsetHeight / this.cellHeight;
        }, 0);

        this.bottomLimit = prevRowsLimit + this.currentRows - this.priority;
      });
    },
    handleResizeOpen: function () {
      this.showResizes = true;

      console.log("========= CLICKED ========== ");
      console.log(this.title);

      console.log(" START " + new Date(this.creationDate * 1000));
      console.log("   END " + new Date(this.dueDate * 1000));

      this.resetTaskPositions();

      this.documentEventListener = clickOutside(this.$refs.task, () => {
        console.log(" clickOutside ");
        this.handleResizeClose();
      });

      eventBus.emit("taskdatapanel", this);
    },
    handleResizeClose: function () {
      this.showResizes = false;
      console.log(" handleResizeClose ");
    },
    handleDragStart: function (e) {
      this.dragLayerX = e.layerX;
      this.dragLayerY = e.layerY;
      console.log(" handleDragStart " + this.dragLayerX + " " + this.dragLayerY);
    },

    handleTouchStart: function (evt) {
      console.log(" TOUCH START ");

      function copyTouch({ identifier, pageX, pageY }) {
        return { identifier, pageX, pageY };
      }

      function colorForTouch(touch) {
        let r = touch.identifier % 16;
        let g = Math.floor(touch.identifier / 3) % 16;
        let b = Math.floor(touch.identifier / 7) % 16;
        r = r.toString(16); // make it a hex digit
        g = g.toString(16); // make it a hex digit
        b = b.toString(16); // make it a hex digit
        const color = `#${r}${g}${b}`;
        return color;
      }

      const el = document.getElementById("canvas");
      const ctx = el.getContext("2d");
      const touches = evt.changedTouches;

      for (let i = 0; i < touches.length; i++) {
        console.log(`touchstart: ${i}.`);
        this.ongoingTouches.push(copyTouch(touches[i]));
        const color = colorForTouch(touches[i]);
        console.log(`color of touch with id ${touches[i].identifier} = ${color}`);
        ctx.beginPath();
        ctx.arc(touches[i].pageX, touches[i].pageY, 4, 0, 2 * Math.PI, false); // a circle at the start
        ctx.fillStyle = color;
        ctx.fill();
      }

      debugger;
    },

    handleTouchMove: function (e) {
      console.log(" TOUCH MOVE ");
      debugger;
    },

    handleTouchEnd: function (e) {
      console.log(" TOUCH END ");
      debugger;
      this.handleUpdateDate();
    },

    handleDrag: function (e) {
      const { layerX, clientX, layerY } = e;
      if (!clientX && layerX) return;

      const cellsToMove = (this.dragLayerX - layerX) / (this.cellSize * this.cellDays);

      const rowToMove = (this.dragLayerY - layerY) / this.cellHeight;

      this.initPosition -= cellsToMove;
      this.endPosition -= cellsToMove;

      if (rowToMove > 0 && this.topLimit - rowToMove >= 0) {
        this.topLimit -= rowToMove;
        this.bottomLimit += rowToMove;
        this.topPosition -= rowToMove;
        this.handlePriorityAndGroup(rowToMove);
      }

      if (rowToMove < 0 && this.bottomLimit + rowToMove >= 0) {
        this.topLimit -= rowToMove;
        this.bottomLimit += rowToMove;
        this.topPosition -= rowToMove;
        this.handlePriorityAndGroup(rowToMove);
      }

      this.width = this.endPosition - this.initPosition;
    },
    handlePriorityAndGroup: function (rowToMove) {
      this.taskPriority -= rowToMove;

      if (this.taskPriority <= 0) {
        const taskElement = this.$refs.task;
        const row = taskElement.closest(".cal__row");

        this.currentRowIndex -= 1;

        const prevGroup = row.parentNode.children[this.currentRowIndex];
        const prevGroupPriorities = prevGroup.offsetHeight / this.cellHeight;

        const newRowName = prevGroup.getAttribute("rowid");
        const prevRowPriorities = Array.from(
          prevGroup.querySelectorAll(".cal__inner-row")
        ).length;
        const newPriority = prevGroupPriorities;

        this.taskPriority = newPriority;
        this.taskGroupName = newRowName;
        this.currentRows = prevRowPriorities;
      } else if (this.taskPriority > this.currentRows) {
        const taskElement = this.$refs.task;
        const row = taskElement.closest(".cal__row");

        this.currentRowIndex += 1;

        const newtGroup = row.parentNode.children[this.currentRowIndex];
        const nextRowPriorities = Array.from(
          newtGroup.querySelectorAll(".cal__inner-row")
        ).length;
        const nextRowName = newtGroup.getAttribute("rowid");

        this.taskPriority = 1;
        this.taskGroupName = nextRowName;
        this.currentRows = nextRowPriorities;
      }
    },
    handleResizeLeft: function (e) {
      const { layerX, clientX } = e;
      if (!clientX && layerX) return;

      console.log(" handleResizeLeft " + layerX);
      if (layerX == 0) return;

      let resize = layerX / this.cellSize;
      resize /= this.cellDays;

      if (resize > 0) {
        // We don't want to make it too small that you cannot grab it.
        if (this.endPosition - resize < this.initPosition) {
          console.log(" End cannot be bigger than Start");
          return;
        }
      }

      this.initPosition += resize;
      this.width = this.endPosition - this.initPosition;
    },
    handleResizeRight: function (e) {
      const { layerX, clientX } = e;

      console.log(" handleResizeRight " + layerX);
      if (!clientX && layerX) return;

      const resize = layerX / (this.cellSize * this.cellDays);
      if (resize == 0) return;

      if (this.width + resize >= 1) {
        this.endPosition += resize;
        this.width = this.endPosition - this.initPosition;
      } else {
        //this.width = 1;
      }

      console.log(" END " + this.endPosition + " => " + this.width);
    },
    convertCellToDate: function (interval) {
      // Converts the number of cells into a position in the calendar
      // We append the position to the start of the first cell of the calendar
      // so we can calculate the real start / end date.
      let relative = interval * this.cellDays;
      return addDays(this.calendarInit, relative);
    },
    handleUpdateDate: function () {
      let initDay = this.convertCellToDate(this.initPosition);
      let endDay = this.convertCellToDate(this.endPosition);

      let d = getDiffDays(initDay, endDay);

      if (d < 1) {
        endDay = addDays(initDay, 1);
      }

      console.log(" START " + new Date(initDay * 1000));
      console.log("   END " + new Date(endDay * 1000));

      //debugger;

      const taskData = {
        ...this.$props,
        creationDate: initDay,
        dueDate: endDay,
        priority: this.taskPriority,
      };

      eventBus.emit("taskdatapanel", taskData);

      try {
        delete taskData.groupName;

        this.updateTask({
          updatedTask: taskData,
          newRow: this.taskGroupName,
          oldRow: this.groupName,
        });
      } catch (error) {
        debugger;
        console.log(" CRASH " + error);
      }
    },
    invalidate: function () {
      console.log("Invalidate task " + this.title);
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
    rows: function () {
      this.currentRows = this.rows;
    },
  },
  mounted() {
    this.invalidate();
    if (this.priority > this.currentRows) {
      this.setRows(this.priority);
    }
    eventBus.on("invalidate-timeline-items", this.invalidate);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.documentEventListener);
    eventBus.off("invalidate-timeline-items", this.invalidate);
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
  padding: 0rem 1rem;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 3;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  height: 62%;
  background-color: tomato;
  border-radius: 4px;
  width: 100%;
}

.task__content::after {
  content: "";
  position: absolute;
  right: 0;
  top: 0;
  display: block;
  height: 100%;
  width: calc(100% * (1 - v-bind(progress)));
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
  margin: 1px 0;
  top: 6px;
  height: 70%;
  width: 14px;
  display: flex;
  align-items: center;
  z-index: 10;
  cursor: ew-resize;
  background-color: rgba(160, 160, 160, 0.7);
  border-radius: 2px;
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
</style>
