// store.js
import { createStore } from 'vuex';

import createApiModule from './modules/api.js'
import foo from './modules/foo.js'
import { NoopApiService } from '@/services';

import * as date from "@/utils/date";

const root = {
  state() {
    return {
      calendarInit: 0,
      calendarEnd: 0,
      cellDays: 1,
      timelineMinRow: 0,
      timelineMaxRow: 0,
      debug: false,
      config: {
        // Configurable minimum distance in seconds between tasks.
        TASK_MIN_SEPARATION_S: 300,
        // Enable/disable task dragging (moving tasks on the timeline)
        TASK_DRAGGING_ENABLED: true,
        // Constrain tasks to their group (prevent dragging outside group boundaries)
        TASK_CONSTRAINED_TO_GROUP: true,
        // Show/hide the "New group" button
        GROUP_CREATE_ENABLED: true,
        // Enable/disable group name editing
        GROUP_EDIT_ENABLED: true,
        // Enable/disable row add/remove buttons (+ and - buttons in timeline rows)
        ROW_ADD_REMOVE_ENABLED: true,
        // Status color mapping: maps status names to CSS color values
        // Format: { "Pending": "#ffb311", "Completed": "#00a85d", ... }
        STATUS_COLORS: {},
      },
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

      if (calendarInit)
        state.calendarInit = date.subtractDays(calendarInit, margin);

      if (calendarEnd)
        state.calendarEnd = date.addDays(calendarEnd, margin);

      if (state.calendarInit > state.calendarEnd) {
        // Calendar start is bigger than end, we just swap the values.
        let t = state.calendarInit;
        state.calendarInit = state.calendarEnd;
        state.calendarEnd = t;
      }
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

      if (calendarInit && calendarEnd)
        this.commit('setCalendarSize', { calendarInit, calendarEnd });
    },
    setConfig(state, { key, value }) {
      // Set a configuration value
      if (key && typeof key === 'string') {
        state.config[key] = value;
      }
    },
    setDebug(state, enabled) {
      // Enable or disable debug mode
      state.debug = enabled === true || enabled === 'true' || enabled === '';
    },
  },
  getters: {
    // A getter can be a function, but you have to return
    // a function with parameters using the following format:

    getConfig: (state) => (param, default_value = null) => {
      if (param in state.config)
        return state.config[param];

      return default_value;
    },
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
  },

  modules: {
    api: createApiModule(new NoopApiService()),
    foo: foo,
  }
};

/**
 * Create Vuex store with optional API service
 * @param {ApiService} apiService - Optional API service instance
 * @returns {Store} Vuex store instance
 */
export function createTimelineStore(apiService = new NoopApiService()) {
  const storeConfig = {
    ...root,
    modules: {
      ...root.modules,
      api: createApiModule(apiService),
    }
  };
  return createStore(storeConfig);
}

// Default export for backward compatibility
export default createStore(root);

