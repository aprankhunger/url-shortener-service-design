import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = { title: "Link unavailable — snip", robots: { index: false } }

const MESSAGES: Record<string, { title: string; body: string }> = {
  not_found: { title: "Link not found", body: "This short link doesn't exist or has been deleted." },
  disabled: { title: "Link disabled", body: "The owner of this link has turned it off." },
  expired: { title: "Link expired", body: "This short link has passed its expiry date." },
  exhausted: { title: "Link used up", body: "This link has reached its click limit — one-time links only work once." },
}

export default async function UnavailablePage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams
  const message = MESSAGES[reason ?? ""] ?? MESSAGES.not_found
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-mono text-sm font-semibold text-primary">410 · {reason ?? "not_found"}</p>
      <h1 className="text-balance text-3xl font-semibold tracking-tight">{message.title}</h1>
      <p className="max-w-md text-pretty leading-relaxed text-muted-foreground">{message.body}</p>
      <Button nativeButton={false} render={<Link href="/" />}>
        Shorten your own link
      </Button>
    </main>
  )
}
