"use client"

import { useState } from "react"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"
import type { CountryBreakdown } from "@/lib/types"

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

export function WorldMap({ countries }: { countries: CountryBreakdown[] }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const byNumeric = new Map(countries.filter((c) => c.numeric).map((c) => [c.numeric as string, c]))
  const max = Math.max(1, ...countries.map((c) => c.clicks))

  return (
    <figure className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-md border border-border bg-background">
        <ComposableMap projectionConfig={{ scale: 150 }} height={380} aria-label="Clicks by country">
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const entry = byNumeric.get(String(geo.id).padStart(3, "0"))
                const intensity = entry ? 0.2 + 0.8 * (entry.clicks / max) : 0
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => setHovered(entry ? `${entry.name}: ${entry.clicks.toLocaleString()} clicks` : (geo.properties?.name as string))}
                    onMouseLeave={() => setHovered(null)}
                    fill={entry ? "var(--chart-1)" : "var(--secondary)"}
                    fillOpacity={entry ? intensity : 1}
                    stroke="var(--background)"
                    strokeWidth={0.5}
                    className="outline-none transition-[fill,fill-opacity] hover:fill-opacity-100 hover:fill-[var(--foreground)]"
                  />
                )
              })
            }
          </Geographies>
        </ComposableMap>
      </div>
      <figcaption aria-live="polite" className="min-h-5 text-xs text-muted-foreground">
        {hovered ?? "Hover a country for details. Location comes from edge geo headers."}
      </figcaption>
    </figure>
  )
}
