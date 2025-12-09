<template>
    <div :class="themeClass">
        <!-- ModalsContainer is required for VueFinalModal to teleport modals to root level -->
        <ModalsContainer />

        <!-- Theme Selector - Always visible -->
        <div class="theme-selector">
            <label for="theme-select" class="theme-selector__label"
                >Theme:</label
            >
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
                <div class="demo-selector">
                    <label for="demo-select" class="demo-selector__label">Demo:</label>
                    <select
                        id="demo-select"
                        v-model="selectedDemo"
                        class="demo-selector__select"
                    >
                        <option value="tasks_full_test">Full Test</option>
                        <option value="tasks">Default Tasks</option>
                        <option value="tasks_test">Hierarchical Tasks</option>
                        <option value="tasks_missing_parent">Missing Parent Tasks</option>
                    </select>
                </div>
                <button class="btn btn-success small" @click="loadDemo">
                    Load Demo
                </button>
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
    title: "VUE-TIMELINES DEMO - Hierarchical Tasks",

    tasks_test: [
        {
            id: "6932f443d8beeb59a701658d",
            title: "testing recurrency",
            group_id: "task-6932f443d8beeb59a701658d",
            creationDate: 1764947011,
            dueDate: 1765065599,
            isSubtask: false,
            parentTaskId: null,
        },
        {
            id: "6932f5f1d8beeb59a70167b6",
            title: "testing recurring. Fixed Frequency",
            group_id: "task-6932f5f1d8beeb59a70167b6",
            creationDate: 1764947400,
            dueDate: 1765065599,
            isSubtask: false,
            parentTaskId: null,
        },
        {
            id: "6932f4d6d8beeb59a70165d3",
            title: "testing recurrency #2",
            group_id: "task-6932f443d8beeb59a701658d",
            creationDate: 1764947750,
            dueDate: 1764979199,
            isSubtask: false,
            parentTaskId: "6932f443d8beeb59a701658d",
        },
        {
            id: "6932f5afd8beeb59a7016726",
            title: "testing recurrency #3",
            group_id: "task-6932f443d8beeb59a701658d",
            creationDate: 1764947940,
            dueDate: 1766447999,
            isSubtask: false,
            parentTaskId: "6932f443d8beeb59a701658d",
        },
        {
            id: "6932f618d8beeb59a7016861",
            title: "testing recurring. Fixed Frequency #2",
            group_id: "task-6932f5f1d8beeb59a70167b6",
            creationDate: 1764948000,
            dueDate: 1764979199,
            isSubtask: false,
            parentTaskId: "6932f5f1d8beeb59a70167b6",
        },
        {
            id: "6932f62bd8beeb59a7016905",
            title: "testing recurring. Fixed Frequency #3",
            group_id: "task-6932f5f1d8beeb59a70167b6",
            creationDate: 1765951911,
            dueDate: 1767139199,
            isSubtask: false,
            parentTaskId: "6932f5f1d8beeb59a70167b6",
        },
        {
            id: "6937d08b1e0369d72e3531c6",
            title: "Testing subtasks to fixed frequency",
            group_id: "task-6932f5f1d8beeb59a70167b6",
            creationDate: 1765929600,
            dueDate: 1766793599,
            isSubtask: true,
            parentTaskId: "6932f62bd8beeb59a7016905",
        },
    ],

    tasks_missing_parent: [
        {
            id: "6932f5afd8beeb59a7016726",
            title: "testing recurrency #3",
            group_id: "task-6932f5afd8beeb59a7016726",
            creationDate: 1764947966,
            dueDate: 1764979199,
            isSubtask: false,
            parentTaskId: "6932f443d8beeb59a701658d",
        },
        {
            id: "6932f62bd8beeb59a7016905",
            title: "testing recurring. Fixed Frequency #3",
            group_id: "task-6932f62bd8beeb59a7016905",
            creationDate: 1764948600,
            dueDate: 1764979199,
            isSubtask: false,
            parentTaskId: "6932f5f1d8beeb59a70167b6",
        },
    ],

    tasks: [
        {
            id: "dummy-parent-001",
            title: "Dummy Parent Task",
            group_id: "task-dummy-parent-001",
            creationDate: 1764720000,
            dueDate: 1765324799,
            isSubtask: false,
            parentTaskId: null,
        },
        {
            id: "dummy-subtask-001",
            title: "Dummy Subtask 1",
            group_id: "task-dummy-parent-001",
            creationDate: 1764720000,
            dueDate: 1765324799,
            isSubtask: true,
            parentTaskId: "dummy-parent-001",
        },
        {
            id: "dummy-subtask-002",
            title: "Dummy Subtask 2",
            group_id: "task-dummy-parent-001",
            creationDate: 1764720000,
            dueDate: 1765324799,
            isSubtask: true,
            parentTaskId: "dummy-parent-001",
        },
        {
            id: "692e8cbde060612dc75b64dc",
            title: "testing task 123",
            group_id: "task-692e8cbde060612dc75b64dc",
            creationDate: 1764720720,
            dueDate: 1765497599,
            isSubtask: false,
            parentTaskId: null,
        },
        {
            id: "692ef71f7fbba45a9dda4ca0",
            title: "Subtask 1. Save 11",
            group_id: "task-692e8cbde060612dc75b64dc",
            creationDate: 1764720720,
            dueDate: 1765497599,
            isSubtask: true,
            parentTaskId: "692e8cbde060612dc75b64dc",
        },
        {
            id: "692efd967fbba45a9dda64af",
            title: "Subtask 2. Test 123",
            group_id: "task-692e8cbde060612dc75b64dc",
            creationDate: 1764720720,
            dueDate: 1765497599,
            isSubtask: true,
            parentTaskId: "692e8cbde060612dc75b64dc",
        },
    ],

    tasks_full_test: [
        // Group 1: Parent task with multiple subtasks
        {
            id: "01",
            group_id: "1",
            title: "Frontend Development",
            creationDate: 1641437099,
            dueDate: 1651805099,
            progress: 0.67, // 2 of 3 subtasks completed
            priority: 0,
            state: "Ongoing",
            // No parentTaskId = root task
        },
        {
            id: "01-1",
            group_id: "1",
            title: "Setup project structure",
            creationDate: 1641437099,
            dueDate: 1643856299,
            progress: 1.0,
            priority: 0,
            state: "Completed",
            parentTaskId: "01",
            isSubtask: true,
        },
        {
            id: "01-2",
            group_id: "1",
            title: "Implement components",
            creationDate: 1643856299,
            dueDate: 1649126699,
            progress: 1.0,
            priority: 0,
            state: "Completed",
            parentTaskId: "01",
            isSubtask: true,
        },
        {
            id: "01-3",
            group_id: "1",
            title: "Write unit tests",
            creationDate: 1649126699,
            dueDate: 1651805099,
            progress: 0.0,
            priority: 0,
            state: "Pending",
            parentTaskId: "01",
            isSubtask: true,
        },
        // Group 2: Multiple parent tasks with subtasks
        {
            id: "02",
            group_id: "2",
            title: "Backend API Development",
            creationDate: 1649041200,
            dueDate: 1650510000,
            progress: 0.5, // 1 of 2 subtasks completed
            priority: 0,
            state: "Ongoing",
        },
        {
            id: "02-1",
            group_id: "2",
            title: "Design API endpoints",
            creationDate: 1649041200,
            dueDate: 1649700000,
            progress: 1.0,
            priority: 0,
            state: "Completed",
            parentTaskId: "02",
            isSubtask: true,
        },
        {
            id: "02-2",
            group_id: "2",
            title: "Implement authentication",
            creationDate: 1649700000,
            dueDate: 1650510000,
            progress: 0.0,
            priority: 0,
            state: "Pending",
            parentTaskId: "02",
            isSubtask: true,
        },
        {
            id: "03",
            group_id: "2",
            title: "Database Design",
            creationDate: 1650596400,
            dueDate: 1651374000,
            progress: 0.33, // 1 of 3 subtasks completed
            priority: 1,
            state: "Ongoing",
        },
        {
            id: "03-1",
            group_id: "2",
            title: "Create schema",
            creationDate: 1650596400,
            dueDate: 1650800000,
            progress: 1.0,
            priority: 1,
            state: "Completed",
            parentTaskId: "03",
            isSubtask: true,
        },
        {
            id: "03-2",
            group_id: "2",
            title: "Set up migrations",
            creationDate: 1650800000,
            dueDate: 1651100000,
            progress: 0.5,
            priority: 1,
            state: "Ongoing",
            parentTaskId: "03",
            isSubtask: true,
        },
        {
            id: "03-3",
            group_id: "2",
            title: "Seed initial data",
            creationDate: 1651100000,
            dueDate: 1651374000,
            progress: 0.0,
            priority: 1,
            state: "Pending",
            parentTaskId: "03",
            isSubtask: true,
        },
        // Group 3: Parent task without subtasks
        {
            id: "04",
            group_id: "3",
            title: "Documentation",
            creationDate: 1642737099,
            dueDate: 1651805099,
            progress: 1.0,
            priority: 0,
            state: "Completed",
        },
        {
            id: "05",
            group_id: "3",
            title: "Code Review",
            creationDate: 1645856299,
            dueDate: 1647126699,
            progress: 0.5,
            priority: 1,
            state: "Ongoing",
            icon: "eye",
        },
        // Group 4: Mixed tasks (some with subtasks, some without)
        {
            id: "06",
            group_id: "4",
            title: "Testing & QA",
            creationDate: 1649031200,
            dueDate: 1649410000,
            progress: 0.5, // 1 of 2 subtasks completed
            priority: 1,
            state: "Ongoing",
        },
        {
            id: "06-1",
            group_id: "4",
            title: "Unit testing",
            creationDate: 1649031200,
            dueDate: 1649200000,
            progress: 1.0,
            priority: 1,
            state: "Completed",
            parentTaskId: "06",
            isSubtask: true,
        },
        {
            id: "06-2",
            group_id: "4",
            title: "Integration testing",
            creationDate: 1649200000,
            dueDate: 1649410000,
            progress: 0.0,
            priority: 1,
            state: "Pending",
            parentTaskId: "06",
            isSubtask: true,
        },
        {
            id: "07",
            group_id: "4",
            title: "Deployment",
            creationDate: 1650596400,
            dueDate: 1651374000,
            progress: 0.9,
            priority: 3,
            state: "Ongoing",
        },
        {
            id: "08",
            group_id: "4",
            title: "Monitoring Setup",
            creationDate: 1649031200,
            dueDate: 1649410000,
            progress: 0.0,
            priority: 4,
            state: "Pending",
        },
    ],

    // Groups for each dataset
    groups: [], // Default - groups will be auto-created from task group_ids

    groups_test: [], // Hierarchical Tasks - groups will be auto-created

    groups_missing_parent: [], // Missing Parent Tasks - groups will be auto-created

    groups_full_test: [
        {
            name: "Project Alpha",
            id: "1",
        },
        {
            name: "Project Beta",
            id: "2",
        },
        {
            name: "Project Gamma",
            id: "3",
        },
        {
            name: "Project Delta",
            id: "4",
        },
    ],
};

