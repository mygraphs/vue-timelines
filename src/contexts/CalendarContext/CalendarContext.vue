<template>
  <slot />
</template>

<script>
import { computed } from "vue";

import { firstDayMonth, getDiffDays, lastDayMonth } from "@/utils/date";
import {
  calendarInit,
  calendarEnd,
  cellDays,
  totalCells,
  todayCell,
  setCellSizeDays,
  setCalendarSize,
  checkCalendarSize,
} from "./keys";

export default {
  name: "CalendarContext",
  data() {
    return {
      calendarInit: 0,
      calendarEnd: 0,
      cellDays: 1,
    };
  },
  computed: {
    totalCells: function () {
      let cells = getDiffDays(this.calendarEnd, this.calendarInit) / this.cellDays

      console.log("TOTAL CELLS" + cells)
      return cells | 0;
    },
    todayCell: function () {
      let now = new Date().getTime() / 1000;
      if (this.calendarEnd < now)
        now = this.calendarEnd;

      let current_day = getDiffDays(this.calendarInit, now) / this.cellDays
      console.log("CURRENT DAY " + current_day)
      return current_day | 0;
    },
  },
  methods: {
    setCellSizeDays: function (days) {
      this.cellDays = days;
    },
    setCalendarSize: function (calendarInit, calendarEnd) {
      this.calendarInit = firstDayMonth(calendarInit);
      this.calendarEnd = lastDayMonth(calendarEnd);
    },
    checkCalendarSize: function (tasks) {
      let calendarInit = null;
      let calendarEnd = null;

      tasks.forEach((task) => {
        if (!calendarInit) calendarInit = task.creationDate;
        if (!calendarEnd) calendarEnd = task.dueDate;

        if (task.creationDate < calendarInit) calendarInit = task.creationDate;
        if (task.dueDate > calendarEnd) {
          calendarEnd = task.dueDate;
          console.log(" END CALENDAR " + task.dueDate)
        }
      });

      if (calendarInit < this.calendarInit)
        this.calendarInit = firstDayMonth(calendarInit);

      if (calendarEnd > this.calendarEnd) {
        console.log(" Calendar end ");
        this.calendarEnd = lastDayMonth(calendarEnd);
      }
    },
  },
  provide: function () {
    return {
      [calendarInit]: computed(() => this.calendarInit),
      [calendarEnd]: computed(() => this.calendarEnd),
      [totalCells]: computed(() => this.totalCells),
      [todayCell]: computed(() => this.todayCell),
      [cellDays]: computed(() => this.cellDays),
      [setCalendarSize]: this.setCalendarSize,
      [setCellSizeDays]: this.setCellSizeDays,
      [checkCalendarSize]: this.checkCalendarSize,
    };
  },
};
</script>
