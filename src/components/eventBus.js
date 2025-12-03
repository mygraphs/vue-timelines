import { reactive } from 'vue';

const eventBus = reactive({
  events: {},

  emit(event, ...args) {
    if (!this.events[event]) {
      return;
    }
    this.events[event].forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error("[eventBus] Error in callback for event", event, ":", error);
      }
    });
  },

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  },

  off(event, callback) {
    if (!this.events[event]) return;
    const index = this.events[event].indexOf(callback);
    if (index > -1) {
      this.events[event].splice(index, 1);
    }
  }
});

export default eventBus;