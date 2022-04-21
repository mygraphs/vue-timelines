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
import dayjs from "dayjs";
import {
  reduceCellSize,
  increaseCellSize,
  resetCellSize,
  cellSize,
  cellSizeInPx,
} from "@/contexts/CellSizeContext";

export default {
  name: "Task",
  props: {
    title: String,
    creationDate: Number,
    duedate: Number,
    calendarInit: Number,
    progress: Number,
  },
  inject: {
    reduceCellSize,
    increaseCellSize,
    resetCellSize,
    cellSize,
    cellSizeInPx,
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
      this.initPostion = this.getDiffDays(this.creationDate);
      this.endPosition = this.getDiffDays(this.duedate);

      this.width = this.endPosition - this.initPostion + 1;
    },
    getDiffDays: function (dateToCampare) {
      return (
        -1 *
        dayjs(this.calendarInit * 1000)
          .set("date", 1)
          .diff(dateToCampare * 1000, "d")
      );
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

      if (this.initPostion - cellsToMove >= 0) {
        this.initPostion -= cellsToMove;
        this.endPosition -= cellsToMove;
        this.width = this.endPosition - this.initPostion + 1;
      }
    },
    handleResizeLeft: function (e) {
      const { layerX, clientX } = e;
      if (!clientX && layerX) return;

      const resize = Math.round(layerX / this.cellSize);

      if ((this.width >= 2 || resize < 0) && this.initPostion + resize >= 0) {
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
      const initDay = dayjs(this.calendarInit * 1000)
        .set("date", 1)
        .add(this.initPostion, "day")
        .unix();

      const endDay = dayjs(this.calendarInit * 1000)
        .set("date", 1)
        .add(this.endPosition, "day")
        .unix();

      console.log(dayjs(initDay * 1000).format("DD-MM-YYYY"));
      console.log(dayjs(endDay * 1000).format("DD-MM-YYYY"));
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
  z-index: 1;
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
