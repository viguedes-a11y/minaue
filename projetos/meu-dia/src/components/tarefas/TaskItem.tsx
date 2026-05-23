'use client'

import { useState } from 'react'
import { Task, PRIORITY_LABELS, PRIORITY_COLORS, RECURRENCE_LABELS } from '@/lib/types'
import { useStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SubtaskList } from './SubtaskList'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TaskForm } from './TaskForm'
import { format, isPast, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ChevronDown,
  ChevronRight,
  Circle,
  CheckCircle2,
  Clock,
  CalendarDays,
  Pencil,
  Trash2,
  Repeat,
  Timer,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  task: Task
}

const STATUS_ICON = {
  pendente: Circle,
  em_andamento: Clock,
  concluida: CheckCircle2,
}

const STATUS_COLOR = {
  pendente: 'text-gray-400',
  em_andamento: 'text-blue-500',
  concluida: 'text-green-500',
}

export function TaskItem({ task }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const { toggleTaskStatus, cyclePriority, updateTask, deleteTask } = useStore()

  const StatusIcon = STATUS_ICON[task.status]
  const deadlinePast = task.deadline && task.status !== 'concluida' && isPast(parseISO(task.deadline))

  function handleEdit(data: Omit<Task, 'id' | 'subtasks' | 'createdAt' | 'updatedAt'>) {
    updateTask(task.id, data)
    setEditing(false)
  }

  const hasSubtasks = task.subtasks.length > 0
  const doneSubtasks = task.subtasks.filter((s) => s.completed).length

  return (
    <>
      <div
        className={cn(
          'bg-white rounded-xl border border-gray-200 transition-shadow',
          task.status === 'concluida' && 'opacity-60'
        )}
      >
        {/* Main row */}
        <div className="flex items-center gap-3 p-3">
          {/* Status toggle */}
          <button
            onClick={() => toggleTaskStatus(task.id)}
            className={cn('flex-shrink-0 transition-colors', STATUS_COLOR[task.status])}
            title="Mudar status"
          >
            <StatusIcon size={20} />
          </button>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                'text-sm font-medium truncate',
                task.status === 'concluida' && 'line-through text-gray-400'
              )}
            >
              {task.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {task.estimatedMinutes && (
                <span className="flex items-center gap-0.5 text-xs text-gray-400">
                  <Timer size={11} />
                  {task.estimatedMinutes}min
                </span>
              )}
              {task.deadline && (
                <span
                  className={cn(
                    'flex items-center gap-0.5 text-xs',
                    deadlinePast ? 'text-red-500 font-medium' : 'text-gray-400'
                  )}
                >
                  <CalendarDays size={11} />
                  {format(parseISO(task.deadline), 'dd MMM', { locale: ptBR })}
                </span>
              )}
              {task.recurrence !== 'nenhuma' && (
                <span className="flex items-center gap-0.5 text-xs text-violet-500">
                  <Repeat size={11} />
                  {RECURRENCE_LABELS[task.recurrence]}
                </span>
              )}
              {hasSubtasks && (
                <span className="text-xs text-gray-400">
                  {doneSubtasks}/{task.subtasks.length} subtarefas
                </span>
              )}
            </div>
          </div>

          {/* Priority badge — tap to cycle */}
          <button onClick={() => cyclePriority(task.id)}>
            <Badge
              variant="outline"
              className={cn('text-xs cursor-pointer', PRIORITY_COLORS[task.priority])}
            >
              {PRIORITY_LABELS[task.priority]}
            </Badge>
          </button>

          {/* Expand / actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditing(true)}
              className="text-gray-400 hover:text-gray-700 transition-colors p-1"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-400 hover:text-gray-700 transition-colors p-1"
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        </div>

        {/* Expanded: description + subtasks */}
        {expanded && (
          <div className="border-t border-gray-100 px-4 py-3 space-y-3">
            {task.description && (
              <p className="text-sm text-gray-600">{task.description}</p>
            )}
            <SubtaskList taskId={task.id} subtasks={task.subtasks} />
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar tarefa</DialogTitle>
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
