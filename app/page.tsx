import { getCurrentUser } from "@/lib/auth"
import { SiteHeader } from "@/components/site-header"
import { ShortenForm } from "@/components/shorten-form"
import { RedirectPath } from "@/components/redirect-path"

export default async function HomePage() {
  const user = await getCurrentUser()
  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-12 md:px-6 md:py-20">
        <section className="flex flex-col gap-8">
          <div className="flex max-w-3xl flex-col gap-4">
            <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
              Short links that know where every click came from.
            </h1>
            <p className="max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Paste a URL, get a short code and a QR. Add an alias, an expiry, a click cap or a password. Every redirect records referrer, device,
              browser and country — after the visitor is already on their way.
            </p>
          </div>
          <ShortenForm signedIn={Boolean(user)} />
          {!user && (
            <p className="text-sm text-muted-foreground">
              {"Anonymous links work instantly. Try the demo account: "}
              <code className="rounded-sm bg-card px-1.5 py-0.5 font-mono text-foreground">demo@snip.dev</code>
              {" / "}
              <code className="rounded-sm bg-card px-1.5 py-0.5 font-mono text-foreground">demo1234</code>
            </p>
          )}
        </section>
        <RedirectPath />
      </main>
    </>
  )
}
