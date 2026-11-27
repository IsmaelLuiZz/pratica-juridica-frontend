import { useEffect, useState } from 'react'
import { mensagemErro } from '../services/api'

export function useData<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [revision, setRevision] = useState(0)
  const [result, setResult] = useState<{ load: typeof load; revision: number; data?: T; error?: string }>()
  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal).then(
      data => { if (!controller.signal.aborted) setResult({ load, revision, data }) },
      error => { if (!controller.signal.aborted) setResult({ load, revision, error: mensagemErro(error) }) },
    )
    return () => controller.abort()
  }, [load, revision])
  const current = result?.load === load && result.revision === revision ? result : undefined
  return { data: current?.data, error: current?.error, reload: () => setRevision(value => value + 1) }
}
