'use client'

import { useState, useRef } from 'react'
import { useStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { TimeBlock, WeekTask, PROJECT_COLORS } from '@/lib/types'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, TouchSensor, useSensor, useSensors, useDroppable, useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, X, Pencil, ListChecks, Check } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const fontDisplay = 'var(--font-cormorant), "Cormorant Garamond", serif'
const fontSans    = 'var(--font-jost), Jost, sans-serif'

const HOUR_START  = 6
const HOUR_END    = 22
const HOUR_PX     = 56   // pixels per hour
const TOTAL_PX    = (HOUR_END - HOUR_START) * HOUR_PX
const DAY_LABELS  = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

function minutesToPx(minutes: number) {
  return ((minutes - HOUR_START * 60) / 60) * HOUR_PX
}
function minToTime(minutes: number) {
  return `${Math.floor(minutes / 60).toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`
}
function getWeekOf(date: Date) {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

// ── Draggable task chip ─────────────────────────────────────────────────
function DraggableTask({ id, title, color, done }: { id: string; title: string; color: string; done?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
        padding: '4px 8px',
        borderRadius: '6px',
        background: done ? '#F0EDE7' : '#FAF8F4',
        border: `1px solid ${color}40`,
        borderLeft: `3px solid ${done ? '#D8D2C8' : color}`,
        fontFamily: fontDisplay, fontSize: '13px', fontWeight: 400,
        color: done ? '#A09888' : '#282F29',
        cursor: 'grab',
        textDecoration: done ? 'line-through' : 'none',
        touchAction: 'none',
        userSelect: 'none',
        marginBottom: '3px',
        lineHeight: 1.3,
      }}
    >
      {title}
    </div>
  )
}

// ── Droppable day-block cell ────────────────────────────────────────────
function DroppableCell({ id, children, style }: { id: string; children: React.ReactNode; style?: React.CSSProperties }) {
  const { isOver, setNodeRef } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        outline: isOver ? `2px dashed #B8A070` : '2px dashed transparent',
        outlineOffset: '-2px',
        borderRadius: '6px',
        transition: 'outline 0.15s ease',
      }}
    >
      {children}
    </div>
  )
}

