"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Shield, 
  TrendingUp, 
  Bus, 
  Download, 
  BarChart3, 
  Clock,
  ChevronDown,
  ChevronUp,
  Eye,
  Building,
  Map as MapIcon,
  Layers,
  Info,
  Star,
  Navigation,
  Phone,
  Globe,
  Calendar
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MapView } from "@/components/map-view"
import { ThreeDReportPreview } from "@/components/3d-report-preview"

import { 
  getLocationData, 
  generateConsistentScore, 
  colorFor, 
  bgFor, 
  labelFor,
  locationKeyFromAddress 
} from "@/lib/location-store"

export default function AnalysisPage() {
  const router = useRouter()
  const [selectedLocation, setSelectedLocation] = useState("")
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [businessType, setBusinessType] = useState("")
  const [businessCategory, setBusinessCategory] = useState("")
  const [score, setScore] = useState(0)
  const [factors, setFactors] = useState<any[]>([])
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([])
  const [transitStations, setTransitStations] = useState<any[]>([])
  const [detailedAnalysis, setDetailedAnalysis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeLayer, setActiveLayer] = useState("footHeat")
  const [is3DMode, setIs3DMode] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const hasAnimated = useRef(false)

  // Load stored data and fetch analysis
  useEffect(() => {
    const storedLocation = localStorage.getItem("selectedLocation")
    const storedLat = localStorage.getItem("lat")
    const storedLng = localStorage.getItem("lng")
    const storedBusinessType = localStorage.getItem("businessType")
    const storedBusinessCategory = localStorage.getItem("businessCategory")

    if (!storedLocation || !storedLat || !storedLng) {
      router.push("/")
      return
    }

    setSelectedLocation(storedLocation)
    setCoordinates({ lat: parseFloat(storedLat), lng: parseFloat(storedLng) })
    setBusinessType(storedBusinessType || "")
    setBusinessCategory(storedBusinessCategory || "")

    fetchAnalysisData(storedLocation, parseFloat(storedLat), parseFloat(storedLng))
  }, [router])

  const fetchAnalysisData = async (location: string, lat: number, lng: number) => {
    try {
      setIsLoading(true)
      
      // Check if we have cached data first
      const locationKey = locationKeyFromAddress(location)
      const cachedData = getLocationData(locationKey)
      
      if (cachedData && !cachedData.isSeeded) {
        console.log("Using cached analysis data")
        setScore(cachedData.score)
        setFactors(Object.entries(cachedData.factors).map(([id, score]) => ({
          id: id === "footTraffic" ? "footHeat" : 
              id === "safety" ? "hazardHeat" : 
              id === "competition" ? "competitors" : 
              id === "accessibility" ? "access" : id,
          name: id === "footTraffic" ? "Foot Traffic" : 
                id === "safety" ? "Safety Index" : 
                id === "competition" ? "Competition" : 
                id === "accessibility" ? "Accessibility" : id,
          score: score as number,
          color: id === "footTraffic" ? "from-green-500 to-emerald-500" :
                 id === "safety" ? "from-blue-500 to-cyan-500" :
                 id === "competition" ? "from-orange-500 to-red-500" :
                 "from-purple-500 to-pink-500"
        })))
        setDetailedAnalysis(cachedData.detailedAnalysis)
        setNearbyPlaces(cachedData.nearbyPlaces || [])
        setIsLoading(false)
        return
      }

      // Fetch fresh data from APIs
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

      // Generate the score using our mathematical algorithm
      const analysis = generateConsistentScore({ lat, lng }, places, transit)
      
      setScore(analysis.score)
      setFactors([
        {
          id: "footHeat",
          name: "Foot Traffic",
          score: analysis.factors.footTraffic,
          color: "from-green-500 to-emerald-500"
        },
        {
          id: "hazardHeat", 
          name: "Safety Index",
          score: analysis.factors.safety,
          color: "from-blue-500 to-cyan-500"
        },
        {
          id: "competitors",
          name: "Competition",
          score: analysis.factors.competition,
          color: "from-orange-500 to-red-500"
        },
        {
          id: "access",
          name: "Accessibility", 
          score: analysis.factors.accessibility,
          color: "from-purple-500 to-pink-500"
        }
      ])
      
      setDetailedAnalysis(analysis.detailedAnalysis)

    } catch (error) {
      console.error("Error fetching analysis data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500/20" }
    if (score >= 65) return { label: "Good", color: "text-blue-400", bg: "bg-blue-500/20" }
    if (score >= 50) return { label: "Average", color: "text-yellow-400", bg: "bg-yellow-500/20" }
    return { label: "Risky", color: "text-red-400", bg: "bg-red-500/20" }
  }

  const scoreInfo = getScoreLabel(score)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Analyzing location...</p>
          <p className="text-cyan-300 text-sm mt-2">Gathering geospatial intelligence</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
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
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <div>
                  <h1 className="text-white font-semibold text-lg">{selectedLocation}</h1>
                  <p className="text-cyan-300 text-sm">{businessCategory}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setIs3DMode(!is3DMode)}
                variant="outline"
                size="sm"
                className={`border-purple-500/50 ${is3DMode ? 'bg-purple-500/20 text-purple-300' : 'text-purple-400'} hover:bg-purple-900/30`}
              >
                {is3DMode ? <Building className="w-4 h-4 mr-2" /> : <MapIcon className="w-4 h-4 mr-2" />}
                {is3DMode ? '3D Buildings' : '2D Map'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-green-500/50 text-green-400 hover:bg-green-900/30"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8 h-[calc(100vh-200px)]">
          
          {/* Left Panel - Score & Controls */}
          <div className="col-span-12 lg:col-span-4 space-y-6 overflow-y-auto">
            
            {/* GeoScore Card */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/20 hover:bg-white/10 transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
                    <span>GeoScore</span>
                  </span>
                  <Badge className={`${scoreInfo.bg} ${scoreInfo.color} border-0`}>
                    {scoreInfo.label}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-white/10"
                      />
                      <motion.circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="url(#scoreGradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 50}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                        animate={{ 
                          strokeDashoffset: hasAnimated.current ? 
                            2 * Math.PI * 50 * (1 - score / 100) : 
                            2 * Math.PI * 50 
                        }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        onAnimationComplete={() => { hasAnimated.current = true }}
                      />
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="50%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div 
                        className="text-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1, duration: 0.5 }}
                      >
                        <div className="text-4xl font-bold text-white">{score}</div>
                        <div className="text-sm text-cyan-300">out of 100</div>
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mb-4">
                  <p className="text-white/80 text-sm">
                    {score >= 80 ? "This location shows excellent potential for business success with strong fundamentals across all key metrics." :
                     score >= 65 ? "Good location with solid fundamentals. Some areas could benefit from strategic improvements." :
                     score >= 50 ? "Average location with mixed indicators. Consider the specific factors that matter most for your business." :
                     "This location presents challenges that should be carefully evaluated against your business model and risk tolerance."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Factor Matrix */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  <span>Analysis Layers</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3">
                  {factors.map((factor) => (
                    <motion.div
                      key={factor.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveLayer(factor.id)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        activeLayer === factor.id 
                          ? 'bg-white/20 border-2 border-cyan-400 shadow-lg shadow-cyan-400/20' 
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-3 h-3 bg-gradient-to-r ${factor.color} rounded-full`}></div>
                        <span className={`text-2xl font-bold ${colorFor(factor.score)}`}>
                          {factor.score}
                        </span>
                      </div>
                      <h3 className="text-white text-sm font-medium">{factor.name}</h3>
                      <div className="mt-2">
                        <Progress 
                          value={factor.score} 
                          className="h-1.5 bg-white/10"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-200 text-xs flex items-start space-x-2">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Click on any layer above to visualize it on the map. Each factor is calculated using real-time data from Google Maps APIs.</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/20">
              <CardHeader 
                className="pb-2 cursor-pointer"
                onClick={() => toggleSection('quickStats')}
              >
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                    <span>Quick Statistics</span>
                  </span>
                  {expandedSections.includes('quickStats') ? 
                    <ChevronUp className="w-4 h-4" /> : 
                    <ChevronDown className="w-4 h-4" />
                  }
                </CardTitle>
              </CardHeader>
              <AnimatePresence>
                {expandedSections.includes('quickStats') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-white/70 text-sm">Nearby Businesses</span>
                          <span className="text-white font-semibold">{nearbyPlaces.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70 text-sm">Transit Stations</span>
                          <span className="text-white font-semibold">{transitStations.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70 text-sm">Analysis Radius</span>
                          <span className="text-white font-semibold">2.0 km</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70 text-sm">Data Freshness</span>
                          <span className="text-green-400 font-semibold">Real-time</span>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Transit Stations */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/20">
              <CardHeader 
                className="pb-2 cursor-pointer"
                onClick={() => toggleSection('transit')}
              >
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Bus className="w-5 h-5 text-purple-400" />
                    <span>Transit Access</span>
                  </span>
                  {expandedSections.includes('transit') ? 
                    <ChevronUp className="w-4 h-4" /> : 
                    <ChevronDown className="w-4 h-4" />
                  }
                </CardTitle>
              </CardHeader>
              <AnimatePresence>
                {expandedSections.includes('transit') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="pt-0">
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {transitStations.length > 0 ? (
                          transitStations.slice(0, 8).map((station, index) => (
                            <div key={index} className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg">
                              <div className={`w-2 h-2 rounded-full ${
                                station.types?.includes('train_station') || station.types?.includes('subway_station') 
                                  ? 'bg-purple-400' 
                                  : 'bg-blue-400'
                              }`}></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{station.name}</p>
                                <p className="text-white/60 text-xs truncate">{station.vicinity}</p>
                              </div>
                              <Badge variant="outline" className="text-xs border-white/20 text-white/70">
                                {station.types?.includes('train_station') || station.types?.includes('subway_station') 
                                  ? 'Rail' 
                                  : 'Bus'}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-white/60 text-sm text-center py-4">
                            No transit stations found within 2km radius
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Nearby Amenities */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/20">
              <CardHeader 
                className="pb-2 cursor-pointer"
                onClick={() => toggleSection('amenities')}
              >
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-orange-400" />
                    <span>Nearby Amenities</span>
                  </span>
                  {expandedSections.includes('amenities') ? 
                    <ChevronUp className="w-4 h-4" /> : 
                    <ChevronDown className="w-4 h-4" />
                  }
                </CardTitle>
              </CardHeader>
              <AnimatePresence>
                {expandedSections.includes('amenities') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="pt-0">
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {nearbyPlaces.slice(0, 12).map((place, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-white text-sm font-medium truncate">{place.name}</p>
                                {place.rating && (
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                    <span className="text-yellow-400 text-xs">{place.rating}</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-white/60 text-xs truncate mb-2">{place.vicinity}</p>
                              <div className="flex flex-wrap gap-1">
                                {place.types?.slice(0, 2).map((type: string, typeIndex: number) => (
                                  <Badge key={typeIndex} variant="outline" className="text-xs border-white/20 text-white/70">
                                    {type.replace(/_/g, ' ')}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

          </div>

          {/* Right Panel - Map */}
          <div className="col-span-12 lg:col-span-8">
            <Card className="bg-white/5 backdrop-blur-xl border border-white/20 h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-cyan-400" />
                    <span>Location Visualization</span>
                    {activeLayer && (
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                        {factors.find(f => f.id === activeLayer)?.name || activeLayer}
                      </Badge>
                    )}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-xs text-white/60">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Live Data</span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 h-[calc(100%-80px)]">
                {coordinates && (
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
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}