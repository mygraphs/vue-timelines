import { createApp } from 'vue';
import MyTimeline from './MyTimeline.vue';
import { createTimelineStore } from './store/store';
import { NoopApiService, DefaultApiService } from './services';

// Import styles - these will be bundled by rollup
// Note: CSS imports are handled by rollup-plugin-postcss
// Bootstrap CSS will be injected into the page when the bundle loads
import 'bootstrap/dist/css/bootstrap.min.css';

// Wrap in try-catch to catch any import errors
try {
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
    return ['height', 'groups', 'tasks', 'title', 'api-base-url', 'api-token'];
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

      // Create Vue app instance
      console.log('[vue-timelines] Creating Vue app instance...');
      this.app = createApp(MyTimeline);
      console.log('[vue-timelines] Vue app instance created');

      // Create store with API service
      console.log('[vue-timelines] Creating store...');
      const store = createTimelineStore(apiService);
      this.app.use(store);
      console.log('[vue-timelines] Store created and added to app');

      // Get props from attributes
      const props = this.getPropsFromAttributes();
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

      // Store reference for later use
      this.store = store;

      // Setup event listeners after store is created
      this.setupEventListeners();
      console.log('[vue-timelines] Event listeners setup complete');

      // Create a container for Vue
      const container = document.createElement('div');
      container.style.width = '100%';
      container.style.height = '100%';
      console.log('[vue-timelines] Container element created');

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
    console.log('[vue-timelines] setGroups called:', (groups && groups.length) || 0);
    this.setAttribute('groups', JSON.stringify(groups));
    if (this.store) {
      this.store.commit('api/setGroups', groups);
    }
  }

  setTasks(tasks) {
    console.log('[vue-timelines] setTasks called:', (tasks && tasks.length) || 0);
    this.setAttribute('tasks', JSON.stringify(tasks));
    if (this.store) {
      this.store.commit('api/setTasks', tasks);
    }
  }

  setTitle(title) {
    console.log('[vue-timelines] setTitle called:', title);
    this.setAttribute('title', title);
    if (this.store) {
      this.store.commit('api/setTitle', title);
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
