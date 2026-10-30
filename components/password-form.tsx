"use client"

import { useState } from "react"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/client"

export function PasswordForm({ code }: { code: string }) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    setError(null)
    try {
      const { url } = await api<{ url: string }>(`/api/urls/${encodeURIComponent(code)}/verify`, { method: "POST", json: { password } })
      window.location.assign(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify password.")
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-5 rounded-xl border border-border bg-card p-6 shadow-sm">
      <span className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
        <Lock aria-hidden className="size-5" />
      </span>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">This link is password protected</h1>
        <p className="text-sm text-muted-foreground">
          {"Enter the password to continue to "}
          <span className="font-mono text-foreground">/{code}</span>.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="link-pass">Password</Label>
        <Input id="link-pass" type="password" autoFocus required value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={Boolean(error) || undefined} />
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending || !password}>
        {pending ? "Checking…" : "Continue"}
      </Button>
    </form>
  )
}
