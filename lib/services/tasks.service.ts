import api from '../api'

export interface Task {
  id: number
  title: string
  description: string
  task_type: 'one_time' | 'recurring' | 'daily' | 'weekly' | 'milestone'
  reward_billpoints: number
  completion_criteria: any
  icon_name?: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TaskStats {
  total_tasks: number
  total_progress_records: number
  completed_tasks: number
  claimed_tasks: number
  tasks_by_completion?: any[]
  recent_completions?: any[]
}

export interface TaskFilters {
  page?: number
  limit?: number
  is_active?: boolean
  task_type?: string
  search?: string
}

export interface TasksResponse {
  tasks: Task[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const tasksService = {
  /**
   * Get task statistics
   */
  async getStats(): Promise<TaskStats> {
    const response = await api.get('/admin/tasks/stats')
    return response.data.data
  },

  /**
   * Get all tasks
   */
  async getTasks(filters: TaskFilters = {}): Promise<TasksResponse> {
    const response = await api.get('/admin/tasks', { params: filters })
    return response.data.data
  },

  /**
   * Get task by ID
   */
  async getTaskById(id: number): Promise<Task> {
    const response = await api.get(`/admin/tasks/${id}`)
    return response.data.data
  },

  /**
   * Create task
   */
  async createTask(taskData: Partial<Task>) {
    const response = await api.post('/admin/tasks', taskData)
    return response.data.data
  },

  /**
   * Update task
   */
  async updateTask(id: number, taskData: Partial<Task>) {
    const response = await api.put(`/admin/tasks/${id}`, taskData)
    return response.data.data
  },

  /**
   * Delete task
   */
  async deleteTask(id: number) {
    const response = await api.delete(`/admin/tasks/${id}`)
    return response.data
  },

  /**
   * Get task completions
   */
  async getTaskCompletions(filters: any = {}) {
    const response = await api.get('/admin/tasks/completions', { params: filters })
    return response.data.data
  },

  /**
   * Get user task progress
   */
  async getUserTaskProgress(userId: number) {
    const response = await api.get(`/admin/tasks/users/${userId}`)
    return response.data.data
  },

  /**
   * Complete task for user
   */
  async completeTaskForUser(taskId: number, userId: number) {
    const response = await api.post(`/admin/tasks/${taskId}/complete/${userId}`)
    return response.data.data
  },

  /**
   * Claim task reward for user
   */
  async claimTaskRewardForUser(taskId: number, userId: number) {
    const response = await api.post(`/admin/tasks/${taskId}/claim/${userId}`)
    return response.data.data
  },
}

