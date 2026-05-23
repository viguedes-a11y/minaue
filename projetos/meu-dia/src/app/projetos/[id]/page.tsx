'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { TaskList } from '@/components/tarefas/TaskList'
import { TaskForm } from '@/components/tarefas/TaskForm'
import { Progress } from '@/components/ui/progress'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Task } from '@/lib/types'
import { ArrowLeft, Plus, Pencil, Trash2, CalendarDays } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const fontDisplay = 'var(--font-cormorant), "Cormorant Garamond", serif'
const fontSans    = 'var(--font-jost), Jost, sans-serif'

export default function ProjectDetailPage() {
  const params  = useParams()
  const router  = useRouter()
  const id      = params.id as string

  const project  = useStore((s) => s.projects.find((p) => p.id === id))
  const tasks    = useStore(useShallow((s) => s.tasks.filter((t) => t.projectId === id)))
  const total    = tasks.length
  const done     = tasks.filter((t) => t.status === 'concluida').length
  const progress = total === 0 ? 0 : Math.round((done / total) * 100)
  const pending  = tasks.filter((t) => t.status !== 'concluida').length
  const { addTask, deleteProject } = useStore()

  const [addingTask, setAddingTask] = useState(false)

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p style={{ color: '#6B7A6C', fontFamily: fontSans }}>Projeto não encontrado.</p>
        <button className="btn-minaue mt-6" onClick={() => router.push('/projetos')}>
          ← Voltar
        </button>
      </div>
    )
  }

  function handleAddTask(data: Omit<Task, 'id' | 'subtasks' | 'createdAt' | 'updatedAt'>) {
    addTask(data)
    setAddingTask(false)
  }

  function handleDelete() {
    if (!confirm(`Deletar "${project!.name}" e todas as tarefas?`)) return
    deleteProject(id)
    router.push('/projetos')
  }

  return (
    <div className="max-w-xl mx-auto min-h-screen flex flex-col">

      {/* Header */}
      <div
        className="sticky top-0 z-10 px-6 pt-6 pb-5 border-b"
        style={{ background: '#EDEAE4', borderColor: '#D8D2C8' }}
      >
        {/* Voltar */}
        <button
          onClick={() => router.push('/projetos')}
          className="flex items-center gap-1.5 text-xs tracking-widest uppercase mb-5 transition-colors"
          style={{ color: '#A09888', fontFamily: fontSans, fontWeight: 300 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#282F29')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#A09888')}
        >
          <ArrowLeft size={13} />
          Projetos
        </button>

        {/* Project identity */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-1 self-stretch rounded-full flex-shrink-0"
              style={{ background: project.color, minHeight: '32px' }}
            />
            <div className="min-w-0">
              <h1
                className="text-[28px] leading-tight truncate"
                style={{ fontFamily: fontDisplay, fontWeight: 300, color: '#282F29' }}
              >
                {project.emoji && <span className="mr-2 text-[22px]">{project.emoji}</span>}
                {project.name}
              </h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span
                  className="text-[11px] tracking-[0.15em] uppercase"
                  style={{ color: '#6B7A6C', fontFamily: fontSans, fontWeight: 300 }}
                >
                  {pending} pendente{pending !== 1 ? 's' : ''}
                </span>
                {project.deadline && (
                  <span
                    className="flex items-center gap-1 text-[11px] tracking-[0.1em]"
                    style={{ color: '#A09888', fontFamily: fontSans, fontWeight: 300 }}
                  >
                    <CalendarDays size={11} />
                    {format(parseISO(project.deadline), "dd 'de' MMMM", { locale: ptBR })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handleDelete}
              className="p-2 rounded transition-colors"
              style={{ color: '#C8C4BC' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#B85050')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#C8C4BC')}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Progress */}
        {total > 0 && (
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between" style={{ fontFamily: fontSans }}>
              <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: '#A09888', fontWeight: 300 }}>
                Progresso
              </span>
              <span className="text-[11px] font-light" style={{ color: '#B8A070' }}>
                {done}/{total} · {progress}%
              </span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: '#D8D2C8' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: `linear-gradient(to right, ${project.color}, ${project.color}99)` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Linha dourada */}
      <div style={{ height: '1px', background: 'linear-gradient(to right, #B8A070, transparent)', flexShrink: 0 }} />

      {/* Tasks section */}
      <div className="flex-1 px-6 py-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2
            className="text-[22px]"
            style={{ fontFamily: fontDisplay, fontWeight: 300, color: '#282F29' }}
          >
            Tarefas
          </h2>
          <button
            onClick={() => setAddingTask(true)}
            className="btn-minaue"
            style={{ padding: '7px 18px', fontSize: '10px' }}
          >
            <Plus size={11} />
            Adicionar
          </button>
        </div>

        <TaskList tasks={tasks} projectColor={project.color} />
      </div>

      {/* Add task — sheet no mobile */}
      <Sheet open={addingTask} onOpenChange={setAddingTask}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl max-h-[90vh] overflow-y-auto"
          style={{ background: '#FAF8F4' }}
        >
          <SheetHeader>
            <SheetTitle style={{ fontFamily: fontDisplay, fontWeight: 300, fontSize: '22px', color: '#282F29' }}>
              Nova tarefa
            </SheetTitle>
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
    </div>
  )
}
