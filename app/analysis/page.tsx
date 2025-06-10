"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  MapPin, 
  Users, 
  Shield, 
  TrendingUp, 
  Bus,
  ChevronDown,
  ChevronUp,
  Building2,
  Map as MapIcon,
  Info,
  Sparkles
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MapView } from "@/components/map-view"
import { ThreeDReportPreview } from "@/components/3d-report-preview"
import { generateConsistentScore, getLocationData, storeLocationData, locationKeyFromAddress, colorFor, bgFor, labelFor } from "@/lib/location-store"

export default function AnalysisPage() {
  const router = useRouter()
  const [selectedLocation, setSelectedLocation] = useState("")
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [businessType, setBusinessType] = useState("")
  const [businessCategory, setBusinessCategory] = useState("")
  const [geoScore, setGeoScore] = useState(0)
  const [factors, setFactors] = useState<any[]>([])
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([])
  const [transitStations, setTransitStations] = useState<any[]>([])
  const [detailedAnalysis, setDetailedAnalysis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeLayer, setActiveLayer] = useState("footHeat")
  const [is3DMode, setIs3DMode] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const confettiTriggered = useRef(false)

  // Load data from localStorage and generate analysis
  useEffect(() => {
    const loadAnalysisData = async () => {
      try {
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
          setGeoScore(cachedData.score)
          setFactors([
            { id: "footHeat", name: "Foot Traffic", score: cachedData.factors.footTraffic, color: "from-green-500 to-emerald-500" },
            { id: "hazardHeat", name: "Safety", score: cachedData.factors.safety, color: "from-blue-500 to-cyan-500" },
            { id: "competitors", name: "Competition", score: cachedData.factors.competition, color: "from-orange-500 to-yellow-500" },
            { id: "access", name: "Accessibility", score: cachedData.factors.accessibility, color: "from-purple-500 to-pink-500" },
          ])
          setNearbyPlaces(cachedData.nearbyPlaces || [])
          setDetailedAnalysis(cachedData.detailedAnalysis)
          setIsLoading(false)
          return
        }

        // Fetch fresh data
        const coords = { lat: parseFloat(lat), lng: parseFloat(lng) }
        
        // Fetch nearby places
        const placesResponse = await fetch(`/api/places?lat=${coords.lat}&lng=${coords.lng}&radius=2000`)
        const placesData = await placesResponse.json()
        const places = placesData.results || []

        // Fetch transit stations
        const transitResponse = await fetch(`/api/transit?lat=${coords.lat}&lng=${coords.lng}&radius=2000`)
        const transitData = await transitResponse.json()
        const transit = transitData.results || []

        setNearbyPlaces(places)
        setTransitStations(transit)

        // Generate score and analysis
        const analysis = generateConsistentScore(coords, places, transit)
        
        setGeoScore(analysis.score)
        setFactors([
          { id: "footHeat", name: "Foot Traffic", score: analysis.factors.footTraffic, color: "from-green-500 to-emerald-500" },
          { id: "hazardHeat", name: "Safety", score: analysis.factors.safety, color: "from-blue-500 to-cyan-500" },
          { id: "competitors", name: "Competition", score: analysis.factors.competition, color: "from-orange-500 to-yellow-500" },
          { id: "access", name: "Accessibility", score: analysis.factors.accessibility, color: "from-purple-500 to-pink-500" },
        ])
        setDetailedAnalysis(analysis.detailedAnalysis)

        // Store the analysis for future use
        storeLocationData(locationKey, {
          location,
          coordinates: coords,
          score: analysis.score,
          factors: analysis.factors,
          lastUpdated: new Date().toISOString(),
          nearbyPlaces: places,
          detailedAnalysis: analysis.detailedAnalysis,
        })

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading analysis data:", error)
        setIsLoading(false)
      }
    }

    loadAnalysisData()
  }, [router])

  // Trigger confetti animation only once when score is loaded and above 70
  useEffect(() => {
    if (!isLoading && geoScore > 0 && geoScore >= 80 && !confettiTriggered.current) {
      confettiTriggered.current = true
      
      // Create confetti effect
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)

        // Create confetti from different positions
        if (typeof window !== 'undefined' && (window as any).confetti) {
          (window as any).confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
          });
          (window as any).confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
          });
        }
      }, 250)
    }
  }, [isLoading, geoScore])

  // Load confetti library
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  const handleLayerChange = (layer: string) => {
    setActiveLayer(layer)
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: "Excellent Location", color: "text-emerald-400", bgColor: "bg-emerald-500/20" }
    if (score >= 60) return { label: "Good Location", color: "text-yellow-400", bgColor: "bg-yellow-500/20" }
    return { label: "Needs Improvement", color: "text-red-400", bgColor: "bg-red-500/20" }
  }

  const scoreInfo = getScoreLabel(geoScore)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Analyzing location...</p>
          <p className="text-cyan-300 text-sm mt-2">Gathering geospatial intelligence</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.push("/")}
                variant="ghost"
                size="sm"
                className="text-cyan-300 hover:text-white hover:bg-cyan-900/30"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="h-6 w-px bg-white/20"></div>
              <div>
                <h1 className="text-lg font-bold text-white">Location Analysis</h1>
                <p className="text-sm text-cyan-300 truncate max-w-md">{selectedLocation}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setIs3DMode(!is3DMode)}
                variant="outline"
                size="sm"
                className={`border-purple-600 text-purple-300 hover:bg-purple-900/30 ${is3DMode ? 'bg-purple-900/30' : ''}`}
              >
                {is3DMode ? <MapIcon className="w-4 h-4 mr-2" /> : <Building2 className="w-4 h-4 mr-2" />}
                {is3DMode ? '2D View' : '3D Buildings'}
              </Button>
              <Button variant="outline" size="sm" className="border-blue-600 text-blue-300 hover:bg-blue-900/30">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" className="border-green-600 text-green-300 hover:bg-green-900/30">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Score and Factors */}
          <div className="lg:col-span-1 space-y-6">
            {/* GeoScore Card */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/20 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <span>GeoScore</span>
                  </CardTitle>
                  <Badge className={`${scoreInfo.bgColor} ${scoreInfo.color} border-current`}>
                    {scoreInfo.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                      {/* Background circle */}
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-white/10"
                      />
                      {/* Progress circle */}
                      <motion.circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        className={scoreInfo.color}
                        initial={{ strokeDasharray: "0 314" }}
                        animate={{ strokeDasharray: `${(geoScore / 100) * 314} 314` }}
                        transition={{ duration: 2, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1, duration: 0.5, type: "spring" }}
                        className="text-center"
                      >
                        <div className={`text-3xl font-bold ${scoreInfo.color}`}>{geoScore}</div>
                        <div className="text-xs text-white/60">out of 100</div>
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mb-4">
                  <p className="text-white/80 text-sm">
                    {geoScore >= 80 && "Outstanding location with excellent business potential"}
                    {geoScore >= 60 && geoScore < 80 && "Solid location with good growth opportunities"}
                    {geoScore < 60 && "Consider location improvements or alternative sites"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Factors Grid */}
            <div className="grid grid-cols-2 gap-4">
              {factors.map((factor, index) => (
                <motion.div
                  key={factor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`bg-white/5 backdrop-blur-xl border border-white/20 cursor-pointer transition-all duration-300 hover:bg-white/10 ${
                      activeLayer === factor.id ? 'ring-2 ring-cyan-400 bg-white/10' : ''
                    }`}
                    onClick={() => handleLayerChange(factor.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-medium text-sm">{factor.name}</h3>
                        <div className={`text-lg font-bold ${colorFor(factor.score)}`}>
                          {factor.score}
                        </div>
                      </div>
                      <Progress 
                        value={factor.score} 
                        className="h-2 bg-white/10"
                      />
                      <div className="mt-2 text-xs text-white/60">
                        {factor.score >= 75 ? "Excellent" : factor.score >= 60 ? "Good" : "Needs Attention"}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Location Intelligence Overview */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Info className="w-5 h-5 text-blue-400" />
                  <span>Location Intelligence</span>
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
                          <div className="text-white/60">Business Type</div>
                          <div className="text-white font-semibold">{businessCategory}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-white/60">Analysis Radius</div>
                          <div className="text-white font-semibold">2 km</div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="transit" className="border-white/10">
                    <AccordionTrigger className="px-6 py-4 text-white hover:text-cyan-300">
                      Transit Stations ({transitStations.length})
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {transitStations.slice(0, 10).map((station, index) => (
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
                        ))}
                        {transitStations.length === 0 && (
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
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {nearbyPlaces.slice(0, 15).map((place, index) => (
                          <div key={index} className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="text-white font-medium text-sm">{place.name}</div>
                                <div className="text-white/60 text-xs">{place.vicinity}</div>
                                {place.rating && (
                                  <div className="flex items-center mt-1">
                                    <span className="text-yellow-400 text-xs">★ {place.rating}</span>
                                    {place.user_ratings_total && (
                                      <span className="text-white/60 text-xs ml-1">({place.user_ratings_total})</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-end space-y-1">
                                <Badge variant="outline" className="text-xs border-green-400 text-green-300">
                                  {place.types?.[0]?.replace(/_/g, ' ') || 'Business'}
                                </Badge>
                                {place.price_level !== undefined && (
                                  <div className="text-white/60 text-xs">
                                    {'$'.repeat(place.price_level + 1)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="real-time" className="border-white/10">
                    <AccordionTrigger className="px-6 py-4 text-white hover:text-cyan-300">
                      Real-time Data
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      <div className="space-y-3">
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-white/60 text-sm">Data Freshness</div>
                          <div className="text-green-400 font-medium">Live - Updated now</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-white/60 text-sm">Analysis Confidence</div>
                          <div className="text-white font-medium">
                            {detailedAnalysis?.stabilityMetrics?.confidenceLevel || 85}% High Confidence
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-white/60 text-sm">Data Sources</div>
                          <div className="text-white font-medium">Google Maps Platform APIs</div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Map and 3D Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interactive Map */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/20 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    <span>{is3DMode ? '3D Building View' : 'Interactive Map'}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {factors.map((factor) => (
                      <Button
                        key={factor.id}
                        onClick={() => handleLayerChange(factor.id)}
                        variant={activeLayer === factor.id ? "default" : "outline"}
                        size="sm"
                        className={`text-xs ${
                          activeLayer === factor.id 
                            ? "bg-cyan-600 text-white" 
                            : "border-white/20 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        {factor.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[500px] relative">
                  {coordinates && (
                    <MapView
                      coordinates={coordinates}
                      selectedLocation={selectedLocation}
                      nearbyPlaces={nearbyPlaces}
                      transitStations={transitStations}
                      activeLayer={activeLayer}
                      factors={factors}
                      onLayerChange={handleLayerChange}
                      is3DMode={is3DMode}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 3D Report Preview */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-purple-400" />
                  <span>3D Report Visualization</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-64">
                  <ThreeDReportPreview />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}