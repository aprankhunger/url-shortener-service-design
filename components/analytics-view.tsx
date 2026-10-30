"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { ArrowLeft } from "lucide-react"
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { CopyButton } from "@/components/copy-button"
import { QrPanel } from "@/components/qr-panel"
import { WorldMap } from "@/components/world-map"
import { displayHost, fetcher, formatDate, shortUrl } from "@/lib/client"
import type { AnalyticsResponse, Breakdown } from "@/lib/types"

const RANGES = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
]
const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]
const DAY = 86_400_000

export function AnalyticsView({ id }: { id: string }) {
  const [days, setDays] = useState(30)
  const [now] = useState(() => Date.now())
  const { data, error } = useSWR<AnalyticsResponse>(`/api/urls/${id}/analytics?from=${now - days * DAY}&to=${now}`, fetcher, {
    refreshInterval: 15_000,
    keepPreviousData: true,
  })

  if (error) return <p role="alert" className="text-destructive">Could not load analytics.</p>
  if (!data) return <p className="text-muted-foreground">Loading analytics…</p>

  const { link } = data
  return (
    <div className="flex flex-col gap-6">
      <Link href="/dashboard" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft aria-hidden className="size-4" />
        All links
      </Link>

      <header className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="break-all font-mono text-2xl font-semibold text-primary">{displayHost(link.code)}</h1>
            <CopyButton value={shortUrl(link.code)} size="icon-sm" />
            <span className="rounded-sm bg-secondary px-2 py-0.5 text-xs font-medium capitalize">{link.status}</span>
          </div>
          <p className="truncate text-sm text-muted-foreground" title={link.longUrl}>{"→ "}{link.longUrl}</p>
          <p className="text-xs text-muted-foreground">Created {formatDate(link.createdAt)}</p>
        </div>
        <QrPanel value={shortUrl(link.code)} code={link.code} size={112} />
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <dl className="flex gap-8">
          <Stat label="Clicks" value={data.totalClicks} />
          <Stat label="Unique visitors" value={data.uniqueVisitors} />
          <Stat label="All-time" value={link.clicks} />
        </dl>
        <div role="group" aria-label="Date range" className="flex rounded-lg border border-border bg-card p-0.5">
          {RANGES.map((range) => (
            <button
              key={range.label}
              type="button"
              aria-pressed={days === range.days}
              onClick={() => setDays(range.days)}
              className={`rounded-md px-3 py-1 font-mono text-sm ${days === range.days ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <Panel title="Clicks over time">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.timeseries} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} tickFormatter={(d: string) => d.slice(5)} minTickGap={24} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="clicks" stroke="var(--chart-1)" strokeWidth={2} fill="var(--chart-1)" fillOpacity={0.12} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Top referrers"><BarList items={data.referrers} total={data.totalClicks} /></Panel>
        <Panel title="Devices"><Donut items={data.devices} /></Panel>
        <Panel title="Browsers"><BarList items={data.browsers} total={data.totalClicks} /></Panel>
        <Panel title="Operating systems"><BarList items={data.os} total={data.totalClicks} /></Panel>
      </div>

      <Panel title="Countries">
        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <WorldMap countries={data.countries} />
          <BarList items={data.countries.slice(0, 8).map((c) => ({ name: c.name, clicks: c.clicks }))} total={data.totalClicks} />
        </div>
      </Panel>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="font-mono text-3xl font-semibold tabular-nums">{value.toLocaleString()}</dd>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function BarList({ items, total }: { items: Breakdown[]; total: number }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">No clicks in this range.</p>
  const max = Math.max(...items.map((i) => i.clicks))
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.name} className="relative flex items-center justify-between gap-4 rounded-sm px-2 py-1.5 text-sm">
          <span aria-hidden className="absolute inset-y-0 left-0 rounded-sm bg-primary/10" style={{ width: `${(item.clicks / max) * 100}%` }} />
          <span className="relative truncate">{item.name}</span>
          <span className="relative font-mono tabular-nums text-muted-foreground">
            {item.clicks.toLocaleString()}
            <span className="ml-2 inline-block w-10 text-right">{total ? Math.round((item.clicks / total) * 100) : 0}%</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

function Donut({ items }: { items: Breakdown[] }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">No clicks in this range.</p>
  return (
    <div className="flex items-center gap-6">
      <div className="size-36 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={items} dataKey="clicks" nameKey="name" innerRadius="60%" outerRadius="100%" stroke="var(--card)" strokeWidth={2}>
              {items.map((item, index) => <Cell key={item.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex flex-col gap-2 text-sm">
        {items.map((item, index) => (
          <li key={item.name} className="flex items-center gap-2 capitalize">
            <span aria-hidden className="size-2.5 rounded-sm" style={{ background: PIE_COLORS[index % PIE_COLORS.length] }} />
            {item.name}
            <span className="font-mono text-muted-foreground">{item.clicks.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
