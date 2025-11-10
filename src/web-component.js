import { createApp } from 'vue';
import MyTimeline from './MyTimeline.vue';
import { createTimelineStore } from './store/store';
import { NoopApiService, DefaultApiService } from './services';

// Import styles - these will be bundled by rollup
import 'bootstrap/dist/css/bootstrap.min.css';

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
    this.app = null;
    this.shadowRoot = null;
  }

  static get observedAttributes() {
    return ['height', 'groups', 'tasks', 'title', 'api-base-url', 'api-token'];
  }

  connectedCallback() {
    // Create shadow DOM (optional - can use light DOM too)
    // Using light DOM for better Vue compatibility
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    // Get API service configuration from attributes
    const apiService = this.createApiService();

    // Create Vue app instance
    this.app = createApp(MyTimeline);

    // Create store with API service
    const store = createTimelineStore(apiService);
    this.app.use(store);

    // Get props from attributes
    const props = this.getPropsFromAttributes();

    // Initialize store with data from attributes
    if (props.groups && props.groups.length > 0) {
      store.commit('api/setGroups', props.groups);
    }
    if (props.tasks && props.tasks.length > 0) {
      store.commit('api/setTasks', props.tasks);
    }
    if (props.title) {
      store.commit('api/setTitle', props.title);
    }

    // Store reference for later use
    this.store = store;

    // Setup event listeners after store is created
    this.setupEventListeners();

    // Create a container for Vue
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';

    // Use shadow DOM or light DOM
    const mountPoint = this.shadowRoot || this;
    mountPoint.appendChild(container);

    // Mount Vue app
    this.app.mount(container);
  }

  disconnectedCallback() {
    if (this.app) {
      this.app.unmount();
      this.app = null;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.app || oldValue === newValue) return;

    const props = this.getPropsFromAttributes();

    switch (name) {
      case 'groups':
        if (props.groups) {
          store.commit('api/setGroups', props.groups);
        }
        break;
      case 'tasks':
        if (props.tasks) {
          store.commit('api/setTasks', props.tasks);
        }
        break;
      case 'title':
        if (props.title) {
          store.commit('api/setTitle', props.title);
        }
        break;
      case 'height':
        // Height is passed as prop to MyTimeline
        if (this.app && this.app._instance) {
          this.app._instance.props.height = props.height;
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
      this.store.subscribe((mutation, state) => {
        // Emit custom events for important state changes
        if (mutation.type === 'api/updateTask') {
          this.dispatchEvent(new CustomEvent('task-updated', {
            detail: mutation.payload,
            bubbles: true,
            composed: true
          }));
        }
      });
    }
  }

  // Public API methods
  setGroups(groups) {
    this.setAttribute('groups', JSON.stringify(groups));
    if (this.store) {
      this.store.commit('api/setGroups', groups);
    }
  }

  setTasks(tasks) {
    this.setAttribute('tasks', JSON.stringify(tasks));
    if (this.store) {
      this.store.commit('api/setTasks', tasks);
    }
  }

  setTitle(title) {
    this.setAttribute('title', title);
    if (this.store) {
      this.store.commit('api/setTitle', title);
    }
  }
}

// Register the custom element
export function register() {
  if (!customElements.get('vue-timeline')) {
    customElements.define('vue-timeline', VueTimelineElement);
  }
}

// Auto-register if in browser
if (typeof window !== 'undefined') {
  register();
}

export default VueTimelineElement;
