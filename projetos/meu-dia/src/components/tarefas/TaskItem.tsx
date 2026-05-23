'use client'

import { useState, useEffect } from 'react'
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
  ChevronDown, ChevronRight, Check, Minus,
  CalendarDays, Pencil, Trash2, Repeat, Timer,
  Play, Square,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  task: Task
  projectColor?: string
}

const fontSans    = 'var(--font-jost), Jost, sans-serif'
const fontDisplay = 'var(--font-cormorant), "Cormorant Garamond", serif'

const STATUS_CFG = {
  pendente:     { border: '#C8C4BC', bg: 'transparent',              inner: null },
  em_andamento: { border: '#B8A070', bg: 'rgba(184,160,112,0.1)',    inner: <Minus size={10} color="#B8A070" strokeWidth={2.5} /> },
  concluida:    { border: '#4E6652', bg: '#4E6652',                  inner: <Check size={11} color="#FAF8F4" strokeWidth={2.5} /> },
} as const

const PRIORITY_CFG: Record<string, { bg: string; color: string; dot: string }> = {
  alta:    { bg: 'rgba(184,80,80,0.09)',   color: '#B85050', dot: '#B85050' },
  media:   { bg: 'rgba(184,160,112,0.12)', color: '#8B7550', dot: '#B8A070' },
  baixa:   { bg: 'rgba(78,102,82,0.09)',   color: '#3D5040', dot: '#4E6652' },
  nenhuma: { bg: 'transparent',            color: '#A09888', dot: '#C8C4BC' },
}

function formatSeconds(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  if (h > 0) return `${h}h${m.toString().padStart(2, '0')}m`
  return `${m.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`
}

