'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'

export function DataLoader() {
  const loadFromSupabase = useStore((s) => s.loadFromSupabase)
  const isLoaded = useStore((s) => s.isLoaded)

  useEffect(() => {
    if (!isLoaded) {
      loadFromSupabase()
    }
  }, [isLoaded, loadFromSupabase])

  return null
}
