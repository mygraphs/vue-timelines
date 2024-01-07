<template>
  <div ref="cellsize__context">
    <slot />
  </div>
</template>

<script>
import { computed } from "vue";
import * as k from "./keys";
import { mapState, mapMutations, mapGetters } from "vuex";

export default {
  name: "CellSizeContext",
  props: {
    desiredHeight: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      cellSize: 25,
      minSize: 20,
      mainHeaderHeight : 200,
      headerHeight: 75,
      cellHeight: 40,
      height: 0,
    };
  },
  computed: {
    ...mapState(["timelineMaxRow", "timelineMinRow"]),
  },
  methods: {
    setTimelineDimensions: function (height, scrollBarSize) {
      //console.log(" DIMENSIONS " + height);
      if (this.elementHeight == 0) {
        console.log(" Cannot calculate size ");
        return;
      }

      //debugger;
      let rows = this.timelineMaxRow;
      let current = this.elementHeight - 100;
    },
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
      this.cellSize = this.minSize;
    },

    increaseCellHeight: function () {
      this.cellHeight += 5;
    },
    reduceCellHeight: function () {
      if (this.cellHeight > 15) {
        this.cellHeight -= 5;
      }
    },
    invalidateHeight: function () {
      if (this.height == 0) return;
      this.elementHeight = this.$refs.cellsize__context.clientHeight;

      // TODO Adjust to the real dynamically generated dimensions or fix the dimensions on CSS
      // CELL HEIGHT = DESIRED SIZE - TIMELINE HEADER: 70px - SCROLL BAR SIZE: 17;
      this.cellHeight = (this.height - this.headerHeight - this.mainHeaderHeight - 17) / this.timelineMaxRow;

      // Clamp to minimum size
      if (this.cellHeight < this.minSize) this.cellHeight = this.minSize;

      //console.log(" NEW CELL SIZE " + this.cellHeight);
      //console.log(" HEIGHT DESIRED " + this.height + " CURRENT " + this.elementHeight);
    },
  },
  watch: {
    desiredHeight(newHeight) {
      this.height = newHeight;
      this.invalidateHeight();
    },
    timelineMaxRow(newRow) {
      console.log(" NEW ROWS " + newRow);
      this.invalidateHeight();
    },
  },
  mounted: function () {},
  provide: function () {
    return {
      [k.mainHeaderHeight]: computed(() => this.mainHeaderHeight),

      [k.headerHeight]: computed(() => this.headerHeight),
      [k.cellSize]: computed(() => this.cellSize),
      [k.cellHeight]: computed(() => this.cellHeight),

      [k.increaseCellHeight]: this.increaseCellHeight,
      [k.reduceCellHeight]: this.reduceCellHeight,

      [k.reduceCellSize]: this.reduceCellSize,
      [k.increaseCellSize]: this.increaseCellSize,
      [k.resetCellSize]: this.resetCellSize,
      [k.setCellSizePx]: this.setCellSizePx,
      [k.minSize]: this.minSize,

      [k.setTimelineDimensions]: this.setTimelineDimensions,
    };
  },
};
</script>
