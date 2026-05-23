'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { Task } from '@/lib/types'
import {
  format, addDays, isToday, isSameDay, parseISO, isPast, startOfDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  AlertTriangle, CalendarClock, Mic, MicOff, Send, Loader2,
  Check, ChevronDown, RefreshCw, Sparkles,
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

const fontDisplay = 'var(--font-cormorant), "Cormorant Garamond", serif'
const fontSans    = 'var(--font-jost), Jost, sans-serif'

// ── Reschedule dialog ────────────────────────────────────────────────────
function RescheduleDialog({ task, onClose }: { task: Task; onClose: () => void }) {
  const updateTask = useStore((s) => s.updateTask)
  const [date, setDate] = useState(
    task.deadline ?? format(addDays(new Date(), 1), 'yyyy-MM-dd')
  )

  function save() {
    updateTask(task.id, { deadline: date })
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xs" style={{ background: '#FAF8F4' }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: fontDisplay, fontWeight: 300, fontSize: '20px', color: '#282F29' }}>
            Reprogramar
          </DialogTitle>
        </DialogHeader>
        <p style={{ fontFamily: fontSans, fontSize: '13px', color: '#6B7A6C', fontWeight: 300, marginBottom: '12px' }}>
          {task.title}
        </p>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: '8px',
            border: '1px solid #D8D2C8', fontFamily: fontSans, fontSize: '14px',
            color: '#282F29', background: '#FFF', outline: 'none',
          }}
        />
        <div className="flex gap-2 pt-3">
          <button
            onClick={save}
            className="btn-minaue flex-1 justify-center"
            style={{ background: '#B8A070', borderColor: '#B8A070', color: '#FAF8F4' }}
          >
            Salvar
          </button>
          <button
            onClick={onClose}
            className="btn-minaue"
            style={{ borderColor: '#D8D2C8', color: '#7A8E7B' }}
          >
            Cancelar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Task card mini ────────────────────────────────────────────────────────
function MiniTask({
  task, projectColor, onReschedule,
}: {
  task: Task
  projectColor: string
  onReschedule: () => void
}) {
  const toggleTaskStatus = useStore((s) => s.toggleTaskStatus)
  const done = task.status === 'concluida'

  return (
    <div
      className="flex items-center gap-3"
      style={{
        padding: '9px 12px',
        borderRadius: '10px',
        background: done ? '#F5F1EA' : '#FAF8F4',
        border: `1px solid ${done ? '#E5E0D8' : '#D8D2C8'}`,
        borderLeft: `3px solid ${done ? '#D8D2C8' : projectColor}`,
        opacity: done ? 0.6 : 1,
        transition: 'all 0.2s ease',
      }}
    >
      <button
        onClick={() => toggleTaskStatus(task.id)}
        style={{
          width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
          border: `2px solid ${done ? '#4E6652' : projectColor}`,
          background: done ? '#4E6652' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.15s ease',
        }}
      >
        {done && <Check size={10} color="#FAF8F4" strokeWidth={2.5} />}
      </button>

      <span
        style={{
          flex: 1, fontFamily: fontDisplay, fontSize: '14px', fontWeight: 400,
          color: done ? '#A09888' : '#282F29',
          textDecoration: done ? 'line-through' : 'none',
          lineHeight: 1.3,
        }}
      >
        {task.title}
      </span>

      {!done && onReschedule && (
        <button
          onClick={onReschedule}
          title="Reprogramar"
          style={{
            flexShrink: 0, padding: '3px', borderRadius: '5px',
            color: '#C8C4BC', border: 'none', background: 'transparent',
            cursor: 'pointer', transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#B8A070')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#C8C4BC')}
        >
          <RefreshCw size={12} />
        </button>
      )}
    </div>
  )
}

// ── Day column ────────────────────────────────────────────────────────────
function DaySection({
  date, tasks, projects, onReschedule,
}: {
  date: Date
  tasks: Task[]
  projects: { id: string; color: string; name: string }[]
  onReschedule: (t: Task) => void
}) {
  const today    = isToday(date)
  const dayLabel = today
    ? 'Hoje'
    : format(date, 'EEEE', { locale: ptBR })
  const dateLabel = format(date, "d 'de' MMM", { locale: ptBR })
  const pending = tasks.filter((t) => t.status !== 'concluida').length

  if (tasks.length === 0) return null

  return (
    <div style={{ marginBottom: '20px' }}>
      <div className="flex items-baseline gap-3" style={{ marginBottom: '8px' }}>
        <span
          style={{
            fontFamily: fontDisplay, fontStyle: 'italic', fontWeight: 400,
            fontSize: today ? '18px' : '15px',
            color: today ? '#282F29' : '#7A8E7B',
            letterSpacing: '0.01em',
          }}
        >
          {dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)}
        </span>
        <span style={{ fontFamily: fontSans, fontSize: '10px', color: '#A09888', fontWeight: 300 }}>
          {dateLabel}
        </span>
        {pending > 0 && (
          <span
            style={{
              marginLeft: 'auto',
              fontFamily: fontSans, fontSize: '10px', fontWeight: 300,
              color: today ? '#8B7550' : '#A09888',
              background: today ? 'rgba(184,160,112,0.12)' : 'transparent',
              padding: today ? '1px 8px' : '0',
              borderRadius: '20px',
            }}
          >
            {pending} pendente{pending > 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        {tasks.map((t) => {
          const proj = projects.find((p) => p.id === t.projectId)
          return (
            <MiniTask
              key={t.id}
              task={t}
              projectColor={proj?.color ?? '#B8A070'}
              onReschedule={() => onReschedule(t)}
            />
          )
        })}
      </div>
    </div>
  )
}

// ── Smart Inbox ───────────────────────────────────────────────────────────
function SmartInbox({ projects }: { projects: { id: string; name: string; color: string }[] }) {
  const addTask = useStore((s) => s.addTask)
  const [text, setText]       = useState('')
  const [loading, setLoading] = useState(false)
  const [recording, setRecording]   = useState(false)
  const [preview, setPreview]       = useState<null | {
    title: string; projectId: string; priority: string; deadline: string | null; description: string | null
  }>(null)
  const [error, setError]     = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const rootProjects = projects.filter((p) => p.id)

  function toggleRecording() {
    if (recording) {
      recognitionRef.current?.stop()
      setRecording(false)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRec) {
      setError('Reconhecimento de voz não disponível. Use Chrome ou Safari.')
      return
    }

    setError('')
    const rec = new SpeechRec()
    rec.lang = 'pt-BR'
    rec.continuous = false
    rec.interimResults = false

    let hasResult = false

    rec.onresult = (e: SpeechRecognitionEvent) => {
      hasResult = true
      const transcript = e.results[0][0].transcript
      setText((prev) => prev ? `${prev} ${transcript}` : transcript)
      setRecording(false)
    }

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      setRecording(false)
      if (e.error === 'not-allowed') {
        setError('Permissão para microfone negada. Libere o acesso nas configurações do navegador.')
      } else if (e.error === 'network') {
        setError('Erro de rede no reconhecimento de voz. Verifique sua conexão.')
      } else if (e.error === 'no-speech') {
        setError('Nenhuma fala detectada. Tente novamente.')
      } else {
        setError(`Erro no microfone (${e.error}). Tente digitar o texto.`)
      }
    }

    rec.onend = () => {
      setRecording(false)
      if (!hasResult) setError('')
    }

    recognitionRef.current = rec
    try {
      rec.start()
      setRecording(true)
    } catch {
      setError('Não foi possível iniciar o microfone. Tente digitar o texto.')
    }
  }

  async function analyze() {
    if (!text.trim()) return
    setLoading(true)
    setError('')
    setPreview(null)
    try {
      const res = await fetch('/api/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, projects: rootProjects.map((p) => ({ id: p.id, name: p.name })) }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPreview(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido ao processar.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function confirm() {
    if (!preview) return
    addTask({
      projectId: preview.projectId,
      title: preview.title,
      description: preview.description ?? undefined,
      priority: (preview.priority as Task['priority']) ?? 'media',
      status: 'pendente',
      deadline: preview.deadline ?? undefined,
      recurrence: 'nenhuma',
    })
    setText('')
    setPreview(null)
  }

  const proj = preview ? rootProjects.find((p) => p.id === preview.projectId) : null

  return (
    <div
      style={{
        borderRadius: '16px',
        background: '#FAF8F4',
        border: '1px solid #D8D2C8',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(40,47,41,0.06)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px 10px',
          borderBottom: '1px solid #EDE8DF',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}
      >
        <Sparkles size={14} style={{ color: '#B8A070' }} />
        <span
          style={{
            fontFamily: fontSans, fontSize: '10px', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#8B7550', fontWeight: 400,
          }}
        >
          Entrada rápida
        </span>
      </div>

      {/* Input area */}
      <div style={{ padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) analyze() }}
          placeholder="Descreva uma tarefa… ex: &quot;Gravar vídeo para o TikTok sobre técnica de sombreamento até sexta&quot;"
          rows={2}
          style={{
            flex: 1, resize: 'none', border: 'none', outline: 'none',
            background: 'transparent', fontFamily: fontSans, fontSize: '13px',
            color: '#282F29', fontWeight: 300, lineHeight: 1.55,
            placeholder: '#A09888',
          }}
        />
        <div className="flex gap-1.5 flex-shrink-0">
          <button
            onClick={toggleRecording}
            title={recording ? 'Parar gravação' : 'Gravar por voz'}
            style={{
              width: '34px', height: '34px', borderRadius: '50%',
              border: `1px solid ${recording ? '#B85050' : '#D8D2C8'}`,
              background: recording ? 'rgba(184,80,80,0.08)' : 'transparent',
              color: recording ? '#B85050' : '#A09888',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s ease',
              animation: recording ? 'pulse-ring 1.5s ease infinite' : 'none',
            }}
          >
            {recording ? <MicOff size={14} /> : <Mic size={14} />}
          </button>
          <button
            onClick={analyze}
            disabled={!text.trim() || loading}
            style={{
              width: '34px', height: '34px', borderRadius: '50%',
              border: 'none',
              background: text.trim() && !loading ? '#B8A070' : '#E5E0D8',
              color: text.trim() && !loading ? '#FAF8F4' : '#A09888',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: text.trim() && !loading ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '0 16px 12px', fontFamily: fontSans, fontSize: '11px', color: '#B85050', fontWeight: 300 }}>
          {error}
        </div>
      )}

      {/* Preview card */}
      {preview && (
        <div
          style={{
            margin: '0 12px 12px',
            borderRadius: '10px',
            background: proj ? `${proj.color}08` : '#F5F1EA',
            border: `1px solid ${proj ? proj.color + '30' : '#E5E0D8'}`,
            borderLeft: `3px solid ${proj?.color ?? '#B8A070'}`,
            padding: '12px 14px',
          }}
        >
          <p style={{ fontFamily: fontDisplay, fontSize: '15px', fontWeight: 400, color: '#282F29', marginBottom: '6px' }}>
            {preview.title}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {proj && (
              <span style={{ fontFamily: fontSans, fontSize: '11px', color: proj.color, fontWeight: 400 }}>
                {proj.name}
              </span>
            )}
            <span
              style={{
                fontFamily: fontSans, fontSize: '10px', fontWeight: 300,
                color: preview.priority === 'alta' ? '#B85050' : preview.priority === 'media' ? '#8B7550' : '#5A7A5E',
                background: preview.priority === 'alta' ? 'rgba(184,80,80,0.08)' : preview.priority === 'media' ? 'rgba(184,160,112,0.12)' : 'rgba(78,102,82,0.08)',
                padding: '1px 8px', borderRadius: '20px',
              }}
            >
              {preview.priority}
            </span>
            {preview.deadline && (
              <span style={{ fontFamily: fontSans, fontSize: '11px', color: '#A09888', fontWeight: 300 }}>
                {format(parseISO(preview.deadline), "dd 'de' MMM", { locale: ptBR })}
              </span>
            )}
          </div>
          {preview.description && (
            <p style={{ fontFamily: fontSans, fontSize: '12px', color: '#6B7A6C', fontWeight: 300, marginTop: '6px', lineHeight: 1.5 }}>
              {preview.description}
            </p>
          )}
          <div className="flex gap-2 mt-10px" style={{ marginTop: '10px' }}>
            <button
              onClick={confirm}
              className="btn-minaue"
              style={{ background: '#B8A070', borderColor: '#B8A070', color: '#FAF8F4', fontSize: '10px', padding: '6px 16px' }}
            >
              <Check size={11} /> Confirmar
            </button>
            <button
              onClick={() => setPreview(null)}
              className="btn-minaue"
              style={{ borderColor: '#D8D2C8', color: '#7A8E7B', fontSize: '10px', padding: '6px 14px' }}
            >
              Descartar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  const tasks    = useStore(useShallow((s) => s.tasks))
  const projects = useStore(useShallow((s) => s.projects))
  const [rescheduling, setRescheduling] = useState<Task | null>(null)
  const [showAllOverdue, setShowAllOverdue] = useState(false)

  const today = startOfDay(new Date())
  const days  = Array.from({ length: 7 }, (_, i) => addDays(today, i))

  const overdue = tasks.filter((t) =>
    t.status !== 'concluida' &&
    t.deadline &&
    isPast(startOfDay(parseISO(t.deadline))) &&
    !isSameDay(parseISO(t.deadline), today)
  )

  const visibleOverdue = showAllOverdue ? overdue : overdue.slice(0, 3)

  const tasksByDay = days.map((day) => ({
    date: day,
    tasks: tasks.filter((t) => t.deadline && isSameDay(parseISO(t.deadline), day)),
  }))

  const rootProjects = projects.filter((p) => !p.parentId)

  function getProjectColor(projectId: string) {
    return projects.find((p) => p.id === projectId)?.color ?? '#B8A070'
  }

  return (
    <div className="max-w-xl mx-auto min-h-screen flex flex-col">

      {/* ── Header ── */}
      <div
        className="sticky top-0 z-10 px-6 pt-8 pb-6"
        style={{
          background: 'linear-gradient(135deg, #1e2a1e 0%, #282F29 60%, #1a241a 100%)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: '-30px', right: '-30px',
          width: '160px', height: '160px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(184,160,112,0.22) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px',
          background: 'linear-gradient(to right, #B8A070, rgba(184,160,112,0.3), transparent)',
        }} />
        <div className="relative">
          <h1 style={{
            fontFamily: fontDisplay, fontStyle: 'italic', fontWeight: 300,
            fontSize: '42px', color: '#D4BC8C', letterSpacing: '0.01em', lineHeight: 1,
          }}>
            Início
          </h1>
          <p style={{
            marginTop: '6px', fontFamily: fontSans, fontSize: '10px',
            letterSpacing: '0.3em', textTransform: 'uppercase', color: '#5E6E5F', fontWeight: 300,
          }}>
            {format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-6">

        {/* ── Entrada inteligente ── */}
        <SmartInbox projects={rootProjects} />

        {/* ── Tarefas atrasadas ── */}
        {overdue.length > 0 && (
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '10px' }}>
              <AlertTriangle size={13} style={{ color: '#B85050' }} />
              <span style={{
                fontFamily: fontSans, fontSize: '10px', letterSpacing: '0.2em',
                textTransform: 'uppercase', color: '#B85050', fontWeight: 400,
              }}>
                Atrasadas — {overdue.length}
              </span>
            </div>
            <div className="space-y-1.5">
              {visibleOverdue.map((t) => (
                <MiniTask
                  key={t.id}
                  task={t}
                  projectColor={getProjectColor(t.projectId)}
                  onReschedule={() => setRescheduling(t)}
                />
              ))}
            </div>
            {overdue.length > 3 && (
              <button
                onClick={() => setShowAllOverdue(!showAllOverdue)}
                style={{
                  marginTop: '8px', fontFamily: fontSans, fontSize: '11px',
                  color: '#A09888', fontWeight: 300, background: 'none',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                <ChevronDown size={12} style={{ transform: showAllOverdue ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                {showAllOverdue ? 'Mostrar menos' : `Ver mais ${overdue.length - 3}`}
              </button>
            )}
          </div>
        )}

        {/* ── Separador ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CalendarClock size={13} style={{ color: '#A09888', flexShrink: 0 }} />
          <span style={{ fontFamily: fontSans, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A09888', fontWeight: 300 }}>
            Próximos 7 dias
          </span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, #D8D2C8, transparent)' }} />
        </div>

        {/* ── Dias ── */}
        <div>
          {tasksByDay.every((d) => d.tasks.length === 0) ? (
            <div style={{ padding: '32px 0', textAlign: 'center' }}>
              <p style={{ fontFamily: fontDisplay, fontStyle: 'italic', color: '#A09888', fontWeight: 300, fontSize: '18px' }}>
                Nenhuma tarefa com prazo esta semana.
              </p>
              <p style={{ fontFamily: fontSans, fontSize: '11px', color: '#C8C4BC', fontWeight: 300, marginTop: '6px' }}>
                Adicione datas às suas tarefas para vê-las aqui.
              </p>
            </div>
          ) : (
            tasksByDay.map(({ date, tasks: dayTasks }) => (
              <DaySection
                key={date.toISOString()}
                date={date}
                tasks={dayTasks}
                projects={projects}
                onReschedule={setRescheduling}
              />
            ))
          )}
        </div>
      </div>

      {rescheduling && (
        <RescheduleDialog task={rescheduling} onClose={() => setRescheduling(null)} />
      )}
    </div>
  )
}
