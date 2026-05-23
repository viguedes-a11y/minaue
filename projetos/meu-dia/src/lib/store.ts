'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import { Project, Task, Subtask, TaskPriority, TaskStatus, TimeBlock, WeekTask } from './types'
import { SEED_PROJECTS } from './seedData'
import { supabase } from './supabase'

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ── Conversão DB ↔ App ────────────────────────────────────────────────────
function toDbTimeBlock(b: TimeBlock) {
  return {
    id: b.id, title: b.title, color: b.color, type: b.type,
    project_id: b.projectId ?? null,
    days: JSON.stringify(b.days),   // stored as jsonb
    start_minutes: b.startMinutes, end_minutes: b.endMinutes,
    created_at: b.createdAt, updated_at: new Date().toISOString(),
  }
}

function fromDbTimeBlock(row: Record<string, unknown>): TimeBlock {
  const rawDays = row.days
  const days: number[] = Array.isArray(rawDays)
    ? rawDays as number[]
    : typeof rawDays === 'string' ? JSON.parse(rawDays) : []
  return {
    id: row.id as string, title: row.title as string, color: row.color as string,
    type: row.type as 'fixed' | 'thematic',
    projectId: (row.project_id as string | null) ?? undefined,
    days,
    startMinutes: row.start_minutes as number, endMinutes: row.end_minutes as number,
    createdAt: row.created_at as string, updatedAt: row.updated_at as string,
  }
}

function toDbWeekTask(wt: WeekTask) {
  return {
    id: wt.id, task_id: wt.taskId, day_of_week: wt.dayOfWeek,
    time_block_id: wt.timeBlockId ?? null, week_of: wt.weekOf,
  }
}

function fromDbWeekTask(row: Record<string, unknown>): WeekTask {
  return {
    id: row.id as string, taskId: row.task_id as string,
    dayOfWeek: row.day_of_week as number,
    timeBlockId: (row.time_block_id as string | null) ?? undefined,
    weekOf: row.week_of as string,
  }
}

function toDbProject(p: Project) {
  return {
    id: p.id, name: p.name, color: p.color, status: p.status,
    parent_id: p.parentId ?? null, order_index: p.order,
    deadline: p.deadline ?? null, emoji: p.emoji ?? null,
    created_at: p.createdAt, updated_at: new Date().toISOString(),
  }
}

function fromDbProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string, name: row.name as string, color: row.color as string,
    status: row.status as Project['status'],
    parentId: (row.parent_id as string | null) ?? undefined,
    order: row.order_index as number,
    deadline: (row.deadline as string | null) ?? undefined,
    emoji: (row.emoji as string | null) ?? undefined,
    createdAt: row.created_at as string, updatedAt: row.updated_at as string,
  }
}

function toDbTask(t: Task) {
  return {
    id: t.id, project_id: t.projectId, title: t.title,
    description: t.description ?? null,
    estimated_minutes: t.estimatedMinutes ?? null,
    time_spent: t.timeSpent ?? 0,
    priority: t.priority, status: t.status,
    deadline: t.deadline ?? null, recurrence: t.recurrence,
    subtasks: t.subtasks,
    created_at: t.createdAt, updated_at: new Date().toISOString(),
  }
}

function fromDbTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string, projectId: row.project_id as string,
    title: row.title as string,
    description: (row.description as string | null) ?? undefined,
    estimatedMinutes: (row.estimated_minutes as number | null) ?? undefined,
    timeSpent: (row.time_spent as number) ?? 0,
    priority: row.priority as Task['priority'], status: row.status as Task['status'],
    deadline: (row.deadline as string | null) ?? undefined,
    recurrence: row.recurrence as Task['recurrence'],
    subtasks: (row.subtasks as Subtask[]) ?? [],
    createdAt: row.created_at as string, updatedAt: row.updated_at as string,
  }
}

// ── State interface ───────────────────────────────────────────────────────
interface AppState {
  projects: Project[]
  tasks: Task[]
  timeBlocks: TimeBlock[]
  weekTasks: WeekTask[]
  isLoaded: boolean

