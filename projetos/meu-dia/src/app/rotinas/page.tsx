'use client'

const fontDisplay = 'var(--font-cormorant), "Cormorant Garamond", serif'
const fontSans    = 'var(--font-jost), Jost, sans-serif'

export default function RotinasPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: fontDisplay, fontStyle: 'italic', fontSize: '28px', color: '#B8A070', marginBottom: '8px' }}>
          Rotinas
        </p>
        <p style={{ fontFamily: fontSans, fontSize: '13px', color: '#A09888', letterSpacing: '0.06em' }}>
          Em breve
        </p>
      </div>
    </div>
  )
}
