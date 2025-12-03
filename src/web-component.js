import { createApp, h } from 'vue';
import MyTimeline from './MyTimeline.vue';
import { CellSizeContext, CalendarContext } from './contexts';
import { createTimelineStore } from './store/store';
import { NoopApiService, DefaultApiService } from './services';
import { VERSION, NAME, DESCRIPTION, AUTHOR, LICENSE } from './version';

// Import styles - these will be bundled by rollup
// Note: CSS imports are handled by rollup-plugin-postcss
// Bootstrap CSS will be injected into the page when the bundle loads
import 'bootstrap/dist/css/bootstrap.min.css';

// Import theme styles - these will be scoped to .vue-timeline-container
// Import default.css directly to avoid @import issues in web component bundle
import './styles/themes/default.css';
import './styles/themes/dark.css';

// Wrap in try-catch to catch any import errors
try {
  console.log(`%c[${NAME}]`, 'color: #42b983; font-weight: bold;', `${NAME} v${VERSION} - ${DESCRIPTION}`);
  console.log(`%c[${NAME}]`, 'color: #42b983;', `Author: ${AUTHOR} | License: ${LICENSE}`);
  console.log('[vue-timelines] Web component script loading...');
  console.log('[vue-timelines] Checking Vue availability...');

  // Check if createApp is available immediately after import
  if (typeof createApp === 'undefined') {
    console.error('[vue-timelines] ERROR: createApp is undefined after import!');
  } else {
    console.log('[vue-timelines] ✅ Vue createApp is available');
  }

  if (typeof MyTimeline === 'undefined') {
    console.error('[vue-timelines] ERROR: MyTimeline is undefined after import!');
  } else {
    console.log('[vue-timelines] ✅ MyTimeline component is available');
  }
} catch (error) {
  console.error('[vue-timelines] ❌ ERROR during script initialization:', error);
  throw error;
}

/**
 * Vue Timeline Web Component
 *
 * Usage:
 * <vue-timeline
 *   height="100vh"
 *   groups='[{"id":"1","name":"Group 1"}]'
 *   tasks='[{"id":"1","group_id":"1","title":"Task 1","creationDate":1641437099,"dueDate":1651805099,"progress":0.8,"priority":0}]'
 *   title="My Timeline"
 * ></vue-timeline>
 */
class VueTimelineElement extends HTMLElement {
  constructor() {
    super();
    console.log('[vue-timelines] VueTimelineElement constructor called');
    this.app = null;
    // Don't set shadowRoot here - it's a read-only property
    // We'll use attachShadow in connectedCallback if needed
    this._shadowRoot = null;
  }

  static get observedAttributes() {
    return ['height', 'groups', 'tasks', 'title', 'api-base-url', 'api-token', 'dragging-enabled', 'constrained-to-group', 'group-create-enabled', 'group-edit-enabled', 'row-add-remove-enabled', 'status-colors', 'debug', 'debug-enabled'];
  }

