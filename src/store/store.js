// store.js
import { createStore } from 'vuex';
import * as date from "@/utils/date";

export default createStore({
  state() {
    return {
      calendarInit: 0,
      calendarEnd: 0,
      cellDays: 1,
      timelineMinRow: 0,
      timelineMaxRow: 0,
      debug: true,
    };
  },
  mutations: {
    setRowBoundaries(state, { minRow, maxRow }) {
      // Minimum and maximum timeline positions defined by the groups
      state.timelineMinRow = minRow;
      state.timelineMaxRow = maxRow;
    },
    setCellSizeDays(state, days) {
      // Selector we should be able to extract the day from text like 1 hour or 8 hours.
      console.log("CELL DAYS " + days);
      state.cellDays = days;
    },
    setCalendarSize(state, { calendarInit, calendarEnd }) {
      let margin = (state.cellDays < 7) ? 7 : state.cellDays * 2;
      if (state.cellDays < 1) {
        margin = state.cellDays;
      }

      state.calendarInit = date.subtractDays(calendarInit, margin);
      state.calendarEnd = date.addDays(calendarEnd, margin);
    },
    checkCalendarSize(state, tasks) {
      let calendarInit = null;
      let calendarEnd = null;

      tasks.forEach((task) => {
        if (!calendarInit || task.creationDate < calendarInit)
          calendarInit = task.creationDate;
        if (!calendarEnd || task.dueDate > calendarEnd)
          calendarEnd = task.dueDate;
      });

      this.commit('setCalendarSize', { calendarInit, calendarEnd });
    },
  },
  getters: {
    isDebug(state) {
      return state.debug;
    },
    totalCells: (state) => {
      let days = date.getDiffDays(state.calendarEnd, state.calendarInit);
      let cells = Math.ceil(days / state.cellDays);
      return cells;
    },
    todayCell: (state) => {
      let now = new Date().getTime() / 1000;
      now = state.calendarEnd < now ? state.calendarEnd : now;

      return Math.floor(date.getDiffDays(state.calendarInit, now) / state.cellDays);
    },
  }
});
