'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, Timer, Repeat, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/',          label: 'Início',    icon: LayoutDashboard },
  { href: '/projetos',  label: 'Projetos',  icon: FolderKanban },
  { href: '/rotinas',   label: 'Rotinas',   icon: Repeat },
  { href: '/foco',      label: 'Foco',      icon: Timer },
  { href: '/relatorio', label: 'Relatório', icon: BarChart2 },
]

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
        style={{ background: '#242B25', borderColor: '#3A4439' }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-6 h-16 border-b"
          style={{ borderColor: '#3A4439' }}
        >
          {/* Logotipo em texto cursivo como no site */}
          <div>
            <p
              className="leading-none"
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: '22px',
                color: '#D4BC8C',
                letterSpacing: '0.02em',
              }}
            >
              Meu Dia
            </p>
            <p
              className="text-[9px] tracking-[0.3em] uppercase mt-0.5"
              style={{ color: '#5E6E5F', fontFamily: 'var(--font-jost), Jost, sans-serif', fontWeight: 300 }}
            >
              Minaue
            </p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-5 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2 rounded transition-all text-sm"
                style={{
                  color: active ? '#D4BC8C' : '#7A8E7B',
                  background: active ? 'rgba(184,160,112,0.08)' : 'transparent',
                  fontFamily: 'var(--font-jost), Jost, sans-serif',
                  fontWeight: active ? 400 : 300,
                  letterSpacing: '0.02em',
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = '#B8A070'
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = '#7A8E7B'
                }}
              >
                <Icon size={15} strokeWidth={1.5} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Rodapé da sidebar */}
        <div
          className="px-6 py-4 border-t"
          style={{ borderColor: '#3A4439' }}
        >
          <div
            className="w-full h-px mb-3"
            style={{ background: 'linear-gradient(to right, #B8A070, transparent)' }}
          />
          <p
            className="text-[10px] tracking-[0.2em] uppercase"
            style={{ color: '#5E6E5F', fontFamily: 'var(--font-jost), Jost, sans-serif', fontWeight: 300 }}
          >
            Mandalas que Florescem
          </p>
        </div>
      </aside>

      {/* ── Mobile bottom tab ───────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 flex border-t"
        style={{ background: '#242B25', borderColor: '#3A4439' }}
      >
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors"
              style={{
                color: active ? '#D4BC8C' : '#4A5B4B',
                fontFamily: 'var(--font-jost), Jost, sans-serif',
              }}
            >
              <Icon size={18} strokeWidth={active ? 1.75 : 1.5} />
              <span className="text-[9px] font-light tracking-wider uppercase">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
