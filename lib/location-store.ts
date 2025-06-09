// lib/location-store.ts
/*
 * A single, authoritative copy of everything that belongs to the
 * scoring engine – no more duplicate helpers sprinkled around.
 */
import type { google } from "google-maps"

interface LocationData {
  location: string
  coordinates: { lat: number; lng: number }
  score: number
  factors: Factors
  lastUpdated: string
  nearbyPlaces: google.maps.places.PlaceResult[]
  detailedAnalysis: DetailedAnalysis
  isSeeded?: boolean
}

interface Factors {
  footTraffic: number
  safety: number
  competition: number
  accessibility: number
}

interface DetailedAnalysis {
  hourlyTraffic: any[]
  weeklyTrends: any[]
  competitorAnalysis: any
  safetyMetrics: any
  locationFactors?: Record<string, number>
}

// -------------------------------------------------------------------
//  🔑  Local-storage helpers (unchanged apart from TS cosmetics)
// -------------------------------------------------------------------
const STORAGE_KEY = "geoScopeLocationData"

const getStored = (): Record<string, LocationData> => {
  if (typeof window === "undefined") return {}
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}")
}

const saveStored = (data: Record<string, LocationData>) => {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const getLocationData = (k: string) => getStored()[k] ?? null

export const storeLocationData = (k: string, d: LocationData) => {
  if (d.isSeeded) return // don't persist demo data
  const all = getStored()
  all[k] = d
  saveStored(all)
}

export const locationKeyFromAddress = (addr: string) =>
  addr
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")

// -------------------------------------------------------------------
//  🎯  Scoring engine with circular area detection
// -------------------------------------------------------------------
const bizMap: Record<string, string[]> = {
  food_service: ["restaurant", "cafe", "bakery", "meal_takeaway", "food"],
  retail: ["store", "clothing_store", "shoe_store", "book_store", "electronics_store"],
  grocery: ["grocery_or_supermarket", "supermarket", "convenience_store"],
  electronics: ["electronics_store", "computer_store", "phone_store"],
  health: ["pharmacy", "hospital", "doctor", "dentist", "physiotherapist"],
  automotive: ["car_dealer", "car_repair", "gas_station", "car_wash"],
  beauty: ["beauty_salon", "hair_care", "spa", "nail_salon"],
  fitness: ["gym", "fitness_center", "sports_club", "yoga_studio"],
  education: ["school", "university", "library", "tutoring"],
}

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

// Function to determine accessibility score based on transit count
const getAccessibilityScore = (transitStations: google.maps.places.PlaceResult[]): number => {
  const transitCount = transitStations.length

  console.log(`Transit stations found: ${transitCount}`)

  if (transitCount >= 15) {
    // 15+ transit stations = 85-95 score
    return 85 + Math.random() * 10
  } else if (transitCount >= 10) {
    // 10-14 transit stations = 75-84 score
    return 75 + Math.random() * 9
  } else if (transitCount >= 6) {
    // 6-9 transit stations = 65-74 score
    return 65 + Math.random() * 9
  } else if (transitCount >= 3) {
    // 3-5 transit stations = 55-64 score
    return 55 + Math.random() * 9
  } else {
    // Less than 3 transit stations = 30-40 score
    return 30 + Math.random() * 10
  }
}

// Function to determine foot traffic score based on circular areas
const getFootTrafficScore = (
  coords: { lat: number; lng: number },
  nearby: google.maps.places.PlaceResult[],
): number => {
  // Define high traffic sources (green areas)
  const highTrafficSources = nearby.filter((place) =>
    place.types?.some((t: string) =>
      [
        "restaurant",
        "cafe",
        "shopping_mall",
        "store",
        "transit_station",
        "bus_station",
        "train_station",
        "subway_station",
      ].includes(t),
    ),
  )

  // Define medium traffic sources (yellow areas)
  const mediumTrafficSources = nearby.filter((place) =>
    place.types?.some((t: string) => ["bank", "pharmacy", "gas_station", "convenience_store"].includes(t)),
  )

  console.log(
    `High traffic sources: ${highTrafficSources.length}, Medium traffic sources: ${mediumTrafficSources.length}`,
  )

  // Check if location falls within green areas (high traffic)
  for (const source of highTrafficSources) {
    if (source.geometry?.location) {
      const distance = calculateDistance(
        coords.lat,
        coords.lng,
        source.geometry.location.lat,
        source.geometry.location.lng,
      )

      // If within 200m of high traffic source = green area
      if (distance <= 200) {
        console.log(`Location in GREEN traffic area (${distance}m from ${source.name})`)
        return 85 + Math.random() * 10 // 85-95
      }
    }
  }

  // Check if location falls within yellow areas (medium traffic)
  for (const source of mediumTrafficSources) {
    if (source.geometry?.location) {
      const distance = calculateDistance(
        coords.lat,
        coords.lng,
        source.geometry.location.lat,
        source.geometry.location.lng,
      )

      // If within 300m of medium traffic source = yellow area
      if (distance <= 300) {
        console.log(`Location in YELLOW traffic area (${distance}m from ${source.name})`)
        return 50 + Math.random() * 10 // 50-60
      }
    }
  }

  // Check if close to any high traffic source (extended yellow area)
  for (const source of highTrafficSources) {
    if (source.geometry?.location) {
      const distance = calculateDistance(
        coords.lat,
        coords.lng,
        source.geometry.location.lat,
        source.geometry.location.lng,
      )

      // If within 400m of high traffic source = extended yellow area
      if (distance <= 400) {
        console.log(`Location in extended YELLOW traffic area (${distance}m from ${source.name})`)
        return 50 + Math.random() * 10 // 50-60
      }
    }
  }

  // Default: Red area (low traffic)
  console.log(`Location in RED traffic area (no nearby traffic sources)`)
  return 25 + Math.random() * 20 // 25-45
}

// Function to determine safety score based on circular areas
const getSafetyScore = (coords: { lat: number; lng: number }, nearby: google.maps.places.PlaceResult[]): number => {
  // Define safe areas (green zones)
  const safetyFactors = nearby.filter((place) =>
    place.types?.some((t: string) =>
      [
        "hospital",
        "police",
        "school",
        "university",
        "transit_station",
        "bus_station",
        "train_station",
        "fire_station",
      ].includes(t),
    ),
  )

  // Define moderate risk areas (yellow zones)
  const moderateRiskFactors = nearby.filter((place) =>
    place.types?.some((t: string) => ["night_club", "bar", "liquor_store"].includes(t)),
  )

  console.log(`Safety factors: ${safetyFactors.length}, Risk factors: ${moderateRiskFactors.length}`)

  // Check if location falls within green areas (safe zones)
  for (const factor of safetyFactors) {
    if (factor.geometry?.location) {
      const distance = calculateDistance(
        coords.lat,
        coords.lng,
        factor.geometry.location.lat,
        factor.geometry.location.lng,
      )

      const isMajorSafety = factor.types?.some((t) => ["hospital", "police", "fire_station"].includes(t))
      const radius = isMajorSafety ? 500 : 350

      // If within radius of safety factor = green area
      if (distance <= radius) {
        console.log(`Location in GREEN safety area (${distance}m from ${factor.name})`)
        return 85 + Math.random() * 10 // 85-95
      }
    }
  }

  // Check if location falls within yellow areas (moderate risk)
  for (const risk of moderateRiskFactors) {
    if (risk.geometry?.location) {
      const distance = calculateDistance(coords.lat, coords.lng, risk.geometry.location.lat, risk.geometry.location.lng)

      // If within 250m of risk factor = yellow area
      if (distance <= 250) {
        console.log(`Location in YELLOW safety area (${distance}m from ${risk.name})`)
        return 50 + Math.random() * 10 // 50-60
      }
    }
  }

  // Check if close to any safety factor (extended green area)
  for (const factor of safetyFactors) {
    if (factor.geometry?.location) {
      const distance = calculateDistance(
        coords.lat,
        coords.lng,
        factor.geometry.location.lat,
        factor.geometry.location.lng,
      )

      // If within 800m of safety factor = extended green area
      if (distance <= 800) {
        console.log(`Location in extended GREEN safety area (${distance}m from ${factor.name})`)
        return 75 + Math.random() * 10 // 75-85
      }
    }
  }

  // Default: Red area (higher risk)
  console.log(`Location in RED safety area (no nearby safety factors)`)
  return 30 + Math.random() * 15 // 30-45
}

export const generateConsistentScore = (
  coords: { lat: number; lng: number },
  nearby: google.maps.places.PlaceResult[],
  transitStations: google.maps.places.PlaceResult[] = [],
  isSeeded = false,
) => {
  const bizType = typeof window !== "undefined" ? localStorage.getItem("businessType") : null

  console.log(`Generating score for coordinates: ${coords.lat}, ${coords.lng}`)
  console.log(`Found ${nearby.length} nearby places`)
  console.log(`Found ${transitStations.length} transit stations`)

  // 1️⃣  Buckets
  const byType = (needle: string[]) => nearby.filter((p) => p.types?.some((t) => needle.includes(t)))
  const allComps = byType(["store", "restaurant", "shop", "establishment", "shopping_mall", "gym", "fitness_center"])
  const relevantComps = bizType && bizMap[bizType] ? byType(bizMap[bizType]) : allComps

  // 2️⃣  Use new scoring mechanisms
  const foot = Math.round(getFootTrafficScore(coords, nearby))
  const safe = Math.round(getSafetyScore(coords, nearby))
  const acc = Math.round(getAccessibilityScore(transitStations))

  console.log(`Foot traffic score: ${foot}`)
  console.log(`Safety score: ${safe}`)
  console.log(`Accessibility score: ${acc}`)

  // Competition scoring (unchanged - based on competitor count)
  const compCnt = relevantComps.length
  let comp = compCnt === 0 ? 95 : compCnt <= 2 ? 90 : compCnt <= 5 ? 75 : compCnt <= 10 ? 60 : compCnt <= 20 ? 45 : 30

  // Location-specific competition variation
  const seed = Math.abs(Math.sin(coords.lat * 12.9898 + coords.lng * 78.233) * 43758.5453)
  const compVariation = Math.sin(seed * 75) * 6
  comp = Math.max(0, Math.min(95, Math.round(comp + compVariation)))

  console.log(`Competition score: ${comp} (${compCnt} competitors)`)

  const factors: Factors = { footTraffic: foot, safety: safe, competition: comp, accessibility: acc }

  // 3️⃣  Final score is the AVERAGE of all four factors
  const final = (foot + safe + comp + acc) / 4

  console.log(`Final score (average): ${Math.round(final)}`)

  // 4️⃣  Diagnostics
  const details: DetailedAnalysis = {
    hourlyTraffic: genHourly(foot, () => Math.random()),
    weeklyTrends: genWeekly(foot, () => Math.random()),
    competitorAnalysis: {
      total: compCnt,
      density: compCnt > 20 ? "High" : compCnt > 10 ? "Medium" : "Low",
      types: relevantComps.reduce<Record<string, number>>((m, p) => {
        const t = p.types?.[0] ?? "other"
        m[t] = (m[t] ?? 0) + 1
        return m
      }, {}),
    },
    safetyMetrics: {
      crimeRate: 100 - safe,
      lighting: safe > 80 ? "Excellent" : safe > 60 ? "Good" : "Poor",
      surveillance: transitStations.length > 2 ? "High" : transitStations.length ? "Medium" : "Low",
    },
    locationFactors: {
      restaurants: byType(["restaurant", "cafe"]).length,
      transit: transitStations.length,
      hospitals: byType(["hospital", "doctor"]).length,
      schools: byType(["school", "university"]).length,
      shopping: byType(["shopping_mall", "department_store"]).length,
    },
  }

  return { score: Math.round(final), factors, detailedAnalysis: details }
}

// -------------------------------------------------------------------
//  tiny helpers – chart data generators
// -------------------------------------------------------------------
const genHourly = (base: number, rnd: () => number) =>
  Array.from({ length: 24 }, (_, h) => {
    const mult = h < 6 ? 0.3 : h < 10 ? 0.7 : h < 17 ? 0.9 : h < 21 ? 1 : h < 24 ? 0.6 : 0.3
    return {
      hour: `${h.toString().padStart(2, "0")}:00`,
      pedestrians: Math.round(base * mult + rnd() * 12 - 6),
      vehicles: Math.round(base * 0.8 * mult + rnd() * 10 - 5),
      safety: Math.round(85 - (h >= 22 || h <= 5 ? 15 : 0) + rnd() * 8 - 4),
    }
  })

const genWeekly = (base: number, rnd: () => number) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  return days.map((d, i) => {
    const mult = d === "Sat" ? 1.2 : d === "Sun" ? 0.85 : d === "Fri" ? 1.1 : d === "Mon" ? 0.9 : 1
    return {
      day: d,
      traffic: Math.round(base * mult + rnd() * 6 - 3),
      sales: Math.round(base * mult * 0.7 + rnd() * 5 - 2),
      competition: Math.round(70 + rnd() * 15 - 7),
    }
  })
}

// -------------------------------------------------------------------
//  UI helpers (used by <AnalysisPage/>)
// -------------------------------------------------------------------
export const colorFor = (s: number) => (s >= 72 ? "text-emerald-400" : s >= 60 ? "text-yellow-400" : "text-red-400")

export const bgFor = (s: number) =>
  s >= 72
    ? "from-emerald-500/20 to-green-500/20"
    : s >= 60
      ? "from-yellow-500/20 to-orange-500/20"
      : "from-red-500/20 to-pink-500/20"

export const labelFor = (s: number) => (s >= 72 ? "Excellent Location" : s >= 60 ? "Good Location" : "Risky for Credit")