export function TaskItem({ task, projectColor }: Props) {
  const [expanded, setExpanded]       = useState(false)
  const [editing, setEditing]         = useState(false)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSecs, setTimerSecs]     = useState(0)

  const { toggleTaskStatus, cyclePriority, updateTask, deleteTask, addTimeSpent } = useStore()

  const statusCfg   = STATUS_CFG[task.status]
  const priorityCfg = PRIORITY_CFG[task.priority] ?? PRIORITY_CFG.nenhuma
  const accent      = projectColor ?? '#B8A070'
  const deadlinePast = task.deadline && task.status !== 'concluida' && isPast(parseISO(task.deadline))
  const hasSubtasks  = task.subtasks.length > 0
  const doneSubtasks = task.subtasks.filter((s) => s.completed).length
  const totalSpent   = (task.timeSpent ?? 0) + timerSecs

  // Timer tick
  useEffect(() => {
    if (!timerRunning) return
    const id = setInterval(() => setTimerSecs((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [timerRunning])

  function handlePlayStop() {
    if (timerRunning) {
      addTimeSpent(task.id, timerSecs)
      setTimerSecs(0)
      setTimerRunning(false)
    } else {
      setTimerRunning(true)
    }
  }

  function handleEdit(data: Omit<Task, 'id' | 'subtasks' | 'createdAt' | 'updatedAt'>) {
    updateTask(task.id, data)
    setEditing(false)
  }

  return (
    <>
      <div
        className={cn('task-card', task.status === 'concluida' && 'opacity-55')}
        style={{
          background: timerRunning ? `${accent}08` : '#FAF8F4',
          border: `1px solid ${timerRunning ? accent + '40' : '#D8D2C8'}`,
          borderLeft: `4px solid ${task.status === 'concluida' ? '#D8D2C8' : accent}`,
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: timerRunning
            ? `0 2px 12px ${accent}20`
            : '0 1px 5px rgba(40,47,41,0.05)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Main row */}
        <div className="flex items-center gap-2.5 px-3.5 py-3">

          {/* Status circle */}
          <button
            className="status-circle flex-shrink-0 flex items-center justify-center"
            onClick={() => toggleTaskStatus(task.id)}
            title="Mudar status"
            style={{
              width: '26px', height: '26px', borderRadius: '50%',
              border: `2px solid ${statusCfg.border}`,
              background: statusCfg.bg,
            }}
          >
            {statusCfg.inner}
          </button>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <p
              style={{
                fontFamily: fontDisplay, fontWeight: 400, fontSize: '15px',
                color: task.status === 'concluida' ? '#A09888' : '#282F29',
                textDecoration: task.status === 'concluida' ? 'line-through' : 'none',
                lineHeight: '1.25',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
            >
              {task.title}
            </p>

            <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
              {/* Timer display */}
              {(timerRunning || (task.timeSpent && task.timeSpent > 0)) && (
                <span
                  className="flex items-center gap-0.5"
                  style={{
                    fontFamily: fontSans, fontSize: '11px', fontWeight: timerRunning ? 400 : 300,
                    color: timerRunning ? accent : '#A09888',
                  }}
                >
                  <Timer size={10} />
                  {formatSeconds(totalSpent)}
                </span>
              )}
              {task.estimatedMinutes && !timerRunning && !(task.timeSpent && task.timeSpent > 0) && (
                <span
                  className="flex items-center gap-0.5"
                  style={{ fontFamily: fontSans, fontSize: '11px', color: '#A09888', fontWeight: 300 }}
                >
                  <Timer size={10} />
                  {task.estimatedMinutes}min
                </span>
              )}
              {task.deadline && (
                <span
                  className="flex items-center gap-0.5"
                  style={{
                    fontFamily: fontSans, fontSize: '11px',
                    fontWeight: deadlinePast ? 400 : 300,
                    color: deadlinePast ? '#B85050' : '#A09888',
                  }}
                >
                  <CalendarDays size={10} />
                  {format(parseISO(task.deadline), 'dd MMM', { locale: ptBR })}
                </span>
              )}
              {task.recurrence !== 'nenhuma' && (
                <span
                  className="flex items-center gap-0.5"
                  style={{ fontFamily: fontSans, fontSize: '11px', color: '#8B7550', fontWeight: 300 }}
                >
                  <Repeat size={10} />
                  {RECURRENCE_LABELS[task.recurrence]}
                </span>
              )}
              {hasSubtasks && (
                <span style={{ fontFamily: fontSans, fontSize: '11px', color: '#A09888', fontWeight: 300 }}>
                  {doneSubtasks}/{task.subtasks.length}
                </span>
              )}
            </div>
          </div>

          {/* Priority pill */}
          <button
            onClick={() => cyclePriority(task.id)}
            className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-full"
            style={{
              background: priorityCfg.bg, fontFamily: fontSans,
              fontSize: '10px', fontWeight: 300, color: priorityCfg.color,
              letterSpacing: '0.06em', border: 'none',
            }}
          >
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: priorityCfg.dot }} />
            {PRIORITY_LABELS[task.priority]}
          </button>

          {/* ── Play/Stop timer button ── */}
          {task.status !== 'concluida' && (
            <button
              onClick={handlePlayStop}
              className="status-circle flex-shrink-0 flex items-center justify-center"
              title={timerRunning ? 'Parar timer' : 'Iniciar timer'}
              style={{
                width: '26px', height: '26px', borderRadius: '50%',
                border: `2px solid ${timerRunning ? accent : '#C8C4BC'}`,
                background: timerRunning ? accent : 'transparent',
                animation: timerRunning ? 'pulse-ring 2s ease infinite' : 'none',
              }}
            >
              {timerRunning
                ? <Square size={8} color="#FAF8F4" fill="#FAF8F4" />
                : <Play size={9} color="#A09888" fill="#A09888" style={{ marginLeft: '1px' }} />
              }
            </button>
          )}

          {/* Actions */}
          <div className="flex items-center gap-0 flex-shrink-0">
            <button
              onClick={() => setEditing(true)}
              style={{ padding: '6px', color: '#C8C4BC', borderRadius: '6px', transition: 'color 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#282F29')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#C8C4BC')}
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              style={{ padding: '6px', color: '#C8C4BC', borderRadius: '6px', transition: 'color 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#B85050')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#C8C4BC')}
            >
              <Trash2 size={13} />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              style={{ padding: '6px', color: '#C8C4BC', borderRadius: '6px', transition: 'color 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#282F29')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#C8C4BC')}
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
        </div>

        {/* Expanded section */}
        {expanded && (
          <div
            className="px-4 py-3 space-y-3"
            style={{ borderTop: '1px solid #EDE8DF', background: '#F5F1EA' }}
          >
            {task.description && (
              <p style={{ fontFamily: fontSans, fontSize: '13px', color: '#6B7A6C', fontWeight: 300, lineHeight: '1.55' }}>
                {task.description}
              </p>
            )}
            {task.timeSpent && task.timeSpent > 0 && (
              <p style={{ fontFamily: fontSans, fontSize: '11px', color: '#A09888', fontWeight: 300 }}>
                Tempo registrado: {formatSeconds(task.timeSpent)}
              </p>
            )}
            <SubtaskList taskId={task.id} subtasks={task.subtasks} />
          </div>
        )}
      </div>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-md" style={{ background: '#FAF8F4' }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: fontDisplay, fontWeight: 300, fontSize: '22px', color: '#282F29' }}>
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