import { mapState, mapGetters, mapMutations } from "vuex";
import { nextTick } from "vue";
import { applyTheme, getTheme, watchSystemTheme } from "./utils/theme-provider";

/* https://v3.vue-final-modal.org/guide/properties */
import { ModalsContainer } from "vue-final-modal";

export default {
    name: "App",
    data() {
        return {
            height: 0,
            hasTimeline: false,
            currentTheme: "light",
            systemThemeWatcher: null,
            selectedDemo: "tasks_full_test",
        };
    },
    computed: {
        themeClass() {
            return this.currentTheme === "dark" ? "vt-theme-dark" : "";
        },
        ...mapState(["isDebug", "api"]),
        ...mapState("api", ["groups", "tasks", "title"]),
    },
    methods: {
        ...mapMutations("api", [
            "setGroups",
            "setTasks",
            "setTitle",
            "updateTask",
        ]),
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

            console.log(
                "******* UPDATED TASK " +
                    task.title +
                    " ********** " +
                    task.group_id
            );
            this.updateTask(task);
        },
        loadDemo: function () {
            this.setTitle(test.title);

            // Load the selected demo dataset
            const selectedTasks = test[this.selectedDemo] || test.tasks;
            this.setTasks(selectedTasks);

            // Load the corresponding groups for the selected demo
            // Map dataset names to their corresponding groups keys
            const groupsKeyMap = {
                'tasks': 'groups',
                'tasks_test': 'groups_test',
                'tasks_missing_parent': 'groups_missing_parent',
                'tasks_full_test': 'groups_full_test'
            };
            const groupsKey = groupsKeyMap[this.selectedDemo] || 'groups';
            const selectedGroups = test[groupsKey] || [];
            this.setGroups(selectedGroups);

            this.hasTimeline = true;
            this.configureHeightResize();
        },
        configureHeightResize() {
            nextTick(() => {
                const observedElement = this.$refs.myGraphContainer;
                if (observedElement) {
                    // Disconnect existing observer if any
                    if (this.resizeObserver) {
                        this.resizeObserver.disconnect();
                    }

                    this.resizeObserver = new ResizeObserver((entries) => {
                        // Use requestAnimationFrame to prevent ResizeObserver loop errors
                        requestAnimationFrame(() => {
                            if (observedElement) {
                                this.height = observedElement.clientHeight;
                                console.log(" CLIENT HEIGHT " + this.height);
                            }
                        });
                    });

                    this.resizeObserver.observe(observedElement);
                }
            });
        },
        handleThemeChange() {
            // Save theme preference
            localStorage.setItem("vue-timelines-theme", this.currentTheme);

            if (this.currentTheme === "auto") {
                // Watch system theme
                if (this.systemThemeWatcher) {
                    this.systemThemeWatcher();
                }
                this.systemThemeWatcher = watchSystemTheme(
                    document.body,
                    (theme) => {
                        // Theme is automatically applied by watchSystemTheme
                    }
                );
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
        const savedTheme =
            localStorage.getItem("vue-timelines-theme") || "light";
        this.currentTheme = savedTheme;
        this.handleThemeChange();
    },
    beforeUnmount() {
        // Cleanup theme watcher
        if (this.systemThemeWatcher) {
            this.systemThemeWatcher();
        }
        // Cleanup resize observer
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    },
    components: {
        MyGraphs,
        FormCreateTimeline,
        ModalsContainer,
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

/* Demo Selector */
.demo-selector {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
}

.demo-selector__label {
    font-size: 0.875rem;
    color: var(--vt-text-secondary, #606060);
    margin: 0;
    font-weight: 500;
}

.demo-selector__select {
    padding: 4px 8px;
    border: 1px solid var(--vt-border-primary, rgb(226, 226, 226));
    border-radius: var(--vt-radius-sm, 0.2rem);
    background-color: var(--vt-bg-primary, #fff);
    color: var(--vt-text-primary, #000);
    font-size: 0.875rem;
    cursor: pointer;
    outline: none;
    min-width: 180px;
}

.demo-selector__select:hover {
    border-color: var(--vt-primary, #3c8dbc);
}

.demo-selector__select:focus {
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
