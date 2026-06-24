import * as React from 'react'

type GuideLang = 'id' | 'en'

const STORAGE_KEY = 'guide_lang'

export function useGuideLang(): [GuideLang, (lang: GuideLang) => void] {
  const [lang, setLangState] = React.useState<GuideLang>(() => {
    if (typeof window === 'undefined') return 'id'
    return (localStorage.getItem(STORAGE_KEY) as GuideLang) || 'id'
  })

  const setLang = React.useCallback((newLang: GuideLang) => {
    localStorage.setItem(STORAGE_KEY, newLang)
    setLangState(newLang)
  }, [])

  return [lang, setLang]
}