  connectedCallback() {
    console.log('[vue-timelines] connectedCallback called');

    try {
      // Check if Vue is available
      if (typeof createApp === 'undefined') {
        console.error('[vue-timelines] ERROR: createApp is not defined! Vue may not be loaded.');
        throw new Error('Vue createApp is not available');
      }
      console.log('[vue-timelines] Vue createApp is available');

      // Check if MyTimeline component is available
      if (typeof MyTimeline === 'undefined') {
        console.error('[vue-timelines] ERROR: MyTimeline component is not defined!');
        throw new Error('MyTimeline component is not available');
      }
      console.log('[vue-timelines] MyTimeline component is available');

      // Use light DOM instead of shadow DOM for better CSS compatibility
      // Shadow DOM isolates styles, which breaks Bootstrap and component CSS
      // Light DOM allows styles to work normally
      console.log('[vue-timelines] Using light DOM (no shadow) for CSS compatibility');

      // Ensure styles are available - check if Bootstrap is loaded
      if (typeof document !== 'undefined') {
        const hasBootstrap = document.querySelector('link[href*="bootstrap"]') ||
                            document.querySelector('style[data-vue-timelines]') ||
                            getComputedStyle(document.body).getPropertyValue('--bs-primary');
        console.log('[vue-timelines] Bootstrap CSS available:', !!hasBootstrap);
      }

      // Get API service configuration from attributes
      console.log('[vue-timelines] Creating API service...');
      const apiService = this.createApiService();
      console.log('[vue-timelines] API service created:', apiService.constructor.name);

      // Get props from attributes first (needed for height calculation)
      const props = this.getPropsFromAttributes();

      // Calculate desired height from height attribute or container
      let desiredHeight = 0;
      if (props.height) {
        // Parse height string (e.g., "600px" -> 600)
        const heightMatch = props.height.match(/(\d+)/);
        if (heightMatch) {
          desiredHeight = parseInt(heightMatch[1], 10);
        }
      }
      // If no height specified, use container height
      if (desiredHeight === 0 && this.offsetHeight > 0) {
        desiredHeight = this.offsetHeight;
      }

      // Create store with API service first (needed for emitBubbleTask)
      console.log('[vue-timelines] Creating store...');
      const store = createTimelineStore(apiService);
      this.store = store; // Store reference early for emitBubbleTask

      // Create Vue app instance with proper context wrappers
      console.log('[vue-timelines] Creating Vue app instance...');
      // Provide emitBubbleTask function for MyTimeline
      // This allows tasks to emit updates, which we'll handle via the store
      const emitBubbleTask = (taskData) => {
        console.log('[vue-timelines] Task updated:', taskData);
        // Update the task in the store
        if (this.store) {
          this.store.commit('api/updateTask', taskData);
        }
        // Emit a custom event for external listeners
        this.dispatchEvent(new CustomEvent('task-updated', {
          detail: taskData,
          bubbles: true,
          composed: true
        }));
      };

      // Wrap MyTimeline in CalendarContext and CellSizeContext to provide necessary context
      this.app = createApp({
        provide: {
          emitBubbleTask: emitBubbleTask
        },
        render: () => h(CalendarContext, null, {
          default: () => h(CellSizeContext, {
            desiredHeight: desiredHeight,
            style: 'height: 100%'
          }, {
            default: () => h(MyTimeline, { height: props.height })
          })
        })
      });
      console.log('[vue-timelines] Vue app instance created with context wrappers, desiredHeight:', desiredHeight);

      // Add store to app
      this.app.use(store);
      console.log('[vue-timelines] Store created and added to app');
      console.log('[vue-timelines] Props from attributes:', {
        groups: (props.groups && props.groups.length) || 0,
        tasks: (props.tasks && props.tasks.length) || 0,
        title: props.title,
        height: props.height
      });

      // Initialize store with data from attributes
      if (props.groups && props.groups.length > 0) {
        store.commit('api/setGroups', props.groups);
        console.log('[vue-timelines] Groups set in store:', props.groups.length);
      }
      if (props.tasks && props.tasks.length > 0) {
        store.commit('api/setTasks', props.tasks);
        console.log('[vue-timelines] Tasks set in store:', props.tasks.length);
      }
      if (props.title) {
        store.commit('api/setTitle', props.title);
        console.log('[vue-timelines] Title set in store:', props.title);
      }

      // Configure dragging if specified
      const draggingEnabled = this.getAttribute('dragging-enabled');
      if (draggingEnabled !== null) {
        const enabled = draggingEnabled === 'true' || draggingEnabled === '';
        store.commit('setConfig', { key: 'TASK_DRAGGING_ENABLED', value: enabled });
        console.log('[vue-timelines] Task dragging enabled:', enabled);
      }

      // Configure group constraint if specified
      const constrainedToGroup = this.getAttribute('constrained-to-group');
      if (constrainedToGroup !== null) {
        const constrained = constrainedToGroup === 'true' || constrainedToGroup === '';
        store.commit('setConfig', { key: 'TASK_CONSTRAINED_TO_GROUP', value: constrained });
        console.log('[vue-timelines] Task constrained to group:', constrained);
      }

      // Configure group create if specified
      const groupCreateEnabled = this.getAttribute('group-create-enabled');
      if (groupCreateEnabled !== null) {
        const enabled = groupCreateEnabled === 'true' || groupCreateEnabled === '';
        store.commit('setConfig', { key: 'GROUP_CREATE_ENABLED', value: enabled });
        console.log('[vue-timelines] Group create enabled:', enabled);
      }

      // Configure group edit if specified
      const groupEditEnabled = this.getAttribute('group-edit-enabled');
      if (groupEditEnabled !== null) {
        const enabled = groupEditEnabled === 'true' || groupEditEnabled === '';
        store.commit('setConfig', { key: 'GROUP_EDIT_ENABLED', value: enabled });
        console.log('[vue-timelines] Group edit enabled:', enabled);
      }

      // Configure row add/remove buttons if specified
      const rowAddRemoveEnabled = this.getAttribute('row-add-remove-enabled');
      if (rowAddRemoveEnabled !== null) {
        const enabled = rowAddRemoveEnabled === 'true' || rowAddRemoveEnabled === '';
        store.commit('setConfig', { key: 'ROW_ADD_REMOVE_ENABLED', value: enabled });
        console.log('[vue-timelines] Row add/remove enabled:', enabled);
      }

      // Configure status colors if specified
      const statusColorsAttr = this.getAttribute('status-colors');
      if (statusColorsAttr) {
        try {
          const statusColors = JSON.parse(statusColorsAttr);
          store.commit('setConfig', { key: 'STATUS_COLORS', value: statusColors });
          console.log('[vue-timelines] Status colors configured:', Object.keys(statusColors).length, 'statuses');
        } catch (e) {
          console.warn('[vue-timelines] Invalid status-colors JSON:', e);
        }
      }

      // Configure debug mode if specified
      const debugAttr = this.getAttribute('debug') || this.getAttribute('debug-enabled');
      if (debugAttr !== null) {
        const enabled = debugAttr === 'true' || debugAttr === '';
        store.commit('setDebug', enabled);
        console.log('[vue-timelines] Debug mode enabled:', enabled);
      }

      // Setup event listeners after store is created
      this.setupEventListeners();
      console.log('[vue-timelines] Event listeners setup complete');

      // Create a container for Vue with scoping class
      const container = document.createElement('div');
      container.className = 'vue-timeline-container';
      container.style.width = '100%';
      container.style.height = '100%';
      console.log('[vue-timelines] Container element created with scoping class');

      // Use light DOM (no shadow) - append directly to element
      this.appendChild(container);
      console.log('[vue-timelines] Container appended to light DOM');

      // Mount Vue app
      console.log('[vue-timelines] Mounting Vue app...');
      this.app.mount(container);
      console.log('[vue-timelines] ✅ Vue app mounted successfully!');
    } catch (error) {
      console.error('[vue-timelines] ❌ ERROR in connectedCallback:', error);
      console.error('[vue-timelines] Error stack:', error.stack);
      throw error;
    }
  }

