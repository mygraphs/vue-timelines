<template>
  <div class="calendar">
    <div v-for="month in calendar" :key="month.name + month.year">
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

export default {
  name: "Calendar",
  props: {
    init: Number,
    end: Number,
  },
  data() {
    return {
      calendar: [],
    };
  },
  methods: {
    buildCalendar: function () {
      let totalDays = 0;
      let init = dayjs(this.init * 1000);
      const end = dayjs(this.end * 1000);

      while (init.month() <= end.month()) {
        const month = {
          name: init.format("MMMM"),
          year: init.format("YYYY"),
          lastDay: init.endOf("month").date(),
        };

        totalDays += init.endOf("month").date();
        this.calendar.push(month);

        init = init.add(1, "month");
      }

      this.$emit("totalCells", totalDays);
    },
  },
  mounted() {
    this.buildCalendar();
  },
};
</script>

<style>
.calendar {
  display: flex;
}
</style>
