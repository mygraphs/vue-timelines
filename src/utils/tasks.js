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
          taskUpdated.creationDate <= task.dueDate;

        const moveRight =
          (taskUpdated.dueDate >= task.creationDate &&
            taskUpdated.dueDate <= task.dueDate) ||
          (taskUpdated.creationDate <= task.creationDate &&
            taskUpdated.dueDate >= task.dueDate);

        if (moveLeft) {
          const diffDays = getDiffDays(task.dueDate, taskUpdated.creationDate);

          task.creationDate = subtractDays(task.creationDate, diffDays + 1);
          task.dueDate = subtractDays(task.dueDate, diffDays + 1);

          const taskUpdateIndex = tasksUpdated.findIndex((taskItem) => {
            return taskItem.id === task.id;
          });

          if (taskUpdateIndex !== -1) tasksUpdated[taskUpdateIndex] = task;
          else tasksUpdated.push(task);
        } else if (moveRight) {
          const diffDays = getDiffDays(taskUpdated.dueDate, task.creationDate);

          task.creationDate = addDays(task.creationDate, diffDays + 1);
          task.dueDate = addDays(task.dueDate, diffDays + 1);

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
            task.creationDate <= taskUpdated.dueDate) ||
          (task.dueDate >= taskUpdated.creationDate &&
            task.dueDate <= taskUpdated.dueDate)
        ) {
          task.priority = taskUpdated.priority + 1;
          tasksUpdated.push(task);
        }

        if (
          (index - 1 >= 0 &&
            task.creationDate >= tasks[index - 1].creationDate &&
            task.creationDate <= tasks[index - 1].dueDate) ||
          (task.dueDate >= tasks[index - 1].creationDate &&
            task.dueDate <= tasks[index - 1].dueDate)
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
