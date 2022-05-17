<template>
  <div class="calendar">
    <div
      v-for="month in calendar"
      :key="month.name + month.year"
      class="calendar__inner-container"
    >
      <div>{{ month.name }} {{ month.year }}</div>

      <div class="calendar__days-container">
        <template v-for="(_, index) in new Array(month.lastDay)" :key="index">
          <div>{{ index + 1 }}</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import { calendarInit, calendarEnd } from "@/contexts/CalendarContext";

export default {
  name: "Calendar",
  inject: { calendarInit, calendarEnd },
  computed: {
    calendar: function () {
      if (!this.calendarInit || !this.calendarEnd) return [];

      const months = [];

      let init = dayjs(this.calendarInit * 1000);
      const end = dayjs(this.calendarEnd * 1000);

      while (init.isBefore(end) || init.isSame(end)) {
        const month = {
          name: init.format("MMMM"),
          year: init.format("YYYY"),
          lastDay: init.endOf("month").date(),
        };

        months.push(month);
        init = init.add(1, "month");
      }

      return months;
    },
  },
};
</script>

<style>
.calendar {
  top: 0;
  display: flex;
  position: sticky;
  z-index: 100;
}

.calendar > div {
  background-color: #f8f9fc;
}

.calendar__inner-container {
  background-color: #f8f9fc;
  padding-top: 1.7rem;
}

.calendar__days-container {
  background-color: #f8f9fc;
}
</style>
