<template>
  <div
    class="task"
    @click="handleResizeOpen"
    draggable="true"
    @dragstart="handleDragStart"
    @drag="handleDrag"
    @dragend="handleUpdateDate"
    ref="task"
  >
    <div class="task__container">
      <div
        class="task__resize task_resize--left"
        v-if="showResizes"
        draggable="true"
        @drag.stop="handleResizeLeft"
        @dragend="handleUpdateDate"
        @dragover.prevent=""
        @dragleave.prevent=""
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
      />
    </div>
  </div>
</template>

<script>
import {
  reduceCellSize,
  increaseCellSize,
  resetCellSize,
  cellSize,
  cellSizeInPx,
  cellHeight,
  cellHeightInPx,
} from "@/contexts/CellSizeContext";
import { calendarInit } from "@/contexts/CalendarContext";
import { getDiffDays, addDays } from "@/utils/date";
import { clickOutside } from "@/utils/listener";

export default {
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
  inject: {
    reduceCellSize,
    increaseCellSize,
    resetCellSize,
    cellSize,
    cellSizeInPx,
    cellHeight,
    cellHeightInPx,
    calendarInit,
    updateTask: { from: "updateTask" },
    rows: { from: "rows" },
    setRows: { from: "setRows" },
  },
  data: function () {
    return {
      initPostion: null,
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
    };
  },
  computed: {
    taskTopPosition: function () {
      return `${this.cellHeight * this.topPosition}px`;
    },
    taskWidth: function () {
      return `${this.cellSize * this.width}px`;
    },
    taskLeftPosition: function () {
      return `${this.cellSize * this.initPostion}px`;
    },
  },
  methods: {
    getTaskPositions: function () {
      this.initPostion = getDiffDays(this.creationDate, this.calendarInit);
      this.endPosition = getDiffDays(this.dueDate, this.calendarInit);

      const taskElement = this.$refs.task;
      const row = taskElement.closest(".calendar__row");
      this.currentRowIndex = Array.from(row.parentNode.children).indexOf(row);

      this.getTopLimit();
      this.getBottomLimit();

      this.width = getDiffDays(this.creationDate, this.dueDate) + 1;
    },
    getTopLimit: function () {
      const taskElement = this.$refs.task;
      const row = taskElement.closest(".calendar__row");
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
      const row = taskElement.closest(".calendar__row");
      const rowIndex = Array.from(row.parentNode.children).indexOf(row);

      const timelineGroups = Array.from(row.parentNode.children);
      const nextTimelineRows = timelineGroups.slice(
        rowIndex + 1,
        timelineGroups.length
      );

      this.$nextTick(() => {
        const prevRowsLimit = nextTimelineRows.reduce((prev, curr) => {
          return prev + curr.offsetHeight / this.cellHeight;
        }, 0);

        this.bottomLimit = prevRowsLimit + this.currentRows - this.priority;
      });
    },
    handleResizeOpen: function () {
      this.showResizes = true;

      this.documentEventListener = clickOutside(this.$refs.task, () => {
        this.handleResizeClose();
      });
    },
    handleResizeClose: function () {
      this.showResizes = false;
    },
    handleDragStart: function (e) {
      this.dragLayerX = e.layerX;
      this.dragLayerY = e.layerY;
    },
    handleDrag: function (e) {
      const { layerX, clientX, layerY } = e;
      if (!clientX && layerX) return;

      const cellsToMove = Math.round(
        (this.dragLayerX - layerX) / this.cellSize
      );

      const rowToMove = Math.round(
        (this.dragLayerY - layerY) / this.cellHeight
      );

      this.initPostion -= cellsToMove;
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

      this.width = this.endPosition - this.initPostion + 1;
    },
    handlePriorityAndGroup: function (rowToMove) {
      this.taskPriority -= rowToMove;

      if (this.taskPriority <= 0) {
        const taskElement = this.$refs.task;
        const row = taskElement.closest(".calendar__row");

        this.currentRowIndex -= 1;

        const prevGroup = row.parentNode.children[this.currentRowIndex];
        const prevGroupPriorities = prevGroup.offsetHeight / this.cellHeight;

        const newRowName = prevGroup.getAttribute("rowid");
        const prevRowPriorities = Array.from(
          prevGroup.querySelectorAll(".calendar__inner-row")
        ).length;
        const newPriority = prevGroupPriorities;

        this.taskPriority = newPriority;
        this.taskGroupName = newRowName;
        this.currentRows = prevRowPriorities;
      } else if (this.taskPriority > this.currentRows) {
        const taskElement = this.$refs.task;
        const row = taskElement.closest(".calendar__row");

        this.currentRowIndex += 1;

        const newtGroup = row.parentNode.children[this.currentRowIndex];
        const nextRowPriorities = Array.from(
          newtGroup.querySelectorAll(".calendar__inner-row")
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

      const resize = Math.round(layerX / this.cellSize);

      if (this.width >= 2 || resize < 0) {
        this.initPostion += resize;
        this.width = this.endPosition - this.initPostion + 1;
      }
    },
    handleResizeRight: function (e) {
      const { layerX, clientX } = e;
      if (!clientX && layerX) return;

      const resize = Math.round(layerX / this.cellSize);

      if (this.width + resize > 0) {
        this.endPosition += resize;
        this.width = this.endPosition - this.initPostion + 1;
      }
    },
    handleUpdateDate: function () {
      const initDay = addDays(this.calendarInit, this.initPostion);
      const endDay = addDays(this.calendarInit, this.endPosition);

      const taskData = {
        ...this.$props,
        creationDate: initDay,
        dueDate: endDay,
        priority: this.taskPriority,
      };

      delete taskData.groupName;

      this.updateTask({
        updatedTask: taskData,
        newRow: this.taskGroupName,
        oldRow: this.groupName,
      });
    },
  },
  watch: {
    calendarInit: function () {
      this.getTaskPositions();
    },
    creationDate: function () {
      this.getTaskPositions();
    },
    rows: function () {
      this.currentRows = this.rows;
    },
  },
  mounted() {
    this.getTaskPositions();

    if (this.priority > this.currentRows) {
      this.setRows(this.priority);
    }
  },
  beforeUnmount() {
    document.removeEventListener("click", this.documentEventListener);
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
