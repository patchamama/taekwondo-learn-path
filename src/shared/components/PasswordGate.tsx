import { useState, type FormEvent, type ReactNode } from 'react'

// SHA-256 of the accepted passwords (case-insensitive, trimmed). This is a deterrent for the published
// site, not real security: everything is served to the browser.
export const ACCEPTED_HASHES = [
  '0a558ea392a194eeae1b070a2a7dbaac7452c9337be8dedd5b60741b6a643f2a',
  '5e6fa6b5a6b1a2ff7a2c7fd56b158d7a49f8805d809826da6f5a83901cd9798d',
]
const KEY = 'tkd-unlocked'

export async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function isAccepted(password: string): Promise<boolean> {
  return ACCEPTED_HASHES.includes(await sha256(password.trim().toLowerCase()))
}

const remembered = () => {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

/** Asks for a password before showing the app (used only in the published build). */
export function PasswordGate({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(remembered)
  const [value, setValue] = useState('')
  const [wrong, setWrong] = useState(false)
  if (open) return <>{children}</>
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (await isAccepted(value)) {
      try {
        localStorage.setItem(KEY, '1')
      } catch {
        /* storage blocked: the gate just asks again next time */
      }
      setOpen(true)
    } else setWrong(true)
  }
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-4">
      <form
        onSubmit={submit}
        className="grid w-full max-w-sm gap-3 rounded-2xl border bg-white p-6"
      >
        <h1 className="text-xl font-bold">Taekwondo Learn</h1>
        <label htmlFor="gate-password" className="text-sm font-medium">
          Password / Passwort / Contraseña
        </label>
        <input
          id="gate-password"
          type="password"
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setWrong(false)
          }}
          className="rounded-lg border px-3 py-2"
        />
        {wrong && (
          <p role="alert" className="text-sm text-rose-600">
            ✗
          </p>
        )}
        <button className="rounded-xl bg-emerald-500 py-2 font-bold text-white">OK</button>
      </form>
    </main>
  )
}
