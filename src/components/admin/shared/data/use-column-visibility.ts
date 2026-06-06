import * as React from 'react'

export function useColumnVisibility(storageKey: string, defaultColumns: string[]) {
  const [visibleColumns, setVisibleColumns] = React.useState<string[]>([])

  React.useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        setVisibleColumns(JSON.parse(stored))
      } catch {
        setVisibleColumns(defaultColumns)
      }
    } else {
      setVisibleColumns(defaultColumns)
    }
  }, [storageKey])

  const toggleColumn = (column: string) => {
    setVisibleColumns((prev) => {
      const next = prev.includes(column)
        ? prev.filter((c) => c !== column)
        : [...prev, column]
      
      localStorage.setItem(storageKey, JSON.stringify(next))
      return next
    })
  }

  return { visibleColumns, toggleColumn }
}