  // Supabase
  loadFromSupabase: () => Promise<void>

  // Projects
  addProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project
  updateProject: (id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>) => void
  deleteProject: (id: string) => void

  // Tasks
  addTask: (data: Omit<Task, 'id' | 'subtasks' | 'createdAt' | 'updatedAt'>, subtaskTitles?: string[]) => Task
  updateTask: (id: string, data: Partial<Omit<Task, 'id' | 'createdAt'>>) => void
  deleteTask: (id: string) => void
  toggleTaskStatus: (id: string) => void
  cyclePriority: (id: string) => void
  addTimeSpent: (taskId: string, seconds: number) => void

  // Subtasks
  addSubtask: (taskId: string, title: string) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  deleteSubtask: (taskId: string, subtaskId: string) => void

  // Time blocks (blocos recorrentes da semana)
  addTimeBlock: (data: Omit<TimeBlock, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTimeBlock: (id: string, data: Partial<Omit<TimeBlock, 'id' | 'createdAt'>>) => void
  deleteTimeBlock: (id: string) => void

  // Week tasks (tarefas planejadas para uma semana)
  addWeekTask: (data: Omit<WeekTask, 'id'>) => void
  removeWeekTask: (id: string) => void
  moveWeekTask: (id: string, dayOfWeek: number, timeBlockId?: string) => void
}

const PRIORITY_CYCLE: TaskPriority[] = ['alta', 'media', 'baixa', 'nenhuma']

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: SEED_PROJECTS,
      tasks: [],
      timeBlocks: [],
      weekTasks: [],
      isLoaded: false,

      // ── Supabase sync ────────────────────────────────────────────
      loadFromSupabase: async () => {
        const [
          { data: dbProjects, error: pe },
          { data: dbTasks, error: te },
          { data: dbBlocks, error: be },
          { data: dbWeekTasks, error: we },
        ] = await Promise.all([
          supabase.from('meudia_projects').select('*'),
          supabase.from('meudia_tasks').select('*'),
          supabase.from('meudia_time_blocks').select('*'),
          supabase.from('meudia_week_tasks').select('*'),
        ])

        if (pe || te) {
          console.error('Supabase load error:', pe ?? te)
          set({ isLoaded: true })
          return
        }
        if (be) console.error('Supabase time_blocks error:', be)
        if (we) console.error('Supabase week_tasks error:', we)

        if (dbProjects && dbProjects.length > 0) {
          const { timeBlocks: localBlocks, weekTasks: localWeekTasks } = get()

          // Se Supabase não tem blocos mas localStorage tem, sobe os dados locais
          if (!be && (!dbBlocks || dbBlocks.length === 0) && localBlocks.length > 0) {
            await supabase.from('meudia_time_blocks').upsert(localBlocks.map(toDbTimeBlock))
          }
          if (!we && (!dbWeekTasks || dbWeekTasks.length === 0) && localWeekTasks.length > 0) {
            await supabase.from('meudia_week_tasks').upsert(localWeekTasks.map(toDbWeekTask))
          }

          set({
            projects: dbProjects.map(fromDbProject),
            tasks: (dbTasks ?? []).map(fromDbTask),
            timeBlocks: (!be && dbBlocks && dbBlocks.length > 0) ? dbBlocks.map(fromDbTimeBlock) : localBlocks,
            weekTasks: (!we && dbWeekTasks && dbWeekTasks.length > 0) ? dbWeekTasks.map(fromDbWeekTask) : localWeekTasks,
            isLoaded: true,
          })
        } else {
          const { projects, tasks, timeBlocks, weekTasks } = get()
          await supabase.from('meudia_projects').upsert(projects.map(toDbProject))
          if (tasks.length > 0) {
            await supabase.from('meudia_tasks').upsert(tasks.map(toDbTask))
          }
          if (timeBlocks.length > 0) {
            await supabase.from('meudia_time_blocks').upsert(timeBlocks.map(toDbTimeBlock))
          }
          if (weekTasks.length > 0) {
            await supabase.from('meudia_week_tasks').upsert(weekTasks.map(toDbWeekTask))
          }
          set({ isLoaded: true })
        }
      },

