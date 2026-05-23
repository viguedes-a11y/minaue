'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { TaskList } from '@/components/tarefas/TaskList'
import { TaskForm } from '@/components/tarefas/TaskForm'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Task } from '@/lib/types'
import { ArrowLeft, Plus, Trash2, CalendarDays } from 'lucide-react'
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

      {/* ── Dark editorial header ── */}
      <div
        className="sticky top-0 z-10 px-6 pt-6 pb-6"
        style={{
          background: 'linear-gradient(135deg, #1e2a1e 0%, #282F29 60%, #1a241a 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gold orb ornament */}
        <div style={{
          position: 'absolute', top: '-30px', right: '-30px',
          width: '160px', height: '160px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(184,160,112,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Project color orb */}
        <div style={{
          position: 'absolute', bottom: '-20px', left: '40%',
          width: '120px', height: '120px', borderRadius: '50%',
          background: `radial-gradient(circle, ${project.color}18 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
        {/* Bottom line */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px',
          background: `linear-gradient(to right, ${project.color}60, rgba(184,160,112,0.3), transparent)`,
        }} />

        <div className="relative">
          {/* Voltar */}
          <button
            onClick={() => router.push('/projetos')}
            className="flex items-center gap-1.5 mb-4 transition-colors"
            style={{
              color: '#5E6E5F', fontFamily: fontSans, fontSize: '10px',
              fontWeight: 300, letterSpacing: '0.25em', textTransform: 'uppercase',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#D4BC8C')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#5E6E5F')}
          >
            <ArrowLeft size={12} />
            Projetos
          </button>

          {/* Project identity */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="flex-shrink-0 rounded-full"
                style={{
                  width: '9px', height: '9px', background: project.color,
                  boxShadow: `0 0 10px ${project.color}90`,
                }}
              />
              <div className="min-w-0">
                <h1
                  className="leading-tight truncate"
                  style={{
                    fontFamily: fontDisplay, fontStyle: 'italic',
                    fontWeight: 300, fontSize: '30px', color: '#D4BC8C',
                  }}
                >
                  {project.name}
                </h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span style={{
                    color: '#5E6E5F', fontFamily: fontSans, fontSize: '10px',
                    fontWeight: 300, letterSpacing: '0.15em', textTransform: 'uppercase',
                  }}>
                    {pending} pendente{pending !== 1 ? 's' : ''}
                  </span>
                  {project.deadline && (
                    <span
                      className="flex items-center gap-1"
                      style={{ color: '#A09888', fontFamily: fontSans, fontSize: '10px', fontWeight: 300 }}
                    >
                      <CalendarDays size={10} />
                      {format(parseISO(project.deadline), "dd 'de' MMMM", { locale: ptBR })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleDelete}
              className="p-2 rounded flex-shrink-0 transition-colors"
              style={{ color: '#5E6E5F' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#B85050')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#5E6E5F')}
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Progress bar */}
          {total > 0 && (
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between" style={{ fontFamily: fontSans }}>
                <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5E6E5F', fontWeight: 300 }}>
                  Progresso
                </span>
                <span style={{ fontSize: '11px', fontWeight: 300, color: '#D4BC8C' }}>
                  {done}/{total} · {progress}%
                </span>
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: '6px', background: 'rgba(255,255,255,0.1)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progress}%`, background: `linear-gradient(to right, ${project.color}, ${project.color}bb)` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tasks section */}
      <div className="flex-1 px-5 py-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2
            style={{ fontFamily: fontDisplay, fontWeight: 300, fontSize: '22px', color: '#282F29' }}
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

      {/* Add task dialog */}
      <Dialog open={addingTask} onOpenChange={setAddingTask}>
        <DialogContent className="max-w-md" style={{ background: '#FAF8F4' }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: fontDisplay, fontWeight: 300, fontSize: '22px', color: '#282F29' }}>
              Nova tarefa
            </DialogTitle>
          </DialogHeader>
          <TaskForm
            projectId={id}
            onSave={handleAddTask}
            onCancel={() => setAddingTask(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
