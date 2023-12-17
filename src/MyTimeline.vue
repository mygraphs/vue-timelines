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
            <TimelineRow :rowid="group.id">
              <template v-for="task in group.tasks" :key="task.id">
                <TimelineItem
                  v-bind="task"
                  v-bind:task="task"
                  :groupName="group.id"
                  ref="getRef(group.id, task.id)"
                  :myupdate="`item-${task.id}-${task.updateTimestamp}`"
                >
                  <small>
                    {{ task.title }}
                  </small>
                </TimelineItem>
              </template>
            </TimelineRow>
          </template>
        </Timeline>
      </template>
    </slot>
  </div>
  <TaskDataPanel ref="taskdata" />
</template>

<script>
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
      return `timelineItem-${groupId}-${taskId}`;
    },
    refreshTimelineItem(task) {
      const refName = this.getRef(task.group_id, task.id);
      const timelineItem = this.$refs[refName];

      if (timelineItem) {
        timelineItem.task=task;
      }
    },
    updateTask: function (taskData) {
      this.refreshTimelineItem(taskData);
      taskData.updateTimestamp = Date.now();
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
    buildDataView() {
      this.groupsToUse = [];
      this.groupsDict = {};

      let init = null;
      let end = null;

      for (const key in this.groups) {
        let group = this.groups[key];
        group.tasks = [];

        this.groupsDict[group.id] = group;
        this.groupsToUse.push(group);
      }

      for (const key in this.tasks) {
        let task = { ...this.tasks[key] };

        const creationDateInitDay = initDay(task.creationDate);
        const dueDateInitDay = initDay(task.dueDate);

        if (!init || creationDateInitDay < init) init = creationDateInitDay;

        if (!end || dueDateInitDay > end) end = dueDateInitDay;

        task.creationDate = initDay(task.creationDate);
        task.dueDate = initDay(task.dueDate);
        task.rowName = "WHATS IS THIS FOR?";

        this.tasksDict[task.id] = task;
        this.groupsDict[task.group_id].tasks.push(task);
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
