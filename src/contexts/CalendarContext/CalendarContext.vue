<template>
  <slot />
</template>

<script>
import { computed } from "vue";

import { firstDayMounth, getDiffDays, lastDayMounth } from "@/utils/date";
import {
  calendarInit,
  calendarEnd,
  totalDays,
  todayCell,
  setCalendarSize,
  checkCalendarSize,
} from "./keys";

export default {
  name: "CalendarContext",
  data() {
    return {
      calendarInit: 0,
      calendarEnd: 0,
    };
  },
  computed: {
    totalDays: function () {
      return getDiffDays(this.calendarEnd, this.calendarInit);
    },
    todayCell: function () {
      return getDiffDays(this.calendarInit, new Date().getTime() / 1000);
    },
  },
  methods: {
    setCalendarSize: function (calendarInit, calendarEnd) {
      this.calendarInit = firstDayMounth(calendarInit);
      this.calendarEnd = lastDayMounth(calendarEnd);
    },
    checkCalendarSize: function (tasks) {
      let calendarInit = null;
      let calendarEnd = null;

      tasks.forEach((task) => {
        if (!calendarInit) calendarInit = task.creationDate;
        if (!calendarEnd) calendarEnd = task.duedate;

        if (task.creationDate < calendarInit) calendarInit = task.creationDate;
        if (task.duedate > calendarEnd) calendarEnd = task.duedate;
      });

      if (calendarInit < this.calendarInit)
        this.calendarInit = firstDayMounth(calendarInit);

      if (calendarEnd > this.calendarEnd)
        this.calendarEnd = lastDayMounth(calendarEnd);
    },
  },
  provide: function () {
    return {
      [calendarInit]: computed(() => this.calendarInit),
      [calendarEnd]: computed(() => this.calendarEnd),
      [totalDays]: computed(() => this.totalDays),
      [todayCell]: computed(() => this.todayCell),
      [setCalendarSize]: this.setCalendarSize,
      [checkCalendarSize]: this.checkCalendarSize,
    };
  },
};
</script>
