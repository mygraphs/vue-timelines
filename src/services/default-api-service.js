import { ApiService } from './api-service.js';

/**
 * Default API Service Implementation
 *
 * Uses fetch API with environment variables for configuration.
 * This is the current implementation that uses process.env.VUE_APP_API_BASE_URL
 * and process.env.VUE_APP_API_TOKEN.
 */
export class DefaultApiService extends ApiService {
  constructor(config = {}) {
    super();
    this.baseURL = config.baseURL || (typeof process !== 'undefined' && process.env?.VUE_APP_API_BASE_URL) || '';
    this.apiToken = config.apiToken || (typeof process !== 'undefined' && process.env?.VUE_APP_API_TOKEN) || '';
  }

  /**
   * Get headers for API requests
   * @private
   */
  getHeaders(json) {
    return {
      mode: 'cors',
      method: 'post',
      headers: {
        'HTTP_KEY': this.apiToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(json),
    };
  }

  /**
   * Make API request
   * @private
   */
  async apiRequest(url, json) {
    try {
      const response = await fetch(this.baseURL + url, this.getHeaders(json));
      const data = await response.json();

      if (data.status !== "success") {
        const errorMsg = data.error_msg || 'API request failed';
        console.error('API Error:', errorMsg);
        // Don't use alert in library - let consumer handle errors
        return Promise.reject(new Error(errorMsg));
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      return Promise.reject(error);
    }
  }

  async createTimeline(timeline) {
    const timelineData = {
      ...timeline,
      etype: "TIMELINE"
    };
    return this.apiRequest("/events/create", timelineData);
  }

  async updateTask(task) {
    // Assuming there's an update endpoint - adjust as needed
    return this.apiRequest("/events/update", task);
  }

  async createGroup(group) {
    const groupData = {
      ...group,
      etype: "GROUP"
    };
    return this.apiRequest("/events/create", groupData);
  }

  async fetchTimeline(id) {
    return this.apiRequest("/events/get", { id, etype: "TIMELINE" });
  }

  async updateGroup(group) {
    return this.apiRequest("/events/update", group);
  }

  async deleteTask(taskId) {
    return this.apiRequest("/events/delete", { id: taskId, etype: "TASK" });
  }

  async deleteGroup(groupId) {
    return this.apiRequest("/events/delete", { id: groupId, etype: "GROUP" });
  }
}

