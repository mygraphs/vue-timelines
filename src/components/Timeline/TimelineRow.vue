<template>
  <div class="cal__row" ref="timelineRow" :rowid="rowid">
    <div class="cal__inner-row-container" :class="{ 'cal__row--dragover': isDragover }">
      <template v-for="(_, index) in Array(rows)" :key="index">
        <div class="cal__inner-row" />
      </template>
    </div>

    <template v-for="(_, index) in new Array(totalCells)" :key="index">
      <div class="cal__cell" @dblclick="handleCellClicked"></div>
    </template>

    <slot />
    <button class="cal__button" @click="handleAddRow">+</button>
    <button class="cal__button-bottom" @click="handleRemoveRow">-</button>
  </div>
</template>

<script>
import eventBus from "../eventBus.js";

import { computed } from "vue";

import { mapState, mapMutations, mapGetters } from "vuex";
import { addDays, convertToDay } from "@/utils/date";
import {
  cellHeightInPx,
  cellHeight,
  cellSizeInPx,
  cellSize,
} from "@/contexts/CellSizeContext";

export default {
  name: "TimelineRow",
  inject: {
    cellHeightInPx,
    cellHeight,
    cellSizeInPx,
    cellSize,
    increaseRow: { from: "increaseRow" },
    decreaseRow: { from: "decreaseRow" },
    updateTask: { from: "updateTask" },
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
    handleCellClicked: function (e) {
      const clickX = e.clientX;
      //const clickY = e.clientY;

      // Get the position of the parent element
      const parentRect = e.target.parentElement.getBoundingClientRect();

      // Calculate the position relative to the parent
      const relativeX = clickX - parentRect.left;
      //const relativeY = clickY - parentRect.top;

      // Our days is the current X position divided by the cellSize and the number of days per cell.
      // We are a real number since we are really time in seconds.
      const relative_days = (relativeX / this.cellSize) * this.cellDays;

      // Current ROW relative to the group
      const priority = Math.ceil(e.offsetY / this.cellHeight);

      // We append the start of this calendar to the relative position
      const clicked_day = addDays(this.calendarInit, relative_days);

      //console.log("CLICKED CELL " + relative_days + "," + priority);

      // The clicked day will become a javascript Date for easier displaying.
      const myStartDate = convertToDay(clicked_day).toDate();
      console.log("DAY CLICKED !" + myStartDate);

      let new_task = {
        id: "NEW_TASK__" + Math.round(clicked_day),
        title: "TASK TITLE",
        row: priority + this.group.timeline_row - 1,
        group_id: this.group.id,
        creationDate: clicked_day,
        dueDate: addDays(clicked_day, this.cellDays),
        priority: priority,
        progress: 0,
        interal_state: "NEW",
        // The task will follow a path of modification
        // The user can delete at any point without saving it.
      };
      eventBus.emit("taskdatapanel", new_task);
      this.updateTask(new_task);
    },

    handleRemoveRow: function () {
      if (this.rows == 1) return;

      this.rows -= 1;
      this.setListRowHeight();
      this.decreaseRow(this.group);
    },
    handleAddRow: function () {
      this.rows += 1;
      this.setListRowHeight();
      this.increaseRow(this.group);
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
  watch: {
    cellHeight: function() {
      this.setListRowHeight();
    },
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

.cal__button-bottom {
  position: sticky;
  right: 10;
  height: 20px;
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
