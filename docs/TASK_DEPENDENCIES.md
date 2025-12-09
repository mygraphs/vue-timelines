# Task Dependencies and Subtasks Display

## Overview

This document describes the behavior for displaying task dependencies (parent tasks and subtasks) in vue-timelines. The goal is to render subtasks in a Gantt chart-like hierarchical structure where subtasks are visually nested under their parent tasks.

## Current Behavior

Tasks and subtasks can be organized hierarchically within their groups. The component supports:

- Parent tasks displayed at the top level within their group
- Subtasks are not visually distinguished from parent tasks
- No hierarchical indentation or nesting is shown
- Dependencies between parent tasks and subtasks are not visually represented

## Desired Behavior

### Visual Hierarchy

Subtasks should be displayed in a hierarchical, Gantt chart-like structure:

1. **Parent Tasks**: Displayed at the top level within their group
2. **Subtasks**: Displayed indented/nested directly below their parent task
3. **Visual Indicators**:
   - Subtasks should be visually indented (e.g., 20-30px left margin per level)
   - Subtasks could have a different visual style (lighter color, smaller height, or different border)
   - Optional: Connection lines or arrows showing the parent-child relationship

### Grouping Structure

```
Group: "Project Alpha"
├── Parent Task 1 (top-level, full width)
│   ├── Subtask 1.1 (indented, nested under Parent 1)
│   ├── Subtask 1.2 (indented, nested under Parent 1)
│   └── Subtask 1.3 (indented, nested under Parent 1)
├── Parent Task 2 (top-level, full width)
│   └── Subtask 2.1 (indented, nested under Parent 2)
└── Parent Task 3 (top-level, full width, no subtasks)
```

### Task Data Model

Tasks have the following structure:

```typescript
interface Task {
  _id: string;                    // Unique task identifier
  parentTaskId?: string | null;   // ID of parent task (null for root tasks)
  isSubtask?: boolean;             // True if this is a subtask (completion dependency)
  title: string;                   // Task title
  startDate?: string;             // Start date (ISO string)
  dueDate?: string;               // Due date (ISO string)
  status: TaskStatus;              // 'Pending' | 'Ongoing' | 'Completed' | 'Overdue' | 'Cancelled' | 'Reopened'
  progress?: number;               // Progress from 0.0 to 1.0
  group_id?: string | null;       // Group ID (for grouping tasks)
  // ... other fields
}
```

### Key Distinctions

- **Subtask** (`isSubtask: true`): A completion dependency of a parent task. These should be nested under their parent.
- **Recurring Child** (`recurrencePattern.parentTaskId` exists): A recurring instance of a task. These are NOT subtasks and should NOT be nested.
- **Root Task** (`parentTaskId: null`): A top-level task with no parent. These appear at the top level of their group.

## Implementation Requirements

### 1. Task Sorting and Ordering

Tasks should be sorted within each group as follows:

1. **Root tasks first** (tasks with `parentTaskId === null`)
2. **Subtasks immediately after their parent** (tasks with `parentTaskId` matching a parent's `_id`)
3. **Maintain parent-child relationships** in the rendering order

**Example Sort Order:**
```
Group: "Project Alpha"
1. Parent Task A (_id: "task-1", parentTaskId: null)
2. Subtask A.1 (_id: "task-2", parentTaskId: "task-1")
3. Subtask A.2 (_id: "task-3", parentTaskId: "task-1")
4. Parent Task B (_id: "task-4", parentTaskId: null)
5. Subtask B.1 (_id: "task-5", parentTaskId: "task-4")
```

### 2. Visual Indentation

Subtasks should be visually indented to show hierarchy:

- **Indentation per level**: 20-30px (configurable)
- **Visual style options**:
  - Lighter background color
  - Smaller height (e.g., 80% of parent task height)
  - Different border style (dashed or lighter color)
  - Optional: Subtask icon indicator (e.g., `fa-sitemap`)

### 3. Collapsible Groups (Optional Enhancement)

For better UX with many subtasks, consider:

- **Collapse/Expand**: Parent tasks can be collapsed to hide their subtasks
- **Badge Count**: Show the number of subtasks when collapsed (e.g., "3 subtasks")
- **Keyboard Navigation**: Support expand/collapse via keyboard

### 4. Dependency Lines (Optional Enhancement)

For clearer visualization:

- **Connection Lines**: Draw lines connecting parent tasks to their subtasks
- **Visual Style**: Light gray or dashed lines
- **Positioning**: From the right edge of parent task to the left edge of subtask

### 5. Progress Calculation

Parent task progress should be calculated based on subtask completion:

- If task is `Completed`: Progress = 100% (1.0)
- If task has subtasks: Progress = (completed subtasks / total subtasks)
- If task has no subtasks: Progress remains as set (or 0 if not set)

This is handled by the backend, but the timeline should display the calculated progress.

## Data Transformation

### Task Transformation Example

When transforming tasks for the timeline, ensure hierarchy is preserved:

```typescript
this.timelineTasks = this.tasks.map((task, index) => {
  return {
    id: task._id,
    group_id: task.group_id || 'unassigned',
    title: task.title,
    creationDate: ...,
    dueDate: ...,
    progress: ...,
    priority: ...,
    state: ...,
    parentTaskId: task.parentTaskId || null,
    isSubtask: task.isSubtask || false
  };
});
```

### Required Transformation

The transformation should:

1. **Separate root tasks from subtasks**
2. **Sort tasks hierarchically** (parent, then children)
3. **Add hierarchy metadata** to each task:

```typescript
interface TimelineTask {
  id: string;
  group_id: string;
  title: string;
  creationDate: number;
  dueDate: number;
  progress: number;
  priority: number;
  state: string;
  // New fields for hierarchy
  parentTaskId?: string | null;
  isSubtask?: boolean;
  depth?: number;              // Nesting depth (0 for root, 1 for subtask, etc.)
  hasSubtasks?: boolean;        // True if this task has subtasks
  subtaskCount?: number;       // Number of subtasks
}
```

### Sorting Algorithm

```typescript
function sortTasksHierarchically(tasks: Task[]): Task[] {
  // Separate root tasks and subtasks
  const rootTasks = tasks.filter(t => !t.parentTaskId && !t.isSubtask);
  const subtasks = tasks.filter(t => t.isSubtask && t.parentTaskId);

  // Create a map of parent ID to subtasks
  const subtaskMap = new Map<string, Task[]>();
  subtasks.forEach(subtask => {
    const parentId = subtask.parentTaskId!;
    if (!subtaskMap.has(parentId)) {
      subtaskMap.set(parentId, []);
    }
    subtaskMap.get(parentId)!.push(subtask);
  });

  // Build sorted array: parent, then its subtasks
  const sorted: Task[] = [];
  rootTasks.forEach(parent => {
    sorted.push(parent);
    const children = subtaskMap.get(parent._id) || [];
    // Sort subtasks by creation date or title
    children.sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    sorted.push(...children);
  });

  return sorted;
}
```

## CSS Styling Requirements

### Indentation Classes

```css
.timeline-task {
  /* Base task styling */
}

.timeline-task--depth-0 {
  /* Root task - no indentation */
  margin-left: 0;
}

.timeline-task--depth-1 {
  /* First-level subtask */
  margin-left: 24px;
  border-left: 2px solid #e0e0e0;
  padding-left: 8px;
}

.timeline-task--depth-2 {
  /* Second-level subtask (if nested subtasks are supported) */
  margin-left: 48px;
  border-left: 2px solid #d0d0d0;
  padding-left: 8px;
}

.timeline-task--subtask {
  /* Subtask-specific styling */
  background-color: rgba(0, 0, 0, 0.02);
  height: 24px; /* Smaller than parent (parent might be 30px) */
  font-size: 0.9em;
}

.timeline-task--subtask::before {
  /* Optional: Subtask indicator icon */
  content: "▸";
  margin-right: 4px;
  color: #666;
}
```

### Visual Hierarchy Indicators

```css
/* Connection line (optional) */
.timeline-task--subtask::after {
  content: "";
  position: absolute;
  left: -24px;
  top: 50%;
  width: 20px;
  height: 1px;
  background-color: #ccc;
  border-top: 1px dashed #999;
}
```

## API Considerations

### Task Data Structure

The timeline component should accept tasks with the following structure:

```typescript
interface TimelineTaskInput {
  id: string;
  group_id: string;
  title: string;
  creationDate: number;        // Unix timestamp (seconds)
  dueDate: number;            // Unix timestamp (seconds)
  progress: number;            // 0.0 to 1.0
  priority: number;            // 0 = highest
  state: string;               // Task status
  parentTaskId?: string | null;
  isSubtask?: boolean;
}
```

### Event Handling

When tasks are updated (drag-and-drop, date changes), the component should:

1. **Maintain hierarchy**: Ensure subtasks cannot be moved outside their parent's date range (optional constraint)
2. **Update parent progress**: Recalculate parent task progress when subtask dates change
3. **Emit update events**: Include hierarchy information in update events

## Example Usage

### Data Preparation

```typescript
// Transform tasks for timeline
const timelineTasks = sortTasksHierarchically(tasks).map(task => ({
  id: task._id,
  group_id: task.group_id || 'unassigned',
  title: task.title,
  creationDate: task.startDate
    ? Math.floor(new Date(task.startDate).getTime() / 1000)
    : Math.floor(new Date(task.createdAt).getTime() / 1000),
  dueDate: task.dueDate
    ? Math.floor(new Date(task.dueDate).getTime() / 1000)
    : Math.floor(Date.now() / 1000) + 86400,
  progress: task.progress ?? 0,
  priority: mapPriorityToNumber(task.priority),
  state: task.status,
  parentTaskId: task.parentTaskId || null,
  isSubtask: task.isSubtask || false,
  depth: calculateDepth(task, tasks), // Helper function
  hasSubtasks: hasSubtasks(task, tasks), // Helper function
  subtaskCount: getSubtaskCount(task, tasks) // Helper function
}));
```

### Component Usage

```html
<vue-timeline
  :groups="groups"
  :tasks="timelineTasks"
  :show-hierarchy="true"
  :indent-per-level="24"
  @update="handleTaskUpdate"
/>
```

## Testing Scenarios

### Scenario 1: Simple Parent-Child

- **Parent Task**: "Design System" (Jan 1 - Jan 15)
- **Subtask 1**: "Create color palette" (Jan 1 - Jan 5)
- **Subtask 2**: "Design components" (Jan 6 - Jan 15)

**Expected**: Parent task at top level, subtasks indented below it.

### Scenario 2: Multiple Parents in Same Group

- **Parent Task A**: "Frontend Development" (Jan 1 - Jan 20)
  - **Subtask A.1**: "Setup project" (Jan 1 - Jan 3)
  - **Subtask A.2**: "Implement features" (Jan 4 - Jan 20)
- **Parent Task B**: "Backend Development" (Jan 1 - Jan 25)
  - **Subtask B.1**: "API design" (Jan 1 - Jan 10)

**Expected**: Parent A and its subtasks, then Parent B and its subtasks.

### Scenario 3: Parent Without Subtasks

- **Parent Task**: "Documentation" (Jan 1 - Jan 10)
- **Parent Task**: "Testing" (Jan 11 - Jan 20)
  - **Subtask**: "Unit tests" (Jan 11 - Jan 15)

**Expected**: "Documentation" appears as top-level, "Testing" appears as top-level with "Unit tests" indented below it.

### Scenario 4: Progress Calculation

- **Parent Task**: "Project Phase 1" (progress: 0.5)
  - **Subtask 1**: "Task A" (Completed - progress: 1.0)
  - **Subtask 2**: "Task B" (Pending - progress: 0.0)
  - **Subtask 3**: "Task C" (Completed - progress: 1.0)

**Expected**: Parent task shows progress of 66.7% (2 completed / 3 total).

## Migration Path

### Phase 1: Basic Hierarchy (Current Priority)

1. Add `parentTaskId` and `isSubtask` to task data model
2. Implement hierarchical sorting
3. Add visual indentation (CSS classes)
4. Test with hierarchical task data

### Phase 2: Enhanced Visuals (Future)

1. Add connection lines between parent and subtasks
2. Implement collapsible groups
3. Add subtask count badges
4. Improve styling and animations

### Phase 3: Advanced Features (Future)

1. Support nested subtasks (subtasks of subtasks)
2. Drag-and-drop constraints (subtasks within parent date range)
3. Keyboard navigation for hierarchy
4. Export/import with hierarchy preserved

## Related Documentation

- [API Service Documentation](./API_SERVICE.md)
- [Web Component Usage](./WEB_COMPONENT.md)
- [Theming Guide](./THEMING.md)

## Questions and Considerations

1. **Nested Subtasks**: Should subtasks be able to have their own subtasks? (Currently supported with depth calculation)

2. **Date Constraints**: Should subtasks be constrained to their parent's date range when dragging?

3. **Filtering**: How should filtering work with hierarchy? (e.g., filter parent hides subtasks, or show subtasks even if parent is filtered?)

4. **Export/Import**: How should hierarchy be preserved in data export/import?

5. **Performance**: For large hierarchies (100+ subtasks per parent), consider virtualization or lazy loading.

## Implementation Notes

- The component automatically calculates task depth for hierarchical styling
- Tasks are sorted hierarchically with parent tasks appearing before their subtasks
- The `depth` property is automatically added to tasks for CSS styling
- Drag-and-drop maintains parent-child relationships
- Parent task validation ensures referenced parents exist (invalid references are set to null)

