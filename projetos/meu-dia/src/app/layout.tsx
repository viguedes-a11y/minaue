import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { NavBar } from '@/components/NavBar'

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Meu Dia',
  description: 'Gerenciador de tarefas e projetos',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#7C3AED',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-gray-50 text-gray-900 antialiased">
        <NavBar />
        <main className="pb-20 md:pb-0 md:pt-16">{children}</main>
      </body>
    </html>
  )
}
