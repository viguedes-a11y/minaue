'use client'

import { useState } from 'react'
import { Task, PRIORITY_LABELS, RECURRENCE_LABELS } from '@/lib/types'
import { useStore } from '@/lib/store'
import { SubtaskList } from './SubtaskList'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { TaskForm } from './TaskForm'
import { format, isPast, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ChevronDown, ChevronRight, Circle, CheckCircle2, Clock,
  CalendarDays, Pencil, Trash2, Repeat, Timer,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  task: Task
  projectColor?: string
}

const fontSans    = 'var(--font-jost), Jost, sans-serif'
const fontDisplay = 'var(--font-cormorant), "Cormorant Garamond", serif'

const PRIORITY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  alta:   { bg: 'rgba(184,80,80,0.08)',   color: '#B85050', border: 'rgba(184,80,80,0.25)' },
  media:  { bg: 'rgba(184,160,112,0.1)',  color: '#8B7550', border: 'rgba(184,160,112,0.3)' },
  baixa:  { bg: 'rgba(94,110,95,0.08)',   color: '#4E6652', border: 'rgba(94,110,95,0.2)' },
  nenhuma:{ bg: 'transparent',            color: '#A09888', border: '#D8D2C8' },
}

const STATUS_ICON = {
  pendente:    Circle,
  em_andamento: Clock,
  concluida:   CheckCircle2,
}

const STATUS_COLOR = {
  pendente:    '#C8C4BC',
  em_andamento: '#B8A070',
  concluida:   '#4E6652',
}

export function TaskItem({ task, projectColor }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const { toggleTaskStatus, cyclePriority, updateTask, deleteTask } = useStore()

  const StatusIcon = STATUS_ICON[task.status]
  const deadlinePast = task.deadline && task.status !== 'concluida' && isPast(parseISO(task.deadline))
  const hasSubtasks = task.subtasks.length > 0
  const doneSubtasks = task.subtasks.filter((s) => s.completed).length
  const priority = PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.nenhuma
  const accent = projectColor ?? '#B8A070'

  function handleEdit(data: Omit<Task, 'id' | 'subtasks' | 'createdAt' | 'updatedAt'>) {
    updateTask(task.id, data)
    setEditing(false)
  }

  return (
    <>
      <div
        className={cn(
          'rounded-lg border transition-all',
          task.status === 'concluida' && 'opacity-55'
        )}
        style={{
          background: '#FAF8F4',
          borderColor: '#D8D2C8',
          borderLeft: `3px solid ${task.status === 'concluida' ? '#D8D2C8' : accent}`,
        }}
      >
        {/* Main row */}
        <div className="flex items-center gap-3 px-3 py-2.5">
          {/* Status toggle */}
          <button
            onClick={() => toggleTaskStatus(task.id)}
            className="flex-shrink-0 transition-colors"
            style={{ color: STATUS_COLOR[task.status] }}
            title="Mudar status"
          >
            <StatusIcon size={18} strokeWidth={1.5} />
          </button>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <p
              className={cn('text-[14px] leading-snug truncate')}
              style={{
                fontFamily: fontDisplay,
                fontWeight: 300,
                color: task.status === 'concluida' ? '#A09888' : '#282F29',
                textDecoration: task.status === 'concluida' ? 'line-through' : 'none',
              }}
            >
              {task.title}
            </p>
            <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
              {task.estimatedMinutes && (
                <span
                  className="flex items-center gap-0.5 text-[11px]"
                  style={{ color: '#A09888', fontFamily: fontSans, fontWeight: 300 }}
                >
                  <Timer size={10} />
                  {task.estimatedMinutes}min
                </span>
              )}
              {task.deadline && (
                <span
                  className="flex items-center gap-0.5 text-[11px]"
                  style={{
                    color: deadlinePast ? '#B85050' : '#A09888',
                    fontFamily: fontSans,
                    fontWeight: deadlinePast ? 400 : 300,
                  }}
                >
                  <CalendarDays size={10} />
                  {format(parseISO(task.deadline), 'dd MMM', { locale: ptBR })}
                </span>
              )}
              {task.recurrence !== 'nenhuma' && (
                <span
                  className="flex items-center gap-0.5 text-[11px]"
                  style={{ color: '#8B7550', fontFamily: fontSans, fontWeight: 300 }}
                >
                  <Repeat size={10} />
                  {RECURRENCE_LABELS[task.recurrence]}
                </span>
              )}
              {hasSubtasks && (
                <span
                  className="text-[11px]"
                  style={{ color: '#A09888', fontFamily: fontSans, fontWeight: 300 }}
                >
                  {doneSubtasks}/{task.subtasks.length} subtarefas
                </span>
              )}
            </div>
          </div>

          {/* Priority badge */}
          <button
            onClick={() => cyclePriority(task.id)}
            className="flex-shrink-0 px-2 py-0.5 rounded-sm text-[10px] tracking-[0.1em] uppercase border transition-colors"
            style={{
              background: priority.bg,
              color: priority.color,
              borderColor: priority.border,
              fontFamily: fontSans,
              fontWeight: 300,
            }}
          >
            {PRIORITY_LABELS[task.priority]}
          </button>

          {/* Actions */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded transition-colors"
              style={{ color: '#C8C4BC' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#282F29')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#C8C4BC')}
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="p-1.5 rounded transition-colors"
              style={{ color: '#C8C4BC' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#B85050')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#C8C4BC')}
            >
              <Trash2 size={13} />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded transition-colors"
              style={{ color: '#C8C4BC' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#282F29')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#C8C4BC')}
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
        </div>

        {/* Expanded: description + subtasks */}
        {expanded && (
          <div
            className="px-4 py-3 space-y-3 border-t"
            style={{ borderColor: '#E5E0D8' }}
          >
            {task.description && (
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: '#6B7A6C', fontFamily: fontSans, fontWeight: 300 }}
              >
                {task.description}
              </p>
            )}
            <SubtaskList taskId={task.id} subtasks={task.subtasks} />
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-md" style={{ background: '#FAF8F4' }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '22px', color: '#282F29' }}>
              Editar tarefa
            </DialogTitle>
          </DialogHeader>
          <TaskForm
            projectId={task.projectId}
            initial={task}
            onSave={handleEdit}
            onCancel={() => setEditing(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
