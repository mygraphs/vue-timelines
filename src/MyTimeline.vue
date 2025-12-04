<template>
    <div class="parent-container container-fluid">
        <!-- TaskDataPanel must always be mounted to receive eventBus events -->
        <TaskDataPanel
            ref="taskdata"
            class="data__panel"
            @openParent="handleOpenParent"
            @closeParent="handleCloseParent"
        />

        <div>
            <div>
                <TimelineHeader @scrollToday="calendarScrollToday" />
            </div>

            <div class="main-container" @scroll="handleScroll">
                <slot>
                    <template v-if="groups">
                        <List class="timeline__group">
                            <ListHeader>
                                <button
                                    v-if="groupCreateEnabled"
                                    class="btn btn-primary btn-sm"
                                    @click="createNewGroup"
                                >
                                    New group
                                </button>
                            </ListHeader>
                            <ListRow
                                v-for="group in groupsToUse"
                                :key="group.id"
                            >
                                <small>
                                    <span style="font-weight: bold">
                                        <TextEdit
                                            v-if="groupEditEnabled"
                                            :defaultText="group.name"
                                            :edit="false"
                                            v-model:newValue="group.name"
                                            field="group_name"
                                            style="max-width: 100px"
                                            :cancelClickOutside="true"
                                            ><template v-slot:textFormat>
                                                {{ group.name }}
                                            </template>
                                            <template v-slot:inputFormat>
                                            </template>
                                        </TextEdit>
                                        <span v-else>{{ group.name }}</span>
                                    </span>
                                    {{ group.color_name }}
                                </small>
                            </ListRow>
                        </List>

                        <Timeline ref="timeline">
                            <template
                                v-for="group in groupsToUse"
                                :key="group.id"
                            >
                                <TimelineRow :group="group" :rowid="group.id">
                                </TimelineRow>
                            </template>
                            <template v-for="task in tasksArray" :key="task.id">
                                <TimelineItem
                                    v-bind:task="task"
                                    :row="task.row"
                                    :ref="getRef(task.group_id, task.id)"
                                >
                                    <template v-slot:task_text>
                                        <small>
                                            {{ task.title }}
                                        </small>
                                    </template>
                                    <template v-slot:taskInfo>
                                        <span class="task_icon_font">
                                            {{
                                                Math.round(
                                                    (task.progress ?? 0) * 100
                                                )
                                            }}%
                                        </span>
                                    </template>
                                </TimelineItem>
                            </template>
                        </Timeline>
                    </template>
                </slot>
            </div>
        </div>
    </div>
</template>

<script>
/* https://v3.vue-final-modal.org/guide/properties */
import { ModalsContainer } from "vue-final-modal";

/* eslint-disable vue/no-unused-components */

import { reactive } from "vue";
import { mapState, mapMutations, mapGetters, mapActions } from "vuex";
import { TimelineHeader } from "@/components";
import { TaskDataPanel } from "@/components";
import { TextEdit } from "@/components";
import { List, ListHeader, ListRow } from "@/components";

import { Timeline, TimelineRow, TimelineItem } from "@/components";
import { cellSize } from "@/contexts/CellSizeContext";
import {
    orderTasks,
    setPriorityTasks,
    sortTasksHierarchically,
    calculateTaskDepth,
    hasSubtasks,
    getSubtaskCount,
} from "@/utils/tasks";
import { initDay } from "@/utils/date";

function binarySearch(tasks, startTime) {
    let low = 0,
        high = tasks.length - 1;
    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        if (tasks[mid].start < startTime) {
            low = mid + 1;
        } else if (tasks[mid].start > startTime) {
            high = mid - 1;
        } else {
            return mid;
        }
    }
    return low;
}

