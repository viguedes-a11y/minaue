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
      {/* ── Desktop: sidebar esquerda ───────────────────────── */}
      <aside
        className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col z-40 border-r"
        style={{ background: '#0F0E0D', borderColor: '#1D1B19' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b" style={{ borderColor: '#1D1B19' }}>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: '#FBBF24', color: '#0F0E0D' }}
          >
            M
          </div>
          <span className="font-semibold text-base tracking-tight" style={{ color: '#EDE8E3' }}>
            Meu Dia
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  active
                    ? 'text-[#EDE8E3]'
                    : 'text-[#7A7470] hover:text-[#C0BBB6] hover:bg-white/5'
                )}
                style={active ? { background: '#1D1B19' } : {}}
              >
                <Icon size={16} strokeWidth={active ? 2 : 1.5} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom: user area */}
        <div
          className="px-4 py-4 border-t text-xs"
          style={{ borderColor: '#1D1B19', color: '#4A4744' }}
        >
          Meu Dia · v2
        </div>
      </aside>

      {/* ── Mobile: bottom tab bar ──────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 flex border-t"
        style={{ background: '#0F0E0D', borderColor: '#1D1B19' }}
      >
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
              style={{ color: active ? '#EDE8E3' : '#4A4744' }}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.5} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
