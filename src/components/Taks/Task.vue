<template>
  <div
    class="task"
    @click="handleResizeOpen"
    v-click-outside="handleResizeClose"
  >
    <div class="task__container">
      <div
        class="task__resize task_resize--left"
        v-if="showResizes"
        draggable="true"
        @drag="handleResizeLeft"
        @dragend="handleUpdateDate"
        @dragover.prevent=""
        @dragleave.prevent=""
      ></div>

      <div
        class="task__content"
        draggable="true"
        @dragstart="handleDragStart"
        @drag="handleDrag"
        @dragend="handleUpdateDate"
      >
        {{ title }}
      </div>

      <div
        class="task__resize task_resize--right"
        v-if="showResizes"
        draggable="true"
        @drag="handleResizeRight"
        @dragend="handleUpdateDate"
        @dragover.prevent=""
        @dragleave.prevent=""
      ></div>
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
} from "@/contexts/CellSizeContext";
import { calendarInit } from "@/contexts/CalendarContext";
import { getDiffDays, addDays } from "@/utils/date";

export default {
  name: "Task",
  props: {
    id: String,
    title: String,
    creationDate: Number,
    duedate: Number,
    progress: Number,
  },
  inject: {
    reduceCellSize,
    increaseCellSize,
    resetCellSize,
    cellSize,
    cellSizeInPx,
    calendarInit,
  },
  data: function () {
    return {
      initPostion: null,
      endPosition: null,
      showResizes: false,
      width: null,
      dragLayerX: null,
    };
  },
  methods: {
    getTaskPositions: function () {
      this.initPostion = getDiffDays(this.creationDate, this.calendarInit);
      this.endPosition = getDiffDays(this.duedate, this.calendarInit);

      this.width = getDiffDays(this.creationDate, this.duedate) + 1;
    },
    handleResizeOpen: function () {
      this.showResizes = true;
    },
    handleResizeClose: function () {
      this.showResizes = false;
    },
    handleDragStart: function (e) {
      this.dragLayerX = e.layerX;
    },
    handleDrag: function (e) {
      const { layerX, clientX } = e;
      if (!clientX && layerX) return;

      const cellsToMove = Math.round(
        (this.dragLayerX - layerX) / this.cellSize
      );

      // if (this.initPostion - cellsToMove >= 0) {
      this.initPostion -= cellsToMove;
      this.endPosition -= cellsToMove;
      this.width = this.endPosition - this.initPostion + 1;
      // }
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

      this.$emit("update", {
        id: this.id,
        creationDate: initDay,
        duedate: endDay,
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
  },
  mounted() {
    this.getTaskPositions();
  },
};
</script>

<style>
.task {
  position: absolute;
  border-radius: 5px;
  top: 14%;
  width: calc(v-bind(cellSizeInPx) * v-bind(width));
  left: calc(v-bind(cellSizeInPx) * v-bind(initPostion));
}

.task:active {
  z-index: 10;
  box-shadow: 0px 0px 10px 0px #000;
}

.task__container {
  position: relative;
  align-items: center;
  background-color: tomato;
  border-radius: 5px;
  color: white;
  width: 100%;
}

.task__container::after {
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

.task__content {
  padding: 0.5rem 1rem;
  position: relative;
  z-index: 3;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.task__resize {
  position: absolute;
  margin: 1px 0;
  top: 0;
  height: calc(100% - (2 * 1px));
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
</style>
