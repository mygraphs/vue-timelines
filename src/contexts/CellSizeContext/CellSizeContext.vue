<template>
  <slot />
</template>

<script>
import { computed } from "vue";
import * as k from "./keys";

export default {
  name: "CellSizeContext",
  data() {
    return {
      cellSize: 25,
      cellHeight: 40,
    };
  },
  methods: {
    setCellSizePx: function (newSize) {
      this.cellSize = newSize;
    },
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
      [k.cellSize]: computed(() => this.cellSize),
      [k.cellSizeInPx]: computed(() => `${this.cellSize}px`),
      [k.cellHeight]: computed(() => this.cellHeight),
      [k.cellHeightInPx]: computed(() => `${this.cellHeight}px`),
      [k.reduceCellSize]: this.reduceCellSize,
      [k.increaseCellSize]: this.increaseCellSize,
      [k.resetCellSize]: this.resetCellSize,
      [k.setCellSizePx]: this.setCellSizePx,
    };
  },
};
</script>
