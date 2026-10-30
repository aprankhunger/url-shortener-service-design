"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const SOURCES = {
  hero: "/images/blob-hero.png",
  knot: "/images/blob-knot.png",
  drop: "/images/blob-drop.png",
} as const

type GlassObjectProps = {
  variant: keyof typeof SOURCES
  className?: string
  depth?: number
  priority?: boolean
}

export function GlassObject({ variant, className, depth = 18, priority = false }: GlassObjectProps) {
  const tilt = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = tilt.current
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let frame = 0
    function onMove(event: PointerEvent) {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const x = event.clientX / window.innerWidth - 0.5
        const y = event.clientY / window.innerHeight - 0.5
        node!.style.transform = `perspective(900px) rotateY(${x * depth}deg) rotateX(${-y * depth}deg) translate3d(${x * depth}px, ${y * depth}px, 0)`
      })
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("pointermove", onMove)
    }
  }, [depth])

  return (
    <div aria-hidden className={cn("pointer-events-none select-none", className)}>
      <div ref={tilt} className="size-full transition-transform duration-500 ease-out will-change-transform">
        <div className="relative size-full animate-drift">
          <Image src={SOURCES[variant]} alt="" fill priority={priority} sizes="(min-width: 768px) 40vw, 70vw" className="glass-blend object-contain" />
        </div>
      </div>
    </div>
  )
}
