<template>
  <GanttHeader @scrollToday="calendarScrollToday" />

  <div class="main-container" @scroll="handleScroll">
    <slot>
      <template v-if="groups.length">
        <List width="200px">
          <ListHeader>Group Name</ListHeader>

          <ListRow v-for="group in groupsToUse" :key="group.id">
            <small>{{ group.name }}</small>
          </ListRow>
        </List>

        <Timeline ref="timeline">
          <template v-for="group in groupsToUse" :key="group.id">
            <TimelineRow :rowid="group.id">
              <template v-for="task in group.tasks" :key="task.id">
                <TimelineItem v-bind="task" :groupName="group.id">
                  <small>
                    <span v-if="!task.due_date">⚠</span>
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
</template>

<script>
import { GanttHeader } from "@/components";
import { List, ListHeader, ListRow } from "@/components";
import { Timeline, TimelineRow, TimelineItem } from "@/components";
import { cellSizeInPx, cellSize } from "@/contexts/CellSizeContext";
import { orderTasks, setPriorityTasks } from "@/utils/tasks";
import { initDay } from "@/utils/date";
import {
  setCalendarSize,
  todayCell,
  checkCalendarSize,
} from "@/contexts/CalendarContext";

export default {
  name: "TriditiveGantt",
  inject: {
    cellSizeInPx,
    cellSize,
    setCalendarSize,
    todayCell,
    checkCalendarSize,
    emitUpdatedTasks: { from: "emitUpdatedTasks" },
  },
  props: {
    groups: {
      type: Array,
      default: () => [],
    },
  },
  data: function () {
    return {
      groupsToUse: [],
    };
  },
  methods: {
    updateTask: function (taskData) {
      const { tasksUpdated, tasks } = this.handleTaskUpdate(taskData);
      this.emitUpdatedTasks({ tasksUpdated, tasks });
    },
    calendarScrollToday: function () {
      this.$refs.timeline.calendarScrollToday();
    },
    handleTaskUpdate: function ({ updatedTask, newRow, oldRow }) {
      const groupIndex = this.groupsToUse.findIndex((group) => {
        return group.id === newRow;
      });

      const currentGroup = this.groupsToUse[groupIndex];

      if (newRow === oldRow) {
        const taskIndex = currentGroup.tasks.findIndex((task) => {
          return task.id === updatedTask.id;
        });

        currentGroup.tasks[taskIndex] = updatedTask;

        const { tasksUpdated, tasks } = orderTasks(
          [updatedTask],
          currentGroup.tasks
        );

        this.groupsToUse[groupIndex].tasks = tasks;
        this.checkCalendarSize(tasksUpdated);

        return { tasksUpdated, tasks };
      }

      if (newRow !== oldRow) {
        const oldGroupIndex = this.groupsToUse.findIndex((group) => {
          return group.id === oldRow;
        });

        const oldGroup = this.groupsToUse[oldGroupIndex];

        const oldTaskIndex = oldGroup.tasks.findIndex((task) => {
          return task.id === updatedTask.id;
        });

        this.groupsToUse[oldGroupIndex].tasks.splice(oldTaskIndex, 1);
        // console.log(this.groupsToUse[oldGroupIndex]);
        // console.log(currentGroup);

        const { tasksUpdated, tasks } = orderTasks(
          [updatedTask],
          [...currentGroup.tasks, updatedTask]
        );

        this.groupsToUse[groupIndex].tasks = tasks;
        this.checkCalendarSize(tasksUpdated);

        return { tasksUpdated, tasks };
      }
    },

    handleScroll: function (e) {
      const scrollTop = e.target.scrollTop;
      const timeline = document.querySelector(".timeline");
      timeline.scrollTop = scrollTop;
    },
  },
  mounted() {
    this.setCalendarSize(this.groups);

    const setInitMoundInTasks = (groups) => {
      return groups.map((group) => {
        return {
          ...group,
          tasks: group.tasks.map((task) => ({
            ...task,
            creationDate: initDay(task.creationDate),
            duedate: initDay(task.duedate),
            rowName: group.id,
          })),
        };
      });
    };

    this.groupsToUse = setInitMoundInTasks(this.groups);

    this.groupsToUse.forEach((group, index) => {
      const { tasksUpdated, tasks } = setPriorityTasks(
        [group.tasks[0]],
        [...group.tasks]
      );

      this.groupsToUse[index].tasks = tasks;

      this.emitUpdatedTasks({ tasksUpdated, tasks });
      this.checkCalendarSize(tasksUpdated);
    });
  },
  provide: function () {
    return {
      updateTask: this.updateTask,
    };
  },
  components: {
    GanttHeader,
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
  max-height: 85vh;
  overflow-y: scroll;
}

.gantt-container {
  display: flex;
}

.calendar {
  text-align: center;
  color: #707070;
  background-color: #fdfdfd;
}
.calendar__days-container {
  display: flex;
}

.calendar__days-container div {
  width: v-bind(cellSizeInPx);
  border-right: 1px solid rgba(177, 184, 189, 0.45);
  border-bottom: 1px solid rgb(226, 226, 226);
}
</style>