// ── Block editor dialog ─────────────────────────────────────────────────
function BlockDialog({
  initial, onSave, onClose,
}: {
  initial?: TimeBlock
  onSave: (data: Omit<TimeBlock, 'id' | 'createdAt' | 'updatedAt'>) => void
  onClose: () => void
}) {
  const projects = useStore(useShallow((s) => s.projects.filter((p) => !p.parentId)))
  const [title, setTitle]         = useState(initial?.title ?? '')
  const [color, setColor]         = useState(initial?.color ?? '#B8A070')
  const [type, setType]           = useState<'fixed' | 'thematic'>(initial?.type ?? 'fixed')
  const [projectId, setProjectId] = useState(initial?.projectId ?? '')
  const [days, setDays]           = useState<number[]>(initial?.days ?? [1, 2, 3, 4, 5])
  const [startH, setStartH]       = useState(Math.floor((initial?.startMinutes ?? 420) / 60))
  const [startM, setStartM]       = useState((initial?.startMinutes ?? 420) % 60)
  const [endH, setEndH]           = useState(Math.floor((initial?.endMinutes ?? 480) / 60))
  const [endM, setEndM]           = useState((initial?.endMinutes ?? 480) % 60)

  function toggleDay(d: number) {
    setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const proj = type === 'thematic' && projectId ? projects.find((p) => p.id === projectId) : null
    onSave({
      title: title.trim(),
      color: proj?.color ?? color,
      type,
      projectId: type === 'thematic' ? projectId : undefined,
      days,
      startMinutes: startH * 60 + startM,
      endMinutes: endH * 60 + endM,
    })
    onClose()
  }

  const labelStyle = { fontFamily: fontSans, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#7A8E7B', fontWeight: 300, display: 'block', marginBottom: '4px' }
  const inputStyle = { fontFamily: fontSans, fontSize: '13px', color: '#282F29', padding: '8px 10px', borderRadius: '7px', border: '1px solid #D8D2C8', background: '#FAF8F4', width: '100%', outline: 'none' }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm" style={{ background: '#FAF8F4' }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: fontDisplay, fontWeight: 300, fontSize: '22px', color: '#282F29' }}>
            {initial ? 'Editar bloco' : 'Novo bloco'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 pt-1">

          {/* Tipo */}
          <div className="flex gap-2">
            {(['fixed', 'thematic'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                style={{
                  flex: 1, padding: '7px', borderRadius: '7px', cursor: 'pointer',
                  fontFamily: fontSans, fontSize: '11px', fontWeight: 300, letterSpacing: '0.05em',
                  border: `1px solid ${type === t ? '#B8A070' : '#D8D2C8'}`,
                  background: type === t ? 'rgba(184,160,112,0.1)' : 'transparent',
                  color: type === t ? '#8B7550' : '#A09888',
                }}
              >
                {t === 'fixed' ? 'Compromisso' : 'Foco em projeto'}
              </button>
            ))}
          </div>

          {/* Título */}
          <div>
            <label style={labelStyle}>Título</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus style={inputStyle} placeholder="Ex: Academia, Buscar Tainá..." />
          </div>

          {/* Projeto (se temático) */}
          {type === 'thematic' && (
            <div>
              <label style={labelStyle}>Projeto</label>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)} style={inputStyle}>
                <option value="">Selecionar projeto...</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}

          {/* Cor (só fixo) */}
          {type === 'fixed' && (
            <div>
              <label style={labelStyle}>Cor</label>
              <div className="flex gap-2 flex-wrap">
                {PROJECT_COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: c, border: 'none', cursor: 'pointer', outline: color === c ? `2px solid ${c}` : '2px solid transparent', outlineOffset: '2px' }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Dias */}
          <div>
            <label style={labelStyle}>Dias da semana</label>
            <div className="flex gap-1.5">
              {DAY_LABELS.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(i + 1)}
                  style={{
                    flex: 1, padding: '5px 2px', borderRadius: '5px',
                    fontFamily: fontSans, fontSize: '10px', fontWeight: 300,
                    border: `1px solid ${days.includes(i + 1) ? color : '#D8D2C8'}`,
                    background: days.includes(i + 1) ? `${color}20` : 'transparent',
                    color: days.includes(i + 1) ? color : '#A09888', cursor: 'pointer',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Horário */}
          <div className="flex gap-3">
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Início</label>
              <div className="flex gap-1">
                <input type="number" min={HOUR_START} max={HOUR_END} value={startH} onChange={(e) => setStartH(+e.target.value)} style={{ ...inputStyle, width: '50%' }} />
                <input type="number" min={0} max={59} step={15} value={startM} onChange={(e) => setStartM(+e.target.value)} style={{ ...inputStyle, width: '50%' }} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Fim</label>
              <div className="flex gap-1">
                <input type="number" min={HOUR_START} max={HOUR_END} value={endH} onChange={(e) => setEndH(+e.target.value)} style={{ ...inputStyle, width: '50%' }} />
                <input type="number" min={0} max={59} step={15} value={endM} onChange={(e) => setEndM(+e.target.value)} style={{ ...inputStyle, width: '50%' }} />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-minaue flex-1 justify-center">Salvar</button>
            <button type="button" className="btn-minaue" style={{ borderColor: '#D8D2C8', color: '#7A8E7B' }} onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Planning panel ──────────────────────────────────────────────────────
function PlanningPanel({ weekOf, onClose }: { weekOf: string; onClose: () => void }) {
  const projects  = useStore(useShallow((s) => s.projects))
  const tasks     = useStore(useShallow((s) => s.tasks.filter((t) => t.status !== 'concluida')))
  const weekTasks = useStore(useShallow((s) => s.weekTasks.filter((wt) => wt.weekOf === weekOf)))
  const { addWeekTask, removeWeekTask } = useStore()
  const [openProject, setOpenProject]  = useState<string | null>(null)

  const rootProjects = projects.filter((p) => !p.parentId)
  const scheduledIds = new Set(weekTasks.map((wt) => wt.taskId))

  function toggle(taskId: string) {
    const existing = weekTasks.find((wt) => wt.taskId === taskId)
    if (existing) {
      removeWeekTask(existing.id)
    } else {
      addWeekTask({ taskId, dayOfWeek: 1, weekOf })
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50, display: 'flex',
        background: 'rgba(40,47,41,0.4)', backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          marginLeft: 'auto', width: 'min(360px, 100%)', height: '100%',
          background: '#FAF8F4', overflowY: 'auto',
          boxShadow: '-8px 0 40px rgba(40,47,41,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #E5E0D8', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontFamily: fontDisplay, fontStyle: 'italic', fontWeight: 300, fontSize: '26px', color: '#282F29', lineHeight: 1 }}>Planejar semana</h2>
            <p style={{ fontFamily: fontSans, fontSize: '10px', color: '#A09888', fontWeight: 300, marginTop: '4px', letterSpacing: '0.1em' }}>
              {weekTasks.length} tarefa{weekTasks.length !== 1 ? 's' : ''} selecionada{weekTasks.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose} style={{ color: '#C8C4BC', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '12px 16px' }}>
          {rootProjects.map((proj) => {
            const allSubs   = projects.filter((p) => p.parentId === proj.id)
            const allProjIds = [proj.id, ...allSubs.map((s) => s.id)]
            const projTasks = tasks.filter((t) => allProjIds.includes(t.projectId))
            if (projTasks.length === 0) return null
            const isOpen = openProject === proj.id

            return (
              <div key={proj.id} style={{ marginBottom: '8px', borderRadius: '10px', border: '1px solid #E5E0D8', overflow: 'hidden' }}>
                <button
                  onClick={() => setOpenProject(isOpen ? null : proj.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '11px 14px', background: isOpen ? `${proj.color}08` : 'transparent',
                    border: 'none', cursor: 'pointer', borderLeft: `4px solid ${proj.color}`,
                  }}
                >
                  <span style={{ flex: 1, textAlign: 'left', fontFamily: fontDisplay, fontSize: '16px', fontWeight: 400, color: '#282F29' }}>{proj.name}</span>
                  <span style={{ fontFamily: fontSans, fontSize: '11px', color: '#A09888', fontWeight: 300 }}>
                    {projTasks.filter((t) => scheduledIds.has(t.id)).length}/{projTasks.length}
                  </span>
                  <ChevronRight size={14} style={{ color: '#A09888', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {isOpen && (
                  <div style={{ background: '#FDFBF8', borderTop: '1px solid #E5E0D8' }}>
                    {projTasks.map((t) => {
                      const checked = scheduledIds.has(t.id)
                      return (
                        <button
                          key={t.id}
                          onClick={() => toggle(t.id)}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '9px 14px 9px 20px', background: checked ? `${proj.color}08` : 'transparent',
                            border: 'none', borderBottom: '1px solid #F0EDE7', cursor: 'pointer', textAlign: 'left',
                          }}
                        >
                          <div style={{
                            width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                            border: `2px solid ${checked ? proj.color : '#C8C4BC'}`,
                            background: checked ? proj.color : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {checked && <Check size={10} color="#FAF8F4" strokeWidth={3} />}
                          </div>
                          <span style={{ fontFamily: fontDisplay, fontSize: '14px', fontWeight: 400, color: checked ? proj.color : '#282F29', flex: 1, lineHeight: 1.3 }}>
                            {t.title}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Week grid ───────────────────────────────────────────────────────────
function WeekGrid({
  weekStart, activeDayIndex, onDayChange,
}: {
  weekStart: Date
  activeDayIndex: number
  onDayChange: (i: number) => void
}) {
  const timeBlocks  = useStore(useShallow((s) => s.timeBlocks))
  const weekTasks   = useStore(useShallow((s) => s.weekTasks.filter((wt) => wt.weekOf === getWeekOf(weekStart))))
  const tasks       = useStore(useShallow((s) => s.tasks))
  const projects    = useStore(useShallow((s) => s.projects))
  const { moveWeekTask } = useStore()

  const [editBlock, setEditBlock]   = useState<TimeBlock | null>(null)
  const { updateTimeBlock, deleteTimeBlock } = useStore()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  )

  // Desktop: all 7 days; Mobile: just activeDayIndex
  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768
  const days = isMobileView ? [activeDayIndex] : [0, 1, 2, 3, 4, 5, 6]

  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    const [dayStr, blockStr] = (over.id as string).split('::')
    const day = parseInt(dayStr) + 1
    moveWeekTask(active.id as string, day, blockStr !== 'free' ? blockStr : undefined)
  }

  function getBlocksForDay(dayIdx: number) {
    return timeBlocks.filter((b) => b.days.includes(dayIdx + 1))
  }

  function getTasksForDayBlock(dayIdx: number, blockId?: string) {
    return weekTasks
      .filter((wt) => wt.dayOfWeek === dayIdx + 1 && wt.timeBlockId === blockId)
      .map((wt) => ({ wt, task: tasks.find((t) => t.id === wt.taskId) }))
      .filter((x) => x.task)
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: 'flex', overflow: 'auto' }}>
          {/* Time axis */}
          <div style={{ width: '40px', flexShrink: 0, paddingTop: '32px' }}>
            {hours.map((h) => (
              <div key={h} style={{ height: `${HOUR_PX}px`, display: 'flex', alignItems: 'flex-start', paddingTop: '2px' }}>
                <span style={{ fontFamily: fontSans, fontSize: '9px', color: '#A09888', fontWeight: 300, lineHeight: 1 }}>
                  {h}h
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((dayIdx) => {
            const date   = addDays(weekStart, dayIdx)
            const isToday = isSameDay(date, new Date())
            const dayBlocks = getBlocksForDay(dayIdx)
            const freeTasks = getTasksForDayBlock(dayIdx, undefined)

            return (
              <div key={dayIdx} style={{ flex: 1, minWidth: 0 }}>
                {/* Day header */}
                <div
                  style={{
                    height: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', marginBottom: '0',
                  }}
                >
                  <span style={{ fontFamily: fontSans, fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: isToday ? '#B8A070' : '#A09888', fontWeight: isToday ? 400 : 300 }}>
                    {DAY_LABELS[dayIdx]}
                  </span>
                  <span style={{ fontFamily: fontSans, fontSize: '11px', color: isToday ? '#282F29' : '#A09888', fontWeight: isToday ? 400 : 300 }}>
                    {format(date, 'd')}
                  </span>
                </div>

                {/* Grid column */}
                <div style={{ position: 'relative', height: `${TOTAL_PX}px`, borderLeft: '1px solid #E5E0D8' }}>
                  {/* Hour lines */}
                  {hours.map((h) => (
                    <div key={h} style={{ position: 'absolute', top: `${(h - HOUR_START) * HOUR_PX}px`, left: 0, right: 0, borderTop: '1px solid #F0EDE7', pointerEvents: 'none' }} />
                  ))}

                  {/* Time blocks */}
                  {dayBlocks.map((block) => {
                    const top = minutesToPx(block.startMinutes)
                    const height = minutesToPx(block.endMinutes) - top
                    const blockTasks = getTasksForDayBlock(dayIdx, block.id)

                    return (
                      <DroppableCell
                        key={block.id}
                        id={`${dayIdx}::${block.id}`}
                        style={{
                          position: 'absolute', top: `${top}px`, left: '2px', right: '2px',
                          height: `${Math.max(height, 24)}px`,
                          background: `${block.color}18`,
                          borderLeft: `3px solid ${block.color}`,
                          borderRadius: '6px',
                          padding: '3px 4px', overflow: 'hidden',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontFamily: fontSans, fontSize: '9px', fontWeight: 400, color: block.color, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            {block.title}
                          </span>
                          <button
                            onClick={() => setEditBlock(block)}
                            style={{ color: `${block.color}80`, background: 'none', border: 'none', cursor: 'pointer', padding: '1px', display: 'flex' }}
                          >
                            <Pencil size={9} />
                          </button>
                        </div>
                        {height >= 36 && (
                          <span style={{ fontFamily: fontSans, fontSize: '8px', color: `${block.color}90`, fontWeight: 300 }}>
                            {minToTime(block.startMinutes)}–{minToTime(block.endMinutes)}
                          </span>
                        )}
                        {blockTasks.map(({ wt, task }) => task && (
                          <DraggableTask key={wt.id} id={wt.id} title={task.title} color={projects.find((p) => p.id === task.projectId)?.color ?? '#B8A070'} done={task.status === 'concluida'} />
                        ))}
                      </DroppableCell>
                    )
                  })}

                  {/* Free tasks (no block) */}
                  <DroppableCell
                    id={`${dayIdx}::free`}
                    style={{
                      position: 'absolute', bottom: 0, left: '2px', right: '2px',
                      minHeight: '40px', background: 'transparent',
                    }}
                  >
                    {freeTasks.map(({ wt, task }) => task && (
                      <DraggableTask key={wt.id} id={wt.id} title={task.title} color={projects.find((p) => p.id === task.projectId)?.color ?? '#B8A070'} done={task.status === 'concluida'} />
                    ))}
                  </DroppableCell>
                </div>
              </div>
            )
          })}
        </div>
      </DndContext>

      {editBlock && (
        <BlockDialog
          initial={editBlock}
          onSave={(data) => updateTimeBlock(editBlock.id, data)}
          onClose={() => setEditBlock(null)}
        />
      )}
    </>
  )
}

// ── Page ────────────────────────────────────────────────────────────────
export default function RotinasPage() {
  const [weekStart, setWeekStart]     = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [activeDay, setActiveDay]     = useState(() => {
    const today = new Date()
    const dow = today.getDay()
    return dow === 0 ? 6 : dow - 1
  })
  const [showPlanning, setShowPlanning] = useState(false)
  const [creatingBlock, setCreatingBlock] = useState(false)
  const { addTimeBlock } = useStore()
  const weekTasks = useStore(useShallow((s) => s.weekTasks.filter((wt) => wt.weekOf === getWeekOf(weekStart))))

  const weekLabel = `${format(weekStart, "d 'de' MMM", { locale: ptBR })} – ${format(addDays(weekStart, 6), "d 'de' MMM", { locale: ptBR })}`

  return (
    <div className="max-w-5xl mx-auto min-h-screen flex flex-col">

      {/* ── Header ── */}
      <div
        className="sticky top-0 z-10 px-4 pt-6 pb-4"
        style={{ background: 'linear-gradient(135deg, #1e2a1e 0%, #282F29 60%, #1a241a 100%)', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(184,160,112,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(to right, #B8A070, rgba(184,160,112,0.3), transparent)' }} />

        <div className="relative flex items-end justify-between gap-4">
          <div>
            <h1 style={{ fontFamily: fontDisplay, fontStyle: 'italic', fontWeight: 300, fontSize: '36px', color: '#D4BC8C', letterSpacing: '0.01em', lineHeight: 1 }}>
              Semana
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <button onClick={() => setWeekStart((d) => subWeeks(d, 1))} style={{ color: '#5E6E5F', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '2px' }}>
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontFamily: fontSans, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5E6E5F', fontWeight: 300 }}>
                {weekLabel}
              </span>
              <button onClick={() => setWeekStart((d) => addWeeks(d, 1))} style={{ color: '#5E6E5F', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '2px' }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowPlanning(true)}
              className="btn-minaue"
              style={{ borderColor: weekTasks.length > 0 ? '#B8A070' : 'rgba(184,160,112,0.4)', color: weekTasks.length > 0 ? '#D4BC8C' : '#5E6E5F', fontSize: '9px', padding: '6px 12px', gap: '5px' }}
            >
              <ListChecks size={11} />
              Planejar
              {weekTasks.length > 0 && <span style={{ background: '#B8A070', color: '#FAF8F4', borderRadius: '10px', padding: '1px 5px', fontSize: '9px' }}>{weekTasks.length}</span>}
            </button>
            <button
              onClick={() => setCreatingBlock(true)}
              className="btn-minaue"
              style={{ borderColor: 'rgba(184,160,112,0.4)', color: '#5E6E5F', fontSize: '9px', padding: '6px 10px' }}
            >
              <Plus size={11} />
            </button>
          </div>
        </div>

        {/* Mobile day tabs */}
        <div className="flex gap-1 mt-3 md:hidden">
          {DAY_LABELS.map((d, i) => {
            const date = addDays(weekStart, i)
            const isToday = isSameDay(date, new Date())
            const hasTasks = weekTasks.filter((wt) => wt.dayOfWeek === i + 1).length > 0
            return (
              <button
                key={i}
                onClick={() => setActiveDay(i)}
                style={{
                  flex: 1, padding: '5px 2px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  background: activeDay === i ? 'rgba(184,160,112,0.2)' : 'transparent',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                }}
              >
                <span style={{ fontFamily: fontSans, fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: isToday ? '#B8A070' : activeDay === i ? '#D4BC8C' : '#5E6E5F', fontWeight: 300 }}>
                  {d}
                </span>
                <span style={{ fontFamily: fontSans, fontSize: '11px', color: isToday ? '#B8A070' : activeDay === i ? '#D4BC8C' : '#7A8070', fontWeight: activeDay === i ? 400 : 300 }}>
                  {format(date, 'd')}
                </span>
                {hasTasks && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#B8A070' }} />}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="flex-1 overflow-auto px-2 py-3">
        <WeekGrid weekStart={weekStart} activeDayIndex={activeDay} onDayChange={setActiveDay} />
      </div>

      {/* Dialogs */}
      {creatingBlock && (
        <BlockDialog
          onSave={(data) => addTimeBlock(data)}
          onClose={() => setCreatingBlock(false)}
        />
      )}
      {showPlanning && (
        <PlanningPanel weekOf={getWeekOf(weekStart)} onClose={() => setShowPlanning(false)} />
      )}
    </div>
  )
}
