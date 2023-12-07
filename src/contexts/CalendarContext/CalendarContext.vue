<template>
  <slot />
</template>

<script>
import { computed } from "vue";

import * as date from "@/utils/date";
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
      let days = date.getDiffDays(this.calendarEnd, this.calendarInit);
      let cells = days / this.cellDays;
      cells = Math.ceil(cells);
      console.log(days + " TOTAL CELLS" + cells);
      return cells | 0;
    },
    todayCell: function () {
      let now = new Date().getTime() / 1000;
      if (this.calendarEnd < now)
        now = this.calendarEnd;

      let current_day = date.getDiffDays(this.calendarInit, now) / this.cellDays
      console.log("CURRENT DAY " + current_day)
      return current_day | 0;
    },
  },
  methods: {
    setCellSizeDays: function (days) {
      console.log("============== SIZE DAYS " + days + " ===============");
      this.cellDays = days;
    },
    setCalendarSize: function (calendarInit, calendarEnd) {
      let margin = (this.cellDays < 7) ? 7 : this.cellDays * 2;
      this.calendarInit = date.subtractDays(calendarInit, margin);
      this.calendarEnd = date.addDays(calendarEnd, margin);
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

      this.setCalendarSize(calendarInit, calendarEnd);
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
