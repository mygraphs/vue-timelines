// import dayjs from "dayjs";
import { getDiffDays, subtractDays, addDays } from "./date";

export const orderTasks = (tasksUpdated, tasks, noOrder) => {
  if (noOrder) return { tasksUpdated, tasks };

  tasks.sort((a, b) => a.creationDate - b.creationDate);
  const tasksUpdatedLength = tasksUpdated.length;

  tasks.forEach((task) => {
    tasksUpdated.forEach((taskUpdated) => {
      if (
        task.id !== taskUpdated.id &&
        task.priority === taskUpdated.priority
      ) {
        const moveLeft =
          taskUpdated.creationDate > task.creationDate &&
          taskUpdated.creationDate <= task.duedate;

        const moveRight =
          (taskUpdated.duedate >= task.creationDate &&
            taskUpdated.duedate <= task.duedate) ||
          (taskUpdated.creationDate <= task.creationDate &&
            taskUpdated.duedate >= task.duedate);

        if (moveLeft) {
          const diffDays = getDiffDays(task.duedate, taskUpdated.creationDate);

          task.creationDate = subtractDays(task.creationDate, diffDays + 1);
          task.duedate = subtractDays(task.duedate, diffDays + 1);

          const taskUpdateIndex = tasksUpdated.findIndex((taskItem) => {
            return taskItem.id === task.id;
          });

          if (taskUpdateIndex !== -1) tasksUpdated[taskUpdateIndex] = task;
          else tasksUpdated.push(task);
        } else if (moveRight) {
          const diffDays = getDiffDays(taskUpdated.duedate, task.creationDate);

          task.creationDate = addDays(task.creationDate, diffDays + 1);
          task.duedate = addDays(task.duedate, diffDays + 1);

          const taskUpdateIndex = tasksUpdated.findIndex((taskItem) => {
            return taskItem.id === task.id;
          });

          if (taskUpdateIndex !== -1) tasksUpdated[taskUpdateIndex] = task;
          else tasksUpdated.push(task);
        }
      }
    });
  });

  noOrder = tasksUpdatedLength === tasksUpdated.length;
  return orderTasks(tasksUpdated, tasks, noOrder);
};

export const setPriorityTasks = (tasksUpdated, tasks, noOrder) => {
  if (noOrder) return { tasksUpdated, tasks };

  tasks.sort((a, b) => a.creationDate - b.creationDate);
  const tasksUpdatedLength = tasksUpdated.length;

  tasks.forEach((task, index) => {
    tasksUpdated.forEach((taskUpdated) => {
      if (!taskUpdated.priority) taskUpdated.priority = 1;
      if (!task.priority) task.priority = 1;

      if (
        task.id !== taskUpdated.id &&
        task.priority === taskUpdated.priority
      ) {
        if (
          (task.creationDate >= taskUpdated.creationDate &&
            task.creationDate <= taskUpdated.duedate) ||
          (task.duedate >= taskUpdated.creationDate &&
            task.duedate <= taskUpdated.duedate)
        ) {
          task.priority = taskUpdated.priority + 1;
          tasksUpdated.push(task);
        }

        if (
          (index - 1 >= 0 &&
            task.creationDate >= tasks[index - 1].creationDate &&
            task.creationDate <= tasks[index - 1].duedate) ||
          (task.duedate >= tasks[index - 1].creationDate &&
            task.duedate <= tasks[index - 1].duedate)
        ) {
          task.priority = taskUpdated.priority + 1;
          tasksUpdated.push(task);
        }
      }
    });
  });

  noOrder = tasksUpdatedLength === tasksUpdated.length;
  return setPriorityTasks(tasksUpdated, tasks, noOrder);
};
