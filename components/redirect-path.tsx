const STEPS = [
  { label: "GET /k7Qp2xA", detail: "Request hits the redirect route — no page render, no auth, no body parsing." },
  { label: "codeIndex lookup", detail: "One unique-index read by code. Status checks for disabled, expiry and click cap are in-memory comparisons." },
  { label: "302 Location", detail: "The visitor is redirected immediately with Cache-Control: no-store so every click is counted." },
  { label: "after() → logClick", detail: "Referrer, user agent, device, browser and geo headers are parsed and stored once the response is flushed." },
]

export function RedirectPath() {
  return (
    <section aria-labelledby="hot-path" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 id="hot-path" className="text-2xl font-semibold tracking-tight">
          The hot path
        </h2>
        <p className="max-w-2xl leading-relaxed text-muted-foreground">
          The redirect is the only request that has to be fast. Everything slow happens after the visitor has left.
        </p>
      </div>
      <ol className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
        {STEPS.map((step, index) => (
          <li key={step.label} className="flex flex-col gap-2 bg-card p-5">
            <span className={`font-mono text-sm font-semibold ${index === 3 ? "text-muted-foreground" : "text-primary"}`}>{step.label}</span>
            <p className="text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
            {index === 2 && <span className="mt-auto w-fit rounded-sm bg-accent px-2 py-0.5 font-mono text-xs font-medium text-accent-foreground">response sent</span>}
          </li>
        ))}
      </ol>
    </section>
  )
}
