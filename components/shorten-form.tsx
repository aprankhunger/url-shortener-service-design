"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { ArrowRight, ChevronDown, Lock, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CopyButton } from "@/components/copy-button"
import { QrPanel } from "@/components/qr-panel"
import { api, displayHost, fetcher, formatDate, shortUrl } from "@/lib/client"
import type { PublicUrl } from "@/lib/types"

function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function ShortenForm({ signedIn }: { signedIn: boolean }) {
  const [longUrl, setLongUrl] = useState("")
  const [showOptions, setShowOptions] = useState(false)
  const [alias, setAlias] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [clickLimit, setClickLimit] = useState("")
  const [password, setPassword] = useState("")
  const [oneTime, setOneTime] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<PublicUrl | null>(null)

  const debouncedAlias = useDebounced(alias.trim(), 300)
  const { data: aliasCheck } = useSWR<{ available: boolean }>(
    debouncedAlias.length >= 3 ? `/api/urls?alias=${encodeURIComponent(debouncedAlias)}` : null,
    fetcher,
  )

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setPending(true)
    try {
      const link = await api<PublicUrl>("/api/urls", {
        method: "POST",
        json: {
          longUrl,
          alias: alias.trim() || undefined,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
          clickLimit: oneTime ? undefined : clickLimit || undefined,
          password: password || undefined,
          oneTime,
        },
      })
      setResult(link)
      setLongUrl("")
      setAlias("")
      setExpiresAt("")
      setClickLimit("")
      setPassword("")
      setOneTime(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not shorten that link.")
    } finally {
      setPending(false)
    }
  }

  const aliasState =
    alias.trim().length === 0 ? null : alias.trim().length < 3 ? "short" : debouncedAlias !== alias.trim() || !aliasCheck ? "checking" : aliasCheck.available ? "free" : "taken"

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm md:p-5" noValidate>
        <Label htmlFor="long-url" className="sr-only">
          Long URL
        </Label>
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            id="long-url"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="Paste a long URL — https://…"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            className="h-12 flex-1 font-mono text-sm md:text-base"
            required
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? "shorten-error" : undefined}
          />
          <Button type="submit" size="lg" className="h-12 px-6 text-base" disabled={pending || !longUrl.trim()}>
            {pending ? "Shortening…" : "Shorten"}
            <ArrowRight aria-hidden />
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setShowOptions((v) => !v)}
          aria-expanded={showOptions}
          aria-controls="link-options"
          className="flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronDown aria-hidden className={`size-4 transition-transform ${showOptions ? "rotate-180" : ""}`} />
          Alias, expiry, limits and password
        </button>

        {showOptions && (
          <div id="link-options" className="grid gap-4 border-t border-border pt-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="alias">Custom alias</Label>
              <div className="flex items-center rounded-lg border border-input bg-background focus-within:ring-3 focus-within:ring-ring/50">
                <span className="pl-3 font-mono text-sm text-muted-foreground">/</span>
                <Input
                  id="alias"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="launch-week"
                  className="border-0 bg-transparent font-mono shadow-none focus-visible:ring-0"
                  maxLength={32}
                  aria-describedby="alias-status"
                />
              </div>
              <p id="alias-status" aria-live="polite" className="min-h-5 text-xs">
                {aliasState === "short" && <span className="text-muted-foreground">At least 3 characters.</span>}
                {aliasState === "checking" && <span className="text-muted-foreground">Checking…</span>}
                {aliasState === "free" && <span className="font-medium text-primary">Available</span>}
                {aliasState === "taken" && <span className="font-medium text-destructive">Taken, reserved or invalid</span>}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="expires">Expires</Label>
              <Input id="expires" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="limit">Click limit</Label>
              <Input
                id="limit"
                type="number"
                min={1}
                inputMode="numeric"
                placeholder="Unlimited"
                value={oneTime ? "1" : clickLimit}
                onChange={(e) => setClickLimit(e.target.value)}
                disabled={oneTime}
              />
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={oneTime} onCheckedChange={setOneTime} />
                One-time link (self-destructs after first visit)
              </label>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="link-password">Password</Label>
              <Input
                id="link-password"
                type="password"
                autoComplete="new-password"
                placeholder="No password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        )}

        {error && (
          <p id="shorten-error" role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}
      </form>

      {result && <ResultTicket link={result} signedIn={signedIn} />}
    </div>
  )
}

function ResultTicket({ link, signedIn }: { link: PublicUrl; signedIn: boolean }) {
  const url = shortUrl(link.code)
  return (
    <section
      aria-label="Your short link"
      className="grid overflow-hidden rounded-xl border border-border bg-card shadow-sm animate-in fade-in slide-in-from-bottom-2 md:grid-cols-[1fr_auto]"
    >
      <div className="flex min-w-0 flex-col gap-4 p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ready to share</p>
        <a href={url} target="_blank" rel="noreferrer" className="break-all font-mono text-2xl font-semibold text-primary hover:underline md:text-3xl">
          {displayHost(link.code)}
        </a>
        <p className="truncate text-sm text-muted-foreground" title={link.longUrl}>
          {"→ "}
          {link.longUrl}
        </p>
        <ul className="flex flex-wrap gap-2 text-xs">
          {link.hasPassword && (
            <li className="flex items-center gap-1 rounded-sm bg-secondary px-2 py-1"><Lock aria-hidden className="size-3" />Password</li>
          )}
          {link.expiresAt && (
            <li className="flex items-center gap-1 rounded-sm bg-secondary px-2 py-1"><Timer aria-hidden className="size-3" />Expires {formatDate(link.expiresAt)}</li>
          )}
          {link.clickLimit && (
            <li className="rounded-sm bg-accent px-2 py-1 font-medium text-accent-foreground">
              {link.clickLimit === 1 ? "One-time" : `${link.clickLimit} clicks max`}
            </li>
          )}
        </ul>
        <div className="flex flex-wrap items-center gap-3">
          <CopyButton value={url} label="Copy link" />
          {signedIn ? (
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/dashboard/${link.id}`} />}>
              View analytics
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              <Link href="/register" className="font-medium text-foreground underline underline-offset-4">Create an account</Link>
              {" to save links and see analytics."}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-center border-t border-dashed border-border bg-muted p-5 md:border-t-0 md:border-l">
        <QrPanel value={url} code={link.code} />
      </div>
    </section>
  )
}
