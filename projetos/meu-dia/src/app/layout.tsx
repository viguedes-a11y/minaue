import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { NavBar } from '@/components/NavBar'

const geist = Geist({ variable: '--font-geist', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Meu Dia',
  description: 'Gerenciador pessoal de tarefas e projetos',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#0F0E0D',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full`}>
      <body className="min-h-full antialiased" style={{ background: '#0F0E0D', color: '#EDE8E3' }}>
        <NavBar />
        {/* mobile: bottom nav 64px; desktop: left sidebar 240px */}
        <main className="pb-20 md:pb-0 md:pl-60">{children}</main>
      </body>
    </html>
  )
}
