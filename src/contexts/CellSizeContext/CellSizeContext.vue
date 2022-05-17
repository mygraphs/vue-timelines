<template>
  <slot />
</template>

<script>
import { computed } from "vue";
import {
  cellSize,
  cellSizeInPx,
  cellHeight,
  cellHeightInPx,
  reduceCellSize,
  increaseCellSize,
  resetCellSize,
} from "./keys";

export default {
  name: "CellSizeContext",
  data() {
    return {
      cellSize: 25,
      cellHeight: 40,
    };
  },
  methods: {
    reduceCellSize: function () {
      if (this.cellSize > 15) {
        this.cellSize -= 5;
      }
    },
    increaseCellSize: function () {
      this.cellSize += 5;
    },
    resetCellSize: function () {
      this.cellSize = 25;
    },
  },
  provide: function () {
    return {
      [cellSize]: computed(() => this.cellSize),
      [cellSizeInPx]: computed(() => `${this.cellSize}px`),
      [cellHeight]: computed(() => this.cellHeight),
      [cellHeightInPx]: computed(() => `${this.cellHeight}px`),
      [reduceCellSize]: this.reduceCellSize,
      [increaseCellSize]: this.increaseCellSize,
      [resetCellSize]: this.resetCellSize,
    };
  },
};
</script>