  disconnectedCallback() {
    console.log('[vue-timelines] disconnectedCallback called');
    if (this.app) {
      this.app.unmount();
      this.app = null;
      console.log('[vue-timelines] Vue app unmounted');
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.app || oldValue === newValue) return;

    console.log(`[vue-timelines] attributeChangedCallback: ${name}`, { oldValue, newValue });

    const props = this.getPropsFromAttributes();

    switch (name) {
      case 'groups':
        if (props.groups && this.store) {
          this.store.commit('api/setGroups', props.groups);
          console.log('[vue-timelines] Groups updated:', props.groups.length);
        }
        break;
      case 'tasks':
        if (props.tasks && this.store) {
          this.store.commit('api/setTasks', props.tasks);
          console.log('[vue-timelines] Tasks updated:', props.tasks.length);
        }
        break;
      case 'title':
        if (props.title) {
          this.store.commit('api/setTitle', props.title);
          console.log('[vue-timelines] Title updated:', props.title);
        }
        break;
      case 'height':
        // Height is passed as prop to MyTimeline
        if (this.app && this.app._instance) {
          this.app._instance.props.height = props.height;
          console.log('[vue-timelines] Height updated:', props.height);
        }
        break;
      case 'dragging-enabled':
        // Update dragging configuration
        if (this.store) {
          const enabled = newValue === 'true' || newValue === '';
          this.store.commit('setConfig', { key: 'TASK_DRAGGING_ENABLED', value: enabled });
          console.log('[vue-timelines] Task dragging enabled updated:', enabled);
        }
        break;
      case 'constrained-to-group':
        // Update group constraint configuration
        if (this.store) {
          const constrained = newValue === 'true' || newValue === '';
          this.store.commit('setConfig', { key: 'TASK_CONSTRAINED_TO_GROUP', value: constrained });
          console.log('[vue-timelines] Task constrained to group updated:', constrained);
        }
        break;
      case 'group-create-enabled':
        // Update group create configuration
        if (this.store) {
          const enabled = newValue === 'true' || newValue === '';
          this.store.commit('setConfig', { key: 'GROUP_CREATE_ENABLED', value: enabled });
          console.log('[vue-timelines] Group create enabled updated:', enabled);
        }
        break;
      case 'group-edit-enabled':
        // Update group edit configuration
        if (this.store) {
          const enabled = newValue === 'true' || newValue === '';
          this.store.commit('setConfig', { key: 'GROUP_EDIT_ENABLED', value: enabled });
          console.log('[vue-timelines] Group edit enabled updated:', enabled);
        }
        break;
      case 'row-add-remove-enabled':
        // Update row add/remove buttons configuration
        if (this.store) {
          const enabled = newValue === 'true' || newValue === '';
          this.store.commit('setConfig', { key: 'ROW_ADD_REMOVE_ENABLED', value: enabled });
          console.log('[vue-timelines] Row add/remove enabled updated:', enabled);
        }
        break;
      case 'status-colors':
        // Update status colors configuration
        if (this.store && newValue) {
          try {
            const statusColors = JSON.parse(newValue);
            this.store.commit('setConfig', { key: 'STATUS_COLORS', value: statusColors });
            console.log('[vue-timelines] Status colors updated:', Object.keys(statusColors).length, 'statuses');
          } catch (e) {
            console.warn('[vue-timelines] Invalid status-colors JSON:', e);
          }
        }
        break;
      case 'debug':
      case 'debug-enabled':
        // Update debug mode configuration
        if (this.store) {
          const enabled = newValue === 'true' || newValue === '';
          this.store.commit('setDebug', enabled);
          console.log('[vue-timelines] Debug mode updated:', enabled);
        }
        break;
    }
  }

