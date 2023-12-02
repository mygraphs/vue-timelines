<template>
  <slot />
</template>

<script>
import { computed } from "vue";

import { firstDayMonth, getDiffDays, lastDayMonth } from "@/utils/date";

import * as k from "./keys";

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

      // We find the first day of the month, so we have a buffer on the calendar to that date
      // [TODO] Maybe change it to x days prior instead of first of month
      if (calendarInit < this.calendarInit)
        this.calendarInit = firstDayMonth(calendarInit);

      // Find the last day of the month and adjust date to that.
      // [TODO] Same as first date, we might want to configure a margin and not end of month
      if (calendarEnd > this.calendarEnd) {
        console.log(" Calendar end ");
        this.calendarEnd = lastDayMonth(calendarEnd);
      }
    },
  },
  provide: function () {
    return {
      [k.calendarInit]: computed(() => this.calendarInit),
      [k.calendarEnd]: computed(() => this.calendarEnd),
      [k.totalCells]: computed(() => this.totalCells),
      [k.todayCell]: computed(() => this.todayCell),
      [k.cellDays]: computed(() => this.cellDays),
      [k.setCalendarSize]: this.setCalendarSize,
      [k.setCellSizeDays]: this.setCellSizeDays,
      [k.checkCalendarSize]: this.checkCalendarSize,
    };
  },
};
</script>
