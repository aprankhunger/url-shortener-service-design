import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { SiteHeader } from "@/components/site-header"
import { AuthForm } from "@/components/auth-form"

export const metadata = { title: "Create account — snip" }

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard")
  return (
    <>
      <SiteHeader user={null} />
      <main className="flex justify-center px-4 py-16">
        <AuthForm mode="register" />
      </main>
    </>
  )
}
