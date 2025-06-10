"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Users, Shield, Bus, TrendingUp, Clock, AlertCircle, Store, Train, Activity, BarChart3, Globe, ArrowLeft, MapPin, Star, TrendingDown, CheckCircle, Info, Zap, Target, ThumbsUp, AlertTriangle, ThumbsDown, Cuboid as Cube, Map as MapIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { MapView } from "@/components/map-view"
import { BusinessTypeSelector } from "@/components/business-type-selector"
import { ThreeDVisualization } from "@/components/3d-visualization"
import {
  getLocationData,
  storeLocationData,
  locationKeyFromAddress,
  generateConsistentScore,
  colorFor,
  bgFor,
  labelFor,
} from "@/lib/location-store"
import Image from "next/image"

interface NearbyPlace {
  name: string
  vicinity: string
  types: string[]
  icon: string
  rating?: number
  user_ratings_total?: number
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
}

export default function AnalysisPage() {
  const router = useRouter()
  const [selectedLocation, setSelectedLocation] = useState("")
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [geoScore, setGeoScore] = useState(0)
  const [activeLayer, setActiveLayer] = useState("footHeat")
  const [isLoading, setIsLoading] = useState(true)
  const [realTimeData, setRealTimeData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([])
  const [transitStations, setTransitStations] = useState<any[]>([])
  const [businessType, setBusinessType] = useState<string>("")
  const [businessCategory, setBusinessCategory] = useState<string>("")
  const [showBusinessSelector, setShowBusinessSelector] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [animationActive, setAnimationActive] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 })
  const [scoreAnimated, setScoreAnimated] = useState(false)
  const [is3DMode, setIs3DMode] = useState(false)

  const hourlyChartRef = useRef<HTMLCanvasElement>(null)
  const weeklyChartRef = useRef<HTMLCanvasElement>(null)
  const hourlyChartInstance = useRef<any>(null)
  const weeklyChartInstance = useRef<any>(null)

  // Initialize window size and animation state on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationActive(true)
    }, 500)

    if (typeof window !== "undefined") {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    const handleResize = () => {
      if (typeof window !== "undefined") {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize)
    }

    return () => {
      clearTimeout(timer)
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [])

  // Define analysis factors with enhanced descriptions and trend indicators
  const factors = realTimeData
    ? [
        {
          id: "footHeat",
          name: "Foot Traffic",
          score: realTimeData.footTraffic || 0,
          icon: Users,
          color: "from-emerald-500 to-green-400",
          description: "Pedestrian flow and activity levels throughout the day",
          trend: realTimeData.footTraffic > 70 ? "up" : realTimeData.footTraffic > 50 ? "stable" : "down"
        },
        {
          id: "hazardHeat",
          name: "Safety",
          score: realTimeData.safety || 0,
          icon: Shield,
          color: "from-blue-500 to-cyan-400",
          description: "Security assessment based on crime data and safety infrastructure",
          trend: realTimeData.safety > 70 ? "up" : realTimeData.safety > 50 ? "stable" : "down"
        },
        {
          id: "competitors",
          name: "Competition",
          score: realTimeData.competition || 0,
          icon: TrendingUp,
          color: "from-orange-500 to-yellow-400",
          description: "Market saturation and competitive landscape analysis",
          trend: realTimeData.competition > 70 ? "up" : realTimeData.competition > 50 ? "stable" : "down"
        },
        {
          id: "access",
          name: "Accessibility",
          score: realTimeData.accessibility || 0,
          icon: Bus,
          color: "from-purple-500 to-pink-400",
          description: "Public transport connectivity and ease of access",
          trend: realTimeData.accessibility > 70 ? "up" : realTimeData.accessibility > 50 ? "stable" : "down"
        },
      ]
    : []

  // Generate realistic hourly traffic patterns based on location data
  const generateHourlyData = () => {
    const baseTraffic = realTimeData?.footTraffic || 75
    const baseSafety = realTimeData?.safety || 75

    return Array.from({ length: 24 }, (_, i) => {
      const hour = i
      let trafficMultiplier = 0.3 // Default low traffic for night hours

      // Define traffic patterns based on typical business hours
      if (hour >= 6 && hour <= 9)
        trafficMultiplier = 0.7 // Morning rush
      else if (hour >= 10 && hour <= 16)
        trafficMultiplier = 0.9 // Business hours
      else if (hour >= 17 && hour <= 20)
        trafficMultiplier = 1.0 // Evening peak
      else if (hour >= 21 && hour <= 23) 
        trafficMultiplier = 0.6 // Evening wind-down

      // Safety adjustments based on time of day
      let safetyAdjustment = 0
      if (hour >= 22 || hour <= 5) safetyAdjustment = -15 // Night hours less safe
      else if (hour >= 6 && hour <= 18) safetyAdjustment = 5 // Daytime safer

      const pedestrians = Math.max(10, Math.round(baseTraffic * trafficMultiplier + Math.sin(hour * 0.5) * 8))
      const vehicles = Math.max(5, Math.round(baseTraffic * trafficMultiplier * 0.8 + Math.cos(hour * 0.3) * 6))
      const safety = Math.max(30, Math.min(95, Math.round(baseSafety + safetyAdjustment + Math.sin(hour + 1) * 5)))

      return {
        hour: `${hour.toString().padStart(2, "0")}:00`,
        pedestrians,
        vehicles,
        safety,
      }
    })
  }

  // Generate weekly business performance trends
  const generateWeeklyData = () => {
    const baseTraffic = realTimeData?.footTraffic || 75
    const baseCompetition = realTimeData?.competition || 75
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    return days.map((day, index) => {
      let trafficMultiplier = 1.0
      let salesMultiplier = 0.7

      // Weekend and weekday patterns
      if (day === "Sat") {
        trafficMultiplier = 1.3 // Saturday peak
        salesMultiplier = 0.9
      } else if (day === "Sun") {
        trafficMultiplier = 0.8 // Sunday slower
        salesMultiplier = 0.6
      } else if (day === "Mon") {
        trafficMultiplier = 0.85 // Monday startup
        salesMultiplier = 0.65
      } else if (day === "Fri") {
        trafficMultiplier = 1.2 // Friday boost
        salesMultiplier = 0.85
      }

      const traffic = Math.max(20, Math.round(baseTraffic * trafficMultiplier + Math.sin(index * 0.8) * 8))
      const sales = Math.max(15, Math.round(baseTraffic * salesMultiplier + Math.cos(index * 0.6) * 6))
      const competition = Math.max(30, Math.min(95, Math.round(baseCompetition + Math.sin(index + 2) * 10)))

      return {
        day,
        traffic,
        sales,
        competition,
      }
    })
  }

  // Initialize Chart.js charts for data visualization
  const initializeCharts = async () => {
    if (typeof window === "undefined" || !realTimeData) return

    const { Chart, registerables } = await import("chart.js")
    Chart.register(...registerables)

    const hourlyData = generateHourlyData()
    const weeklyData = generateWeeklyData()

    // Clean up existing chart instances
    if (hourlyChartInstance.current) {
      hourlyChartInstance.current.destroy()
    }
    if (weeklyChartInstance.current) {
      weeklyChartInstance.current.destroy()
    }

    // Create hourly traffic pattern chart
    if (hourlyChartRef.current) {
      const ctx = hourlyChartRef.current.getContext("2d")
      if (ctx) {
        hourlyChartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: hourlyData.map((d) => d.hour),
            datasets: [
              {
                label: "Pedestrians",
                data: hourlyData.map((d) => d.pedestrians),
                borderColor: "#10b981",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "#10b981",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
                pointRadius: 4,
              },
              {
                label: "Safety Score",
                data: hourlyData.map((d) => d.safety),
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                fill: false,
                tension: 0.4,
                pointBackgroundColor: "#3b82f6",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
                pointRadius: 3,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: {
                  color: "#94a3b8",
                  font: {
                    size: 12,
                  },
                },
              },
              tooltip: {
                backgroundColor: "#1e293b",
                titleColor: "#3b82f6",
                bodyColor: "#ffffff",
                borderColor: "#3b82f6",
                borderWidth: 1,
              },
            },
            scales: {
              x: {
                grid: {
                  color: "rgba(55, 65, 81, 0.3)",
                },
                ticks: {
                  color: "#94a3b8",
                  font: {
                    size: 11,
                  },
                },
              },
              y: {
                grid: {
                  color: "rgba(55, 65, 81, 0.3)",
                },
                ticks: {
                  color: "#94a3b8",
                  font: {
                    size: 11,
                  },
                },
                beginAtZero: true,
                max: 120,
              },
            },
            interaction: {
              intersect: false,
              mode: "index",
            },
          },
        })
      }
    }

    // Create weekly performance trends chart
    if (weeklyChartRef.current) {
      const ctx = weeklyChartRef.current.getContext("2d")
      if (ctx) {
        weeklyChartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: weeklyData.map((d) => d.day),
            datasets: [
              {
                label: "Traffic Score",
                data: weeklyData.map((d) => d.traffic),
                backgroundColor: "rgba(16, 185, 129, 0.8)",
                borderColor: "#10b981",
                borderWidth: 1,
                borderRadius: 6,
                borderSkipped: false,
              },
              {
                label: "Sales Potential",
                data: weeklyData.map((d) => d.sales),
                backgroundColor: "rgba(59, 130, 246, 0.8)",
                borderColor: "#3b82f6",
                borderWidth: 1,
                borderRadius: 6,
                borderSkipped: false,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: {
                  color: "#94a3b8",
                  font: {
                    size: 12,
                  },
                },
              },
              tooltip: {
                backgroundColor: "#1e293b",
                titleColor: "#3b82f6",
                bodyColor: "#ffffff",
                borderColor: "#3b82f6",
                borderWidth: 1,
              },
            },
            scales: {
              x: {
                grid: {
                  color: "rgba(55, 65, 81, 0.3)",
                },
                ticks: {
                  color: "#94a3b8",
                  font: {
                    size: 11,
                  },
                },
              },
              y: {
                grid: {
                  color: "rgba(55, 65, 81, 0.3)",
                },
                ticks: {
                  color: "#94a3b8",
                  font: {
                    size: 11,
                  },
                },
                beginAtZero: true,
                max: 120,
              },
            },
            interaction: {
              intersect: false,
              mode: "index",
            },
          },
        })
      }
    }
  }

  // Initialize charts when data is available
  useEffect(() => {
    if (realTimeData && !isLoading) {
      const timer = setTimeout(() => {
        initializeCharts()
      }, 500) 

      return () => clearTimeout(timer)
    }
  }, [realTimeData, isLoading])

  // Cleanup chart instances on component unmount
  useEffect(() => {
    return () => {
      if (hourlyChartInstance.current) {
        hourlyChartInstance.current.destroy()
      }
      if (weeklyChartInstance.current) {
        weeklyChartInstance.current.destroy()
      }
    }
  }, [])

  // Trigger confetti animation for high scores
  useEffect(() => {
    if (geoScore >= 75 && !isLoading && !scoreAnimated) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [geoScore, isLoading, scoreAnimated])

  // Business type mapping for competitor analysis
  const businessTypeMapping: Record<string, string[]> = {
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

  // Main data fetching function with comprehensive error handling
  const fetchRealTimeData = async () => {
    try {
      setError(null)

      let location = ""
      if (typeof window !== "undefined") {
        location = localStorage.getItem("selectedLocation") || ""
      }

      if (!location) {
        throw new Error("No location selected. Please go back and select a location.")
      }

      setSelectedLocation(location)

      const locationKey = locationKeyFromAddress(location)
      const existingData = getLocationData(locationKey)

      // Use cached data if available and not seeded
      if (existingData && !existingData.isSeeded) {
        setCoordinates(existingData.coordinates)
        setGeoScore(existingData.score)
        setRealTimeData({
          footTraffic: existingData.factors.footTraffic,
          safety: existingData.factors.safety,
          competition: existingData.factors.competition,
          accessibility: existingData.factors.accessibility,
          competitors: existingData.nearbyPlaces.filter((p: any) =>
            p.types?.some((t: string) => ["store", "restaurant", "shop", "establishment"].includes(t)),
          ),
          competitorCount: existingData.nearbyPlaces.filter((p: any) =>
            p.types?.some((t: string) => ["store", "restaurant", "shop", "establishment"].includes(t)),
          ).length,
          lastUpdated: existingData.lastUpdated,
          detailedAnalysis: existingData.detailedAnalysis,
        })
        setNearbyPlaces(existingData.nearbyPlaces)

        // Fetch transit data separately as it might not be cached
        const transitResponse = await fetch(
          `/api/transit?lat=${existingData.coordinates.lat}&lng=${existingData.coordinates.lng}&radius=2000`,
        )
        if (transitResponse.ok) {
          const transitData = await transitResponse.json()
          setTransitStations(transitData.results || [])
        }

        setIsLoading(false)
        return
      }

      // Geocode the address to get precise coordinates
      const geocodeResponse = await fetch(`/api/geocode?address=${encodeURIComponent(location)}`)

      if (!geocodeResponse.ok) {
        const errorData = await geocodeResponse.json()
        throw new Error(`Geocoding failed: ${errorData.error || geocodeResponse.statusText}`)
      }

      const geocodeData = await geocodeResponse.json()

      if (!geocodeData.results || geocodeData.results.length === 0) {
        throw new Error(`No results found for location: ${location}`)
      }

      const { lat, lng } = geocodeData.results[0].geometry.location
      const actualAddress = geocodeData.results[0].formatted_address

      setCoordinates({ lat, lng })

      // Fetch nearby places and transit data in parallel for better performance
      const [placesResponse, transitResponse] = await Promise.all([
        fetch(`/api/places?lat=${lat}&lng=${lng}&radius=2000&type=establishment`),
        fetch(`/api/transit?lat=${lat}&lng=${lng}&radius=2000`),
      ])

      let placesData = { results: [] }
      let transitData = { results: [] }

      if (placesResponse.ok) {
        placesData = await placesResponse.json()
        setNearbyPlaces(placesData.results || [])
      }

      if (transitResponse.ok) {
        transitData = await transitResponse.json()
        setTransitStations(transitData.results || [])
      }

      // Generate comprehensive location analysis
      const analysisResult = generateConsistentScore(
        { lat, lng },
        placesData.results || [],
        transitData.results || [], 
        false,
      )

      setGeoScore(analysisResult.score)

      const newData = {
        footTraffic: analysisResult.factors.footTraffic,
        safety: analysisResult.factors.safety,
        competition: analysisResult.factors.competition,
        accessibility: analysisResult.factors.accessibility,
        competitors:
          placesData.results?.filter((p: any) =>
            p.types?.some((t: string) => ["store", "restaurant", "shop", "establishment"].includes(t)),
          ) || [],
        competitorCount: analysisResult.detailedAnalysis.competitorAnalysis.total,
        lastUpdated: new Date().toISOString(),
        detailedAnalysis: analysisResult.detailedAnalysis,
      }

      setRealTimeData(newData)

      // Cache the analysis results for future use
      const locationData = {
        location: actualAddress,
        coordinates: { lat, lng },
        score: analysisResult.score,
        factors: analysisResult.factors,
        lastUpdated: new Date().toISOString(),
        nearbyPlaces: placesData.results || [],
        detailedAnalysis: analysisResult.detailedAnalysis,
        isSeeded: false,
      }

      storeLocationData(locationKey, locationData)
    } catch (error) {
      console.error("Error fetching real-time data:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setError(errorMessage)

      // Reset state on error
      setGeoScore(0)
      setRealTimeData(null)
      setNearbyPlaces([])
      setTransitStations([])
      setCoordinates(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchRealTimeData()
  }, [])

  // Handle business type selection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedBusinessType = localStorage.getItem("businessType")
      if (savedBusinessType) {
        setBusinessType(savedBusinessType)
        setBusinessCategory(localStorage.getItem("businessCategory") || "")
      } else if (!isLoading && !showBusinessSelector && !error) {
        setShowBusinessSelector(true)
      }
    }
  }, [isLoading, error])

  const handleBusinessTypeSelect = (type: string, category: string) => {
    setBusinessType(type)
    setBusinessCategory(category)
    if (typeof window !== "undefined") {
      localStorage.setItem("businessType", type)
      localStorage.setItem("businessCategory", category)
    }
  }

  // Filter competitors based on selected business type
  const relevantCompetitors =
    businessType && businessTypeMapping[businessType]
      ? nearbyPlaces.filter((place) => place.types?.some((t: string) => businessTypeMapping[businessType].includes(t)))
      : nearbyPlaces.filter((place) =>
          place.types?.some((t: string) => ["store", "restaurant", "shop", "establishment"].includes(t)),
        )

  // Generate smart suggestions based on GeoScore
  const getSmartSuggestions = () => {
    if (geoScore >= 75) {
      return {
        icon: ThumbsUp,
        color: "text-green-400",
        bgColor: "bg-green-900/20",
        borderColor: "border-green-500/30",
        title: "Excellent Location Choice",
        message: "This location shows strong potential for business success with high foot traffic and good accessibility."
      }
    } else if (geoScore >= 50) {
      return {
        icon: AlertTriangle,
        color: "text-yellow-400",
        bgColor: "bg-yellow-900/20",
        borderColor: "border-yellow-500/30",
        title: "Good Location with Room for Improvement",
        message: "Consider strategies to boost foot traffic or improve accessibility to maximize potential."
      }
    } else {
      return {
        icon: ThumbsDown,
        color: "text-red-400",
        bgColor: "bg-red-900/20",
        borderColor: "border-red-500/30",
        title: "High Risk Location",
        message: "This location may face challenges. Consider alternative locations or significant marketing investment."
      }
    }
  }

  const suggestions = getSmartSuggestions()

  // Animated background with floating elements
  const EarthBackground = () => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Main Earth Visualization */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: animationActive ? 0.04 : 0,
          scale: animationActive ? 1 : 0.8,
          rotate: animationActive ? 360 : 0,
        }}
        transition={{
          opacity: { duration: 2 },
          scale: { duration: 3 },
          rotate: { duration: 200, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
        }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px]"
      >
        <ThreeDVisualization type="hero" className="w-full h-full" />
      </motion.div>

      {/* Floating orbs with subtle glow effects */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className={`absolute w-32 h-32 rounded-full bg-gradient-to-r ${
            i % 2 === 0 ? "from-blue-500/5 to-cyan-500/3" : "from-purple-500/5 to-pink-500/3"
          }`}
          initial={{
            x: Math.random() * windowSize.width,
            y: Math.random() * windowSize.height,
            scale: 0,
          }}
          animate={{
            x: [Math.random() * windowSize.width, Math.random() * windowSize.width, Math.random() * windowSize.width],
            y: [
              Math.random() * windowSize.height,
              Math.random() * windowSize.height,
              Math.random() * windowSize.height,
            ],
            scale: animationActive ? [0, 1, 0.5, 1, 0] : 0,
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            times: [0, 0.2, 0.5, 0.8, 1],
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 2,
          }}
        />
      ))}

      {/* Floating particles for ambient effect */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className={`absolute w-1 h-1 rounded-full ${
            i % 3 === 0 ? "bg-blue-400/50" : i % 3 === 1 ? "bg-cyan-400/50" : "bg-purple-400/50"
          }`}
          initial={{
            x: Math.random() * windowSize.width,
            y: Math.random() * windowSize.height,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            x: [Math.random() * windowSize.width, Math.random() * windowSize.width, Math.random() * windowSize.width],
            y: [
              Math.random() * windowSize.height,
              Math.random() * windowSize.height,
              Math.random() * windowSize.height,
            ],
            opacity: animationActive ? [0, 0.7, 0] : 0,
            scale: animationActive ? [0, 1, 0] : 0,
          }}
          transition={{
            duration: 8 + Math.random() * 12,
            times: [0, 0.5, 1],
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  )

  // Confetti animation for celebrating high scores
  const ConfettiAnimation = () => {
    if (!showConfetti) return null

    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
            initial={{
              x: typeof window !== "undefined" ? Math.random() * window.innerWidth : 0,
              y: -20,
              rotate: 0,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: typeof window !== "undefined" ? window.innerHeight + 20 : 800,
              rotate: 360,
              x: typeof window !== "undefined" ? Math.random() * window.innerWidth : 0,
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              ease: "easeOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    )
  }

  // Error state with retry functionality
  if (error || (coordinates === null && !isLoading)) {
    return (
      <div className="min-h-screen bg-slate-900 relative">
        <EarthBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center p-8 bg-white/5 backdrop-blur-xl rounded-xl border border-white/20 max-w-md">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-white text-2xl font-bold mb-4">Analysis Failed</h2>
            <p className="text-red-200 mb-6">{error || "Unable to analyze the selected location."}</p>
            <div className="space-y-3">
              <Button onClick={() => router.push("/")} className="w-full bg-cyan-600 hover:bg-cyan-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <Button
                onClick={fetchRealTimeData}
                variant="outline"
                className="w-full border-red-500 text-red-300 hover:bg-red-900/30"
              >
                Retry Analysis
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading state with animated indicators
  if (isLoading || !realTimeData) {
    return (
      <div className="min-h-screen bg-slate-900 relative">
        <EarthBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="relative mb-8 mx-auto">
              <div className="w-20 h-20 border-4 border-cyan-400/30 rounded-full mx-auto"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
            <h2 className="text-white text-2xl font-bold mb-2 text-center">Analyzing Location</h2>
            <p className="text-cyan-300 text-center">Generating your GeoScope report...</p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 relative">
      {/* Animated background */}
      <EarthBackground />

      {/* Confetti celebration */}
      <ConfettiAnimation />

      {/* Business type selection modal */}
      <BusinessTypeSelector
        isOpen={showBusinessSelector}
        onClose={() => setShowBusinessSelector(false)}
        onSelect={handleBusinessTypeSelect}
      />

      {/* Header with navigation and controls */}
      <header className="relative z-10 py-6 px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="rounded-full overflow-hidden border-4 border-blue-500 shadow-lg shadow-blue-500/30 w-12 h-12">
              <Image src="/logo.png" alt="GeoScope Credit Logo" width={48} height={48} className="object-cover" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-white">GeoScope Credit</h1>
              <p className="text-blue-300 text-sm">Location Intelligence Report</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setIs3DMode(!is3DMode)}
              variant="outline"
              className={`border-purple-600 text-purple-300 hover:bg-purple-900/30 ${is3DMode ? 'bg-purple-900/30' : ''}`}
            >
              {is3DMode ? <MapIcon className="w-4 h-4 mr-2" /> : <Cube className="w-4 h-4 mr-2" />}
              {is3DMode ? '2D View' : '3D Buildings'}
            </Button>
            <Button
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("businessType")
                  localStorage.removeItem("businessCategory")
                }
                router.push("/")
              }}
              variant="outline"
              className="border-cyan-600 text-cyan-300 hover:bg-cyan-900/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-green-600 text-green-300 hover:bg-green-900/30"
              onClick={() => window.print()}
            >
              Export Report
            </Button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="container mx-auto px-8 py-12 relative z-10">
        {/* Hero section with enhanced score display */}
        <div className="flex flex-col lg:flex-row items-start justify-between mb-16 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="lg:w-1/2"
          >
            {/* Location header with status indicators */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl text-cyan-300">Analysis Complete</h2>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">{selectedLocation}</h3>
              
              {/* Status badges */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-xl rounded-full px-4 py-2 border border-white/20">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Live Analysis</span>
                </div>
                {businessCategory && (
                  <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-xl rounded-full px-4 py-2 border border-white/20">
                    <Store className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 text-sm font-medium">{businessCategory}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-xl rounded-full px-4 py-2 border border-white/20">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">
                    {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced circular score display */}
            <Card className={`bg-white/5 backdrop-blur-xl border border-white/20 relative overflow-hidden mb-8`}>
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    <Zap className="w-8 h-8 text-cyan-400" />
                    <h4 className="text-2xl font-bold text-white">GeoScope Score</h4>
                  </div>
                  
                  {/* Circular progress indicator */}
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                      {/* Background circle */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="12"
                        fill="none"
                      />
                      {/* Progress circle */}
                      <motion.circle
                        cx="100"
                        cy="100"
                        r="80"
                        stroke={geoScore >= 75 ? "#10b981" : geoScore >= 50 ? "#f59e0b" : "#ef4444"}
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 80}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                        animate={{ 
                          strokeDashoffset: !scoreAnimated ? 2 * Math.PI * 80 * (1 - geoScore / 100) : 2 * Math.PI * 80 * (1 - geoScore / 100)
                        }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        onAnimationComplete={() => setScoreAnimated(true)}
                        className="drop-shadow-lg"
                        style={{
                          filter: `drop-shadow(0 0 8px ${geoScore >= 75 ? "#10b981" : geoScore >= 50 ? "#f59e0b" : "#ef4444"}40)`
                        }}
                      />
                    </svg>
                    {/* Score number in center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                        className={`text-6xl font-bold ${colorFor(geoScore)}`}
                      >
                        {geoScore}
                      </motion.div>
                    </div>
                  </div>

                  {/* Score label and slider */}
                  <Badge variant="outline" className={`${colorFor(geoScore)} border-current text-lg px-4 py-2 mb-6`}>
                    {labelFor(geoScore)}
                  </Badge>
                  
                  {/* Enhanced score slider */}
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-gray-300 mb-3">
                      <span className="text-red-400">Poor</span>
                      <span className="text-yellow-400">Average</span>
                      <span className="text-green-400">Excellent</span>
                    </div>
                    <div className="relative h-4 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-black/30 rounded-full"></div>
                      <motion.div
                        className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-gray-300"
                        initial={{ left: "0%" }}
                        animate={{ left: `${geoScore}%` }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        style={{ marginLeft: "-12px" }}
                      />
                      {/* Scale markers */}
                      {[0, 25, 50, 75, 100].map((mark) => (
                        <div
                          key={mark}
                          className="absolute top-0 bottom-0 w-0.5 bg-white/50"
                          style={{ left: `${mark}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0</span>
                      <span>25</span>
                      <span>50</span>
                      <span>75</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Smart suggestions based on score */}
            <Card className={`${suggestions.bgColor} border ${suggestions.borderColor} backdrop-blur-xl mb-8`}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <suggestions.icon className={`w-8 h-8 ${suggestions.color} flex-shrink-0 mt-1`} />
                  <div>
                    <h4 className={`text-lg font-bold ${suggestions.color} mb-2`}>{suggestions.title}</h4>
                    <p className="text-white/80">{suggestions.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced factor grid */}
            <div className="grid grid-cols-2 gap-4">
              {factors.map((factor, index) => (
                <motion.div
                  key={factor.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={`bg-white/5 backdrop-blur-xl p-6 rounded-2xl text-white cursor-pointer transition-all duration-300 hover:scale-105 shadow-lg relative overflow-hidden border border-white/20 ${
                    activeLayer === factor.id ? 'ring-2 ring-cyan-400 bg-white/10' : ''
                  }`}
                  onClick={() => setActiveLayer(factor.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <factor.icon className="w-8 h-8" />
                    {factor.trend === "up" && <TrendingUp className="w-5 h-5 text-green-200" />}
                    {factor.trend === "down" && <TrendingDown className="w-5 h-5 text-red-200" />}
                    {factor.trend === "stable" && <CheckCircle className="w-5 h-5 text-blue-200" />}
                  </div>
                  <div className="text-3xl font-bold mb-1">{factor.score}</div>
                  <div className="text-sm opacity-90 mb-2">{factor.name}</div>
                  <Progress value={factor.score} className="h-2 bg-white/20" />
                  
                  {/* Active indicator */}
                  {activeLayer === factor.id && (
                    <div className="absolute inset-0 bg-cyan-400/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-cyan-300">Active Layer</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Enhanced map section with 3D support */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="lg:w-1/2 h-[900px]"
          >
            <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-lg h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    <span>Interactive Analysis Map</span>
                    {is3DMode && (
                      <Badge variant="outline" className="border-purple-400 text-purple-400 ml-2">
                        3D Buildings
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="border-cyan-400 text-cyan-400">
                      2km Radius
                    </Badge>
                    <Badge variant="outline" className="border-purple-400 text-purple-400">
                      {transitStations.length} Transit
                    </Badge>
                    <Badge variant="outline" className="border-orange-400 text-orange-400">
                      {relevantCompetitors.length} Competitors
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 h-full">
                <MapView
                  coordinates={coordinates}
                  selectedLocation={selectedLocation}
                  nearbyPlaces={nearbyPlaces}
                  transitStations={transitStations}
                  activeLayer={activeLayer}
                  factors={factors}
                  onLayerChange={setActiveLayer}
                  is3DMode={is3DMode}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Enhanced Location Intelligence Overview with Accordions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-16"
        >
          <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <span>Location Intelligence Overview</span>
                <Badge variant="outline" className="border-green-400 text-green-400 ml-auto">
                  Real-time Data
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full space-y-4">
                <AccordionItem value="quick-stats" className="border border-white/10 rounded-lg bg-white/5 backdrop-blur-xl">
                  <AccordionTrigger className="px-6 py-4 text-white hover:text-cyan-300">
                    <div className="flex items-center space-x-3">
                      <Target className="w-5 h-5 text-cyan-400" />
                      <span className="text-lg font-semibold">Quick Statistics</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
                      <div className="text-center p-4 bg-white/5 backdrop-blur-xl rounded-lg hover:bg-white/10 transition-colors border border-white/10">
                        <Store className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                        <div className="text-white font-bold text-2xl">{relevantCompetitors.length}</div>
                        <div className="text-cyan-300 text-sm">Competitors</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 backdrop-blur-xl rounded-lg hover:bg-white/10 transition-colors border border-white/10">
                        <Train className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <div className="text-white font-bold text-2xl">{transitStations.length}</div>
                        <div className="text-cyan-300 text-sm">Transit</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 backdrop-blur-xl rounded-lg hover:bg-white/10 transition-colors border border-white/10">
                        <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <div className="text-white font-bold text-2xl">{realTimeData?.footTraffic || 0}</div>
                        <div className="text-cyan-300 text-sm">Traffic Score</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 backdrop-blur-xl rounded-lg hover:bg-white/10 transition-colors border border-white/10">
                        <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <div className="text-white font-bold text-2xl">{realTimeData?.safety || 0}</div>
                        <div className="text-cyan-300 text-sm">Safety Score</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 backdrop-blur-xl rounded-lg hover:bg-white/10 transition-colors border border-white/10">
                        <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                        <div className="text-white font-bold text-2xl">{realTimeData?.competition || 0}</div>
                        <div className="text-cyan-300 text-sm">Competition</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 backdrop-blur-xl rounded-lg hover:bg-white/10 transition-colors border border-white/10">
                        <Bus className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <div className="text-white font-bold text-2xl">{realTimeData?.accessibility || 0}</div>
                        <div className="text-cyan-300 text-sm">Accessibility</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 backdrop-blur-xl rounded-lg hover:bg-white/10 transition-colors border border-white/10">
                        <Activity className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                        <div className="text-white font-bold text-2xl">{nearbyPlaces.length}</div>
                        <div className="text-cyan-300 text-sm">Total Places</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 backdrop-blur-xl rounded-lg hover:bg-white/10 transition-colors border border-white/10">
                        <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                        <div className="text-white font-bold text-2xl">
                          {Math.round((nearbyPlaces.filter(p => p.rating).reduce((sum, p) => sum + (p.rating || 0), 0) / nearbyPlaces.filter(p => p.rating).length) * 10) / 10 || 0}
                        </div>
                        <div className="text-cyan-300 text-sm">Avg Rating</div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="transit-details" className="border border-white/10 rounded-lg bg-white/5 backdrop-blur-xl">
                  <AccordionTrigger className="px-6 py-4 text-white hover:text-cyan-300">
                    <div className="flex items-center space-x-3">
                      <Train className="w-5 h-5 text-purple-400" />
                      <span className="text-lg font-semibold">Transit Stations ({transitStations.length})</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    {transitStations.length > 0 ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {transitStations.slice(0, 6).map((station, index) => (
                          <div key={index} className="bg-white/5 backdrop-blur-xl rounded-lg p-4 border border-white/10">
                            <div className="flex items-start space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                station.types?.includes('train_station') || station.types?.includes('subway_station') 
                                  ? 'bg-purple-500' : 'bg-blue-500'
                              }`}>
                                {station.types?.includes('train_station') || station.types?.includes('subway_station') ? '🚊' : '🚌'}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-white font-semibold text-sm">{station.name}</h4>
                                <p className="text-white/60 text-xs mt-1">{station.vicinity}</p>
                                <Badge variant="outline" className="text-xs mt-2 border-purple-400 text-purple-400">
                                  {station.types?.includes('train_station') ? 'Train' : 
                                   station.types?.includes('subway_station') ? 'Subway' : 'Bus'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Train className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-white/60">No transit stations found within 2km radius</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="nearby-amenities" className="border border-white/10 rounded-lg bg-white/5 backdrop-blur-xl">
                  <AccordionTrigger className="px-6 py-4 text-white hover:text-cyan-300">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-green-400" />
                      <span className="text-lg font-semibold">Nearby Amenities ({nearbyPlaces.length})</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {nearbyPlaces.slice(0, 9).map((place, index) => (
                        <div key={index} className="bg-white/5 backdrop-blur-xl rounded-lg p-4 border border-white/10">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                              {place.types?.includes('restaurant') ? '🍽️' :
                               place.types?.includes('store') ? '🏪' :
                               place.types?.includes('hospital') ? '🏥' :
                               place.types?.includes('school') ? '🏫' : '🏢'}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-semibold text-sm">{place.name}</h4>
                              <p className="text-white/60 text-xs mt-1">{place.vicinity}</p>
                              {place.rating && (
                                <div className="flex items-center space-x-1 mt-2">
                                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                  <span className="text-yellow-400 text-xs">{place.rating}</span>
                                  <span className="text-white/40 text-xs">({place.user_ratings_total || 0})</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="grid lg:grid-cols-2 gap-8 mb-16"
        >
          {/* 24-Hour Traffic Pattern */}
          <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span>24-Hour Traffic Pattern</span>
                <Badge variant="outline" className="border-green-400 text-green-400 text-xs">
                  Live Data
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative h-80">
                <canvas ref={hourlyChartRef} className="w-full h-full"></canvas>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Trends */}
          <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span>Weekly Performance Trends</span>
                <Badge variant="outline" className="border-green-400 text-green-400 text-xs">
                  Predictive
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative h-80">
                <canvas ref={weeklyChartRef} className="w-full h-full"></canvas>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Competitor Analysis */}
        {businessType && relevantCompetitors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="mb-16"
          >
            <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Store className="w-5 h-5 text-orange-400" />
                  <span>{businessCategory} Market Analysis</span>
                  <Badge variant="outline" className="border-orange-400 text-orange-400">
                    {relevantCompetitors.length} Competitors
                  </Badge>
                  <Badge variant="outline" className={`ml-2 ${
                    realTimeData?.detailedAnalysis?.competitorAnalysis?.marketSaturation === "Saturated" 
                      ? "border-red-400 text-red-400"
                      : realTimeData?.detailedAnalysis?.competitorAnalysis?.marketSaturation === "Competitive"
                      ? "border-yellow-400 text-yellow-400"
                      : "border-green-400 text-green-400"
                  }`}>
                    {realTimeData?.detailedAnalysis?.competitorAnalysis?.marketSaturation || "Unknown"} Market
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relevantCompetitors.slice(0, 6).map((competitor, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.5 + index * 0.1 }}
                      className="bg-white/5 backdrop-blur-xl rounded-lg p-4 hover:bg-white/10 transition-all duration-300 border border-white/10"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-white font-medium text-sm leading-tight">{competitor.name}</h4>
                        {competitor.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-yellow-400">{competitor.rating}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-cyan-200 text-xs mb-3 line-clamp-2">{competitor.vicinity}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs border-orange-400 text-orange-400">
                          {competitor.types?.[0]?.replace(/_/g, ' ') || 'Business'}
                        </Badge>
                        <span className="text-xs text-cyan-300">{competitor.user_ratings_total || 0} reviews</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {relevantCompetitors.length > 6 && (
                  <div className="mt-6 text-center">
                    <Badge variant="outline" className="border-orange-400 text-orange-400">
                      +{relevantCompetitors.length - 6} more competitors in the area
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Enhanced Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="py-8 mt-16 border-t border-white/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-full overflow-hidden w-10 h-10 border-2 border-blue-500/50">
                <Image src="/logo.png" alt="GeoScope Credit" width={40} height={40} className="object-cover" />
              </div>
              <div className="text-blue-300">Coded by Harman • Built in Canada</div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
              <Badge variant="outline" className="border-green-400 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Live
              </Badge>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}