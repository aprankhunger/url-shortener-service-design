"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/client"

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const isLogin = mode === "login"

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setPending(true)
    setError(null)
    try {
      await api(`/api/auth/${mode}`, { method: "POST", json: { email: form.get("email"), password: form.get("password") } })
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-5 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{isLogin ? "Sign in" : "Create your account"}</h1>
        <p className="text-sm text-muted-foreground">{isLogin ? "Manage links and view analytics." : "Save links and track every click."}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={isLogin ? "demo@snip.dev" : ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          minLength={8}
          required
          defaultValue={isLogin ? "demo1234" : ""}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? "No account? " : "Already registered? "}
        <Link href={isLogin ? "/register" : "/login"} className="font-medium text-foreground underline underline-offset-4">
          {isLogin ? "Create one" : "Sign in"}
        </Link>
      </p>
    </form>
  )
}
