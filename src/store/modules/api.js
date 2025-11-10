import { mapState, mapGetters, mapMutations } from "vuex";
import { getTimestampNow } from "@/utils/date";
import { NoopApiService } from "@/services";

/**
 * Create API module with injected API service
 * @param {ApiService} apiService - API service instance
 * @returns {Object} Vuex module
 */
export default function createApiModule(apiService = new NoopApiService()) {
  return {
    namespaced: true,
    state() {
      return {
        id: null,
        start_date: null,
        end_date: null,
        title: "API TIMELINE TITLE",
        groups: [],
        tasks: [],
      };
    },
    getters: {
      findTaskById(state) {
        return (taskId) => state.tasks.find(task => task.id === taskId);
      },
    },
    mutations: {
      setTitle(state, title) {
        state.title = title;
      },
      setGroups(state, groups) {
        state.groups = groups;
      },
      setTasks(state, tasks) {
        state.tasks = tasks;
      },
      setTimeline(state, json) {
        console.log(" SET NEW TIMELINE");
        let event = json.event;

        state.id = event.id;
        state.start_date = event.start_date;
        state.end_date = event.end_date;

        if ('groups' in event)
          state.groups = event.groups;
        else {
          state.groups = [];
          // Note: We can't call commit from mutation, so this will be handled in action
        }

        if ('tasks' in event)
          state.tasks = event.tasks;
        else
          state.tasks = [];

        if ('title' in event)
          state.title = event.title;
        else
          state.title = "EMPTY TITLE";

        this.commit('setCalendarSize', { calendarInit: event.start_date, calendarEnd: event.end_date });
      },
      updateTask(state, updatedTask) {
        let idx = state.tasks.findIndex(task => task.id === updatedTask.id);

        if (idx === -1) {
          // If we cannot find this task by ID then this is a new task.
          state.tasks.push(updatedTask);
          return;
        }

        state.tasks[idx] = updatedTask;
      },
    },
    actions: {
      listTasks({ state }) {
        for (const key in state.tasks) {
          const t = state.tasks[key];
          console.log(
            key +
            ": (" +
            t.title +
            ") GROUP " +
            t.group_id +
            "[" +
            new Date(t.creationDate * 1000).toLocaleDateString() +
            "] [" +
            new Date(t.dueDate * 1000).toLocaleDateString() +
            "]"
          );
        }
      },
      test() {
        console.log(" TEST API ACTION ");
      },
      testObj(context, obj) {
        console.log(" TEST API PARAM " + obj.title);
      },
      async createTimeline({ commit, dispatch }, newTimeline) {
        try {
          const data = await apiService.createTimeline(newTimeline);
          commit('setTimeline', data);

          // If no groups, create default group
          if (!data.event.groups || data.event.groups.length === 0) {
            await dispatch('addNewGroup', { name: "default group" });
          }

          return data;
        } catch (error) {
          console.error('Failed to create timeline:', error);
          throw error;
        }
      },
      async addNewGroup({ commit, state }, group) {
        try {
          const newGroup = {
            ...group,
            etype: "GROUP",
            gallery_id: state.id,
          };

          const data = await apiService.createGroup(newGroup);
          let e = data.event;

          if (e.name == "default group") {
            e.name += " " + (state.groups.length + 1);
          }

          commit('setGroups', [...state.groups, e]);
          return data;
        } catch (error) {
          console.error('Failed to create group:', error);
          throw error;
        }
      },
      async updateTask({ commit }, task) {
        try {
          const data = await apiService.updateTask(task);
          commit('updateTask', task); // Update local state
          return data;
        } catch (error) {
          console.error('Failed to update task:', error);
          // Still update local state even if API fails
          commit('updateTask', task);
          throw error;
        }
      },
    }
  };
}
