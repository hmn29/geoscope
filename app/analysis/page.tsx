"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, MapPin, Users, Shield, TrendingUp, Bus, Download, Eye, Building, Map as MapIcon, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MapView } from "@/components/map-view"
import { generateConsistentScore, getLocationData, storeLocationData, locationKeyFromAddress, colorFor, bgFor, labelFor } from "@/lib/location-store"
import Image from "next/image"

export default function AnalysisPage() {
  const router = useRouter()
  const [selectedLocation, setSelectedLocation] = useState("")
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [businessType, setBusinessType] = useState("")
  const [businessCategory, setBusinessCategory] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([])
  const [transitStations, setTransitStations] = useState<any[]>([])
  const [score, setScore] = useState(0)
  const [factors, setFactors] = useState<any>({})
  const [detailedAnalysis, setDetailedAnalysis] = useState<any>({})
  const [activeLayer, setActiveLayer] = useState("footHeat")
  const [is3DMode, setIs3DMode] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [hasShownConfetti, setHasShownConfetti] = useState(false) // Track if confetti has been shown
  const confettiTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load data from localStorage on component mount
  useEffect(() => {
    const location = localStorage.getItem("selectedLocation")
    const lat = localStorage.getItem("lat")
    const lng = localStorage.getItem("lng")
    const bizType = localStorage.getItem("businessType")
    const bizCategory = localStorage.getItem("businessCategory")

    if (!location || !lat || !lng) {
      router.push("/")
      return
    }

    setSelectedLocation(location)
    setCoordinates({ lat: parseFloat(lat), lng: parseFloat(lng) })
    setBusinessType(bizType || "")
    setBusinessCategory(bizCategory || "")

    // Check if we have cached data
    const locationKey = locationKeyFromAddress(location)
    const cachedData = getLocationData(locationKey)

    if (cachedData) {
      // Use cached data
      setScore(cachedData.score)
      setFactors(cachedData.factors)
      setDetailedAnalysis(cachedData.detailedAnalysis)
      setNearbyPlaces(cachedData.nearbyPlaces || [])
      setIsLoading(false)
      
      // Only show confetti once for high scores and if not shown before
      if (cachedData.score >= 80 && !hasShownConfetti) {
        triggerConfetti()
      }
    } else {
      // Fetch new data
      fetchLocationData(parseFloat(lat), parseFloat(lng), location)
    }
  }, [router, hasShownConfetti])

  const triggerConfetti = () => {
    if (hasShownConfetti) return // Prevent multiple confetti triggers
    
    setShowConfetti(true)
    setHasShownConfetti(true)
    
    // Clear any existing timeout
    if (confettiTimeoutRef.current) {
      clearTimeout(confettiTimeoutRef.current)
    }
    
    // Hide confetti after 3 seconds
    confettiTimeoutRef.current = setTimeout(() => {
      setShowConfetti(false)
    }, 3000)
  }

  const fetchLocationData = async (lat: number, lng: number, location: string) => {
    try {
      setIsLoading(true)

      // Fetch nearby places and transit stations in parallel
      const [placesResponse, transitResponse] = await Promise.all([
        fetch(`/api/places?lat=${lat}&lng=${lng}&radius=2000&type=establishment`),
        fetch(`/api/transit?lat=${lat}&lng=${lng}&radius=2000`)
      ])

      const placesData = await placesResponse.json()
      const transitData = await transitResponse.json()

      const places = placesData.results || []
      const transit = transitData.results || []

      setNearbyPlaces(places)
      setTransitStations(transit)

      // Generate score using the enhanced algorithm
      const result = generateConsistentScore({ lat, lng }, places, transit)
      
      setScore(result.score)
      setFactors(result.factors)
      setDetailedAnalysis(result.detailedAnalysis)

      // Store the data for future use
      const locationKey = locationKeyFromAddress(location)
      storeLocationData(locationKey, {
        location,
        coordinates: { lat, lng },
        score: result.score,
        factors: result.factors,
        lastUpdated: new Date().toISOString(),
        nearbyPlaces: places,
        detailedAnalysis: result.detailedAnalysis
      })

      // Only show confetti once for high scores
      if (result.score >= 80 && !hasShownConfetti) {
        triggerConfetti()
      }

    } catch (error) {
      console.error("Error fetching location data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current)
      }
    }
  }, [])

  const factorData = [
    {
      id: "footHeat",
      name: "Foot Traffic",
      score: factors.footTraffic || 0,
      icon: Users,
      color: "from-green-500 to-emerald-500",
      description: "Pedestrian activity and customer flow patterns"
    },
    {
      id: "hazardHeat", 
      name: "Safety Index",
      score: factors.safety || 0,
      icon: Shield,
      color: "from-blue-500 to-cyan-500",
      description: "Security assessment and crime risk analysis"
    },
    {
      id: "competitors",
      name: "Competition",
      score: factors.competition || 0,
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
      description: "Market saturation and competitive landscape"
    },
    {
      id: "access",
      name: "Accessibility",
      score: factors.accessibility || 0,
      icon: Bus,
      color: "from-purple-500 to-pink-500",
      description: "Public transportation and ease of access"
    }
  ]

  const handleLayerChange = (layerId: string) => {
    // Don't trigger confetti when changing layers
    setActiveLayer(layerId)
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good" 
    if (score >= 40) return "Average"
    return "Poor"
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-blue-400"
    if (score >= 40) return "text-yellow-400"
    return "text-red-400"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Analyzing location...</p>
          <p className="text-cyan-300 text-sm mt-2">Processing geospatial data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Confetti Animation - Only shows once for scores >= 80 */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -10,
                  rotate: 0,
                  scale: Math.random() * 0.5 + 0.5
                }}
                animate={{
                  y: window.innerHeight + 10,
                  rotate: 360,
                  x: Math.random() * window.innerWidth
                }}
                transition={{
                  duration: Math.random() * 2 + 2,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900"></div>
      
      {/* Header */}
      <header className="relative z-10 py-4 px-6 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              size="sm"
              className="border-cyan-600 text-cyan-300 hover:bg-cyan-900/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-blue-500">
                <Image src="/logo.png" alt="GeoScope" width={32} height={32} className="object-cover" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Location Analysis</h1>
                <p className="text-blue-300 text-sm">{businessCategory}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setIs3DMode(!is3DMode)}
              variant="outline"
              size="sm"
              className={`border-purple-600 text-purple-300 hover:bg-purple-900/30 ${is3DMode ? 'bg-purple-900/30' : ''}`}
            >
              {is3DMode ? <MapIcon className="w-4 h-4 mr-2" /> : <Building className="w-4 h-4 mr-2" />}
              {is3DMode ? '2D View' : '3D Buildings'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-green-600 text-green-300 hover:bg-green-900/30"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Analysis Results */}
        <div className="w-1/3 p-6 overflow-y-auto bg-white/5 backdrop-blur-xl border-r border-white/10">
          {/* Location Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <h2 className="text-white font-semibold truncate">{selectedLocation}</h2>
            </div>
            <p className="text-blue-300 text-sm">
              {coordinates?.lat.toFixed(6)}, {coordinates?.lng.toFixed(6)}
            </p>
          </div>

          {/* GeoScore Display */}
          <Card className="mb-6 bg-white/10 backdrop-blur-xl border border-white/20">
            <CardContent className="p-6 text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-white/20"
                  />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    className={getScoreColor(score)}
                    initial={{ strokeDasharray: "0 314" }}
                    animate={{ strokeDasharray: `${(score / 100) * 314} 314` }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1, duration: 0.5 }}
                      className={`text-3xl font-bold ${getScoreColor(score)}`}
                    >
                      {score}
                    </motion.div>
                    <div className="text-white/60 text-sm">GeoScore</div>
                  </div>
                </div>
              </div>
              <div className={`text-lg font-semibold ${getScoreColor(score)} mb-2`}>
                {getScoreLabel(score)} Location
              </div>
              <p className="text-white/60 text-sm">
                {score >= 80 ? "Outstanding business potential with excellent fundamentals" :
                 score >= 60 ? "Good location with solid growth opportunities" :
                 score >= 40 ? "Average location with room for improvement" :
                 "Challenging location requiring strategic planning"}
              </p>
            </CardContent>
          </Card>

          {/* Factor Cards */}
          <div className="space-y-3 mb-6">
            {factorData.map((factor) => (
              <Card
                key={factor.id}
                className={`cursor-pointer transition-all duration-300 bg-white/5 backdrop-blur-xl border border-white/20 hover:bg-white/10 ${
                  activeLayer === factor.id ? 'ring-2 ring-cyan-400 bg-white/15' : ''
                }`}
                onClick={() => handleLayerChange(factor.id)} // Use the safe handler
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${factor.color} rounded-lg flex items-center justify-center`}>
                        <factor.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{factor.name}</h3>
                        <p className="text-white/60 text-sm">{factor.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${colorFor(factor.score)}`}>
                        {factor.score}
                      </div>
                      <div className="w-16 bg-white/20 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${factor.color}`}
                          style={{ width: `${factor.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Location Intelligence Overview */}
          <Card className="bg-white/5 backdrop-blur-xl border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Eye className="w-5 h-5 text-cyan-400" />
                <span>Location Intelligence Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="quick-stats" className="border-white/10">
                  <AccordionTrigger className="px-6 py-4 text-white hover:text-cyan-300">
                    Quick Statistics
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-white/60">Nearby Businesses</div>
                        <div className="text-white font-semibold">{nearbyPlaces.length}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-white/60">Transit Stations</div>
                        <div className="text-white font-semibold">{transitStations.length}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-white/60">Safety Level</div>
                        <div className={`font-semibold ${colorFor(factors.safety || 0)}`}>
                          {factors.safety >= 75 ? 'High' : factors.safety >= 50 ? 'Medium' : 'Low'}
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-white/60">Competition</div>
                        <div className={`font-semibold ${colorFor(factors.competition || 0)}`}>
                          {factors.competition >= 75 ? 'Low' : factors.competition >= 50 ? 'Medium' : 'High'}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="transit" className="border-white/10">
                  <AccordionTrigger className="px-6 py-4 text-white hover:text-cyan-300">
                    Transit Stations ({transitStations.length})
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {transitStations.length > 0 ? (
                        transitStations.slice(0, 8).map((station, index) => (
                          <div key={index} className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-white font-medium text-sm">{station.name}</div>
                                <div className="text-white/60 text-xs">{station.vicinity}</div>
                              </div>
                              <Badge variant="outline" className="text-xs border-blue-400 text-blue-300">
                                {station.types?.includes('train_station') ? 'Train' :
                                 station.types?.includes('subway_station') ? 'Subway' : 'Bus'}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-white/60 text-sm text-center py-4">
                          No transit stations found within 2km radius
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="amenities" className="border-white/10">
                  <AccordionTrigger className="px-6 py-4 text-white hover:text-cyan-300">
                    Nearby Amenities ({nearbyPlaces.length})
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {nearbyPlaces.slice(0, 10).map((place, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-white font-medium text-sm">{place.name}</div>
                              <div className="text-white/60 text-xs">{place.vicinity}</div>
                            </div>
                            <div className="text-right">
                              {place.rating && (
                                <div className="text-yellow-400 text-xs">
                                  ⭐ {place.rating}
                                </div>
                              )}
                              <Badge variant="outline" className="text-xs border-green-400 text-green-300 mt-1">
                                {place.types?.[0]?.replace(/_/g, ' ') || 'Business'}
                              </Badge>
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
        </div>

        {/* Right Panel - Interactive Map */}
        <div className="flex-1 relative">
          {coordinates && (
            <MapView
              coordinates={coordinates}
              selectedLocation={selectedLocation}
              nearbyPlaces={nearbyPlaces}
              transitStations={transitStations}
              activeLayer={activeLayer}
              factors={factorData}
              onLayerChange={handleLayerChange} // Use the safe handler
              is3DMode={is3DMode}
            />
          )}
        </div>
      </div>
    </div>
  )
}