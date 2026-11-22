import { useEffect, useState } from 'react'
import { editorAvailable } from './api'

/** True only when the app runs locally with the editor backend; the editing UI is hidden on the deployed site. */
export function useEditor(): boolean {
  const [on, setOn] = useState(false)
  useEffect(() => {
    let alive = true
    editorAvailable().then((v) => alive && setOn(v))
    return () => {
      alive = false
    }
  }, [])
  return on
}
