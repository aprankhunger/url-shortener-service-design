import { SiteHeader } from "@/components/site-header"
import { GlassObject } from "@/components/glass-object"

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-svh overflow-x-clip">
      <SiteHeader user={null} />
      <GlassObject variant="drop" priority depth={20} className="absolute top-20 -right-28 z-0 size-80 opacity-90 md:top-24 md:right-[8%] md:size-[30rem]" />
      <main className="relative z-10 mx-auto flex max-w-6xl px-4 py-14 md:px-6 md:py-20">{children}</main>
    </div>
  )
}
