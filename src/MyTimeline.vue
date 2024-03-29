<template>
  <div class="parent-container container-fluid">
    <VueFinalModal
      v-model="showModal"
      :drag="true"
      :fit-parent="false"
      :click-to-close="false"
      :fitParent="false"
      :hide-overlay="true"
      :focus-retain="false"
      :focus-trap="false"
      :esc-to-close="true"
      :lock-scroll="false"
      :preventClick="false"
      attach="body"
    >
      <TaskDataPanel
        ref="taskdata"
        class="data__panel"
        @openParent="showModal = true"
        @closeParent="showModal = false"
      />
    </VueFinalModal>

    <div>
      <div>
        <TimelineHeader @scrollToday="calendarScrollToday" />
      </div>

      <div class="main-container" @scroll="handleScroll">
        <slot>
          <template v-if="groups">
            <List class="timeline__group">
              <ListHeader>
                <button class="btn btn-primary btn-sm" @click="createNewGroup">
                  New group
                </button>
              </ListHeader>
              <ListRow v-for="group in groupsToUse" :key="group.id">
                <small>
                  <span style="font-weight: bold">
                    <TextEdit
                      :defaultText="group.name"
                      :edit="false"
                      v-model:newValue="group.name"
                      field="group_name"
                      style="max-width: 100px"
                      :cancelClickOutside="true"
                      ><template v-slot:textFormat>
                        {{ group.name }}
                      </template>
                      <template v-slot:inputFormat> </template>
                    </TextEdit>
                  </span>
                  {{ group.color_name }}
                </small>
              </ListRow>
            </List>

            <Timeline ref="timeline">
              <template v-for="group in groupsToUse" :key="group.id">
                <TimelineRow :group="group" :rowid="group.id"> </TimelineRow>
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
                      {{ Math.round(task.progress * 100) }}%
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
import { $vfm, VueFinalModal, ModalsContainer } from "vue-final-modal";

/* eslint-disable vue/no-unused-components */

import { reactive } from "vue";
import { mapState, mapMutations, mapGetters } from "vuex";
import { TimelineHeader } from "@/components";
import { TaskDataPanel } from "@/components";
import { TextEdit } from "@/components";
import { List, ListHeader, ListRow } from "@/components";

import { Timeline, TimelineRow, TimelineItem } from "@/components";
import { cellSize } from "@/contexts/CellSizeContext";
import { orderTasks, setPriorityTasks } from "@/utils/tasks";
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
      return Object.values(this.tasksDict);
    },
  },
  methods: {
    ...mapMutations(["setCalendarSize", "setCellSizeDays", "setRowBoundaries"]),
    ...mapMutations("api", ["addNewGroup"]),
    createNewGroup() {
      console.log(" CREATE NEW GROUP ");
      this.addNewGroup({ name: "default group" });
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
          if (this.isDebug) console.log(" Found group " + g.id + " <=> " + g.name);

          if (g.id != task.group_id) {
            if (this.isDebug)
              console.log(" Update group " + task.group_id + " => " + g.id);

            task.group_id = g.id;
          }

          let old = task.priority;
          task.priority = row - g.timeline_row;
          if (this.isDebug)
            console.log(" Update priority " + old + " => " + task.priority);

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
      this.setRowBoundaries({ minRow: 0, maxRow: this.timelineMaxRow - 1 });
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
      this.setRowBoundaries({ minRow: 0, maxRow: this.timelineMaxRow + 1 });

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
      const ts = { start: task.creationDate - m, end: task.dueDate - m, id: task.id };

      for (let t = 0; t < tasks.length; t++) {
        let tc = tasks[t];
        if (tc.id == ts.id) continue; // Same task, we ignore it

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
      for (const key in this.groups) {
        let group = this.groups[key];

        // Minimum one row in a group.
        group.rows = 1;

        this.groupsDict[group.id] = group;
        this.groupsToUse.push(group);

        //group.order = this.groupsToUse.length;
      }

      // First pass to calculate how many rows do we have in each group
      for (const task of this.tasks.values()) {
        let group = this.groupsDict[task.group_id];
        if (!group.rows || task.priority >= group.rows) {
          // Size of the rows is task + 1 because tasks start at 0 priority.
          group.rows = task.priority + 1;
        }
        task.group = group;
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

      // Build the task structure
      for (const key in this.tasks) {
        let task = { ...this.tasks[key] };
        let group = this.groupsDict[task.group_id];

        task.row = group.timeline_row + task.priority;

        const startDay = initDay(task.creationDate);
        const endDay = initDay(task.dueDate);

        init = init ? Math.min(init, startDay) : startDay;
        end = Math.max(end, endDay);

        this.tasksDict[task.id] = task;
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
    this.buildDataView();
    this.setCellSizeDays(1);
  },
  watch: {
    groups: function () {
      console.log(" MYTIMELINE GROUPS WATCH ");
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
    VueFinalModal,
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
  color: #707070;
}
.cal__int-container {
  display: flex;
}

.cal__int-container div {
  width: v-bind('cellSize + "px"');
  border-right: 1px solid rgba(177, 184, 189, 0.45);
  border-bottom: 1px solid rgb(226, 226, 226);
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
  padding: 1rem;
  background: #fff;
  border-radius: 0.5rem;
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
.dark .confirm-modal-content {
  background: #000;
}

.overlay_disabled {
  visibility: none;
}
</style>