  getPropsFromAttributes() {
    return {
      height: this.getAttribute('height') || '100vh',
      groups: this.parseJSONAttribute('groups', []),
      tasks: this.parseJSONAttribute('tasks', []),
      title: this.getAttribute('title') || ''
    };
  }

  parseJSONAttribute(name, defaultValue) {
    const value = this.getAttribute(name);
    if (!value) return defaultValue;
    try {
      return JSON.parse(value);
    } catch (e) {
      console.warn(`Invalid JSON in attribute ${name}:`, value);
      return defaultValue;
    }
  }

  createApiService() {
    const baseURL = this.getAttribute('api-base-url');
    const apiToken = this.getAttribute('api-token');

    if (baseURL) {
      // Use DefaultApiService if API configuration is provided
      return new DefaultApiService({
        baseURL: baseURL,
        apiToken: apiToken || ''
      });
    }

    // Default to NoopApiService for demo/static use
    return new NoopApiService();
  }

  setupEventListeners() {
    // Listen to Vuex store changes and emit custom events
    if (this.store) {
      console.log('[vue-timelines] Setting up store event listeners...');
      this.store.subscribe((mutation, state) => {
        console.log('[vue-timelines] Store mutation:', mutation.type, mutation.payload);
        // Emit custom events for important state changes
        if (mutation.type === 'api/updateTask') {
          console.log('[vue-timelines] Emitting task-updated event:', mutation.payload);
          this.dispatchEvent(new CustomEvent('task-updated', {
            detail: mutation.payload,
            bubbles: true,
            composed: true
          }));
        }
      });
      console.log('[vue-timelines] Store event listeners setup complete');
    } else {
      console.warn('[vue-timelines] Store not available for event listeners');
    }
  }

