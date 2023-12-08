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
                <TimelineItem v-bind="task" :groupName="group.id">
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
    emitUpdatedTasks: { from: "emitUpdatedTasks" },
  },
  props: {
    groups: {
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
      groupsToUse: [],
    };
  },
  computed: {
    ...mapState(["calendarInit", "calendarEnd", "cellDays"]),
    ...mapGetters(["totalCells", "todayCell"]),
  },
  methods: {
    ...mapMutations(["setCalendarSize", "setCellSizeDays"]),
    updateTask: function (taskData) {
      const { tasksUpdated, tasks } = this.handleTaskUpdate(taskData);
      this.emitUpdatedTasks({ tasksUpdated, tasks });
    },
    calendarScrollToday: function () {
      this.$refs.timeline.calendarScrollToday();
    },
    handleTaskUpdate: function ({ updatedTask, newRow, oldRow }) {
      let tasks = null;

      if (newRow !== oldRow) {
        const taskIndex = this.groupsToUse[oldRow].tasks.findIndex((task) => {
          return task.id === updatedTask.id;
        });

        this.groupsToUse[oldRow].tasks.splice(taskIndex, 1);
        this.groupsToUse[newRow].tasks.push(updatedTask);
      } else {
        let idx = this.groupsToUse.findIndex((group) => {
          return group.id === newRow;
        });

        if (idx < 0) {
          console.log(" Failed to find group ");
          debugger;
        }

        let group = this.groupsToUse[idx];

        for (let i = 0; i < group.tasks.length; i++) {
          let task = group.tasks[i];
          const is_task = task.id === updatedTask.id;
          console.log("CHECK TASK " + task.id + " <=> " + updatedTask.id + " " + is_task);
          if (is_task) {
            group.tasks[i] = updatedTask;
            tasks = group.tasks[i];
            break;
          }
        }
      }

      /*
      const { tasksUpdated, tasks } = orderTasks(
        [updatedTask],
        [...this.groupsToUse[newRow].tasks]
      );

      tasksUpdated.forEach((taskUpdated) => {
        const taskIndex = this.groupsToUse[newRow].tasks.findIndex((task) => {
          return task.id === taskUpdated.id;
        });

        console.log(taskUpdated);
        this.groupsToUse[newRow].tasks[taskIndex] = taskUpdated;
      });

      this.checkCalendarSize(tasksUpdated);
      */
      /*
      return {
        tasksUpdated: tasksUpdated.map((task) => ({
          ...task,
          newGroup: this.groupsToUse[newRow].name,
        })),
        tasks: tasks.map((task) => task),
      };
      */

      return {
        tasksUpdated: [],
        tasks: [],
      };
    },
    handleScroll: function (e) {
      const scrollTop = e.target.scrollTop;
      const timeline = document.querySelector(".timeline");
      timeline.scrollTop = scrollTop;
    },
  },
  mounted() {
    this.groupsToUse = this.groups;

    let init = null;
    let end = null;

    for (const key in this.groupsToUse) {
      this.groupsToUse[key].tasks.map((task) => {
        const creationDateInitDay = initDay(task.creationDate);
        const dueDateInitDay = initDay(task.dueDate);

        if (!init || creationDateInitDay < init) init = creationDateInitDay;

        if (!end || dueDateInitDay > end) end = dueDateInitDay;

        return {
          ...task,
          creationDate: creationDateInitDay,
          dueDate: dueDateInitDay,
          rowName: dueDateInitDay,
        };
      });

      const { tasksUpdated, tasks } = setPriorityTasks(
        [this.groupsToUse[key].tasks[0]],
        [...this.groupsToUse[key].tasks]
      );

      this.groupsToUse[key].tasks = tasks;
      this.emitUpdatedTasks({ tasksUpdated, tasks });
    }

    let unix_time = Date.now() / 1000;
    if (end < unix_time) {
      console.log(" SET DATE TO TODAY " + unix_time);
      //end = unix_time;
    }

    this.setCellSizeDays(1);
    this.setCalendarSize({ calendarInit: init, calendarEnd: end });
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
