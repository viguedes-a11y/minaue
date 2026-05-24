'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, Timer, Repeat, BarChart2, Download, CalendarDays } from 'lucide-react'
import { useStore } from '@/lib/store'

const NAV = [
  { href: '/',            label: 'Início',     icon: LayoutDashboard },
  { href: '/projetos',    label: 'Projetos',   icon: FolderKanban },
  { href: '/calendario',  label: 'Calendário', icon: CalendarDays },
  { href: '/rotinas',     label: 'Rotinas',    icon: Repeat },
  { href: '/foco',        label: 'Foco',       icon: Timer },
  { href: '/relatorio',   label: 'Relatório',  icon: BarChart2 },
]

const fontDisplay = 'var(--font-cormorant), "Cormorant Garamond", serif'
const fontSans    = 'var(--font-jost), Jost, sans-serif'

function exportBackup() {
  const { projects, tasks } = useStore.getState()
  const data = JSON.stringify({ projects, tasks, exportedAt: new Date().toISOString() }, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `meu-dia-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function NavBar() {
  const pathname = usePathname()

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside
        className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col z-40 border-r"
        style={{ background: '#E8E5DF', borderColor: '#D8D2C8' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b" style={{ borderColor: '#D8D2C8' }}>
          <div>
            <p style={{ fontFamily: fontDisplay, fontStyle: 'italic', fontWeight: 300, fontSize: '22px', color: '#8B7550', letterSpacing: '0.02em', lineHeight: 1 }}>
              Meu Dia
            </p>
            <p className="text-[9px] tracking-[0.3em] uppercase mt-0.5" style={{ color: '#A09888', fontFamily: fontSans, fontWeight: 300 }}>
              Minaue
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-5 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2 rounded text-sm transition-all"
                style={{
                  color: active ? '#282F29' : '#7A8070',
                  background: active ? '#D4C9B030' : 'transparent',
                  fontFamily: fontSans,
                  fontWeight: active ? 400 : 300,
                  letterSpacing: '0.02em',
                  borderLeft: active ? '2px solid #B8A070' : '2px solid transparent',
                }}
              >
                <Icon size={15} strokeWidth={active ? 1.75 : 1.5} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Rodapé */}
        <div className="px-5 py-4 border-t space-y-3" style={{ borderColor: '#D8D2C8' }}>
          <div className="h-px" style={{ background: 'linear-gradient(to right, #B8A070, transparent)' }} />

          {/* Botão de backup */}
          <button
            onClick={exportBackup}
            className="w-full flex items-center gap-2 px-3 py-2 rounded transition-all"
            style={{
              fontFamily: fontSans, fontSize: '11px', fontWeight: 300,
              color: '#A09888', letterSpacing: '0.08em', background: 'transparent',
              border: '1px solid transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#8B7550'
              e.currentTarget.style.borderColor = 'rgba(184,160,112,0.3)'
              e.currentTarget.style.background = 'rgba(184,160,112,0.06)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#A09888'
              e.currentTarget.style.borderColor = 'transparent'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <Download size={13} strokeWidth={1.5} />
            Exportar backup
          </button>

          <p className="text-[9px] tracking-[0.3em] uppercase px-3" style={{ color: '#C8C4BC', fontFamily: fontSans, fontWeight: 300 }}>
            Mandalas que Florescem
          </p>
        </div>
      </aside>

      {/* ── Mobile bottom bar ───────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 flex border-t" style={{ background: '#E8E5DF', borderColor: '#D8D2C8' }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors"
              style={{ color: active ? '#282F29' : '#A09888', fontFamily: fontSans }}
            >
              <Icon size={18} strokeWidth={active ? 1.75 : 1.5} />
              <span className="text-[9px] font-light tracking-wider uppercase">{label}</span>
            </Link>
          )
        })}

        {/* Backup no mobile — botão pequeno no canto */}
        <button
          onClick={exportBackup}
          className="flex flex-col items-center justify-center py-2.5 gap-1 px-3 transition-colors"
          style={{ color: '#A09888', fontFamily: fontSans }}
        >
          <Download size={18} strokeWidth={1.5} />
          <span className="text-[9px] font-light tracking-wider uppercase">Backup</span>
        </button>
      </nav>
    </>
  )
}
