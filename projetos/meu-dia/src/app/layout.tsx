import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'
import { NavBar } from '@/components/NavBar'
import { DataLoader } from '@/components/DataLoader'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
})

const jost = Jost({
  variable: '--font-jost',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'Meu Dia · Minaue',
  description: 'Gerenciador pessoal de tarefas e projetos',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#282F29',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${jost.variable} h-full`}>
      <body className="min-h-full antialiased" style={{ background: '#EDEAE4', color: '#282F29' }}>
        <DataLoader />
        <NavBar />
        <main className="pb-20 md:pb-0 md:pl-60">{children}</main>
      </body>
    </html>
  )
}