  // Public API methods
  setGroups(groups) {
    const groupCount = (groups && groups.length) ? groups.length : 0;
    console.log('[vue-timelines] setGroups called:', groupCount, 'groups');

    if (groupCount > 0) {
      console.log('[vue-timelines] 📋 Groups summary:');
      groups.forEach((group, idx) => {
        console.log(`  Group ${idx + 1}: "${group.name}" (${group.id})`);
      });
    }

    this.setAttribute('groups', JSON.stringify(groups));
    if (this.store) {
      this.store.commit('api/setGroups', groups);
      console.log('[vue-timelines] Groups committed to store:', this.store.state.api.groups.length, 'groups');
    }
  }

  setTasks(tasks) {
    const taskCount = (tasks && tasks.length) ? tasks.length : 0;
    console.log('[vue-timelines] setTasks called:', taskCount, 'tasks');

    if (taskCount > 0) {
      // Log summary of tasks
      console.log('[vue-timelines] 📋 Tasks summary:');
      tasks.forEach((task, idx) => {
        const startDate = task.creationDate ? new Date(task.creationDate * 1000).toISOString() : 'N/A';
        const endDate = task.dueDate ? new Date(task.dueDate * 1000).toISOString() : 'N/A';
        console.log(`  Task ${idx + 1}: "${task.title}" (${task.id})`);
        console.log(`    - group_id: ${task.group_id}`);
        console.log(`    - creationDate: ${task.creationDate} (${startDate})`);
        console.log(`    - dueDate: ${task.dueDate} (${endDate})`);
        console.log(`    - isSubtask: ${task.isSubtask || false}, parentTaskId: ${task.parentTaskId || 'none'}`);
        console.log(`    - progress: ${task.progress || 0}, state: ${task.state || 'N/A'}`);
      });
    }

    this.setAttribute('tasks', JSON.stringify(tasks));
    if (this.store) {
      console.log('[vue-timelines] Committing tasks to store');
      this.store.commit('api/setTasks', tasks);
      console.log('[vue-timelines] Store state after commit:', this.store.state.api.tasks.length, 'tasks');
    } else {
      console.warn('[vue-timelines] Store not available when setTasks called');
    }
  }

  setTitle(title) {
    console.log('[vue-timelines] setTitle called:', title);
    this.setAttribute('title', title);
    if (this.store) {
      this.store.commit('api/setTitle', title);
    }
  }

  setDraggingEnabled(enabled) {
    console.log('[vue-timelines] setDraggingEnabled called:', enabled);
    this.setAttribute('dragging-enabled', enabled ? 'true' : 'false');
    if (this.store) {
      this.store.commit('setConfig', { key: 'TASK_DRAGGING_ENABLED', value: enabled });
    }
  }

  setConstrainedToGroup(constrained) {
    console.log('[vue-timelines] setConstrainedToGroup called:', constrained);
    this.setAttribute('constrained-to-group', constrained ? 'true' : 'false');
    if (this.store) {
      this.store.commit('setConfig', { key: 'TASK_CONSTRAINED_TO_GROUP', value: constrained });
    }
  }

  setTaskEditCallback(callback) {
    console.log('[vue-timelines] setTaskEditCallback called');
    if (callback && typeof callback !== 'function') {
      console.warn('[vue-timelines] setTaskEditCallback: callback must be a function');
      return;
    }
    if (this.store) {
      this.store.commit('setConfig', { key: 'TASK_EDIT_CALLBACK', value: callback });
      console.log('[vue-timelines] Task edit callback set');
    }
  }

