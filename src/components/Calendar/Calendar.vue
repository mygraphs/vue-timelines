<template>
  <div class="calendar">
    <div
      v-for="month in calendar"
      :key="month.name + month.year"
      class="cal__inner-container"
    >
      <div>{{ month.year }}</div>
      <div>{{ month.name }}</div>

      <div class="cal__int-container" v-if="this.cellDays >= 1">
        <template v-for="day in month.days" :key="day">
          <div>{{ day.title }}</div>
        </template>
      </div>
      <div v-else class="cal__day-container">
        <template v-for="day in month.days" :key="day">
          <table>
            <tr>
              <td>
                <div>{{ day.title }}</div>
              </td>
            </tr>
            <tr>
              <td>
                <div class="cal__int-container">
                  <table>
                    <tr>
                      <template v-for="hour in day.hours" :key="hour">
                        <td>
                          <div>{{ hour }}</div>
                        </td>
                      </template>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
          </table>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(weekOfYear);
dayjs.extend(isSameOrAfter);

import { mapState, mapMutations, mapGetters } from "vuex";
import { cellSize, resetCellSize } from "@/contexts/CellSizeContext";

function adjustTextToCells(day, format, number_days, cell_size) {
  const LETTER_SIZE_PX = 10;

  // Adjust the text to the available space
  let text = day.format(format);
  let size_px = cell_size * number_days;
  if (size_px < text.length * LETTER_SIZE_PX) {
    if (format == "MMMM") text = text.substring(0, 3);
    else text = text.substring(2);
  }

  return text;
}

export default {
  name: "Calendar",
  inject: { cellSize, resetCellSize },
  methods: {
    ...mapMutations(["setCalendarSize", "setCellSizeDays"]),
  },
  computed: {
    ...mapState(["calendarInit", "calendarEnd", "cellDays"]),
    ...mapGetters(["totalCells", "todayCell"]),
    calendar: function () {
      /*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
      if (!this.calendarInit || !this.calendarEnd) return [];

      let currentDay = dayjs(this.calendarInit * 1000);
      let currentMonth = currentDay.month();
      let end = dayjs(this.calendarEnd * 1000);

      let months = [];
      let days = [];

      let count = 0;
      console.log(
        "================= DIVIDE IN " + this.cellDays + " =================== "
      );

      while (true) {
        let day = { title: "" };

        if (this.cellDays === 7) {
          // Assuming 7 for work weeks
          day.title = currentDay.week();
        } else if (this.cellDays < 14) day.title = currentDay.date();

        if (this.cellDays < 1) {
          let oldDay = currentDay.day();
          let hours = [];
          while (oldDay == currentDay.day()) {
            hours.push(currentDay.hour());
            currentDay = currentDay.add(this.cellDays * 24, "hour");
          }

          day.hours = hours;
        }

        days.push(day);

        let newDay = currentDay.add(this.cellDays, "day");
        if (currentMonth != newDay.month()) {
          currentMonth = newDay.month();

          const month = {
            name: adjustTextToCells(currentDay, "MMMM", days.length, this.cellSize),
            year: adjustTextToCells(currentDay, "YYYY", days.length, this.cellSize),
            days: days,
          };

          months.push(month);
          days = [];
        }

        if (currentDay.isSameOrAfter(end)) {
          console.log("Finished date " + currentDay);
          break;
        }

        count += 1;
        if (count == this.totalCells) {
          break;
        }

        currentDay = newDay;
      }

      console.log(
        "================= FINISHED UPDATE " + this.cellDays + " =================== "
      );
      if (days.length > 0)
        months.push({
          name: adjustTextToCells(currentDay, "MMMM", days.length, this.cellSize),
          year: adjustTextToCells(currentDay, "YYYY", days.length, this.cellSize),
          days: days,
        });

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
  background-color: #f8f9fc;
  width: 100%;
  z-index: 100;
}

.calendar > div {
  background-color: #f8f9fc;
}

.cal__inner-container {
  background-color: #f8f9fc;
  padding-top: 1.7rem;
  text-align: left;
  font-size: 1.0vw;
}

.cal__inner-container span {
  padding-left: 10px;
}

.cal__day-container {
  display: flex;
  background-color: #f7f8fb;
}

.cal__int-container {
  background-color: #f8f9fc;
  text-align: left;
}

.div-centered {
  clear: both;
  width: 100px;
}

table {
  border-spacing: 0px;
  border: 0px;
  margin: 0px;
  padding: 0px;
}
tr {
  padding: 0px;
}
td {
  padding: 0px;
}
</style>
