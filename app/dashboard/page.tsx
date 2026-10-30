import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { SiteHeader } from "@/components/site-header"
import { ShortenForm } from "@/components/shorten-form"
import { LinksTable } from "@/components/links-table"

export const metadata = { title: "Dashboard — snip" }

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 md:px-6">
        <section className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">Your links</h1>
          <ShortenForm signedIn />
        </section>
        <LinksTable />
      </main>
    </>
  )
}
