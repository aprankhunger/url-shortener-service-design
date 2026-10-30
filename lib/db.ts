import "server-only"
import { nanoid } from "nanoid"
import { hashIp, hashPassword } from "@/lib/crypto"
import type { ClickRecord, UrlRecord, User } from "@/lib/types"

/**
 * In-memory stand-in for MongoDB. Each Map mirrors a collection plus the index
 * the real deployment would declare:
 *   urls.code      -> unique index      (codeIndex)
 *   users.email    -> unique index      (emailIndex)
 *   clicks.urlId   -> compound index    (clicksByUrl, kept sorted by timestamp)
 * Data resets when the server process restarts.
 */
type Store = {
  users: Map<string, User>
  emailIndex: Map<string, string>
  urls: Map<string, UrlRecord>
  codeIndex: Map<string, string>
  clicksByUrl: Map<string, ClickRecord[]>
}

const STORE_VERSION = 2
const globalForStore = globalThis as unknown as { __snipStore?: Store; __snipStoreVersion?: number }

export function db(): Store {
  if (!globalForStore.__snipStore || globalForStore.__snipStoreVersion !== STORE_VERSION) {
    globalForStore.__snipStoreVersion = STORE_VERSION
    const store: Store = {
      users: new Map(),
      emailIndex: new Map(),
      urls: new Map(),
      codeIndex: new Map(),
      clicksByUrl: new Map(),
    }
    globalForStore.__snipStore = store
    seed(store)
  }
  return globalForStore.__snipStore
}

export function insertUrl(store: Store, url: UrlRecord) {
  store.urls.set(url.id, url)
  store.codeIndex.set(url.code.toLowerCase(), url.id)
  store.clicksByUrl.set(url.id, [])
}

export function removeUrl(store: Store, url: UrlRecord) {
  store.urls.delete(url.id)
  store.codeIndex.delete(url.code.toLowerCase())
  store.clicksByUrl.delete(url.id)
}

export const DEMO_EMAIL = "demo@snip.dev"
export const DEMO_PASSWORD = "demo1234"

const REFERRERS = ["Direct", "twitter.com", "news.ycombinator.com", "linkedin.com", "google.com", "reddit.com", "github.com"]
const REFERRER_WEIGHTS = [30, 18, 12, 10, 14, 9, 7]
const DEVICES = ["desktop", "mobile", "tablet"]
const DEVICE_WEIGHTS = [52, 41, 7]
const BROWSERS = ["Chrome", "Safari", "Firefox", "Edge", "Samsung Internet"]
const BROWSER_WEIGHTS = [55, 26, 9, 7, 3]
const OSES = ["Windows", "macOS", "iOS", "Android", "Linux"]
const OS_WEIGHTS = [28, 24, 22, 20, 6]
const LOCATIONS: [string, string, number, number][] = [
  ["US", "San Francisco", 37.77, -122.42], ["US", "New York", 40.71, -74.0], ["US", "Austin", 30.27, -97.74],
  ["GB", "London", 51.51, -0.13], ["DE", "Berlin", 52.52, 13.4], ["IN", "Bengaluru", 12.97, 77.59],
  ["BR", "São Paulo", -23.55, -46.63], ["CA", "Toronto", 43.65, -79.38], ["FR", "Paris", 48.86, 2.35],
  ["JP", "Tokyo", 35.68, 139.69], ["AU", "Sydney", -33.87, 151.21], ["NL", "Amsterdam", 52.37, 4.9],
  ["NG", "Lagos", 6.52, 3.38], ["MX", "Mexico City", 19.43, -99.13], ["SG", "Singapore", 1.35, 103.82],
]
const LOCATION_WEIGHTS = [14, 10, 6, 10, 8, 9, 6, 6, 5, 5, 4, 4, 3, 3, 3]

function mulberry32(seedValue: number) {
  let a = seedValue
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seed(store: Store) {
  const now = Date.now()
  const day = 86_400_000
  const user: User = {
    id: nanoid(),
    email: DEMO_EMAIL,
    passwordHash: hashPassword(DEMO_PASSWORD),
    createdAt: now - 45 * day,
  }
  store.users.set(user.id, user)
  store.emailIndex.set(user.email, user.id)

  const rand = mulberry32(42)
  const pick = <T,>(items: T[], weights: number[]) => {
    const total = weights.reduce((a, b) => a + b, 0)
    let r = rand() * total
    for (let i = 0; i < items.length; i++) {
      r -= weights[i]
      if (r <= 0) return items[i]
    }
    return items[items.length - 1]
  }

  const demoLinks: { code: string; longUrl: string; custom: boolean; clicks: number; extra?: Partial<UrlRecord> }[] = [
    { code: "launch", longUrl: "https://vercel.com/blog/introducing-fluid-compute", custom: true, clicks: 640 },
    { code: "k7Qp2xA", longUrl: "https://nextjs.org/docs/app/building-your-application/caching", custom: false, clicks: 212 },
    { code: "deck", longUrl: "https://example.com/investor-deck-2026.pdf", custom: true, clicks: 38, extra: { passwordHash: hashPassword("secret") } },
    { code: "Zr4mWn9", longUrl: "https://github.com/vercel/next.js/discussions", custom: false, clicks: 0, extra: { isActive: false } },
  ]

  for (const [index, entry] of demoLinks.entries()) {
    const url: UrlRecord = {
      id: nanoid(),
      code: entry.code,
      longUrl: entry.longUrl,
      userId: user.id,
      customAlias: entry.custom,
      expiresAt: null,
      passwordHash: null,
      clickLimit: null,
      clicks: 0,
      isActive: true,
      createdAt: now - (40 - index * 6) * day,
      ...entry.extra,
    }
    insertUrl(store, url)
    const clicks = store.clicksByUrl.get(url.id)!
    for (let i = 0; i < entry.clicks; i++) {
      const ageDays = Math.pow(rand(), 1.6) * 30
      const [country, city, latitude, longitude] = pick(LOCATIONS, LOCATION_WEIGHTS)
      const device = pick(DEVICES, DEVICE_WEIGHTS)
      clicks.push({
        id: nanoid(),
        urlId: url.id,
        timestamp: now - ageDays * day,
        referrer: pick(REFERRERS, REFERRER_WEIGHTS),
        userAgent: "seed",
        device,
        browser: pick(BROWSERS, BROWSER_WEIGHTS),
        os: device === "desktop" ? pick(["Windows", "macOS", "Linux"], [50, 40, 10]) : pick(OSES.slice(2, 4), OS_WEIGHTS.slice(2, 4)),
        country,
        city,
 latitude,
 longitude,
        ipHash: hashIp(`seed-${Math.floor(rand() * entry.clicks * 0.7)}`),
      })
    }
    clicks.sort((a, b) => a.timestamp - b.timestamp)
    url.clicks = clicks.length
  }
}
