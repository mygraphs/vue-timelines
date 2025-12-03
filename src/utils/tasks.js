// import dayjs from "dayjs";
import { getDiffDays, subtractDays, addDays } from "./date";

/**
 * Calculate the depth of a task in the hierarchy
 * @param {Object} task - Task object with parentTaskId
 * @param {Array} allTasks - All tasks array
 * @returns {number} Depth level (0 for root, 1 for subtask, etc.)
 */
export function calculateTaskDepth(task, allTasks) {
  if (!task.parentTaskId) return 0;

  const parent = allTasks.find(t => t.id === task.parentTaskId);
  if (!parent) return 0;

  return 1 + calculateTaskDepth(parent, allTasks);
}

/**
 * Check if a task has subtasks
 * @param {Object} task - Task object
 * @param {Array} allTasks - All tasks array
 * @returns {boolean} True if task has subtasks
 */
export function hasSubtasks(task, allTasks) {
  return allTasks.some(t => t.parentTaskId === task.id && (t.isSubtask || false));
}

/**
 * Get the count of subtasks for a task
 * @param {Object} task - Task object
 * @param {Array} allTasks - All tasks array
 * @returns {number} Number of subtasks
 */
export function getSubtaskCount(task, allTasks) {
  return allTasks.filter(t => t.parentTaskId === task.id && (t.isSubtask || false)).length;
}

/**
 * Sort tasks hierarchically: parent tasks first, then their subtasks
 * @param {Array} tasks - Array of task objects
 * @returns {Array} Sorted array with hierarchical order
 */
export function sortTasksHierarchically(tasks) {
  if (!tasks || tasks.length === 0) return [];

  // Separate root tasks and subtasks
  const rootTasks = tasks.filter(t => !t.parentTaskId || (!t.isSubtask && !t.parentTaskId));
  const subtasks = tasks.filter(t => t.isSubtask && t.parentTaskId);

  // Create a map of parent ID to subtasks
  const subtaskMap = new Map();
  subtasks.forEach(subtask => {
    const parentId = subtask.parentTaskId;
    if (!subtaskMap.has(parentId)) {
      subtaskMap.set(parentId, []);
    }
    subtaskMap.get(parentId).push(subtask);
  });

  // Sort root tasks by creation date
  rootTasks.sort((a, b) => (a.creationDate || 0) - (b.creationDate || 0));

  // Build sorted array: parent, then its subtasks
  const sorted = [];
  rootTasks.forEach(parent => {
    sorted.push(parent);
    const children = subtaskMap.get(parent.id) || [];
    // Sort subtasks by creation date or title
    children.sort((a, b) => {
      if (a.creationDate && b.creationDate) {
        return a.creationDate - b.creationDate;
      }
      return (a.title || '').localeCompare(b.title || '');
    });
    sorted.push(...children);
  });

  // Add any orphaned subtasks (parent not in rootTasks)
  const processedIds = new Set(sorted.map(t => t.id));
  subtasks.forEach(subtask => {
    if (!processedIds.has(subtask.id)) {
      sorted.push(subtask);
    }
  });

  return sorted;
}

export const orderTasks = (tasksUpdated, tasks, noOrder) => {
  if (noOrder) return { tasksUpdated, tasks };

  tasks.sort((a, b) => a.creationDate - b.creationDate);
  const tasksUpdatedLength = tasksUpdated.length;

  tasks.forEach((task) => {
    tasksUpdated.forEach((taskUpdated) => {
      if (
        task.id !== taskUpdated.id &&
        (task.priority ?? 0) === (taskUpdated.priority ?? 0)
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
      if (taskUpdated.priority == null) taskUpdated.priority = 0;
      if (task.priority == null) task.priority = 0;

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
