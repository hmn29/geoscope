// lib/location-store.ts
/*
 * Enhanced location scoring system with mathematical stability and consistency
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
  stabilityMetrics: {
    consistencyScore: number
    dataQuality: number
    confidenceLevel: number
  }
}

// -------------------------------------------------------------------
//  🔑  Local-storage helpers
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
//  🎯  Enhanced Scoring Engine with Mathematical Stability
// -------------------------------------------------------------------

// Business type mappings
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

// Deterministic hash function for consistent scoring
const deterministicHash = (input: string): number => {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// Create a stable random number generator based on coordinates
const createStableRandom = (lat: number, lng: number, seed: string = ""): (() => number) => {
  const coordString = `${lat.toFixed(6)}_${lng.toFixed(6)}_${seed}`
  const hash = deterministicHash(coordString)
  let state = hash
  
  return () => {
    state = (state * 1664525 + 1013904223) % Math.pow(2, 32)
    return (state / Math.pow(2, 32))
  }
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

// Weighted scoring function with decay
const calculateProximityScore = (
  targetCoords: { lat: number; lng: number },
  places: google.maps.places.PlaceResult[],
  weights: Record<string, number>,
  maxDistance: number = 1000
): number => {
  let totalScore = 0
  let totalWeight = 0

  places.forEach(place => {
    if (!place.geometry?.location) return

    const distance = calculateDistance(
      targetCoords.lat,
      targetCoords.lng,
      place.geometry.location.lat,
      place.geometry.location.lng
    )

    if (distance <= maxDistance) {
      // Exponential decay function for distance
      const distanceDecay = Math.exp(-distance / (maxDistance * 0.3))
      
      // Find the weight for this place type
      let placeWeight = 0
      place.types?.forEach(type => {
        if (weights[type]) {
          placeWeight = Math.max(placeWeight, weights[type])
        }
      })

      if (placeWeight > 0) {
        const score = placeWeight * distanceDecay
        totalScore += score
        totalWeight += distanceDecay
      }
    }
  })

  return totalWeight > 0 ? Math.min(100, (totalScore / totalWeight) * 100) : 0
}

// Enhanced foot traffic scoring with multiple factors
const getFootTrafficScore = (
  coords: { lat: number; lng: number },
  nearby: google.maps.places.PlaceResult[],
): number => {
  const stableRandom = createStableRandom(coords.lat, coords.lng, "traffic")
  
  // Define traffic generators with weights
  const trafficWeights: Record<string, number> = {
    'shopping_mall': 1.0,
    'transit_station': 0.9,
    'bus_station': 0.8,
    'train_station': 0.9,
    'subway_station': 0.9,
    'restaurant': 0.7,
    'cafe': 0.6,
    'store': 0.5,
    'bank': 0.4,
    'pharmacy': 0.4,
    'gas_station': 0.3,
    'convenience_store': 0.5
  }

  // Calculate base score using proximity-weighted algorithm
  const baseScore = calculateProximityScore(coords, nearby, trafficWeights, 800)
  
  // Add density bonus for high-traffic areas
  const highTrafficPlaces = nearby.filter(place =>
    place.types?.some(type => ['shopping_mall', 'transit_station', 'restaurant'].includes(type))
  ).length
  
  const densityBonus = Math.min(20, highTrafficPlaces * 3)
  
  // Apply stable random variation (±5%)
  const variation = (stableRandom() - 0.5) * 10
  
  const finalScore = Math.max(10, Math.min(95, baseScore + densityBonus + variation))
  
  console.log(`Foot Traffic Score: base=${baseScore.toFixed(1)}, density=${densityBonus}, final=${finalScore.toFixed(1)}`)
  return Math.round(finalScore)
}

// Enhanced safety scoring with multiple safety indicators
const getSafetyScore = (
  coords: { lat: number; lng: number }, 
  nearby: google.maps.places.PlaceResult[]
): number => {
  const stableRandom = createStableRandom(coords.lat, coords.lng, "safety")
  
  // Define safety factors with weights
  const safetyWeights: Record<string, number> = {
    'police': 1.0,
    'hospital': 0.9,
    'fire_station': 0.8,
    'school': 0.7,
    'university': 0.7,
    'transit_station': 0.6,
    'bus_station': 0.5,
    'train_station': 0.6,
    'pharmacy': 0.4,
    'bank': 0.4
  }

  // Risk factors (negative weights)
  const riskWeights: Record<string, number> = {
    'night_club': -0.6,
    'bar': -0.4,
    'liquor_store': -0.3
  }

  // Calculate positive safety score
  const safetyScore = calculateProximityScore(coords, nearby, safetyWeights, 1000)
  
  // Calculate risk penalty
  const riskPenalty = Math.abs(calculateProximityScore(coords, nearby, riskWeights, 500))
  
  // Base safety score starts at 70 (neutral)
  const baseScore = 70
  const adjustedScore = baseScore + (safetyScore * 0.3) - (riskPenalty * 0.2)
  
  // Apply stable random variation (±3%)
  const variation = (stableRandom() - 0.5) * 6
  
  const finalScore = Math.max(20, Math.min(95, adjustedScore + variation))
  
  console.log(`Safety Score: base=${baseScore}, safety=${safetyScore.toFixed(1)}, risk=${riskPenalty.toFixed(1)}, final=${finalScore.toFixed(1)}`)
  return Math.round(finalScore)
}

// Enhanced accessibility scoring
const getAccessibilityScore = (transitStations: google.maps.places.PlaceResult[]): number => {
  const transitCount = transitStations.length
  
  // Logarithmic scaling for diminishing returns
  const baseScore = Math.min(90, 30 + (Math.log(transitCount + 1) * 20))
  
  // Bonus for variety of transit types
  const transitTypes = new Set()
  transitStations.forEach(station => {
    station.types?.forEach(type => {
      if (['bus_station', 'train_station', 'subway_station', 'transit_station'].includes(type)) {
        transitTypes.add(type)
      }
    })
  })
  
  const varietyBonus = transitTypes.size * 5
  
  const finalScore = Math.max(15, Math.min(95, baseScore + varietyBonus))
  
  console.log(`Accessibility Score: count=${transitCount}, base=${baseScore.toFixed(1)}, variety=${varietyBonus}, final=${finalScore.toFixed(1)}`)
  return Math.round(finalScore)
}

// Enhanced competition scoring with market saturation analysis
const getCompetitionScore = (
  coords: { lat: number; lng: number },
  relevantCompetitors: google.maps.places.PlaceResult[]
): number => {
  const stableRandom = createStableRandom(coords.lat, coords.lng, "competition")
  
  const competitorCount = relevantCompetitors.length
  
  // Calculate competition density in different radius zones
  const zones = [
    { radius: 200, weight: 1.0 },
    { radius: 500, weight: 0.7 },
    { radius: 1000, weight: 0.4 }
  ]
  
  let competitionPressure = 0
  
  zones.forEach(zone => {
    const competitorsInZone = relevantCompetitors.filter(comp => {
      if (!comp.geometry?.location) return false
      const distance = calculateDistance(
        coords.lat, coords.lng,
        comp.geometry.location.lat, comp.geometry.location.lng
      )
      return distance <= zone.radius
    }).length
    
    competitionPressure += competitorsInZone * zone.weight
  })
  
  // Convert competition pressure to score (inverse relationship)
  let baseScore = 90
  if (competitionPressure > 0) {
    baseScore = Math.max(20, 90 - (competitionPressure * 8))
  }
  
  // Apply stable random variation (±4%)
  const variation = (stableRandom() - 0.5) * 8
  
  const finalScore = Math.max(15, Math.min(95, baseScore + variation))
  
  console.log(`Competition Score: count=${competitorCount}, pressure=${competitionPressure.toFixed(1)}, final=${finalScore.toFixed(1)}`)
  return Math.round(finalScore)
}

// Main scoring function with enhanced stability
export const generateConsistentScore = (
  coords: { lat: number; lng: number },
  nearby: google.maps.places.PlaceResult[],
  transitStations: google.maps.places.PlaceResult[] = [],
  isSeeded = false,
) => {
  const bizType = typeof window !== "undefined" ? localStorage.getItem("businessType") : null

  console.log(`=== Generating score for coordinates: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)} ===`)
  console.log(`Found ${nearby.length} nearby places, ${transitStations.length} transit stations`)

  // Filter relevant competitors based on business type
  const allComps = nearby.filter((p) => 
    p.types?.some((t) => ["store", "restaurant", "shop", "establishment", "shopping_mall"].includes(t))
  )
  const relevantComps = bizType && bizMap[bizType] ? 
    nearby.filter((p) => p.types?.some((t) => bizMap[bizType].includes(t))) : 
    allComps

  // Calculate individual factor scores
  const footTraffic = getFootTrafficScore(coords, nearby)
  const safety = getSafetyScore(coords, nearby)
  const accessibility = getAccessibilityScore(transitStations)
  const competition = getCompetitionScore(coords, relevantComps)

  const factors: Factors = { 
    footTraffic, 
    safety, 
    competition, 
    accessibility 
  }

  // Calculate weighted average (can be adjusted for different business types)
  const weights = {
    footTraffic: 0.3,
    safety: 0.2,
    competition: 0.25,
    accessibility: 0.25
  }

  const weightedScore = (
    footTraffic * weights.footTraffic +
    safety * weights.safety +
    competition * weights.competition +
    accessibility * weights.accessibility
  )

  // Calculate stability metrics
  const scores = [footTraffic, safety, competition, accessibility]
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / scores.length
  const standardDeviation = Math.sqrt(variance)
  
  const consistencyScore = Math.max(0, 100 - (standardDeviation * 2))
  const dataQuality = Math.min(100, (nearby.length / 50) * 100)
  const confidenceLevel = Math.min(100, (consistencyScore + dataQuality) / 2)

  const finalScore = Math.round(weightedScore)

  console.log(`=== Final Scores ===`)
  console.log(`Foot Traffic: ${footTraffic}`)
  console.log(`Safety: ${safety}`)
  console.log(`Competition: ${competition}`)
  console.log(`Accessibility: ${accessibility}`)
  console.log(`Weighted Average: ${finalScore}`)
  console.log(`Consistency: ${consistencyScore.toFixed(1)}`)

  // Generate detailed analysis
  const details: DetailedAnalysis = {
    hourlyTraffic: genHourly(footTraffic, createStableRandom(coords.lat, coords.lng, "hourly")),
    weeklyTrends: genWeekly(footTraffic, createStableRandom(coords.lat, coords.lng, "weekly")),
    competitorAnalysis: {
      total: relevantComps.length,
      density: relevantComps.length > 15 ? "High" : relevantComps.length > 8 ? "Medium" : "Low",
      types: relevantComps.reduce<Record<string, number>>((m, p) => {
        const t = p.types?.[0] ?? "other"
        m[t] = (m[t] ?? 0) + 1
        return m
      }, {}),
      marketSaturation: relevantComps.length > 20 ? "Saturated" : relevantComps.length > 10 ? "Competitive" : "Open"
    },
    safetyMetrics: {
      crimeRisk: safety < 40 ? "High" : safety < 70 ? "Medium" : "Low",
      lighting: safety > 80 ? "Excellent" : safety > 60 ? "Good" : "Poor",
      surveillance: transitStations.length > 3 ? "High" : transitStations.length > 1 ? "Medium" : "Low",
      emergencyServices: nearby.filter(p => p.types?.some(t => ["hospital", "police", "fire_station"].includes(t))).length
    },
    locationFactors: {
      restaurants: nearby.filter(p => p.types?.includes("restaurant")).length,
      transit: transitStations.length,
      healthcare: nearby.filter(p => p.types?.some(t => ["hospital", "pharmacy", "doctor"].includes(t))).length,
      education: nearby.filter(p => p.types?.some(t => ["school", "university"].includes(t))).length,
      shopping: nearby.filter(p => p.types?.some(t => ["shopping_mall", "store"].includes(t))).length,
      entertainment: nearby.filter(p => p.types?.some(t => ["movie_theater", "amusement_park", "casino"].includes(t))).length
    },
    stabilityMetrics: {
      consistencyScore: Math.round(consistencyScore),
      dataQuality: Math.round(dataQuality),
      confidenceLevel: Math.round(confidenceLevel)
    }
  }

  return { score: finalScore, factors, detailedAnalysis: details }
}

// -------------------------------------------------------------------
//  Chart data generators with stable randomization
// -------------------------------------------------------------------
const genHourly = (base: number, rnd: () => number) =>
  Array.from({ length: 24 }, (_, h) => {
    const mult = h < 6 ? 0.3 : h < 10 ? 0.7 : h < 17 ? 0.9 : h < 21 ? 1 : h < 24 ? 0.6 : 0.3
    return {
      hour: `${h.toString().padStart(2, "0")}:00`,
      pedestrians: Math.max(5, Math.round(base * mult + (rnd() - 0.5) * 12)),
      vehicles: Math.max(2, Math.round(base * 0.8 * mult + (rnd() - 0.5) * 10)),
      safety: Math.max(30, Math.round(85 - (h >= 22 || h <= 5 ? 15 : 0) + (rnd() - 0.5) * 8)),
    }
  })

const genWeekly = (base: number, rnd: () => number) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  return days.map((d, i) => {
    const mult = d === "Sat" ? 1.2 : d === "Sun" ? 0.85 : d === "Fri" ? 1.1 : d === "Mon" ? 0.9 : 1
    return {
      day: d,
      traffic: Math.max(10, Math.round(base * mult + (rnd() - 0.5) * 6)),
      sales: Math.max(5, Math.round(base * mult * 0.7 + (rnd() - 0.5) * 5)),
      competition: Math.max(20, Math.round(70 + (rnd() - 0.5) * 15)),
    }
  })
}

// -------------------------------------------------------------------
//  UI helpers
// -------------------------------------------------------------------
export const colorFor = (s: number) => (s >= 75 ? "text-emerald-400" : s >= 60 ? "text-yellow-400" : "text-red-400")

export const bgFor = (s: number) =>
  s >= 75
    ? "from-emerald-500/20 to-green-500/20"
    : s >= 60
      ? "from-yellow-500/20 to-orange-500/20"
      : "from-red-500/20 to-pink-500/20"

export const labelFor = (s: number) => (s >= 75 ? "Excellent Location" : s >= 60 ? "Good Location" : "Needs Improvement")