<template>
  <!-- <GanttHeader @scrollToday="calendarScrollToday" /> -->
  <GanttHeader />

  <div class="gantt-container">
    <slot>
      <template v-if="groups.length !== 0">
        <List width="150px">
          <ListHeader>Group Name</ListHeader>

          <ListRow v-for="group in groupsToUse" :key="group.id">
            {{ group.name }}
          </ListRow>
        </List>

        <Timeline ref="gantt">
          <template v-for="group in groupsToUse" :key="group.id">
            <TimelineRow :name="group.name">
              <template v-for="task in group.tasks" :key="task.id">
                <TimelineItem v-bind="task" :groupName="group.name">
                  {{ task.title }}
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
import { orderTasks } from "@/utils/tasks";
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
    handleTaskUpdate: function ({ updatedTask, newRow, oldRow }) {
      const groupIndex = this.groupsToUse.findIndex((group) => {
        return group.name === newRow;
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
          return group.name === oldRow;
        });

        const oldGroup = this.groupsToUse[oldGroupIndex];

        const oldTaskIndex = oldGroup.tasks.findIndex((task) => {
          return task.id === updatedTask.id;
        });

        this.groupsToUse[oldGroupIndex].tasks.splice(oldTaskIndex, 1);

        const { tasksUpdated, tasks } = orderTasks(
          [updatedTask],
          [...currentGroup.tasks, updatedTask]
        );

        this.groupsToUse[groupIndex].tasks = tasks;
        this.checkCalendarSize(tasksUpdated);

        return { tasksUpdated, tasks };
      }
    },
    updateTask: function (taskData) {
      const { tasksUpdated, tasks } = this.handleTaskUpdate(taskData);
      this.emitUpdatedTasks({ tasksUpdated, tasks });
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
            rowName: group.name,
          })),
        };
      });
    };

    this.groupsToUse = setInitMoundInTasks(this.groups);

    this.groupsToUse.forEach((group) => {
      const { tasksUpdated, tasks } = this.handleTaskUpdate({
        updatedTask: group.tasks[0],
        newRow: group.name,
        oldRow: group.name,
      });

      if (tasksUpdated.length > 1) {
        const taskesUpdatedEmit = tasksUpdated.splice(0, 1);
        this.emitUpdatedTasks({ tasksUpdated: taskesUpdatedEmit, tasks });
      }
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
.gantt-container {
  display: flex;
}

.calendar {
  text-align: center;
  padding-top: 0.4rem;
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
