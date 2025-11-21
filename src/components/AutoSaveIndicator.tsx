import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function AutoSaveIndicator({ lastSaved }: { lastSaved: number | null }) {
  const [display, setDisplay] = useState('')

  useEffect(() => {
    if (!lastSaved) {
      setDisplay('')
      return
    }

    const updateDisplay = () => {
      const now = Date.now()
      const diff = now - lastSaved
      
      if (diff < 1000) {
        setDisplay('Saved just now')
      } else if (diff < 60000) {
        setDisplay(`Saved ${Math.floor(diff / 1000)}s ago`)
      } else if (diff < 3600000) {
        setDisplay(`Saved ${Math.floor(diff / 60000)}m ago`)
      } else {
        setDisplay('Saved')
      }
    }

    updateDisplay()
    const interval = setInterval(updateDisplay, 1000)
    return () => clearInterval(interval)
  }, [lastSaved])

  if (!display) return null

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className={cn(
        'h-2 w-2 rounded-full bg-green-500 animate-pulse'
      )} />
      {display}
    </div>
  )
}
