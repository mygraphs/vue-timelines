<template>
  <div class="timeline" ref="timeline">
    <Calendar />

    <div class="timeline__row-container">
      <slot />
    </div>
  </div>
</template>

<script>
import { Calendar } from "../Calendar";
import { cellSize } from "@/contexts/CellSizeContext";
import { todayCell } from "@/contexts/CalendarContext";

export default {
  name: "Timeline",
  inject: { cellSize, todayCell },
  methods: {
    calendarScrollToday: function () {
      this.$refs.timeline.scrollLeft = this.cellSize * (this.todayCell - 4);
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.calendarScrollToday();
    });
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
