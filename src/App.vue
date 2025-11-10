<template>
  <div :class="themeClass">
    <!-- Theme Selector - Always visible -->
    <div class="theme-selector">
      <label for="theme-select" class="theme-selector__label">Theme:</label>
      <select
        id="theme-select"
        v-model="currentTheme"
        @change="handleThemeChange"
        class="theme-selector__select"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="auto">Auto (System)</option>
      </select>
    </div>

    <div v-if="!hasTimeline" class="flex-container">
      <div class="col">
        <button class="btn btn-success small" @click="loadDemo">Load Demo</button>
      </div>

      <div class="col">
        <FormCreateTimeline
          ref="createTimeline"
          class="form__create__panel"
          @openParent="showModal = true"
          @callbackSubmit="createNewTimeline"
          @closeParent="showModal = false"
        />
      </div>
    </div>

    <div v-else class="graph__container" ref="myGraphContainer">
      <MyGraphs
        v-model:desiredHeight="height"
        v-bind:title="title"
        @update="handleUpdatedTasks"
      />
    </div>
  </div>
</template>

<script>
import MyGraphs from "./MyGraphs";
import { FormCreateTimeline } from "@/components";

var test = {
  title: "VUE-TIMELINES DEMO",
  tasks: [
    {
      id: "01",
      group_id: "1",
      title: "Test task 01",
      creationDate: 1641437099,
      dueDate: 1651805099,
      progress: 0.8,
      priority: 0,
    },
    {
      id: "02",
      group_id: "1",
      title: "Test task 02",
      creationDate: 1643856299,
      dueDate: 1649126699,
      progress: 0.5,
      priority: 1,
    },
    {
      id: "03",
      group_id: "2",
      title: "Test task 03",
      creationDate: 1649041200,
      dueDate: 1650510000,
      progress: 0.8,
      priority: 0,
    },
    {
      id: "04",
      group_id: "2",
      title: "Test task 04",
      creationDate: 1650596400,
      dueDate: 1651374000,
      progress: 0.5,
      priority: 1,
    },
    {
      id: "05",
      group_id: "2",
      title: "Test task 05",
      creationDate: 1651719600,
      dueDate: 1651892400,
      progress: 0.5,
      priority: 1,
    },
    {
      id: "06",
      group_id: "2",
      title: "Test task 06",
      creationDate: 1652151600,
      dueDate: 1652152600,
      progress: 0.5,
      priority: 0,
    },
    {
      id: "07",
      group_id: "3",
      title: "Test task 07",
      creationDate: 1642737099,
      dueDate: 1651805099,
      progress: 1.0,
      priority: 0,
    },
    {
      id: "08",
      group_id: "3",
      title: "Test task 08",
      creationDate: 1645856299,
      dueDate: 1647126699,
      progress: 0.5,
      priority: 1,
      icon: "eye",
    },
    {
      id: "09",
      group_id: "4",
      title: "Test task 09",
      creationDate: 1649031200,
      dueDate: 1649410000,
      progress: 0.8,
      priority: 1,
    },
    {
      id: "10",
      group_id: "4",
      title: "Test task 10",
      creationDate: 1650596400,
      dueDate: 1651374000,
      progress: 0.9,
      priority: 3,
    },
    {
      id: "11",
      group_id: "4",
      title: "Test task 11",
      creationDate: 1649031200,
      dueDate: 1649410000,
      progress: 0.0,
      priority: 4,
    },
  ],
  groups: [
    {
      name: "group 01",
      id: "1",
    },
    {
      name: "group 02",
      id: "2",
    },
    {
      name: "group 03",
      id: "3",
    },
    {
      name: "group 04",
      id: "4",
    },
  ],
};

import { mapState, mapGetters, mapMutations } from "vuex";
import { nextTick } from "vue";
import { applyTheme, getTheme, watchSystemTheme } from "./utils/theme-provider";

/* https://v3.vue-final-modal.org/guide/properties */
import { VueFinalModal } from "vue-final-modal";

