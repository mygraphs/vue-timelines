import { reactive } from 'vue';

const eventBus = reactive({
  events: {},

  emit(event, ...args) {
    console.log("[eventBus] emit called for event:", event, "args:", args);
    console.log("[eventBus] Registered listeners for", event, ":", this.events[event] ? this.events[event].length : 0);
    if (!this.events[event]) {
      console.log("[eventBus] No listeners registered for event:", event);
      return;
    }
    console.log("[eventBus] Calling", this.events[event].length, "listener(s) for event:", event);
    this.events[event].forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error("[eventBus] Error in callback for event", event, ":", error);
      }
    });
  },

  on(event, callback) {
    console.log("[eventBus] on called for event:", event, "callback:", callback);
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    console.log("[eventBus] Total listeners for", event, ":", this.events[event].length);
  },

  off(event, callback) {
    console.log("[eventBus] off called for event:", event);
    if (!this.events[event]) return;
    const index = this.events[event].indexOf(callback);
    if (index > -1) {
      this.events[event].splice(index, 1);
      console.log("[eventBus] Removed listener for", event, "remaining:", this.events[event].length);
    }
  }
});

export default eventBus;