<template>
  <div class="calendar">
    <div v-for="month in calendar" :key="month.name + month.year"
      class="cal__inner-container">
      <div>{{ month.year }}</div>
      <div>{{ month.name }}</div>
      <div class="cal__days-container">
        <template v-for="day in month.days" :key="day">
          <div>{{ day }}</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
dayjs.extend(weekOfYear);

import { calendarInit, calendarEnd, cellDays } from "@/contexts/CalendarContext";

export default {
  name: "Calendar",
  inject: { calendarInit, calendarEnd, cellDays },
  computed: {
    calendar: function () {
      if (!this.calendarInit || !this.calendarEnd) return [];

      const months = [];
      let init = dayjs(this.calendarInit * 1000);
      const end = dayjs(this.calendarEnd * 1000);

      let last_value = -1;
      while (init.isBefore(end) || init.isSame(end)) {
        const monthEnd = init.endOf('month');
        const days = [];
        let currentDay = init.startOf('month');

        while (currentDay.isBefore(monthEnd) || currentDay.isSame(monthEnd)) {
          if (this.cellDays === 7) { // Assuming 7 for work weeks
            // Skip to the next week's first day

            let week = currentDay.week();
            if (last_value != week && week < 53) {
                days.push(week);
                last_value = week;
            }

          } else {
            // Increment by the cellDays value
            days.push(currentDay.date());
          }

          currentDay = currentDay.add(this.cellDays, 'day');
        }

        const month = {
          name: init.format("MMMM"),
          year: init.format("YYYY"),
          days: days,
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

.cal__inner-container {
  background-color: #f8f9fc;
  padding-top: 1.7rem;
}

.cal__days-container {
  background-color: #f8f9fc;
}
</style>
