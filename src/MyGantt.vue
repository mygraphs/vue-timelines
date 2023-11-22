<template>
  <GanttHeader @scrollToday="calendarScrollToday" />

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
  name: "VueTimeline",
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
  methods: {
    updateTask: function (taskData) {
      const { tasksUpdated, tasks } = this.handleTaskUpdate(taskData);
      this.emitUpdatedTasks({ tasksUpdated, tasks });
    },
    calendarScrollToday: function () {
      this.$refs.timeline.calendarScrollToday();
    },
    handleTaskUpdate: function ({ updatedTask, newRow, oldRow }) {
      if (newRow !== oldRow) {
        const taskIndex = this.groupsToUse[oldRow].tasks.findIndex((task) => {
          return task.id === updatedTask.id;
        });

        this.groupsToUse[oldRow].tasks.splice(taskIndex, 1);
        this.groupsToUse[newRow].tasks.push(updatedTask);
      } else {
        const taskIndex = this.groupsToUse[newRow].tasks.findIndex((task) => {
          return task.id === updatedTask.id;
        });

        this.groupsToUse[newRow].tasks[taskIndex] = updatedTask;
      }

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
      return {
        tasksUpdated: tasksUpdated.map((task) => ({
          ...task,
          newGroup: this.groupsToUse[newRow].name,
        })),
        tasks: tasks.map((task) => task),
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

    let calendarInit = null;
    let calendarEnd = null;

    for (const key in this.groupsToUse) {
      this.groupsToUse[key].tasks.map((task) => {
        const creationDateInitDay = initDay(task.creationDate);
        const dueDateInitDay = initDay(task.duedate);

        if (!calendarInit) calendarInit = creationDateInitDay;
        if (!calendarEnd) calendarEnd = dueDateInitDay;

        if (creationDateInitDay < calendarInit) {
          calendarInit = creationDateInitDay;
        }

        if (dueDateInitDay > calendarEnd) {
          calendarEnd = dueDateInitDay;
        }

        return {
          ...task,
          creationDate: creationDateInitDay,
          duedate: dueDateInitDay,
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

    this.setCalendarSize(calendarInit, calendarEnd);
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
  max-height: v-bind(height);
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
