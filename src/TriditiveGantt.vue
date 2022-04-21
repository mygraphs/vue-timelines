<template>
  <GanttHeader @scrollToday="calendarScrollToday" />

  <div class="gantt-container">
    <div class="list">
      <template v-for="column in columns" :key="column.key">
        <div class="list__header">{{ column.slug }}</div>
      </template>

      <template v-for="task in tasks" :key="task.title">
        <template v-for="column in columns" :key="column.key">
          <div>{{ setCellFormat(task[column.key]) }}</div>
        </template>
      </template>
    </div>

    <div class="gantt" v-if="tasks.length !== 0" ref="gantt">
      <Calendar
        :init="calendarInit"
        :end="calendarEnd"
        @totalCells="(value) => (totalCells = value)"
      />

      <template v-for="task in tasks" :key="task.id">
        <div class="calendar__row">
          <template v-for="(_, index) in new Array(totalCells)" :key="index">
            <div class="calendar__cell" />
          </template>

          <Task v-bind="task" :calendarInit="calendarInit" />
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import { Task, Calendar, GanttHeader } from "@/components";
import { cellSizeInPx, cellSize } from "@/contexts/CellSizeContext";

export default {
  name: "TriditiveGantt",
  inject: { cellSizeInPx, cellSize },
  props: {
    columns: { type: Array, default: () => [] },
    tasks: { type: Array, default: () => [] },
  },
  data: function () {
    return {
      listColumns: this.columns.length,
      totalCells: 0,
      todayCell: 0,
    };
  },
  computed: {
    calendarInit: function () {
      return [...this.tasks].sort((a, b) => a.initDate < b.initDate)[0]
        .creationDate;
    },
    calendarEnd: function () {
      return [...this.tasks].sort((a, b) => b.duedate > a.duedate)[0].duedate;
    },
  },
  methods: {
    calendarScrollToday: function () {
      if (!this.todayCell) {
        this.todayCell =
          -1 *
            dayjs(this.calendarInit * 1000)
              .set("date", 1)
              .diff(new Date(), "d") +
          1;
      }

      this.$refs.gantt.scrollLeft = this.cellSize * (this.todayCell - 4);
    },
    setCellFormat: function (value) {
      if (typeof value === "string") return value;

      if (typeof value === "number") {
        if (value < 1 && value > 0) return `${value * 100}%`;

        if (dayjs().isValid(value * 1000)) {
          return dayjs(value * 1000).format("DD/MM/YYYY");
        }
      }

      return value;
    },
  },
  mounted() {
    setTimeout(this.calendarScrollToday, 1);
  },
  components: {
    Task,
    Calendar,
    GanttHeader,
  },
};
</script>

<style>
.gantt {
  overflow-x: scroll;
  width: 100%;
}

.gantt-container {
  display: flex;
}

.list {
  display: grid;
  grid-template-columns: repeat(v-bind(listColumns), 1fr);
  min-width: 500px;
  color: #606060;
}

.list div {
  padding: 0.8rem 0.5rem;
  border-right: 1px solid rgb(226, 226, 226);
  border-bottom: 1px solid rgb(226, 226, 226);
}

.list__header {
  color: #707070;
  background-color: #fdfdfd;
}

.calendar {
  text-align: center;
  padding: 0.24rem 0;
  color: #707070;
  background-color: #fdfdfd;
}
.calendar__days-container {
  display: flex;
}

.calendar__days-container div {
  width: v-bind(cellSizeInPx);
  border-right: 1px solid rgba(177, 184, 189, 0.5);
  border-bottom: 1px solid rgb(226, 226, 226);
}

.calendar__row {
  display: flex;
  position: relative;
}

.calendar__row:after {
  content: "";
  position: absolute;
  height: 100%;
  width: 1px;
  top: -2px;
  background-color: rgba(255, 0, 0, 0.5);
  left: calc(v-bind(cellSizeInPx) * v-bind(todayCell));
}

.calendar__cell {
  max-width: v-bind(cellSizeInPx);
  min-width: v-bind(cellSizeInPx);
  width: v-bind(cellSizeInPx);
  border-right: 1px solid;
  border-bottom: 1px solid;
  border-color: rgba(212, 222, 230, 0.5);
  height: 45px;
}
</style>
