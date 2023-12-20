<template>
  <div class="cal__row" ref="timelineRow" :rowid="rowid">
    <div
      class="cal__inner-row-container"
      :class="{ 'cal__row--dragover': isDragover }"
    >
      <template v-for="(_, index) in Array(rows)" :key="index">
        <div class="cal__inner-row" />
      </template>
    </div>

    <template v-for="(_, index) in new Array(totalCells)" :key="index">
      <div class="cal__cell"></div>
    </template>

    <slot />
    <button class="cal__button" @click="handleAddRow">+</button>
  </div>
</template>

<script>
import { computed } from "vue";

import { mapState, mapMutations, mapGetters } from "vuex";

import {
  cellHeightInPx,
  cellHeight,
  cellSizeInPx,
} from "@/contexts/CellSizeContext";

export default {
  name: "TimelineRow",
  inject: {
    cellHeightInPx,
    cellHeight,
    cellSizeInPx,
  },
  props: {
    group: {
      type: Object,
      required: true,
    },
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
  computed: {
    ...mapState(["calendarInit", "calendarEnd", "cellDays"]),
    ...mapGetters(["totalCells", "todayCell"]),
  },
  methods: {
    ...mapMutations(["setCalendarSize", "setCellSizeDays"]),
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
    console.log(this.group.name + " GROUP ROWS " + this.group.rows);
    this.$nextTick(() => {
      this.rows = this.group.rows;
      this.setListRowHeight();
    });
  },
};
</script>

<style>
.cal__row {
  height: calc(v-bind(cellHeightInPx) * v-bind(rows));
  display: flex;
  position: relative;
}

.cal__row--dragover {
  background-color: rgba(128, 128, 128, 0.2) !important;
}

.cal__row:after {
  content: "";
  position: absolute;
  height: 100%;
  width: 1px;
  top: -3px;
  background-color: rgba(255, 0, 0, 0.6);
  left: calc(v-bind(cellSizeInPx) * v-bind(todayCell));
}

.cal__inner-row-container {
  display: block;
  width: 100%;
  position: fixed;
  z-index: 5;
  height: calc(v-bind(cellHeightInPx) * v-bind(rows));
  pointer-events: none;
}

.task__content:active .cal__inner-row-container {
  pointer-events: initial;
}

.cal__inner-row {
  height: v-bind(cellHeightInPx);
}

.cal__button {
  position: sticky;
  height: 20px;
  right: 0;
  z-index: 10;
  font-size: 0.7rem;
}

.cal__cell {
  max-width: v-bind(cellSizeInPx);
  min-width: v-bind(cellSizeInPx);
  width: v-bind(cellSizeInPx);
  border-right: 1px solid rgba(212, 222, 230, 0.4);
  border-bottom: 1px solid rgba(212, 222, 230, 0.7);
  height: 100%;
  position: relative;
}
</style>
