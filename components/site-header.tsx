import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/logout-button"
import type { SessionUser } from "@/lib/auth"

export function SiteHeader({ user }: { user: SessionUser | null }) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-mono text-base font-semibold tracking-tight">
          <span aria-hidden className="flex size-6 items-center justify-center rounded-sm bg-primary text-xs text-primary-foreground">
            {"/>"}
          </span>
          snip
        </Link>
        <nav aria-label="Account" className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/dashboard" />}>
                Dashboard
              </Button>
              <span className="hidden text-sm text-muted-foreground md:inline">{user.email}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/login" />}>
                Sign in
              </Button>
              <Button size="sm" nativeButton={false} render={<Link href="/register" />}>
                Create account
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
