<template>
  <div class="timeline" ref="timeline">
    <Calendar />

    <div class="timeline__row-container">
      <slot />
    </div>
  </div>
</template>

<script>
import eventBus from '../eventBus.js';
import { mapState, mapMutations, mapGetters } from "vuex";

import { Calendar } from "../Calendar";
import { minSize, cellSize, setCellSizePx, resetCellSize } from "@/contexts/CellSizeContext";

export default {
  name: "Timeline",
  inject: { cellSize, minSize, setCellSizePx, resetCellSize },
  computed: {
    ...mapState(["calendarInit", "calendarEnd", "cellDays"]),
    ...mapGetters(["totalCells", "todayCell"]),
  },
  methods: {
    calendarScrollToday: function () {
      this.$refs.timeline.scrollLeft = this.cellSize * (this.todayCell - 4);
    },
    handleResize(width) {
      if (this.totalCells == 0) {
        console.log("Waiting for initialization");
        return;
      }

      // Check if we can meet the minimum size in case of having to downsize
      let MIN_SIZE_PX = this.minSize;
      if (this.totalCells * this.cellSize > width) {
          if (this.totalCells * MIN_SIZE_PX > width) {
            // We cannot fit on the size minimum size
            console.log('Cannot fit into ', width);

            this.resetCellSize();
            return;
          }
      }

      // Round up one so we leave an empty space on the right.
      // We should think about what to do with the empty space.
      let new_size = Math.ceil(width / (this.totalCells + 1)) | 0;
      console.log('Resize to fit:' + width + " Size " + new_size);
      this.setCellSizePx(new_size);
    },
    triggerResizeManually() {
      const width = this.$refs.timeline.clientWidth;
      this.handleResize(width);
      eventBus.emit('invalidate-timeline-items');
    },
    invalidate() {
        this.triggerResizeManually();
    }
  },
  mounted() {
    const observedElement = this.$refs.timeline;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        // Call your callback function here with the new width
        this.handleResize(width);
      }
    });

    resizeObserver.observe(observedElement);

    this.$nextTick(() => {
      this.calendarScrollToday();
    });

    eventBus.on('timeline-invalidate', this.triggerResizeManually);
  },
  beforeUnmount() {
    eventBus.off('timeline-invalidate', this.triggerResizeManually);
  },
  components: {
    Calendar,
  },
};
</script>

<style>
.timeline {
  overflow-x: scroll;
  width: 100%;
  overflow-y: hidden;
  position: sticky;
  top: 0;
}
</style>
