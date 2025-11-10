/**
 * API Service Interface
 *
 * Abstract interface for API communication. Implement this interface to provide
 * custom API integration (REST, GraphQL, Firebase, etc.)
 */
export class ApiService {
  /**
   * Create a new timeline
   * @param {Object} timeline - Timeline object with properties: title, start_date, end_date, state
   * @returns {Promise<Object>} Promise resolving to timeline data with event object
   */
  async createTimeline(timeline) {
    throw new Error('createTimeline must be implemented by API service');
  }

  /**
   * Update an existing task
   * @param {Object} task - Task object with id, title, creationDate, dueDate, progress, etc.
   * @returns {Promise<Object>} Promise resolving to updated task data
   */
  async updateTask(task) {
    throw new Error('updateTask must be implemented by API service');
  }

  /**
   * Create a new group
   * @param {Object} group - Group object with name, gallery_id, etc.
   * @returns {Promise<Object>} Promise resolving to created group data with event object
   */
  async createGroup(group) {
    throw new Error('createGroup must be implemented by API service');
  }

  /**
   * Fetch timeline by ID
   * @param {string|number} id - Timeline ID
   * @returns {Promise<Object>} Promise resolving to timeline data with event object
   */
  async fetchTimeline(id) {
    throw new Error('fetchTimeline must be implemented by API service');
  }

  /**
   * Update an existing group
   * @param {Object} group - Group object with id and updated properties
   * @returns {Promise<Object>} Promise resolving to updated group data
   */
  async updateGroup(group) {
    throw new Error('updateGroup must be implemented by API service');
  }

  /**
   * Delete a task
   * @param {string|number} taskId - Task ID
   * @returns {Promise<void>} Promise resolving when task is deleted
   */
  async deleteTask(taskId) {
    throw new Error('deleteTask must be implemented by API service');
  }

  /**
   * Delete a group
   * @param {string|number} groupId - Group ID
   * @returns {Promise<void>} Promise resolving when group is deleted
   */
  async deleteGroup(groupId) {
    throw new Error('deleteGroup must be implemented by API service');
  }
}