      // ── Projects ─────────────────────────────────────────────────
      addProject: (data) => {
        const now = new Date().toISOString()
        const project: Project = { ...data, id: generateId(), createdAt: now, updatedAt: now }
        set((s) => ({ projects: [...s.projects, project] }))
        supabase.from('meudia_projects').insert(toDbProject(project)).then(({ error }) => {
          if (error) console.error('Supabase addProject error:', error)
        })
        return project
      },

      updateProject: (id, data) => {
        const now = new Date().toISOString()
        set((s) => ({
          projects: s.projects.map((p) => p.id === id ? { ...p, ...data, updatedAt: now } : p),
        }))
        const updated = get().projects.find((p) => p.id === id)
        if (updated) {
          supabase.from('meudia_projects').update(toDbProject(updated)).eq('id', id).then(({ error }) => {
            if (error) console.error('Supabase updateProject error:', error)
          })
        }
      },

      deleteProject: (id) => {
        const allIds = [id, ...get().projects.filter((p) => p.parentId === id).map((p) => p.id)]
        set((s) => ({
          projects: s.projects.filter((p) => !allIds.includes(p.id)),
          tasks: s.tasks.filter((t) => !allIds.includes(t.projectId)),
        }))
        supabase.from('meudia_tasks').delete().in('project_id', allIds).then(() =>
          supabase.from('meudia_projects').delete().in('id', allIds).then(({ error }) => {
            if (error) console.error('Supabase deleteProject error:', error)
          })
        )
      },

      // ── Tasks ─────────────────────────────────────────────────────
      addTask: (data, subtaskTitles = []) => {
        const now = new Date().toISOString()
        const id = generateId()
        const subtasks: Subtask[] = subtaskTitles
          .filter((t) => t.trim())
          .map((title) => ({ id: generateId(), taskId: id, title: title.trim(), completed: false, createdAt: now }))
        const task: Task = { ...data, id, subtasks, createdAt: now, updatedAt: now }
        set((s) => ({ tasks: [...s.tasks, task] }))
        supabase.from('meudia_tasks').insert(toDbTask(task)).then(({ error }) => {
          if (error) console.error('Supabase addTask error:', error)
        })
        return task
      },

      updateTask: (id, data) => {
        const now = new Date().toISOString()
        set((s) => ({
          tasks: s.tasks.map((t) => t.id === id ? { ...t, ...data, updatedAt: now } : t),
        }))
        const updated = get().tasks.find((t) => t.id === id)
        if (updated) {
          supabase.from('meudia_tasks').update(toDbTask(updated)).eq('id', id).then(({ error }) => {
            if (error) console.error('Supabase updateTask error:', error)
          })
        }
      },

      deleteTask: (id) => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
        supabase.from('meudia_tasks').delete().eq('id', id).then(({ error }) => {
          if (error) console.error('Supabase deleteTask error:', error)
        })
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

      addTimeSpent: (taskId, seconds) => {
        const task = get().tasks.find((t) => t.id === taskId)
        if (!task) return
        get().updateTask(taskId, { timeSpent: (task.timeSpent ?? 0) + seconds })
      },

