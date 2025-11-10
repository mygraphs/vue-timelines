import { ApiService } from './api-service.js';

/**
 * No-op API Service Implementation
 *
 * A service that does nothing - useful for:
 * - Demo/static use cases
 * - Testing
 * - When API is not needed
 *
 * All methods return resolved promises with mock data or no-op.
 */
export class NoopApiService extends ApiService {
  async createTimeline(timeline) {
    console.log('[NoopApiService] createTimeline called (no-op):', timeline);
    return Promise.resolve({
      status: "success",
      event: {
        id: Date.now().toString(),
        ...timeline,
        groups: [],
        tasks: []
      }
    });
  }

  async updateTask(task) {
    console.log('[NoopApiService] updateTask called (no-op):', task);
    return Promise.resolve({
      status: "success",
      event: task
    });
  }

  async createGroup(group) {
    console.log('[NoopApiService] createGroup called (no-op):', group);
    return Promise.resolve({
      status: "success",
      event: {
        id: Date.now().toString(),
        ...group,
        name: group.name || "default group"
      }
    });
  }

  async fetchTimeline(id) {
    console.log('[NoopApiService] fetchTimeline called (no-op):', id);
    return Promise.resolve({
      status: "success",
      event: {
        id: id,
        title: "Demo Timeline",
        start_date: Math.floor(Date.now() / 1000) - 86400 * 30, // 30 days ago
        end_date: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days from now
        groups: [],
        tasks: []
      }
    });
  }

  async updateGroup(group) {
    console.log('[NoopApiService] updateGroup called (no-op):', group);
    return Promise.resolve({
      status: "success",
      event: group
    });
  }

  async deleteTask(taskId) {
    console.log('[NoopApiService] deleteTask called (no-op):', taskId);
    return Promise.resolve();
  }

  async deleteGroup(groupId) {
    console.log('[NoopApiService] deleteGroup called (no-op):', groupId);
    return Promise.resolve();
  }
}

