import { redirect } from "next/navigation"
import { resolveCode } from "@/lib/links"
import { PasswordForm } from "@/components/password-form"
import { GlassObject } from "@/components/glass-object"

export const metadata = { title: "Protected link — SNIP / 26", robots: { index: false } }

export default async function ProtectedLinkPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const result = resolveCode(code)
  if (result.status === "ok") redirect(`/${result.url.code}`)
  if (result.status !== "password") redirect(`/unavailable?reason=${result.status}`)

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-16">
      <GlassObject variant="drop" priority depth={20} className="absolute top-1/2 left-1/2 z-0 size-[28rem] -translate-x-1/2 -translate-y-1/2 opacity-60 md:size-[40rem]" />
      <div className="relative z-10 w-full max-w-sm">
        <PasswordForm code={result.url.code} />
      </div>
    </main>
  )
}
