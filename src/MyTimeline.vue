<template>
  <TimelineHeader @scrollToday="calendarScrollToday" />

  <div class="main-container" @scroll="handleScroll">
    <slot>
      <template v-if="groups">
        <List width="200px">
          <ListHeader>Group Name</ListHeader>
          <ListRow v-for="group in groupsToUse" :key="group.id">
            <small>
              <span style="font-weight: bold">{{ group.name }}</span>
              {{ group.color_name }}
            </small>
          </ListRow>
        </List>

        <Timeline ref="timeline">
          <template v-for="group in groupsToUse" :key="group.id">
            <TimelineRow :group="group" :rowid="group.id">
              <!--
              -->
            </TimelineRow>
          </template>
          <template v-for="task in Object.values(tasksDict)" :key="task.id">
            <TimelineItem
              v-bind:task="task"
              :ref="getRef(task.group_id, task.id)"
            >
              <small>
                {{ task.title }}
              </small>
            </TimelineItem>
          </template>
        </Timeline>
      </template>
    </slot>
  </div>
  <TaskDataPanel ref="taskdata" />
</template>

<script>
/* eslint-disable vue/no-unused-components */

import { reactive } from "vue";
import { mapState, mapMutations, mapGetters } from "vuex";
import { TimelineHeader } from "@/components";
import { TaskDataPanel } from "@/components";
import { List, ListHeader, ListRow } from "@/components";

import { Timeline, TimelineRow, TimelineItem } from "@/components";
import { cellSizeInPx, cellSize } from "@/contexts/CellSizeContext";
import { orderTasks, setPriorityTasks } from "@/utils/tasks";
import { initDay } from "@/utils/date";

export default {
  name: "VueTimeline",
  inject: {
    cellSizeInPx,
    cellSize,
    emitBubbleTask: { from: "emitBubbleTask" },
  },
  props: {
    groups: {
      type: Object,
      default: () => {},
    },
    tasks: {
      type: Object,
      default: () => {},
    },
    height: {
      type: String,
      default: "85vh",
    },
  },
  data: function () {
    return {
      initialized: false,
      tasksDict: {}, // Fast search tasks
      groupsDict: {}, // Groups dictionary
      groupsToUse: [], // Display group
    };
  },
  computed: {
    ...mapState(["calendarInit", "calendarEnd", "cellDays"]),
    ...mapGetters(["totalCells", "todayCell"]),
  },
  methods: {
    ...mapMutations(["setCalendarSize", "setCellSizeDays"]),
    getRef(groupId, taskId) {
      let refName = `timelineItem-${groupId}-${taskId}`;
      return refName;
    },
    updateTask: function (taskData) {
      this.tasksDict[taskData.id] = taskData;
      this.emitBubbleTask(taskData);
    },
    calendarScrollToday: function () {
      this.$refs.timeline.calendarScrollToday();
    },
    handleScroll: function (e) {
      const scrollTop = e.target.scrollTop;
      const timeline = document.querySelector(".timeline");
      timeline.scrollTop = scrollTop;
    },
    buildDataView: function () {
      this.groupsToUse = [];
      this.groupsDict = {};

      // Get the groups and create the dictionary and array to display them
      for (const key in this.groups) {
        let group = this.groups[key];
        this.groupsDict[group.id] = group;
        this.groupsToUse.push(group);

        group.order = this.groupsToUse.length;
      }

      // First pass to calculate how many rows do we have in each group
      for (const task of this.tasks.values()) {
        let group = this.groupsDict[task.group_id];
        if (!group.rows || task.priority > group.rows) {
          group.rows = task.priority;
        }
        task.group = group;
      }

      // Calculate the incrementals of the rows
      let current_row = 0;
      for (let group of this.groupsToUse.values()) {
          group.timeline_row = current_row;
          current_row += group.rows;
      }

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
    },
  },
  beforeUnmount() {},

  mounted() {
    this.buildDataView();
    this.setCellSizeDays(1);
  },
  provide: function () {
    return {
      updateTask: this.updateTask,
    };
  },
  components: {
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

<style>
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
  width: v-bind(cellSizeInPx);
  border-right: 1px solid rgba(177, 184, 189, 0.45);
  border-bottom: 1px solid rgb(226, 226, 226);
}
</style>
