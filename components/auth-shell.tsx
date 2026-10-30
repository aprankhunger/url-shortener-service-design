import { SiteHeader } from "@/components/site-header"

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-svh overflow-x-clip">
      <SiteHeader user={null} />
      <main className="relative z-10 mx-auto flex max-w-6xl px-4 py-14 md:px-6 md:py-20">{children}</main>
    </div>
  )
}