export default {
    name: "VueTimeline",
    inject: {
        cellSize,
        emitBubbleTask: { from: "emitBubbleTask" },
    },
    props: {
        height: {
            type: String,
            default: "100vh",
        },
    },
    data: function () {
        return {
            initialized: false,
            showModal: false,
            tasksDict: {}, // Fast search tasks
            groupsDict: {}, // Groups dictionary
            groupsToUse: [], // Display group
            isUpdatingGroups: false, // Flag to prevent recursive updates
        };
    },
    computed: {
        ...mapState("api", ["groups", "tasks", "title"]),
        ...mapState([
            "calendarInit",
            "calendarEnd",
            "cellDays",
            "isDebug",
            "timelineMaxRow",
            "timelineMinRow",
        ]),
        ...mapGetters(["totalCells", "todayCell", "getConfig"]),
        tasksArray() {
            const tasks = Object.values(this.tasksDict);
            console.log(
                "[vue-timelines] tasksArray computed:",
                tasks.length,
                "tasks"
            );
            if (tasks.length > 0) {
                console.log("[vue-timelines] 📋 tasksArray tasks:");
                tasks.forEach((task, idx) => {
                    const startDate = task.creationDate
                        ? new Date(task.creationDate * 1000).toISOString()
                        : "N/A";
                    const endDate = task.dueDate
                        ? new Date(task.dueDate * 1000).toISOString()
                        : "N/A";
                    console.log(
                        `  ${idx + 1}. "${task.title}" (${task.id}) - row: ${
                            task.row
                        }, group_id: ${task.group_id}`
                    );
                    console.log(`     dates: ${startDate} to ${endDate}`);
                });
            }
            return tasks;
        },
        groupCreateEnabled() {
            return this.getConfig("GROUP_CREATE_ENABLED", true);
        },
        groupEditEnabled() {
            return this.getConfig("GROUP_EDIT_ENABLED", true);
        },
    },
    methods: {
        ...mapMutations([
            "setCalendarSize",
            "setCellSizeDays",
            "setRowBoundaries",
        ]),
        ...mapActions("api", ["addNewGroup"]),
        handleOpenParent() {
            console.log(
                "[MyTimeline] handleOpenParent called, setting showModal = true"
            );
            this.showModal = true;
            console.log("[MyTimeline] showModal is now:", this.showModal);
        },
        handleCloseParent() {
            console.log(
                "[MyTimeline] handleCloseParent called, setting showModal = false"
            );
            this.showModal = false;
        },
        createNewGroup() {
            console.log(" CREATE NEW GROUP ");
            this.addNewGroup({ name: "default group" })
                .then(() => {
                    console.log("Group created successfully");
                })
                .catch((error) => {
                    console.error("Failed to create group:", error);
                });
        },
        getRef(groupId, taskId) {
            let refName = `timelineItem-${groupId}-${taskId}`;
            return refName;
        },
        updateGroup: function (task) {
            // Find the group for a task and update it's priority.
            // Priorities are a number between 0 and n in the group, that define the current row.

            let row = task.row;
            for (let g of this.groupsToUse.values()) {
                if (row >= g.timeline_row && row < g.timeline_row + g.rows) {
                    if (this.isDebug)
                        console.log(" Found group " + g.id + " <=> " + g.name);

                    if (g.id != task.group_id) {
                        if (this.isDebug)
                            console.log(
                                " Update group " + task.group_id + " => " + g.id
                            );

                        task.group_id = g.id;
                    }

                    let old = task.priority ?? 0;
                    task.priority = row - g.timeline_row;
                    if (this.isDebug)
                        console.log(
                            " Update priority " + old + " => " + task.priority
                        );

                    break;
                }
            }

            return task;
        },
        updateTask: function (taskData) {
            //console.log(" updateTask " + taskData.title);
            if (taskData.interal_state == "NEW") {
                taskData.interal_state = "TEMPORAL";
                this.tasksDict[taskData.id] = taskData;
            } else {
                this.tasksDict[taskData.id] = this.updateGroup(taskData);
            }

            this.emitBubbleTask(taskData);
            this.buildSearchCache();
        },
        decreaseRow: function (group) {
            console.log(" decreaseRow ");
            this.setRowBoundaries({
                minRow: 0,
                maxRow: this.timelineMaxRow - 1,
            });
        },
        increaseRow: function (group) {
            const groupIdx = this.groupsToUse.findIndex((g) => {
                return g.id === group.id;
            });

            console.log(" Append to group " + groupIdx);
            for (let g of this.groupsToUse.values()) {
                if (g.timeline_row < group.timeline_row) continue;

                g.timeline_row += 1;
                const t = g.timeline_row + g.rows;
            }

            // Propagate the row creation
            this.setRowBoundaries({
                minRow: 0,
                maxRow: this.timelineMaxRow + 1,
            });

            this.groupsToUse[groupIdx] = { ...group, rows: group.rows + 1 };

            for (let idx in this.tasksDict) {
                let task = this.tasksDict[idx];

                // Append at the end of the group
                if (task.row < group.timeline_row + group.rows - 1) {
                    continue;
                }

                let newt = { ...task, row: task.row + 1 };
                //console.log(" MOVE " + newt.title + " " + newt.row + "<>" + task.row);
                this.updateTask(newt);
            }
        },
        calendarScrollToday: function () {
            this.$refs.timeline.calendarScrollToday();
        },
        handleScroll: function (e) {
            const scrollTop = e.target.scrollTop;
            const timeline = document.querySelector(".timeline");
            timeline.scrollTop = scrollTop;
        },
        buildSearchCache: function () {
            // Internally we have several caches to be able to find on the fly
            // if the task moved will have a conflict with another one.
            this.cacheRows = [];
            for (let [key, task] of Object.entries(this.tasksDict)) {
                let row = this.cacheRows[task.row];
                if (!row) row = this.cacheRows[task.row] = [];

                row.push({
                    start: task.creationDate,
                    end: task.dueDate,
                    id: task.id,
                    isSubtask: task.isSubtask || false,
                    parentTaskId: task.parentTaskId || null,
                });
            }

            for (const key in this.cacheRows) {
                this.cacheRows[key].sort((a, b) => a.start - b.start);
            }
        },
        getConflictCase: function (ts, tc) {
            if (ts.start < tc.start && ts.end > tc.end) {
                // Our task fits in the middle
                //console.log(" TASKS ENCLOSES OTHER ");
                return 1;
            }

            if (tc.start > ts.start && ts.end > tc.start) {
                // Our conflict starts before this one ends
                //console.log(" TASKS OVERLAPS LEFT ");
                return 2;
            }

            if (tc.start < ts.start && tc.end > ts.end) {
                // Our task fits in another task
                //console.log(" TASKS IS INSIDE ANOTHER ");
                return 3;
            }

            if (tc.start < ts.start && ts.start < tc.end) {
                // Our tasks starts before the other ended
                //console.log(" TASKS OVERLAPS RIGHT ");
                return 4;
            }

            return 0; // No conflict
        },
        findConflicts: function (task) {
            let tasks = this.cacheRows[task.row];
            if (!tasks) {
                //console.log(" NO TASKS ON THIS LIST ");
                return null;
            }

            let m = this.getConfig("TASK_MIN_SEPARATION_S", 1) - 1;
            const ts = {
                start: task.creationDate - m,
                end: task.dueDate - m,
                id: task.id,
                isSubtask: task.isSubtask || false,
                parentTaskId: task.parentTaskId || null,
            };

            // If moving a parent task (not a subtask), ignore conflicts with subtasks
            const isParentTask = !ts.isSubtask && !ts.parentTaskId;

            for (let t = 0; t < tasks.length; t++) {
                let tc = tasks[t];
                if (tc.id == ts.id) continue; // Same task, we ignore it

                // If moving a parent task, skip conflicts with subtasks
                if (isParentTask && tc.isSubtask) {
                    continue;
                }

                // Covers case we overlap on left or it is contained on the left side
                if (ts.start <= tc.end && ts.end >= tc.start) return tc;

                // Covers case we overlap on the right or it is contained on the right
                if (tc.start <= ts.end && tc.end >= ts.start) return tc;
            }

            return null;
        },

        buildDataView: function () {
            this.groupsToUse = [];
            this.groupsDict = {};

            // Get the groups and create the dictionary and array to display them
            // Create copies to avoid mutating the store directly
            // Handle both array and object formats for this.groups
            const groupsArray = Array.isArray(this.groups)
                ? this.groups
                : Object.values(this.groups);

            for (let i = 0; i < groupsArray.length; i++) {
                let group = groupsArray[i];

                // Create a copy of the group to avoid mutating the store object directly
                const groupCopy = { ...group };

                // Ensure name is preserved
                if (!groupCopy.name && group.name) {
                    groupCopy.name = group.name;
                }

                // Preserve existing rows value if it exists and is valid, otherwise default to 1
                if (!groupCopy.rows || groupCopy.rows < 1 || !isFinite(groupCopy.rows)) {
                    groupCopy.rows = 1;
                }

                this.groupsDict[groupCopy.id] = groupCopy;
                this.groupsToUse.push(groupCopy);

                //group.order = this.groupsToUse.length;
            }

            // Sort groups alphabetically by name for consistent ordering
            this.groupsToUse.sort((a, b) => {
                const nameA = (a.name || '').toLowerCase();
                const nameB = (b.name || '').toLowerCase();
                return nameA.localeCompare(nameB);
            });

            // Sort tasks hierarchically before processing
            // this.tasks is an array from Vuex store
            const allTasksArray = Array.isArray(this.tasks) ? this.tasks : [];
            console.log(
                "[vue-timelines] MyTimeline.buildDataView: Processing",
                allTasksArray.length,
                "tasks"
            );

            // Dynamically create groups for any group_id found in tasks that doesn't exist
            const existingGroupIds = new Set(Object.keys(this.groupsDict));
            const taskGroupIds = new Set();
            allTasksArray.forEach((task) => {
                if (task.group_id) {
                    taskGroupIds.add(task.group_id);
                }
            });

            const missingGroupIds = Array.from(taskGroupIds).filter(
                (groupId) => !existingGroupIds.has(groupId)
            );

            if (missingGroupIds.length > 0) {
                console.log(
                    `[vue-timelines] 🔧 Creating ${missingGroupIds.length} missing groups dynamically:`,
                    missingGroupIds
                );

                const newGroups = [];
                // Get existing groups from store to preserve names
                const existingGroupsFromStore = Array.isArray(this.groups)
                    ? this.groups
                    : Object.values(this.groups);
                const storeGroupsMap = new Map();
                existingGroupsFromStore.forEach(g => {
                    storeGroupsMap.set(g.id, g);
                });

                missingGroupIds.forEach((groupId) => {
                    // Check if group exists in store first - preserve existing name if it does
                    let existingGroup = storeGroupsMap.get(groupId);
                    let groupName;
                    let groupRows = 1;

                    if (existingGroup) {
                        // Group exists in store - preserve its name and rows
                        groupName = existingGroup.name;
                        groupRows = existingGroup.rows || 1;
                        console.log(`[vue-timelines] 🔄 Preserving existing group "${groupName}" (${groupId}) from store`);
                    } else {
                        // Create a new group with a default name
                        // Try to extract a meaningful name from the group_id (e.g., "task-123" -> "Task 123")
                        if (groupId.startsWith("task-")) {
                            groupName = `Task ${groupId.replace("task-", "")}`;
                        } else {
                            groupName = `Group ${groupId}`;
                        }
                    }

                    const newGroup = {
                        id: groupId,
                        name: groupName,
                        rows: groupRows,
                    };

                    this.groupsDict[groupId] = newGroup;
                    this.groupsToUse.push(newGroup);
                    // Only add to newGroups if it's truly new (not in store)
                    if (!existingGroup) {
                        newGroups.push(newGroup);
                    }
                });

                // Re-sort groups alphabetically after adding new groups
                this.groupsToUse.sort((a, b) => {
                    const nameA = (a.name || '').toLowerCase();
                    const nameB = (b.name || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                });

                // Update the Vuex store with only truly new groups
                // Only update store if there are actually new groups to add
                if (newGroups.length > 0) {
                    // Merge existing groups with new groups
                    // Handle both array and object formats for this.groups
                    const existingGroups = Array.isArray(this.groups)
                        ? this.groups
                        : Object.values(this.groups);
                    const allGroups = [...existingGroups, ...newGroups];
                    this.isUpdatingGroups = true;
                    this.$store.commit("api/setGroups", allGroups);
                    this.$nextTick(() => {
                        this.isUpdatingGroups = false;
                    });
                    console.log(
                        `[vue-timelines] ✅ Added ${newGroups.length} new groups to store. Total groups: ${allGroups.length}`
                    );
                } else {
                    console.log(
                        `[vue-timelines] ℹ️ No new groups to add - all groups already exist in store`
                    );
                }
            }

            if (allTasksArray.length > 0) {
                console.log(
                    "[vue-timelines] 📝 Tasks received in buildDataView:"
                );
                allTasksArray.forEach((task, idx) => {
                    const startDate = task.creationDate
                        ? new Date(task.creationDate * 1000).toISOString()
                        : "N/A";
                    const endDate = task.dueDate
                        ? new Date(task.dueDate * 1000).toISOString()
                        : "N/A";
                    console.log(
                        `  Task ${idx + 1}: "${task.title}" (${task.id})`
                    );
                    console.log(`    - group_id: ${task.group_id}`);
                    console.log(`    - dates: ${startDate} to ${endDate}`);
                    console.log(`    - isSubtask: ${task.isSubtask || false}`);
                });
            }

            const sortedTasks = sortTasksHierarchically(allTasksArray);
            console.log(
                "[vue-timelines] After hierarchical sort:",
                sortedTasks.length,
                "tasks"
            );

            // Add hierarchy metadata to tasks
            sortedTasks.forEach((task) => {
                task.depth = calculateTaskDepth(task, allTasksArray);
                task.hasSubtasks = hasSubtasks(task, allTasksArray);
                task.subtaskCount = getSubtaskCount(task, allTasksArray);
            });

            // STEP 1: Create a map of tasks per group
            // This makes it easier to calculate rows per group
            const tasksByGroup = new Map();
            sortedTasks.forEach((task) => {
                if (!task.group_id) {
                    console.warn(
                        `[vue-timelines] ⚠️ Task "${task.title}" (${task.id}) has no group_id, skipping`
                    );
                    return;
                }

                const group = this.groupsDict[task.group_id];
                if (!group) {
                    console.warn(
                        `[vue-timelines] ⚠️ Task "${task.title}" (${task.id}) group_id "${task.group_id}" not found, skipping`
                    );
                    return;
                }

                task.group = group;

                if (!tasksByGroup.has(task.group_id)) {
                    tasksByGroup.set(task.group_id, []);
                }
                tasksByGroup.get(task.group_id).push(task);
            });

            // STEP 2: Create a map of parent ID to its subtasks (for hierarchical row assignment)
            const subtaskMap = new Map();
            sortedTasks.forEach((task) => {
                if (task.isSubtask && task.parentTaskId) {
                    if (!subtaskMap.has(task.parentTaskId)) {
                        subtaskMap.set(task.parentTaskId, []);
                    }
                    subtaskMap.get(task.parentTaskId).push(task);
                }
            });

            // STEP 3: Assign rows to tasks within each group
            // Process each group separately to ensure proper row assignment
            const groupTaskRows = {}; // Track row assignments per group: groupId -> taskId -> rowIndex

            // Initialize row tracking for each group
            for (const groupId in this.groupsDict) {
                groupTaskRows[groupId] = {};
            }

            // Process each group's tasks
            for (const [groupId, groupTasks] of tasksByGroup.entries()) {
                // Sort tasks within group: parents first, then their subtasks
                const groupParentTasks = groupTasks.filter(
                    (t) => !t.isSubtask || !t.parentTaskId
                );
                const groupSubtasks = groupTasks.filter(
                    (t) => t.isSubtask && t.parentTaskId
                );

                let currentRow = 0;

                // First, assign rows to parent tasks
                groupParentTasks.forEach((task) => {
                    groupTaskRows[groupId][task.id] = currentRow;
                    currentRow++;
                });

                // Then, assign rows to subtasks (after their parent)
                groupSubtasks.forEach((task) => {
                    const parentRow = groupTaskRows[groupId][task.parentTaskId];
                    if (parentRow !== undefined) {
                        // Find the highest row already assigned to subtasks of this parent
                        const parentSubtasks = subtaskMap.get(task.parentTaskId) || [];
                        const existingSubtaskRows = parentSubtasks
                            .filter(
                                (st) =>
                                    st.id !== task.id &&
                                    groupTaskRows[groupId][st.id] !== undefined
                            )
                            .map((st) => groupTaskRows[groupId][st.id]);

                        const maxSubtaskRow =
                            existingSubtaskRows.length > 0
                                ? Math.max(...existingSubtaskRows)
                                : parentRow;

                        // Assign to next row after the highest subtask row (or parent if no subtasks yet)
                        const nextRow = maxSubtaskRow + 1;
                        groupTaskRows[groupId][task.id] = nextRow;
                        currentRow = Math.max(currentRow, nextRow + 1);
                    } else {
                        // FALLBACK: Parent not found in this group, assign to end
                        groupTaskRows[groupId][task.id] = currentRow;
                        currentRow++;
                        console.warn(
                            `[vue-timelines] ⚠️ Parent row not found for subtask "${task.title}" (${task.id}), parent: ${task.parentTaskId}. Assigned to row ${currentRow - 1} in group ${groupId}`
                        );
                    }
                });

                console.log(
                    `[vue-timelines] 📊 Group "${this.groupsDict[groupId].name}" (${groupId}): ${groupTasks.length} tasks, max row: ${currentRow - 1}, required rows: ${currentRow}`
                );
            }

            // STEP 4: Calculate required rows for each group (WITHOUT modifying groups yet)
            // Store calculated rows in a map first
            const calculatedRowsByGroupId = new Map();
            for (const groupId in this.groupsDict) {
                const taskRows = groupTaskRows[groupId] || {};
                const taskCount = Object.keys(taskRows).length;
                const assignedRows = Object.values(taskRows);
                const maxRowIndex =
                    assignedRows.length > 0 ? Math.max(...assignedRows) : -1;
                const requiredRows = maxRowIndex + 1; // +1 because rows are 0-indexed
                const finalRows = Math.max(1, requiredRows); // Ensure at least 1 row

                calculatedRowsByGroupId.set(groupId, finalRows);

                const group = this.groupsDict[groupId];
                console.log(
                    `[vue-timelines] 📊 Group "${group.name}" (${groupId}): ${taskCount} tasks, maxRowIndex=${maxRowIndex}, requiredRows=${requiredRows}, calculated rows=${finalRows}`
                );
            }

            // STEP 5: Now update groups with calculated rows (all at once)
            // Capture original rows from store BEFORE modifying anything
            const currentGroups = Array.isArray(this.groups)
                ? this.groups
                : Object.values(this.groups);
            const originalRowsByGroupId = new Map();
            currentGroups.forEach((g) => {
                originalRowsByGroupId.set(g.id, g.rows || 1);
            });

            // Update groupsDict and groupsToUse with calculated rows
            let groupsChanged = false;
            for (const groupId in this.groupsDict) {
                const group = this.groupsDict[groupId];
                const calculatedRows = calculatedRowsByGroupId.get(groupId) || 1;
                const originalRows = originalRowsByGroupId.get(groupId) || 1;

                if (calculatedRows !== originalRows) {
                    groupsChanged = true;
                    console.log(
                        `[vue-timelines] 🔄 Group "${group.name}" (${groupId}) rows changed: ${originalRows} → ${calculatedRows}`
                    );
                }

                // Update the group object
                group.rows = calculatedRows;
            }

            // Also check if number of groups changed
            if (!groupsChanged && this.groupsToUse.length !== currentGroups.length) {
                groupsChanged = true;
                console.log(
                    `[vue-timelines] 🔄 Number of groups changed: ${currentGroups.length} → ${this.groupsToUse.length}`
                );
            }

            // STEP 6: Update store with all calculated groups (only if changed)
            if (groupsChanged) {
                const updatedGroups = this.groupsToUse.map((g) => ({
                    ...g,
                    rows: calculatedRowsByGroupId.get(g.id) || g.rows || 1,
                }));

                this.isUpdatingGroups = true;
                this.$store.commit("api/setGroups", updatedGroups);
                this.$nextTick(() => {
                    this.isUpdatingGroups = false;
                });
                console.log(
                    `[vue-timelines] 💾 Updated store with ${updatedGroups.length} groups (rows calculated)`
                );
            } else {
                console.log(
                    `[vue-timelines] ℹ️ Groups unchanged, skipping store update to prevent recursion`
                );
            }

            // Calculate the incrementals of the rows
            let current_row = 0;
            for (let group of this.groupsToUse.values()) {
                group.timeline_row = current_row;
                current_row += group.rows;
            }

            this.setRowBoundaries({ minRow: 0, maxRow: current_row });

            // Start and end of the calendar
            let init = null;
            let end = null;

            // Build the task structure using sorted tasks to maintain hierarchy
            let tasksAdded = 0;
            let tasksSkipped = 0;
            const skippedTasks = [];

            for (const task of sortedTasks) {
                let group = this.groupsDict[task.group_id];
                if (!group) {
                    tasksSkipped++;
                    skippedTasks.push({
                        id: task.id,
                        title: task.title,
                        group_id: task.group_id,
                    });
                    console.warn(
                        `[vue-timelines] ⚠️ Task "${task.title}" (${task.id}) skipped: group_id "${task.group_id}" not found in groupsDict`
                    );
                    continue;
                }

                // Get the group from groupsToUse to ensure we have the latest timeline_row
                // groupsDict and groupsToUse should reference the same objects, but use groupsToUse for safety
                const groupInUse = this.groupsToUse.find(
                    (g) => g.id === group.id
                );
                const activeGroup = groupInUse || group;

                // Create task copy with hierarchy metadata
                let taskCopy = { ...task };
                // Use the pre-calculated row from groupTaskRows
                const taskRow = groupTaskRows[group.id][task.id];

                let finalRow;
                if (taskRow === undefined) {
                    // EMERGENCY FALLBACK: Task has no row assigned (shouldn't happen, but handle gracefully)
                    console.error(
                        `[vue-timelines] ❌ Task "${task.title}" (${task.id}) has no row assigned! Assigning to next available row.`
                    );

                    // Find the maximum row already assigned in this group
                    const existingRows = Object.values(
                        groupTaskRows[group.id] || {}
                    );
                    const maxRow =
                        existingRows.length > 0
                            ? Math.max(...existingRows)
                            : -1;
                    const emergencyRow = maxRow + 1;

                    // Assign the row
                    groupTaskRows[group.id][task.id] = emergencyRow;
                    // Update group.rows in both groupsDict and groupsToUse
                    const newRequiredRows = emergencyRow + 1;
                    group.rows = Math.max(group.rows || 1, newRequiredRows);
                    if (activeGroup) {
                        activeGroup.rows = Math.max(
                            activeGroup.rows || 1,
                            emergencyRow + 1
                        );
                    }

                    // Recalculate timeline_row for all groups since we updated group.rows
                    let recalc_row = 0;
                    for (let g of this.groupsToUse.values()) {
                        g.timeline_row = recalc_row;
                        // Also update in groupsDict
                        if (this.groupsDict[g.id]) {
                            this.groupsDict[g.id].timeline_row = recalc_row;
                        }
                        recalc_row += g.rows;
                    }

                    // Now use the recalculated timeline_row from activeGroup
                    const timelineRow =
                        activeGroup?.timeline_row ?? group.timeline_row ?? 0;
                    finalRow = timelineRow + emergencyRow;
                    taskCopy.row = finalRow;
                } else {
                    // Normal case: use pre-calculated row
                    // Use timeline_row from activeGroup (groupsToUse) which has the latest value
                    let timelineRow =
                        activeGroup?.timeline_row ?? group.timeline_row;

                    // Validate taskRow
                    if (
                        typeof taskRow !== "number" ||
                        isNaN(taskRow) ||
                        !isFinite(taskRow)
                    ) {
                        console.error(
                            `[vue-timelines] ❌ Task "${task.title}" (${task.id}) has invalid taskRow: ${taskRow}. Using emergency fallback.`
                        );
                        // Fall through to emergency fallback logic
                        const existingRows = Object.values(
                            groupTaskRows[group.id] || {}
                        );
                        const maxRow =
                            existingRows.length > 0
                                ? Math.max(
                                      ...existingRows.filter(
                                          (r) =>
                                              typeof r === "number" && !isNaN(r)
                                      )
                                  )
                                : -1;
                        const emergencyRow = maxRow + 1;
                        groupTaskRows[group.id][task.id] = emergencyRow;
                        const newRequiredRows = emergencyRow + 1;
                        group.rows = Math.max(
                            group.rows || 1,
                            newRequiredRows
                        );
                        if (activeGroup) {
                            activeGroup.rows = Math.max(
                                activeGroup.rows || 1,
                                emergencyRow + 1
                            );
                        }

                        // Recalculate timeline_row
                        let recalc_row = 0;
                        for (let g of this.groupsToUse.values()) {
                            g.timeline_row = recalc_row;
                            if (this.groupsDict[g.id]) {
                                this.groupsDict[g.id].timeline_row = recalc_row;
                            }
                            recalc_row += g.rows;
                        }

                        timelineRow =
                            activeGroup?.timeline_row ??
                            group.timeline_row ??
                            0;
                        finalRow = timelineRow + emergencyRow;
                    } else if (
                        timelineRow === undefined ||
                        isNaN(timelineRow)
                    ) {
                        console.error(
                            `[vue-timelines] ❌ Group "${group.name}" (${group.id}) has undefined/invalid timeline_row: ${timelineRow}. Calculating manually.`
                        );
                        // Last resort: calculate it manually
                        let calc_row = 0;
                        for (let g of this.groupsToUse.values()) {
                            if (g.id === group.id) break;
                            calc_row += g.rows || 1;
                        }
                        timelineRow = calc_row;
                        finalRow = timelineRow + taskRow;
                    } else {
                        finalRow = timelineRow + taskRow;
                    }

                    // Final validation - ensure finalRow is always valid
                    if (
                        typeof finalRow !== "number" ||
                        isNaN(finalRow) ||
                        !isFinite(finalRow)
                    ) {
                        console.error(
                            `[vue-timelines] ❌ Task "${task.title}" (${task.id}) calculated invalid finalRow: ${finalRow}. Using fallback.`
                        );
                        // Emergency fallback: use group's timeline_row + 0
                        const fallbackTimelineRow =
                            activeGroup?.timeline_row ??
                            group.timeline_row ??
                            0;
                        finalRow = Math.max(0, Math.floor(fallbackTimelineRow));
                    }

                    taskCopy.row = finalRow;
                }

                console.log(
                    `[vue-timelines] Task "${task.title}" (${task.id}):`
                );
                console.log(
                    `  - group.id: ${group.id}, group.name: ${group.name}`
                );
                console.log(`  - group.timeline_row: ${group.timeline_row}`);
                console.log(
                    `  - activeGroup?.timeline_row: ${activeGroup?.timeline_row}`
                );
                console.log(`  - taskRow from groupTaskRows: ${taskRow}`);
                console.log(`  - task.priority: ${task.priority ?? 0}`);
                console.log(`  - Final row: ${finalRow}`);
                console.log(`  - taskCopy.row: ${taskCopy.row}`);

                // Preserve hierarchy metadata
                if (task.depth !== undefined) taskCopy.depth = task.depth;
                if (task.hasSubtasks !== undefined)
                    taskCopy.hasSubtasks = task.hasSubtasks;
                if (task.subtaskCount !== undefined)
                    taskCopy.subtaskCount = task.subtaskCount;
                if (task.parentTaskId !== undefined)
                    taskCopy.parentTaskId = task.parentTaskId;
                if (task.isSubtask !== undefined)
                    taskCopy.isSubtask = task.isSubtask;

                const startDay = initDay(task.creationDate);
                const endDay = initDay(task.dueDate);

                init = init ? Math.min(init, startDay) : startDay;
                end = Math.max(end, endDay);

                this.tasksDict[task.id] = taskCopy;
                tasksAdded++;
            }

            console.log(
                `[vue-timelines] ✅ Tasks processed: ${tasksAdded} added to tasksDict, ${tasksSkipped} skipped`
            );
            if (skippedTasks.length > 0) {
                console.warn(`[vue-timelines] ⚠️ Skipped tasks:`, skippedTasks);
            }

            if (init && end) {
                const initDate = new Date(init * 1000).toISOString();
                const endDate = new Date(end * 1000).toISOString();
                console.log(
                    `[vue-timelines] 📅 Calendar range: ${init} (${initDate}) to ${end} (${endDate})`
                );
            }

            let unix_time = Date.now() / 1000;
            if (end < unix_time) {
                console.log(" SET DATE TO TODAY " + unix_time);
                //end = unix_time;
            }

            this.setCalendarSize({ calendarInit: init, calendarEnd: end });

            this.buildSearchCache();
        },
    },
    beforeUnmount() {},

    mounted() {
        console.log(
            "[MyTimeline] Component mounted, showModal initial value:",
            this.showModal
        );
        this.buildDataView();
        this.setCellSizeDays(1);
    },
    watch: {
        showModal(newVal) {
            console.log("[MyTimeline] showModal changed to:", newVal);
        },
        groups: function () {
            // Skip if we're in the middle of updating groups to prevent recursion
            if (this.isUpdatingGroups) {
                console.log(
                    " MYTIMELINE GROUPS WATCH - skipping (isUpdatingGroups=true)"
                );
                return;
            }
            console.log(" MYTIMELINE GROUPS WATCH ");
            this.buildDataView();
        },
        tasks: function () {
            const taskCount =
                this.tasks && this.tasks.length ? this.tasks.length : 0;
            console.log(" MYTIMELINE TASKS WATCH ", taskCount);
            this.buildDataView();
        },
    },
    provide: function () {
        return {
            findConflicts: this.findConflicts,
            updateTask: this.updateTask,
            increaseRow: this.increaseRow,
            decreaseRow: this.decreaseRow,
        };
    },
    components: {
        ModalsContainer,
        TextEdit,
        TimelineHeader,
        TaskDataPanel,
        List,
        ListHeader,
        ListRow,
        Timeline,
        TimelineRow,
        TimelineItem,
    },
};
</script>

<style scoped>
.task_icon_font {
    opacity: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 0.6em;
}
</style>
<style>
.timeline__group {
    min-width: 120px;
    width: auto;
}

.parent-container {
    height: 100%;
    /* background-color: #F00; */
}

.filler-container {
    /* background-color: #000; */
}

.main-container {
    display: flex;
    max-height: v-bind(height);
    overflow-y: scroll;
}

.Timeline-container {
    display: flex;
}

.calendar {
    text-align: center;
    color: var(--vt-calendar-text, #707070);
}
.cal__int-container {
    display: flex;
}

.cal__int-container div {
    width: v-bind('cellSize + "px"');
    border-right: 1px solid var(--vt-calendar-border, rgba(177, 184, 189, 0.45));
    border-bottom: 1px solid var(--vt-border-primary, rgb(226, 226, 226));
}

/*
    Hack to make preventClick work on the modal :(
*/
.vfm--inset {
    pointer-events: none;
}

.vfm__content {
    pointer-events: auto;
}
</style>

<style scoped>
.confirm-modal {
    display: flex;
    justify-content: center;
    align-items: center;
}
.confirm-modal-content {
    display: flex;
    flex-direction: column;
    padding: var(--vt-spacing-lg, 1rem);
    background: var(--vt-bg-modal, #fff);
    border-radius: var(--vt-radius-md, 0.5rem);
}
.confirm-modal-content > * + * {
    margin: 0.5rem 0;
}
.confirm-modal-content h1 {
    font-size: 1.375rem;
}
.confirm-modal-content button {
    margin: 0.25rem 0 0 auto;
    padding: 0 8px;
    border: 1px solid;
    border-radius: 0.5rem;
}
/* Dark theme is now handled via CSS variables */

.overlay_disabled {
    visibility: none;
}
</style>