export default {
  name: "App",
  data() {
    return {
      height: 0,
      hasTimeline: false,
      currentTheme: 'light',
      systemThemeWatcher: null,
    };
  },
  computed: {
    themeClass() {
      return this.currentTheme === 'dark' ? 'vt-theme-dark' : '';
    },
    ...mapState(["isDebug", "api"]),
    ...mapState("api", ["groups", "tasks", "title"]),
  },
  methods: {
    ...mapMutations("api", ["setGroups", "setTasks", "setTitle", "updateTask"]),
    createNewTimeline: function (timeline) {
      console.log("NEW TIMELINE");
      this.$store
        .dispatch("api/createTimeline", timeline)
        .then((data) => {
          this.hasTimeline = true;
          this.configureHeightResize();
        })
        .catch((error) => {
          alert(error);
        });
    },

    handleUpdatedTasks: function (task) {
      if (this.isDebug) {
        let t = task.title.split("|");
        task.title = t[0] + " | " + Math.round(Math.random() * 100);
      }

      console.log("******* UPDATED TASK " + task.title + " ********** " + task.group_id);
      this.updateTask(task);
    },
    loadDemo: function () {
      this.setTitle(test.title);
      this.setTasks(test.tasks);
      this.setGroups(test.groups);
      this.hasTimeline = true;
      this.configureHeightResize();
    },
    configureHeightResize() {
      nextTick(() => {
        const observedElement = this.$refs.myGraphContainer;
        if (observedElement) {
          const resizeObserver = new ResizeObserver((entries) => {
            this.height = observedElement.clientHeight;
            console.log(" CLIENT HEIGHT " + this.height);
          });

          resizeObserver.observe(observedElement);
        }
      });
    },
    handleThemeChange() {
      // Save theme preference
      localStorage.setItem('vue-timelines-theme', this.currentTheme);

      if (this.currentTheme === 'auto') {
        // Watch system theme
        if (this.systemThemeWatcher) {
          this.systemThemeWatcher();
        }
        this.systemThemeWatcher = watchSystemTheme(document.body, (theme) => {
          // Theme is automatically applied by watchSystemTheme
        });
      } else {
        // Stop watching system theme if it was active
        if (this.systemThemeWatcher) {
          this.systemThemeWatcher();
          this.systemThemeWatcher = null;
        }
        // Apply selected theme
        applyTheme(document.body, this.currentTheme);
      }
    },
  },
  mounted: function () {
    //    debugger;

    this.$store.dispatch("api/test");
    this.$store.dispatch("api/testObj", { title: "TEST" });
    if (this.hasTimeline) this.configureHeightResize();

    // Initialize theme
    const savedTheme = localStorage.getItem('vue-timelines-theme') || 'light';
    this.currentTheme = savedTheme;
    this.handleThemeChange();
  },
  beforeUnmount() {
    // Cleanup theme watcher
    if (this.systemThemeWatcher) {
      this.systemThemeWatcher();
    }
  },
  components: {
    MyGraphs,
    FormCreateTimeline,
  },
};
</script>

<style>
/* Overwrite styles here */

* {
  /*  box-sizing: border-box; */
}

.graph__container {
  height: 100vh;
  /* height: 1000px; */
}

.task__content {
  /* background-color: rgba(0, 0, 255, 1); */
}

.form__create__panel {
}

/* Theme Selector */
.theme-selector {
  position: fixed;
  bottom: 10px;
  left: 10px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: var(--vt-bg-modal, #fff);
  border: 1px solid var(--vt-border-primary, rgb(226, 226, 226));
  border-radius: var(--vt-radius-md, 0.5rem);
  box-shadow: var(--vt-shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
}

.theme-selector__label {
  font-size: 0.875rem;
  color: var(--vt-text-secondary, #606060);
  margin: 0;
  font-weight: 500;
}

.theme-selector__select {
  padding: 4px 8px;
  border: 1px solid var(--vt-border-primary, rgb(226, 226, 226));
  border-radius: var(--vt-radius-sm, 0.2rem);
  background-color: var(--vt-bg-primary, #fff);
  color: var(--vt-text-primary, #000);
  font-size: 0.875rem;
  cursor: pointer;
  outline: none;
}

.theme-selector__select:hover {
  border-color: var(--vt-primary, #3c8dbc);
}

.theme-selector__select:focus {
  border-color: var(--vt-primary, #3c8dbc);
  box-shadow: 0 0 0 2px rgba(60, 141, 188, 0.2);
}
</style>

<style scoped>
.flex-container {
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
}

.flex-container > div {
  background-color: #fff;
  padding: 15px;
  font-size: 30px;
}
</style>
