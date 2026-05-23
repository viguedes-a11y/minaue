'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import { Project, Task, Subtask, TaskPriority, TaskStatus } from './types'
import { SEED_PROJECTS } from './seedData'

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

interface AppState {
  projects: Project[]
  tasks: Task[]

  // Projects
  addProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project
  updateProject: (id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>) => void
  deleteProject: (id: string) => void

  // Tasks
  addTask: (data: Omit<Task, 'id' | 'subtasks' | 'createdAt' | 'updatedAt'>) => Task
  updateTask: (id: string, data: Partial<Omit<Task, 'id' | 'createdAt'>>) => void
  deleteTask: (id: string) => void
  toggleTaskStatus: (id: string) => void
  cyclePriority: (id: string) => void

  // Subtasks
  addSubtask: (taskId: string, title: string) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  deleteSubtask: (taskId: string, subtaskId: string) => void
}

const PRIORITY_CYCLE: TaskPriority[] = ['alta', 'media', 'baixa', 'nenhuma']

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: SEED_PROJECTS,
      tasks: [],

      addProject: (data) => {
        const now = new Date().toISOString()
        const project: Project = { ...data, id: generateId(), createdAt: now, updatedAt: now }
        set((s) => ({ projects: [...s.projects, project] }))
        return project
      },

      updateProject: (id, data) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
          ),
        }))
      },

      deleteProject: (id) => {
        // delete project, all its sub-projects, and all their tasks
        const allIds = [id, ...get().projects.filter((p) => p.parentId === id).map((p) => p.id)]
        set((s) => ({
          projects: s.projects.filter((p) => !allIds.includes(p.id)),
          tasks: s.tasks.filter((t) => !allIds.includes(t.projectId)),
        }))
      },

      addTask: (data) => {
        const now = new Date().toISOString()
        const task: Task = { ...data, id: generateId(), subtasks: [], createdAt: now, updatedAt: now }
        set((s) => ({ tasks: [...s.tasks, task] }))
        return task
      },

      updateTask: (id, data) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
          ),
        }))
      },

      deleteTask: (id) => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
      },

      toggleTaskStatus: (id) => {
        const task = get().tasks.find((t) => t.id === id)
        if (!task) return
        const next: TaskStatus =
          task.status === 'pendente' ? 'em_andamento'
          : task.status === 'em_andamento' ? 'concluida'
          : 'pendente'
        get().updateTask(id, { status: next })
      },

      cyclePriority: (id) => {
        const task = get().tasks.find((t) => t.id === id)
        if (!task) return
        const idx = PRIORITY_CYCLE.indexOf(task.priority)
        const next = PRIORITY_CYCLE[(idx + 1) % PRIORITY_CYCLE.length]
        get().updateTask(id, { priority: next })
      },

      addSubtask: (taskId, title) => {
        const subtask: Subtask = {
          id: generateId(), taskId, title, completed: false,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, subtasks: [...t.subtasks, subtask] } : t
          ),
        }))
      },

      toggleSubtask: (taskId, subtaskId) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? { ...t, subtasks: t.subtasks.map((st) => st.id === subtaskId ? { ...st, completed: !st.completed } : st) }
              : t
          ),
        }))
      },

      deleteSubtask: (taskId, subtaskId) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, subtasks: t.subtasks.filter((st) => st.id !== subtaskId) } : t
          ),
        }))
      },
    }),
    { name: 'meu-dia-v2' }
  )
)

// ── Hooks helpers ─────────────────────────────────────────────────────────────

export function useRootProjects() {
  return useStore(
    useShallow((s) =>
      s.projects
        .filter((p) => !p.parentId)
        .sort((a, b) => a.order - b.order)
    )
  )
}

export function useSubProjects(parentId: string) {
  return useStore(
    useShallow((s) =>
      s.projects
        .filter((p) => p.parentId === parentId)
        .sort((a, b) => a.order - b.order)
    )
  )
}

export function useProjectPendingCount(projectId: string) {
  return useStore((s) => s.tasks.filter((t) => t.projectId === projectId && t.status !== 'concluida').length)
}

export function useProjectProgress(projectId: string) {
  return useStore((s) => {
    const tasks = s.tasks.filter((t) => t.projectId === projectId)
    if (tasks.length === 0) return 0
    return Math.round((tasks.filter((t) => t.status === 'concluida').length / tasks.length) * 100)
  })
}
