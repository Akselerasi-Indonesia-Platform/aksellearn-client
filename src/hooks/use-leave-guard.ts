import { useEffect } from 'react'
import { useBlocker } from '@tanstack/react-router'

export function useLeaveGuard(shouldBlock: boolean, message?: string) {
  // TEMPORARILY DISABLED due to SPA routing stability issues
  // Keeping the hook calls to satisfy React's Rules of Hooks during hot-reloads
  
  useBlocker({
    shouldBlockFn: () => false, // NEVER block
  })

  useEffect(() => {
    // Do nothing
  }, [shouldBlock])
}
