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
      return getDiffDays(lastDayMounth(this.calendarEnd), this.calendarInit);
    },
    todayCell: function () {
      return getDiffDays(this.calendarInit, new Date().getTime() / 1000);
    },
  },
  methods: {
    setCalendarSize: function (groups) {
      const tasks = groups
        .map((group) => [...group.tasks])
        .reduce((prev, curr) => [...prev, ...curr]);

      const tasksSorted = tasks.sort((a, b) => a.creationDate - b.creationDate);

      const [firstTask] = tasksSorted;
      const [lastTask] = tasksSorted.reverse();

      this.calendarInit = firstDayMounth(firstTask.creationDate);
      this.calendarEnd = firstDayMounth(lastTask.duedate);
    },
    checkCalendarSize: function (tasks) {
      const tasksSorted = tasks.sort((a, b) => a.creationDate - b.creationDate);

      const [firstTask] = tasksSorted;
      const [lastTask] = tasksSorted.reverse();

      if (!this.calendarInit || firstTask.creationDate < this.calendarInit) {
        this.calendarInit = firstDayMounth(firstTask.creationDate);
      }

      if (!this.calendarEnd || lastTask.duedate > this.calendarEnd) {
        this.calendarEnd = firstDayMounth(lastTask.duedate);
      }
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