  updateTask(task) {
    console.log('[vue-timelines] updateTask called:', task);
    if (this.store) {
      // Update the task in the store, which will trigger the task-updated event
      // Use dispatch to go through the API service, which will also update local state
      this.store.dispatch('api/updateTask', task)
        .then(() => {
          console.log('[vue-timelines] Task updated successfully');
        })
        .catch((error) => {
          console.error('[vue-timelines] Error updating task:', error);
          // The action already updates local state even if API fails
        });
    }
  }

  setGroupCreateEnabled(enabled) {
    console.log('[vue-timelines] setGroupCreateEnabled called:', enabled);
    this.setAttribute('group-create-enabled', enabled ? 'true' : 'false');
    if (this.store) {
      this.store.commit('setConfig', { key: 'GROUP_CREATE_ENABLED', value: enabled });
    }
  }

  setGroupEditEnabled(enabled) {
    console.log('[vue-timelines] setGroupEditEnabled called:', enabled);
    this.setAttribute('group-edit-enabled', enabled ? 'true' : 'false');
    if (this.store) {
      this.store.commit('setConfig', { key: 'GROUP_EDIT_ENABLED', value: enabled });
    }
  }

  setRowAddRemoveEnabled(enabled) {
    console.log('[vue-timelines] setRowAddRemoveEnabled called:', enabled);
    this.setAttribute('row-add-remove-enabled', enabled ? 'true' : 'false');
    if (this.store) {
      this.store.commit('setConfig', { key: 'ROW_ADD_REMOVE_ENABLED', value: enabled });
    }
  }

  setStatusColors(statusColors) {
    console.log('[vue-timelines] setStatusColors called:', statusColors);
    if (!statusColors || typeof statusColors !== 'object') {
      console.warn('[vue-timelines] setStatusColors: statusColors must be an object');
      return;
    }
    if (this.store) {
      this.store.commit('setConfig', { key: 'STATUS_COLORS', value: statusColors });
      console.log('[vue-timelines] Status colors set');
    }
  }

  setDebugEnabled(enabled) {
    console.log('[vue-timelines] setDebugEnabled called:', enabled);
    this.setAttribute('debug-enabled', enabled ? 'true' : 'false');
    if (this.store) {
      this.store.commit('setDebug', enabled);
      console.log('[vue-timelines] Debug mode set:', enabled);
    }
  }
}

// Register the custom element
export function register() {
  console.log('[vue-timelines] register() called');
  if (!customElements.get('vue-timeline')) {
    console.log('[vue-timelines] Registering vue-timeline custom element...');
    customElements.define('vue-timeline', VueTimelineElement);
    console.log('[vue-timelines] ✅ vue-timeline custom element registered successfully!');
  } else {
    console.log('[vue-timelines] vue-timeline custom element already registered');
  }
}

// Auto-register if in browser
if (typeof window !== 'undefined') {
  console.log('[vue-timelines] Browser environment detected');

  // Delay registration slightly to ensure all imports are resolved
  // This helps avoid race conditions with Vue initialization
  const registerWithDelay = () => {
    try {
      console.log('[vue-timelines] Attempting to register custom element...');

      // Double-check Vue is available before registering
      if (typeof createApp === 'undefined') {
        console.error('[vue-timelines] ERROR: createApp still undefined, cannot register!');
        console.error('[vue-timelines] This suggests Vue was not properly bundled.');
        return;
      }

      register();
      console.log('[vue-timelines] ✅ Web component initialization complete');
    } catch (error) {
      console.error('[vue-timelines] ❌ ERROR during registration:', error);
      console.error('[vue-timelines] Error stack:', error.stack);
    }
  };

  // Use requestAnimationFrame to ensure DOM is ready
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(() => {
      setTimeout(registerWithDelay, 0);
    });
  } else {
    setTimeout(registerWithDelay, 100);
  }
} else {
  console.log('[vue-timelines] Not in browser environment, skipping auto-registration');
}

export default VueTimelineElement;