      // ── Subtasks ──────────────────────────────────────────────────
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
        const updated = get().tasks.find((t) => t.id === taskId)
        if (updated) {
          supabase.from('meudia_tasks').update({ subtasks: updated.subtasks }).eq('id', taskId)
            .then(({ error }) => { if (error) console.error('Supabase addSubtask error:', error) })
        }
      },

      toggleSubtask: (taskId, subtaskId) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? { ...t, subtasks: t.subtasks.map((st) => st.id === subtaskId ? { ...st, completed: !st.completed } : st) }
              : t
          ),
        }))
        const updated = get().tasks.find((t) => t.id === taskId)
        if (updated) {
          supabase.from('meudia_tasks').update({ subtasks: updated.subtasks }).eq('id', taskId)
            .then(({ error }) => { if (error) console.error('Supabase toggleSubtask error:', error) })
        }
      },

      deleteSubtask: (taskId, subtaskId) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, subtasks: t.subtasks.filter((st) => st.id !== subtaskId) } : t
          ),
        }))
        const updated = get().tasks.find((t) => t.id === taskId)
        if (updated) {
          supabase.from('meudia_tasks').update({ subtasks: updated.subtasks }).eq('id', taskId)
            .then(({ error }) => { if (error) console.error('Supabase deleteSubtask error:', error) })
        }
      },

      // ── Time blocks ───────────────────────────────────────────────
      addTimeBlock: (data) => {
        const now = new Date().toISOString()
        const block: TimeBlock = { ...data, id: generateId(), createdAt: now, updatedAt: now }
        set((s) => ({ timeBlocks: [...s.timeBlocks, block] }))
        supabase.from('meudia_time_blocks').insert(toDbTimeBlock(block)).then(({ error }) => {
          if (error) console.error('Supabase addTimeBlock error:', error)
        })
      },

      updateTimeBlock: (id, data) => {
        const now = new Date().toISOString()
        set((s) => ({
          timeBlocks: s.timeBlocks.map((b) => b.id === id ? { ...b, ...data, updatedAt: now } : b),
        }))
        const updated = get().timeBlocks.find((b) => b.id === id)
        if (updated) {
          supabase.from('meudia_time_blocks').update(toDbTimeBlock(updated)).eq('id', id).then(({ error }) => {
            if (error) console.error('Supabase updateTimeBlock error:', error)
          })
        }
      },

      deleteTimeBlock: (id) => {
        set((s) => ({
          timeBlocks: s.timeBlocks.filter((b) => b.id !== id),
          weekTasks: s.weekTasks.map((wt) => wt.timeBlockId === id ? { ...wt, timeBlockId: undefined } : wt),
        }))
        supabase.from('meudia_time_blocks').delete().eq('id', id).then(({ error }) => {
          if (error) console.error('Supabase deleteTimeBlock error:', error)
        })
      },

      // ── Week tasks ────────────────────────────────────────────────
      addWeekTask: (data) => {
        const wt: WeekTask = { ...data, id: generateId() }
        set((s) => ({ weekTasks: [...s.weekTasks, wt] }))
        supabase.from('meudia_week_tasks').insert(toDbWeekTask(wt)).then(({ error }) => {
          if (error) console.error('Supabase addWeekTask error:', error)
        })
      },

      removeWeekTask: (id) => {
        set((s) => ({ weekTasks: s.weekTasks.filter((wt) => wt.id !== id) }))
        supabase.from('meudia_week_tasks').delete().eq('id', id).then(({ error }) => {
          if (error) console.error('Supabase removeWeekTask error:', error)
        })
      },

      moveWeekTask: (id, dayOfWeek, timeBlockId) => {
        set((s) => ({
          weekTasks: s.weekTasks.map((wt) =>
            wt.id === id ? { ...wt, dayOfWeek, timeBlockId } : wt
          ),
        }))
        supabase.from('meudia_week_tasks').update({ day_of_week: dayOfWeek, time_block_id: timeBlockId ?? null }).eq('id', id).then(({ error }) => {
          if (error) console.error('Supabase moveWeekTask error:', error)
        })
      },
    }),
    { name: 'meu-dia-v4' }
  )
)

// ── Hooks helpers ─────────────────────────────────────────────────────────
export function useRootProjects() {
  return useStore(
    useShallow((s) => s.projects.filter((p) => !p.parentId).sort((a, b) => a.order - b.order))
  )
}

export function useSubProjects(parentId: string) {
  return useStore(
    useShallow((s) => s.projects.filter((p) => p.parentId === parentId).sort((a, b) => a.order - b.order))
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
