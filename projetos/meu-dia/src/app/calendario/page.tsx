'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { TimeBlock, WeekTask, Task, Project } from '@/lib/types'
import {
  format, startOfWeek, addDays, addWeeks, subWeeks, parseISO,
  differenceInCalendarDays, isToday,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { CSSProperties } from 'react'
import {
  ChevronLeft, ChevronRight, X, Clock, Calendar,
  ListChecks, Layers, Check, Trash2,
} from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const fontDisplay = 'var(--font-cormorant), "Cormorant Garamond", serif'
const fontSans    = 'var(--font-jost), Jost, sans-serif'

const DAY_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const DAY_FULL  = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

const BLOCK_COLORS = [
  '#7A9E82', '#7899B8', '#C4848C', '#B89C5A',
  '#9B8EC0', '#B8886A', '#6B9BAA', '#8A9E78',
]

const PRIORITY_DOT: Record<string, string> = {
  alta: '#E07070', media: '#D4A060', baixa: '#7899B8', nenhuma: 'transparent',
}

// ── Helpers ────────────────────────────────────────────────────────────────

function minToTime(m: number) {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}
function timeToMin(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

// ── TaskCard ───────────────────────────────────────────────────────────────

function TaskCard({
  wt, task, project, onSetTime, onSetDay, onRemove,
}: {
  wt: WeekTask; task: Task; project?: Project
  onSetTime: () => void; onSetDay: () => void; onRemove: () => void
}) {
  const color = project?.color ?? '#B8A070'
  return (
    <div style={{
      background: '#FAF8F4', borderRadius: '8px', marginBottom: '5px',
      border: `1px solid #E8E4DC`, borderLeft: `3px solid ${color}`,
      padding: '7px 8px 6px 10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: fontSans, fontSize: '13px', fontWeight: 400,
            color: '#282F29', margin: 0, lineHeight: 1.35,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {task.priority !== 'nenhuma' && (
              <span style={{
                display: 'inline-block', width: '6px', height: '6px',
                borderRadius: '50%', background: PRIORITY_DOT[task.priority],
                marginRight: '5px', verticalAlign: 'middle', flexShrink: 0,
              }} />
            )}
            {task.title}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px', flexWrap: 'wrap' }}>
            {project && (
              <span style={{ fontFamily: fontSans, fontSize: '10px', color: '#9A9490' }}>
                {project.name}
              </span>
            )}
            {wt.time && (
              <span style={{
                fontFamily: fontSans, fontSize: '10px', color: '#6A7060',
                background: '#EDE9E0', borderRadius: '4px', padding: '1px 5px', fontWeight: 500,
              }}>
                {wt.time}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1px', flexShrink: 0, marginTop: '1px' }}>
          <IconBtn icon={<Clock size={11} />} title="Horário" onClick={onSetTime} />
          <IconBtn icon={<Calendar size={11} />} title="Dia" onClick={onSetDay} />
          <IconBtn icon={<X size={11} />} title="Tirar da semana" onClick={onRemove} danger />
        </div>
      </div>
    </div>
  )
}

function IconBtn({
  icon, title, onClick, danger = false,
}: { icon: React.ReactNode; title: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: '22px', height: '22px', border: 'none', background: 'transparent',
        cursor: 'pointer', borderRadius: '4px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C0BCB4',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = danger ? '#FAEAEA' : '#EDE9E0'
        e.currentTarget.style.color = danger ? '#C07070' : '#6A7060'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = '#C0BCB4'
      }}
    >
      {icon}
    </button>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function CalendarioPage() {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [activeDayIdx, setActiveDayIdx] = useState(() => {
    const today = new Date()
    const d = today.getDay() // 0=Sun
    return d === 0 ? 6 : d - 1
  })
  const [orgOpen, setOrgOpen]     = useState(false)
  const [blocosOpen, setBlocosOpen] = useState(false)
  const [editTimeWt, setEditTimeWt] = useState<WeekTask | null>(null)
  const [editDayWt, setEditDayWt]   = useState<WeekTask | null>(null)

  // block form
  const [blockForm, setBlockForm] = useState({
    title: '', color: BLOCK_COLORS[0], type: 'fixed' as 'fixed' | 'thematic',
    days: [] as number[], startTime: '08:00', endTime: '09:00',
  })

  const weekOf = format(weekStart, 'yyyy-MM-dd')
  const days   = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const {
    projects, tasks, timeBlocks, weekTasks,
    addWeekTask, removeWeekTask, updateWeekTask, updateTask,
    addTimeBlock, deleteTimeBlock,
  } = useStore(useShallow((s) => ({
    projects: s.projects, tasks: s.tasks,
    timeBlocks: s.timeBlocks, weekTasks: s.weekTasks,
    addWeekTask: s.addWeekTask, removeWeekTask: s.removeWeekTask,
    updateWeekTask: s.updateWeekTask, updateTask: s.updateTask,
    addTimeBlock: s.addTimeBlock, deleteTimeBlock: s.deleteTimeBlock,
  })))

  const thisWeekTasks    = useMemo(() => weekTasks.filter(wt => wt.weekOf === weekOf), [weekTasks, weekOf])
  const unscheduledWts   = useMemo(() => thisWeekTasks.filter(wt => !wt.dayOfWeek), [thisWeekTasks])
  const taskIdsInWeek    = useMemo(() => new Set(thisWeekTasks.map(wt => wt.taskId)), [thisWeekTasks])
  const pendingTasks     = useMemo(() => tasks.filter(t => t.status !== 'concluida'), [tasks])

  function getProject(task: Task): Project | undefined {
    return projects.find(p => p.id === task.projectId)
  }
  function getTask(taskId: string): Task | undefined {
    return tasks.find(t => t.id === taskId)
  }
  function getTasksForDay(dayIdx: number): WeekTask[] {
    return thisWeekTasks
      .filter(wt => wt.dayOfWeek === dayIdx + 1)
      .sort((a, b) => (a.time ?? '99:99').localeCompare(b.time ?? '99:99'))
  }
  function getBlocksForDay(dayIdx: number): TimeBlock[] {
    return timeBlocks.filter(b => b.days.includes(dayIdx + 1))
  }

  function toggleTaskInWeek(task: Task) {
    if (taskIdsInWeek.has(task.id)) {
      const wt = thisWeekTasks.find(wt => wt.taskId === task.id)
      if (wt) removeWeekTask(wt.id)
    } else {
      // If task has deadline within this week, auto-assign day
      let dayOfWeek: number | undefined
      let time: string | undefined
      if (task.deadline) {
        const dl = parseISO(task.deadline.slice(0, 10))
        const diff = differenceInCalendarDays(dl, weekStart)
        if (diff >= 0 && diff < 7) {
          dayOfWeek = diff + 1
          if (task.deadline.includes('T')) {
            time = task.deadline.split('T')[1].slice(0, 5)
          }
        }
      }
      addWeekTask({ taskId: task.id, dayOfWeek, time, weekOf })
    }
  }

  function assignDay(wt: WeekTask, dayOfWeek: number | undefined) {
    updateWeekTask(wt.id, { dayOfWeek })
    // Update task deadline date
    if (dayOfWeek !== undefined) {
      const date = addDays(weekStart, dayOfWeek - 1)
      const task = getTask(wt.taskId)
      if (task) {
        const t = wt.time ?? (task.deadline?.includes('T') ? task.deadline.split('T')[1].slice(0, 5) : undefined)
        updateTask(wt.taskId, {
          deadline: t
            ? `${format(date, 'yyyy-MM-dd')}T${t}:00`
            : format(date, 'yyyy-MM-dd'),
        })
      }
    }
    setEditDayWt(null)
  }

  function assignTime(wt: WeekTask, time: string | undefined) {
    updateWeekTask(wt.id, { time })
    if (wt.dayOfWeek !== undefined) {
      const date = addDays(weekStart, wt.dayOfWeek - 1)
      updateTask(wt.taskId, {
        deadline: time
          ? `${format(date, 'yyyy-MM-dd')}T${time}:00`
          : format(date, 'yyyy-MM-dd'),
      })
    }
    setEditTimeWt(null)
  }

  function saveBlock() {
    if (!blockForm.title.trim() || blockForm.days.length === 0) return
    addTimeBlock({
      title: blockForm.title.trim(),
      color: blockForm.color,
      type: blockForm.type,
      days: blockForm.days,
      startMinutes: timeToMin(blockForm.startTime),
      endMinutes: timeToMin(blockForm.endTime),
    })
    setBlockForm({ title: '', color: BLOCK_COLORS[0], type: 'fixed', days: [], startTime: '08:00', endTime: '09:00' })
  }

  // ── Layout ──────────────────────────────────────────────────────────────

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div style={{ minHeight: '100vh', background: '#EDEAE4', fontFamily: fontSans }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <header style={{
        background: '#FAF8F4', borderBottom: '1px solid #E0DBD2',
        padding: '0 20px', height: '56px',
        display: 'flex', alignItems: 'center', gap: '12px',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        {/* Week navigation */}
        <button onClick={() => setWeekStart(w => subWeeks(w, 1))} style={navBtnStyle}>
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontFamily: fontDisplay, fontStyle: 'italic', fontSize: '18px', color: '#3D5040', minWidth: '160px', textAlign: 'center' }}>
          {format(weekStart, "d 'de' MMM", { locale: ptBR })}
          {' — '}
          {format(addDays(weekStart, 6), "d 'de' MMM", { locale: ptBR })}
        </span>
        <button onClick={() => setWeekStart(w => addWeeks(w, 1))} style={navBtnStyle}>
          <ChevronRight size={16} />
        </button>

        <button
          onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
          style={{ ...navBtnStyle, fontSize: '10px', letterSpacing: '0.08em', padding: '4px 8px', width: 'auto', color: '#8B7550' }}
        >
          HOJE
        </button>

        <div style={{ flex: 1 }} />

        {/* Blocos */}
        <button onClick={() => setBlocosOpen(true)} style={headerBtnStyle}>
          <Layers size={14} />
          <span>Blocos</span>
        </button>

        {/* Organizar semana */}
        <button
          onClick={() => setOrgOpen(true)}
          style={{ ...headerBtnStyle, background: '#3D5040', color: '#F5F0E8', borderColor: '#3D5040' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#2d3d30' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#3D5040' }}
        >
          <ListChecks size={14} />
          <span>Organizar semana</span>
        </button>
      </header>

      {/* ── Unscheduled tasks row ────────────────────────────────── */}
      {unscheduledWts.length > 0 && (
        <div style={{
          background: '#FAF8F4', borderBottom: '1px solid #E0DBD2',
          padding: '10px 20px',
        }}>
          <p style={{ fontFamily: fontSans, fontSize: '10px', color: '#A09888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Esta semana — sem dia definido
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {unscheduledWts.map(wt => {
              const task = getTask(wt.taskId)
              if (!task) return null
              const proj = getProject(task)
              const color = proj?.color ?? '#B8A070'
              return (
                <div key={wt.id} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: '#FAF8F4', border: `1px solid #E0DBD2`,
                  borderLeft: `3px solid ${color}`, borderRadius: '6px',
                  padding: '5px 8px 5px 10px', fontSize: '12px',
                  fontFamily: fontSans, color: '#282F29',
                }}>
                  <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.title}
                  </span>
                  <IconBtn icon={<Calendar size={11} />} title="Definir dia" onClick={() => setEditDayWt(wt)} />
                  <IconBtn icon={<X size={11} />} title="Tirar da semana" onClick={() => removeWeekTask(wt.id)} danger />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Mobile day tabs ──────────────────────────────────────── */}
      <div className="md:hidden" style={{
        background: '#FAF8F4', borderBottom: '1px solid #E0DBD2',
        display: 'flex', overflowX: 'auto',
      }}>
        {days.map((day, i) => {
          const active = i === activeDayIdx
          const today  = isToday(day)
          const count  = getTasksForDay(i).length
          return (
            <button key={i} onClick={() => setActiveDayIdx(i)} style={{
              flex: '0 0 auto', padding: '10px 14px', border: 'none', cursor: 'pointer',
              background: active ? '#3D5040' : 'transparent',
              borderBottom: active ? '2px solid #B8A070' : '2px solid transparent',
              fontFamily: fontSans, fontSize: '11px', letterSpacing: '0.06em',
              color: active ? '#F5F0E8' : today ? '#B8A070' : '#7A8070',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            }}>
              <span style={{ textTransform: 'uppercase' }}>{DAY_SHORT[i]}</span>
              <span style={{ fontSize: '13px', fontWeight: active ? 500 : 300 }}>{format(day, 'd')}</span>
              {count > 0 && (
                <span style={{
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: active ? '#B8A07080' : '#D8D2C8',
                  fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: active ? '#F5F0E8' : '#8A8070',
                }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div style={{ padding: '16px 20px 100px' }}>

        {/* Desktop: 7 columns */}
        <div className="hidden md:grid" style={{
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
          display: 'grid',
        } as CSSProperties}>
          {days.map((day, i) => (
            <DayColumn
              key={i}
              day={day}
              dayIdx={i}
              weekTasks={getTasksForDay(i)}
              blocks={getBlocksForDay(i)}
              tasks={tasks}
              projects={projects}
              onSetTime={setEditTimeWt}
              onSetDay={setEditDayWt}
              onRemove={(wt) => removeWeekTask(wt.id)}
            />
          ))}
        </div>

        {/* Mobile: single day */}
        <div className="md:hidden">
          <DayColumn
            day={days[activeDayIdx]}
            dayIdx={activeDayIdx}
            weekTasks={getTasksForDay(activeDayIdx)}
            blocks={getBlocksForDay(activeDayIdx)}
            tasks={tasks}
            projects={projects}
            onSetTime={setEditTimeWt}
            onSetDay={setEditDayWt}
            onRemove={(wt) => removeWeekTask(wt.id)}
            showHeader={false}
          />
        </div>
      </div>

      {/* ── Organizar semana sheet ───────────────────────────────── */}
      <Sheet open={orgOpen} onOpenChange={setOrgOpen}>
        <SheetContent side="right" style={{ background: '#FAF8F4', borderLeft: '1px solid #E0DBD2', width: '340px', maxWidth: '90vw', padding: '24px 20px', overflowY: 'auto' }}>
          <SheetHeader style={{ marginBottom: '20px' }}>
            <SheetTitle style={{ fontFamily: fontDisplay, fontStyle: 'italic', fontSize: '22px', color: '#3D5040', fontWeight: 400 }}>
              Organizar a semana
            </SheetTitle>
            <p style={{ fontFamily: fontSans, fontSize: '11px', color: '#A09888', letterSpacing: '0.05em', marginTop: '2px' }}>
              {format(weekStart, "d MMM", { locale: ptBR })} — {format(addDays(weekStart, 6), "d MMM", { locale: ptBR })}
            </p>
          </SheetHeader>

          {/* Group pending tasks by project */}
          {projects
            .filter(p => !p.parentId && pendingTasks.some(t => t.projectId === p.id))
            .map(proj => {
              const projTasks = pendingTasks.filter(t => t.projectId === proj.id)
              return (
                <div key={proj.id} style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: proj.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: fontSans, fontSize: '11px', fontWeight: 500, color: '#3D5040', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {proj.name}
                    </span>
                  </div>
                  {projTasks.map(task => {
                    const inWeek = taskIdsInWeek.has(task.id)
                    const wt = thisWeekTasks.find(w => w.taskId === task.id)
                    return (
                      <button
                        key={task.id}
                        onClick={() => toggleTaskInWeek(task)}
                        style={{
                          width: '100%', textAlign: 'left', display: 'flex', alignItems: 'flex-start',
                          gap: '10px', padding: '8px 10px', borderRadius: '8px',
                          border: `1px solid ${inWeek ? proj.color + '40' : '#E8E4DC'}`,
                          background: inWeek ? proj.color + '0A' : 'transparent',
                          cursor: 'pointer', marginBottom: '4px',
                          transition: 'all 0.15s',
                        }}
                      >
                        {/* Checkbox */}
                        <div style={{
                          width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0, marginTop: '1px',
                          border: `1.5px solid ${inWeek ? proj.color : '#C8C4BC'}`,
                          background: inWeek ? proj.color : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {inWeek && <Check size={10} color="#fff" strokeWidth={2.5} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: fontSans, fontSize: '13px', color: '#282F29', margin: 0, lineHeight: 1.3 }}>
                            {task.title}
                          </p>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                            {task.deadline && (
                              <span style={{ fontFamily: fontSans, fontSize: '10px', color: '#9A8878' }}>
                                {format(parseISO(task.deadline.slice(0, 10)), "d MMM", { locale: ptBR })}
                              </span>
                            )}
                            {wt?.dayOfWeek && (
                              <span style={{ fontFamily: fontSans, fontSize: '10px', color: proj.color, fontWeight: 500 }}>
                                {DAY_SHORT[wt.dayOfWeek - 1]} {wt.time && `· ${wt.time}`}
                              </span>
                            )}
                            {inWeek && !wt?.dayOfWeek && (
                              <span style={{ fontFamily: fontSans, fontSize: '10px', color: '#A09888', fontStyle: 'italic' }}>
                                sem dia definido
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )
            })
          }

          {pendingTasks.length === 0 && (
            <p style={{ fontFamily: fontSans, fontSize: '13px', color: '#A09888', textAlign: 'center', marginTop: '40px', fontStyle: 'italic' }}>
              Nenhuma tarefa pendente
            </p>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Blocos de trabalho dialog ────────────────────────────── */}
      <Dialog open={blocosOpen} onOpenChange={setBlocosOpen}>
        <DialogContent style={{ background: '#FAF8F4', border: '1px solid #E0DBD2', borderRadius: '16px', maxWidth: '480px', maxHeight: '80vh', overflowY: 'auto' }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: fontDisplay, fontStyle: 'italic', fontSize: '22px', color: '#3D5040', fontWeight: 400 }}>
              Blocos de trabalho
            </DialogTitle>
          </DialogHeader>

          {/* Existing blocks */}
          <div style={{ marginBottom: '20px' }}>
            {timeBlocks.length === 0 ? (
              <p style={{ fontFamily: fontSans, fontSize: '13px', color: '#A09888', fontStyle: 'italic' }}>
                Nenhum bloco cadastrado
              </p>
            ) : (
              timeBlocks.map(b => (
                <div key={b.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 10px', borderRadius: '8px',
                  border: '1px solid #E8E4DC', background: '#FAF8F4',
                  marginBottom: '6px',
                }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: b.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: fontSans, fontSize: '13px', color: '#282F29', margin: 0 }}>{b.title}</p>
                    <p style={{ fontFamily: fontSans, fontSize: '10px', color: '#9A9490', margin: 0 }}>
                      {minToTime(b.startMinutes)}–{minToTime(b.endMinutes)}
                      {' · '}
                      {b.days.map(d => DAY_SHORT[d - 1]).join(', ')}
                    </p>
                  </div>
                  <button onClick={() => deleteTimeBlock(b.id)} style={{
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    color: '#C8B8B0', padding: '4px',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#C07070' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#C8B8B0' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add new block form */}
          <div style={{ borderTop: '1px solid #E0DBD2', paddingTop: '16px' }}>
            <p style={{ fontFamily: fontSans, fontSize: '11px', color: '#A09888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Novo bloco
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                placeholder="Nome do bloco (ex: Academia, Foco PlanetaZen…)"
                value={blockForm.title}
                onChange={e => setBlockForm(f => ({ ...f, title: e.target.value }))}
                style={inputStyle}
              />
              {/* Color picker */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {BLOCK_COLORS.map(c => (
                  <button key={c} onClick={() => setBlockForm(f => ({ ...f, color: c }))} style={{
                    width: '24px', height: '24px', borderRadius: '50%', background: c,
                    border: blockForm.color === c ? '2px solid #282F29' : '2px solid transparent',
                    cursor: 'pointer', outline: 'none',
                  }} />
                ))}
              </div>
              {/* Days */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {DAY_SHORT.map((d, i) => {
                  const selected = blockForm.days.includes(i + 1)
                  return (
                    <button
                      key={i}
                      onClick={() => setBlockForm(f => ({
                        ...f,
                        days: selected ? f.days.filter(x => x !== i + 1) : [...f.days, i + 1],
                      }))}
                      style={{
                        flex: 1, padding: '5px 0', border: 'none', borderRadius: '6px',
                        background: selected ? blockForm.color : '#EDE9E0',
                        color: selected ? '#fff' : '#7A8070',
                        fontFamily: fontSans, fontSize: '11px', cursor: 'pointer',
                      }}
                    >
                      {d}
                    </button>
                  )
                })}
              </div>
              {/* Times */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="time" value={blockForm.startTime}
                  onChange={e => setBlockForm(f => ({ ...f, startTime: e.target.value }))}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <span style={{ color: '#A09888', fontFamily: fontSans, fontSize: '12px' }}>até</span>
                <input type="time" value={blockForm.endTime}
                  onChange={e => setBlockForm(f => ({ ...f, endTime: e.target.value }))}
                  style={{ ...inputStyle, flex: 1 }}
                />
              </div>
              <button
                onClick={saveBlock}
                disabled={!blockForm.title.trim() || blockForm.days.length === 0}
                style={{
                  padding: '9px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: '#3D5040', color: '#F5F0E8',
                  fontFamily: fontSans, fontSize: '13px', letterSpacing: '0.04em',
                  opacity: !blockForm.title.trim() || blockForm.days.length === 0 ? 0.4 : 1,
                }}
              >
                Adicionar bloco
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit time dialog ─────────────────────────────────────── */}
      {editTimeWt && (() => {
        const task = getTask(editTimeWt.taskId)
        return (
          <Dialog open onOpenChange={() => setEditTimeWt(null)}>
            <DialogContent style={{ background: '#FAF8F4', border: '1px solid #E0DBD2', borderRadius: '16px', maxWidth: '320px' }}>
              <DialogHeader>
                <DialogTitle style={{ fontFamily: fontDisplay, fontStyle: 'italic', fontSize: '20px', color: '#3D5040', fontWeight: 400 }}>
                  Definir horário
                </DialogTitle>
              </DialogHeader>
              {task && <p style={{ fontFamily: fontSans, fontSize: '13px', color: '#7A8070', marginBottom: '12px' }}>{task.title}</p>}
              <input
                type="time"
                defaultValue={editTimeWt.time ?? ''}
                onChange={e => {
                  const val = e.target.value
                  if (val) assignTime(editTimeWt, val)
                }}
                style={inputStyle}
                autoFocus
              />
              {editTimeWt.time && (
                <button onClick={() => assignTime(editTimeWt, undefined)} style={{ ...clearBtnStyle, marginTop: '8px' }}>
                  Limpar horário
                </button>
              )}
            </DialogContent>
          </Dialog>
        )
      })()}

      {/* ── Edit day dialog ──────────────────────────────────────── */}
      {editDayWt && (() => {
        const task = getTask(editDayWt.taskId)
        return (
          <Dialog open onOpenChange={() => setEditDayWt(null)}>
            <DialogContent style={{ background: '#FAF8F4', border: '1px solid #E0DBD2', borderRadius: '16px', maxWidth: '360px' }}>
              <DialogHeader>
                <DialogTitle style={{ fontFamily: fontDisplay, fontStyle: 'italic', fontSize: '20px', color: '#3D5040', fontWeight: 400 }}>
                  Definir dia
                </DialogTitle>
              </DialogHeader>
              {task && <p style={{ fontFamily: fontSans, fontSize: '13px', color: '#7A8070', marginBottom: '14px' }}>{task.title}</p>}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {days.map((day, i) => {
                  const selected = editDayWt.dayOfWeek === i + 1
                  return (
                    <button key={i} onClick={() => assignDay(editDayWt, i + 1)} style={{
                      flex: '1 0 calc(14% - 4px)', padding: '8px 4px', borderRadius: '8px',
                      border: `1px solid ${selected ? '#3D5040' : '#E0DBD2'}`,
                      background: selected ? '#3D5040' : '#FAF8F4',
                      color: selected ? '#F5F0E8' : '#282F29',
                      fontFamily: fontSans, fontSize: '11px', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                    }}>
                      <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{DAY_SHORT[i]}</span>
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>{format(day, 'd')}</span>
                    </button>
                  )
                })}
              </div>
              {editDayWt.dayOfWeek && (
                <button onClick={() => assignDay(editDayWt, undefined)} style={{ ...clearBtnStyle, marginTop: '12px' }}>
                  Sem dia definido
                </button>
              )}
            </DialogContent>
          </Dialog>
        )
      })()}

    </div>
  )
}

// ── DayColumn ──────────────────────────────────────────────────────────────

function DayColumn({
  day, dayIdx, weekTasks, blocks, tasks, projects,
  onSetTime, onSetDay, onRemove, showHeader = true,
}: {
  day: Date; dayIdx: number
  weekTasks: WeekTask[]; blocks: TimeBlock[]
  tasks: Task[]; projects: Project[]
  onSetTime: (wt: WeekTask) => void
  onSetDay: (wt: WeekTask) => void
  onRemove: (wt: WeekTask) => void
  showHeader?: boolean
}) {
  const today = isToday(day)

  function getTask(taskId: string) { return tasks.find(t => t.id === taskId) }
  function getProject(task: Task)  { return projects.find(p => p.id === task.projectId) }

  return (
    <div style={{
      background: today ? '#F5F2EA' : '#FAF8F4',
      borderRadius: '10px',
      border: `1px solid ${today ? '#D4C9A8' : '#E0DBD2'}`,
      padding: '10px 8px',
      minHeight: '120px',
    }}>
      {/* Day header */}
      {showHeader && (
        <div style={{ marginBottom: '8px' }}>
          <p style={{
            fontFamily: fontSans, fontSize: '10px', textTransform: 'uppercase',
            letterSpacing: '0.1em', color: today ? '#B8A070' : '#9A9490', margin: 0,
          }}>
            {DAY_SHORT[dayIdx]}
          </p>
          <p style={{
            fontFamily: fontDisplay, fontStyle: 'italic', fontSize: '20px',
            color: today ? '#B8A070' : '#282F29', margin: 0, lineHeight: 1,
          }}>
            {format(day, 'd')}
          </p>
        </div>
      )}

      {/* Block color dots */}
      {blocks.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
          {blocks.map(b => (
            <div key={b.id} title={`${b.title} · ${minToTime(b.startMinutes)}–${minToTime(b.endMinutes)}`} style={{
              height: '4px', borderRadius: '2px', flex: '1 0 16px', maxWidth: '32px',
              background: b.color, opacity: 0.85,
            }} />
          ))}
        </div>
      )}

      {/* Tasks */}
      {weekTasks.length === 0 ? (
        <p style={{ fontFamily: fontSans, fontSize: '11px', color: '#C8C4BC', fontStyle: 'italic', margin: 0 }}>
          —
        </p>
      ) : (
        weekTasks.map(wt => {
          const task = getTask(wt.taskId)
          if (!task) return null
          const proj = getProject(task)
          return (
            <TaskCard
              key={wt.id}
              wt={wt}
              task={task}
              project={proj}
              onSetTime={() => onSetTime(wt)}
              onSetDay={() => onSetDay(wt)}
              onRemove={() => onRemove(wt)}
            />
          )
        })
      )}
    </div>
  )
}

// ── Shared styles ──────────────────────────────────────────────────────────

const navBtnStyle: CSSProperties = {
  width: '28px', height: '28px', border: '1px solid #E0DBD2',
  borderRadius: '6px', background: '#FAF8F4', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#7A8070',
}

const headerBtnStyle: CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '6px',
  padding: '6px 12px', borderRadius: '8px', border: '1px solid #D8D2C8',
  background: '#FAF8F4', cursor: 'pointer', color: '#3D5040',
  fontFamily: 'var(--font-jost), Jost, sans-serif', fontSize: '12px',
  letterSpacing: '0.04em',
}

const inputStyle: CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: '8px',
  border: '1px solid #E0DBD2', background: '#FAF8F4',
  fontFamily: 'var(--font-jost), Jost, sans-serif', fontSize: '13px', color: '#282F29',
  outline: 'none', boxSizing: 'border-box',
}

const clearBtnStyle: CSSProperties = {
  width: '100%', padding: '7px', border: '1px solid #E0DBD2',
  borderRadius: '8px', background: 'transparent', cursor: 'pointer',
  fontFamily: 'var(--font-jost), Jost, sans-serif', fontSize: '12px',
  color: '#9A9490', letterSpacing: '0.04em',
}
