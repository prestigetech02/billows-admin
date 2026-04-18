'use client'

import { useState } from 'react'
import { Search, Filter, Plus, MoreVertical, Edit, Trash2, Eye } from 'lucide-react'
import { tasksService, Task, TaskFilters } from '@/lib/services/tasks.service'
import { useTasks, useTaskStats, useTaskById, useCreateTask, useUpdateTask, useDeleteTask } from '@/lib/hooks/useTasks'
import { TableSkeleton } from '@/components/ui/Skeleton'
import TaskTable from '@/components/tasks/TaskTable'
import TaskFiltersPanel from '@/components/tasks/TaskFiltersPanel'
import TaskFormModal from '@/components/tasks/TaskFormModal'
import TaskDetailModal from '@/components/tasks/TaskDetailModal'
import { useToast } from '@/lib/hooks/useToast'

export default function TasksPage() {
  const { showSuccess, showError } = useToast()
  const [filters, setFilters] = useState<TaskFilters>({
    page: 1,
    limit: 20
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [actionMenuTask, setActionMenuTask] = useState<{ task: Task; anchor: HTMLElement } | null>(null)

  // React Query hooks
  const { data: tasksData, isLoading, isFetching } = useTasks(filters)
  const { data: statsData } = useTaskStats()
  const { data: taskDetail } = useTaskById(selectedTaskId)
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()

  const tasks = tasksData?.tasks || []
  const pagination = tasksData?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
  const stats = statsData || {
    total_tasks: 0,
    total_progress_records: 0,
    completed_tasks: 0,
    claimed_tasks: 0,
  }

  const handleSearch = (search: string) => {
    setFilters(prev => ({
      ...prev,
      search: search || undefined,
      page: 1
    }))
  }

  const handleFilterChange = (newFilters: Partial<TaskFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }))
    setShowFilters(false)
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      await createTaskMutation.mutateAsync(taskData)
      setShowCreateModal(false)
    } catch (error: any) {
      // Error handled by mutation
    }
  }

  const handleUpdateTask = async (taskData: Partial<Task>) => {
    if (!editingTask) return
    try {
      await updateTaskMutation.mutateAsync({ id: editingTask.id, data: taskData })
      setEditingTask(null)
    } catch (error: any) {
      // Error handled by mutation
    }
  }

  const handleDeleteTask = async (task: Task) => {
    if (!confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      return
    }
    try {
      await deleteTaskMutation.mutateAsync(task.id)
      setActionMenuTask(null)
    } catch (error: any) {
      // Error handled by mutation
    }
  }

  const handleViewTask = (task: Task) => {
    setSelectedTaskId(task.id)
    setShowDetailModal(true)
  }

  const handleTaskAction = (action: string, task: Task) => {
    switch (action) {
      case 'view':
        handleViewTask(task)
        setActionMenuTask(null)
        break
      case 'edit':
        setEditingTask(task)
        setActionMenuTask(null)
        break
      case 'delete':
        handleDeleteTask(task)
        break
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks & Rewards</h1>
          <p className="text-gray-600 mt-1">Manage tasks and rewards for users</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              showFilters
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Total Tasks</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{stats.total_tasks.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Total Progress Records</div>
          <div className="text-2xl font-bold text-blue-600 mt-2">{stats.total_progress_records.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Completed Tasks</div>
          <div className="text-2xl font-bold text-green-600 mt-2">{stats.completed_tasks.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Claimed Rewards</div>
          <div className="text-2xl font-bold text-purple-600 mt-2">{stats.claimed_tasks.toLocaleString()}</div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <TaskFiltersPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or description..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tasks Table */}
      {isLoading && tasks.length === 0 ? (
        <TableSkeleton />
      ) : (
        <TaskTable
          tasks={tasks}
          loading={isFetching}
          pagination={pagination}
          onPageChange={handlePageChange}
          onViewTask={handleViewTask}
          onEditTask={(task) => setEditingTask(task)}
          onDeleteTask={handleDeleteTask}
          onActionMenuClick={(task, anchor) => setActionMenuTask({ task, anchor })}
        />
      )}

      {/* Action Menu */}
      {actionMenuTask && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px]"
          style={{
            top: actionMenuTask.anchor.getBoundingClientRect().bottom + 5,
            left: actionMenuTask.anchor.getBoundingClientRect().left,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleTaskAction('view', actionMenuTask.task)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
          <button
            onClick={() => handleTaskAction('edit', actionMenuTask.task)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => handleTaskAction('delete', actionMenuTask.task)}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

      {/* Click outside to close action menu */}
      {actionMenuTask && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActionMenuTask(null)}
        />
      )}

      {/* Create/Edit Modal */}
      <TaskFormModal
        task={editingTask}
        isOpen={showCreateModal || !!editingTask}
        onClose={() => {
          setShowCreateModal(false)
          setEditingTask(null)
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
      />

      {/* Detail Modal */}
      {taskDetail && (
        <TaskDetailModal
          task={taskDetail}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedTaskId(null)
          }}
        />
      )}
    </div>
  )
}

