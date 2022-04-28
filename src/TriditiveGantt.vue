<template>
  <GanttHeader @scrollToday="calendarScrollToday" />

  <div class="gantt-container">
    <div class="list">
      <div class="list__header">Name</div>

      <template v-for="group in groups" :key="group.id">
        <div>{{ setCellFormat(group.name) }}</div>
      </template>
    </div>

    <div class="gantt" v-if="groups.length !== 0" ref="gantt">
      <Calendar />

      <template v-for="group in groups" :key="group.id">
        <TaskList v-bind="group" />
      </template>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import { GanttHeader, Calendar, TaskList } from "@/components";
import { cellSizeInPx, cellSize } from "@/contexts/CellSizeContext";
import { setCalendarSize, todayCell } from "@/contexts/CalendarContext";

export default {
  name: "TriditiveGantt",
  inject: {
    cellSizeInPx,
    cellSize,
    setCalendarSize,
    todayCell,
  },
  props: {
    groups: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    calendarScrollToday: function () {
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
    this.setCalendarSize(this.groups);
  },
  components: {
    TaskList,
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
