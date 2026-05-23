'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { TaskList } from '@/components/tarefas/TaskList'
import { TaskForm } from '@/components/tarefas/TaskForm'
import { ProjectForm } from '@/components/projetos/ProjectForm'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Task, Project, STATUS_LABELS } from '@/lib/types'
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const project = useStore((s) => s.projects.find((p) => p.id === id))
  const tasks = useStore(useShallow((s) => s.tasks.filter((t) => t.projectId === id)))
  const totalTasks = tasks.length
  const doneTasks = tasks.filter((t) => t.status === 'concluida').length
  const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100)
  const { addTask, updateProject, deleteProject } = useStore()

  const [addingTask, setAddingTask] = useState(false)
  const [editingProject, setEditingProject] = useState(false)

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400">Projeto não encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/projetos')}>
          Voltar
        </Button>
      </div>
    )
  }

  function handleAddTask(data: Omit<Task, 'id' | 'subtasks' | 'createdAt' | 'updatedAt'>) {
    addTask(data)
    setAddingTask(false)
  }

  function handleEditProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) {
    updateProject(id, data)
    setEditingProject(false)
  }

  function handleDelete() {
    if (!confirm(`Deletar "${project!.name}" e todas as tarefas?`)) return
    deleteProject(id)
    router.push('/projetos')
  }

  const pendingCount = tasks.filter((t) => t.status !== 'concluida').length

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Back */}
      <button
        onClick={() => router.push('/projetos')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={16} />
        Projetos
      </button>

      {/* Project header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditingProject(true)}
              className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="secondary">{STATUS_LABELS[project.status]}</Badge>
          {project.deadline && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <CalendarDays size={13} />
              {format(parseISO(project.deadline), "dd 'de' MMMM", { locale: ptBR })}
            </span>
          )}
          <span className="text-xs text-gray-500">
            {pendingCount} tarefa{pendingCount !== 1 ? 's' : ''} pendente{pendingCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Progresso geral</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Tarefas</h2>
          <Button onClick={() => setAddingTask(true)} size="sm" className="gap-1.5">
            <Plus size={15} />
            Adicionar
          </Button>
        </div>

        <TaskList tasks={tasks} />
      </div>

      {/* Add task sheet (bottom sheet on mobile) */}
      <Sheet open={addingTask} onOpenChange={setAddingTask}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nova tarefa</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <TaskForm
              projectId={id}
              onSave={handleAddTask}
              onCancel={() => setAddingTask(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit project dialog */}
      <Dialog open={editingProject} onOpenChange={setEditingProject}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar projeto</DialogTitle>
          </DialogHeader>
          <ProjectForm
            initial={project}
            onSave={handleEditProject}
            onCancel={() => setEditingProject(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
