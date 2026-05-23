'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { Play, Pause, RotateCcw, ChevronDown } from 'lucide-react'

const fontDisplay = 'var(--font-cormorant), "Cormorant Garamond", serif'
const fontSans    = 'var(--font-jost), Jost, sans-serif'

const MODES = {
  foco:         { label: 'Foco',        seconds: 25 * 60, color: '#B8A070' },
  'pausa-curta':{ label: 'Pausa',       seconds:  5 * 60, color: '#7A9E82' },
  'pausa-longa':{ label: 'Pausa longa', seconds: 15 * 60, color: '#7899B8' },
} as const

type Mode = keyof typeof MODES

const RADIUS        = 96
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface Session {
  id: string
  taskTitle: string
  projectName: string
  projectColor: string
  completedAt: Date
}

export default function FocoPage() {
  const [mode, setMode]               = useState<Mode>('foco')
  const [isRunning, setIsRunning]     = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(MODES.foco.seconds)
  const [selectedTaskId, setSelected] = useState<string | null>(null)
  const [sessions, setSessions]       = useState<Session[]>([])
  const [showPicker, setShowPicker]   = useState(false)

  const tasks    = useStore(useShallow((s) => s.tasks.filter((t) => t.status !== 'concluida')))
  const projects = useStore(useShallow((s) => s.projects))

  const cfg           = MODES[mode]
  const totalSeconds  = cfg.seconds
  const progress      = secondsLeft / totalSeconds
  const dashOffset    = CIRCUMFERENCE * (1 - progress)
  const minutes       = Math.floor(secondsLeft / 60).toString().padStart(2, '0')
  const secs          = (secondsLeft % 60).toString().padStart(2, '0')
  const selectedTask  = tasks.find((t) => t.id === selectedTaskId)
  const selectedProj  = selectedTask ? projects.find((p) => p.id === selectedTask.projectId) : null
  const todaySessions = sessions.filter((s) => s.completedAt.toDateString() === new Date().toDateString())

  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setIsRunning(false)
          if (mode === 'foco') {
            const task = tasks.find((t) => t.id === selectedTaskId)
            const proj = task ? projects.find((p) => p.id === task.projectId) : null
            setSessions((prev) => [{
              id: Math.random().toString(36),
              taskTitle:    task?.title ?? 'Sessão livre',
              projectName:  proj?.name ?? '',
              projectColor: proj?.color ?? '#B8A070',
              completedAt:  new Date(),
            }, ...prev])
          }
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [isRunning, mode, selectedTaskId, tasks, projects])

  function changeMode(m: Mode) {
    setMode(m); setIsRunning(false); setSecondsLeft(MODES[m].seconds)
  }
  function reset() { setIsRunning(false); setSecondsLeft(cfg.seconds) }

  return (
    <div className="max-w-xl mx-auto min-h-screen flex flex-col">

      {/* ── Header ── */}
      <div
        className="sticky top-0 z-10 px-6 pt-8 pb-6"
        style={{ background: 'linear-gradient(135deg, #1e2a1e 0%, #282F29 60%, #1a241a 100%)', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: `radial-gradient(circle, ${cfg.color}30 0%, transparent 70%)`, pointerEvents: 'none', transition: 'background 0.5s ease' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(to right, ${cfg.color}80, rgba(184,160,112,0.2), transparent)` }} />
        <div className="relative">
          <h1 style={{ fontFamily: fontDisplay, fontStyle: 'italic', fontWeight: 300, fontSize: '42px', color: '#D4BC8C', letterSpacing: '0.01em', lineHeight: 1 }}>
            Foco
          </h1>
          <p style={{ marginTop: '6px', fontFamily: fontSans, fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#5E6E5F', fontWeight: 300 }}>
            {todaySessions.length > 0 ? `${todaySessions.length} sessão${todaySessions.length > 1 ? 'ões' : ''} hoje` : 'pronta para começar'}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 py-8 gap-8">

        {/* ── Mode tabs ── */}
        <div
          className="flex gap-1 p-1 rounded-lg"
          style={{ background: '#E5E0D8' }}
        >
          {(Object.entries(MODES) as [Mode, typeof MODES[Mode]][]).map(([key, m]) => (
            <button
              key={key}
              onClick={() => changeMode(key)}
              style={{
                fontFamily: fontSans, fontSize: '11px', fontWeight: 300,
                letterSpacing: '0.1em', padding: '6px 14px', borderRadius: '6px',
                border: 'none', cursor: 'pointer',
                background: mode === key ? '#FAF8F4' : 'transparent',
                color: mode === key ? m.color : '#A09888',
                boxShadow: mode === key ? '0 1px 4px rgba(40,47,41,0.1)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* ── Timer circle ── */}
        <div style={{ position: 'relative' }}>
          <svg width="220" height="220" style={{ overflow: 'visible' }}>
            {/* Glow */}
            <circle cx="110" cy="110" r={RADIUS + 10} fill="none"
              stroke={cfg.color} strokeWidth="1" opacity="0.12" />
            {/* Track */}
            <circle cx="110" cy="110" r={RADIUS} fill="none"
              stroke="#D8D2C8" strokeWidth="5" />
            {/* Progress */}
            <circle cx="110" cy="110" r={RADIUS} fill="none"
              stroke={cfg.color} strokeWidth="5" strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 110 110)"
              style={{ transition: isRunning ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.3s ease' }}
            />
          </svg>

          {/* Time overlay */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: fontDisplay, fontSize: '52px', fontWeight: 300, color: '#282F29', lineHeight: 1, letterSpacing: '-0.02em' }}>
              {minutes}<span style={{ opacity: 0.4, fontSize: '36px' }}>:</span>{secs}
            </span>
            <span style={{ fontFamily: fontSans, fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: cfg.color, fontWeight: 300, marginTop: '4px' }}>
              {cfg.label}
            </span>
          </div>
        </div>

        {/* ── Controles ── */}
        <div className="flex items-center gap-5">
          <button
            onClick={reset}
            style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid #D8D2C8', background: 'transparent', color: '#A09888', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#B8A070'; e.currentTarget.style.color = '#B8A070' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#D8D2C8'; e.currentTarget.style.color = '#A09888' }}
          >
            <RotateCcw size={16} strokeWidth={1.5} />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            style={{
              width: '68px', height: '68px', borderRadius: '50%',
              background: isRunning ? '#282F29' : cfg.color,
              border: 'none', color: '#FAF8F4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: `0 4px 20px ${cfg.color}40`,
              transition: 'all 0.25s cubic-bezier(.34,1.56,.64,1)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            {isRunning
              ? <Pause size={24} strokeWidth={1.5} />
              : <Play size={24} strokeWidth={1.5} style={{ marginLeft: '3px' }} />
            }
          </button>

          {/* Dots de sessões */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex gap-1.5">
              {[0,1,2,3].map((i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i < todaySessions.length ? cfg.color : '#D8D2C8', transition: 'background 0.3s ease' }} />
              ))}
            </div>
            <span style={{ fontFamily: fontSans, fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A09888', fontWeight: 300 }}>
              {todaySessions.length}/4
            </span>
          </div>
        </div>

        {/* ── Seletor de tarefa ── */}
        <div style={{ width: '100%' }}>
          <p style={{ fontFamily: fontSans, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A09888', fontWeight: 300, marginBottom: '8px' }}>
            Trabalhando em
          </p>
          <button
            onClick={() => setShowPicker(!showPicker)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 16px', borderRadius: '12px',
              background: '#FAF8F4', border: `1px solid ${selectedTask ? (selectedProj?.color ?? '#D8D2C8') + '50' : '#D8D2C8'}`,
              borderLeft: `4px solid ${selectedProj?.color ?? '#D8D2C8'}`,
              cursor: 'pointer', textAlign: 'left',
              boxShadow: '0 1px 5px rgba(40,47,41,0.05)',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              {selectedTask ? (
                <>
                  <p style={{ fontFamily: fontDisplay, fontSize: '16px', fontWeight: 400, color: '#282F29', lineHeight: 1.3 }}>
                    {selectedTask.title}
                  </p>
                  <p style={{ fontFamily: fontSans, fontSize: '11px', color: '#A09888', fontWeight: 300, marginTop: '2px' }}>
                    {selectedProj?.name}
                  </p>
                </>
              ) : (
                <p style={{ fontFamily: fontSans, fontSize: '13px', color: '#A09888', fontWeight: 300 }}>
                  Selecionar tarefa (opcional)
                </p>
              )}
            </div>
            <ChevronDown size={16} style={{ color: '#C8C4BC', flexShrink: 0, transform: showPicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {/* Task picker dropdown */}
          {showPicker && (
            <div style={{ marginTop: '4px', borderRadius: '12px', background: '#FAF8F4', border: '1px solid #D8D2C8', overflow: 'hidden', boxShadow: '0 4px 20px rgba(40,47,41,0.1)', maxHeight: '240px', overflowY: 'auto' }}>
              <button
                onClick={() => { setSelected(null); setShowPicker(false) }}
                style={{ width: '100%', padding: '12px 16px', textAlign: 'left', fontFamily: fontSans, fontSize: '13px', color: '#A09888', fontWeight: 300, background: 'transparent', border: 'none', borderBottom: '1px solid #EDE8DF', cursor: 'pointer' }}
              >
                Nenhuma tarefa
              </button>
              {projects.filter((p) => !p.parentId).map((proj) => {
                const projTasks = tasks.filter((t) => t.projectId === proj.id || projects.find((sp) => sp.id === t.projectId && sp.parentId === proj.id))
                if (projTasks.length === 0) return null
                return (
                  <div key={proj.id}>
                    <p style={{ padding: '8px 16px 4px', fontFamily: fontSans, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: proj.color, fontWeight: 400 }}>
                      {proj.name}
                    </p>
                    {projTasks.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => { setSelected(t.id); setShowPicker(false) }}
                        style={{
                          width: '100%', padding: '10px 16px 10px 20px', textAlign: 'left',
                          fontFamily: fontDisplay, fontSize: '15px', fontWeight: 400, color: '#282F29',
                          background: selectedTaskId === t.id ? `${proj.color}10` : 'transparent',
                          border: 'none', borderBottom: '1px solid #F0EDE7', cursor: 'pointer',
                          borderLeft: `3px solid ${selectedTaskId === t.id ? proj.color : 'transparent'}`,
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = `${proj.color}10` }}
                        onMouseLeave={(e) => { if (selectedTaskId !== t.id) e.currentTarget.style.background = 'transparent' }}
                      >
                        {t.title}
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Histórico de sessões ── */}
        {sessions.length > 0 && (
          <div style={{ width: '100%' }}>
            <p style={{ fontFamily: fontSans, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A09888', fontWeight: 300, marginBottom: '10px' }}>
              Sessões hoje
            </p>
            <div className="space-y-2">
              {sessions.slice(0, 6).map((s, i) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3"
                  style={{ padding: '10px 14px', borderRadius: '10px', background: '#FAF8F4', border: '1px solid #E5E0D8', borderLeft: `3px solid ${s.projectColor}` }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: fontDisplay, fontSize: '14px', fontWeight: 400, color: '#282F29', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.taskTitle}
                    </p>
                    {s.projectName && (
                      <p style={{ fontFamily: fontSans, fontSize: '11px', color: '#A09888', fontWeight: 300 }}>
                        {s.projectName}
                      </p>
                    )}
                  </div>
                  <span style={{ fontFamily: fontSans, fontSize: '10px', color: '#B8A070', fontWeight: 300, letterSpacing: '0.05em', flexShrink: 0 }}>
                    {s.completedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
