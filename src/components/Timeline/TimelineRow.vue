<template>
  <div class="calendar__row" ref="timelineRow" :rowid="rowid">
    <div
      class="calendar__inner-row-container"
      :class="{ 'calendar__row--dragover': isDragover }"
    >
      <template v-for="(_, index) in Array(rows)" :key="index">
        <div class="calendar__inner-row" />
      </template>
    </div>

    <template v-for="(_, index) in new Array(totalDays)" :key="index">
      <div class="calendar__cell" />
    </template>

    <slot />
    <button class="calendar__button" @click="handleAddRow">+</button>
  </div>
</template>

<script>
import { computed } from "vue";

import { totalDays, todayCell } from "@/contexts/CalendarContext";
import {
  cellHeightInPx,
  cellHeight,
  cellSizeInPx,
} from "@/contexts/CellSizeContext";

export default {
  name: "TimelineRow",
  inject: {
    totalDays,
    cellHeightInPx,
    cellHeight,
    cellSizeInPx,
    todayCell,
  },
  props: {
    rowid: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      rows: 1,
      isDragover: false,
    };
  },
  methods: {
    handleAddRow: function () {
      this.rows += 1;
      this.setListRowHeight();
    },
    handleReduceRow: function () {},
    setRows: function (rowCount) {
      this.rows = rowCount;
    },
    setListRowHeight: function () {
      const timelineRow = this.$refs.timelineRow;
      const timelineRowIndex = Array.from(
        document.querySelector(".timeline__row-container").children
      ).indexOf(timelineRow);

      const sameListRow = Array.from(document.querySelectorAll(".list__row"))[
        timelineRowIndex
      ];

      sameListRow.style.height = `${this.cellHeight * this.rows}px`;
    },
  },
  provide: function () {
    return {
      rows: computed(() => this.rows),
      setRows: this.setRows,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.setListRowHeight();
    });
  },
};
</script>

<style>
.calendar__row {
  height: calc(v-bind(cellHeightInPx) * v-bind(rows));
  display: flex;
  position: relative;
}

.calendar__row--dragover {
  background-color: rgba(128, 128, 128, 0.2) !important;
}

.calendar__row:after {
  content: "";
  position: absolute;
  height: 100%;
  width: 1px;
  top: -3px;
  background-color: rgba(255, 0, 0, 0.6);
  left: calc(v-bind(cellSizeInPx) * v-bind(todayCell));
}

.calendar__inner-row-container {
  display: block;
  width: 100%;
  position: fixed;
  z-index: 5;
  height: calc(v-bind(cellHeightInPx) * v-bind(rows));
  pointer-events: none;
}

.task__content:active .calendar__inner-row-container {
  pointer-events: initial;
}

.calendar__inner-row {
  height: v-bind(cellHeightInPx);
}

.calendar__button {
  position: sticky;
  height: 20px;
  right: 0;
  z-index: 10;
  font-size: 0.7rem;
}

.calendar__cell {
  max-width: v-bind(cellSizeInPx);
  min-width: v-bind(cellSizeInPx);
  width: v-bind(cellSizeInPx);
  border-right: 1px solid rgba(212, 222, 230, 0.4);
  border-bottom: 1px solid rgba(212, 222, 230, 0.7);
  height: 100%;
  position: relative;
}
</style>
