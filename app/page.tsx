"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Zap, TrendingUp, Shield, FileText, Code, Database, Map, Users, Bus, Calculator, Globe, Layers, Settings, BarChart3, Activity, Target, Lightbulb, Download, ExternalLink, GitBranch, Terminal, ThumbsUp, AlertTriangle, XCircle } from "lucide-react"

import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  Circle,
} from "@react-google-maps/api"

import { LocationAutocomplete } from "@/components/location-autocomplete"
import { BusinessTypeSelector } from "@/components/business-type-selector"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const CLEAN_DARK: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0b0f19" }] },
  { elementType: "labels", stylers: [{ visibility: "off" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ visibility: "on" }, { color: "#54627a" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e243d" }],
  },
]

const NYC = { lat: 40.712776, lng: -74.005974 } 

export default function HomePage() {
  const router = useRouter()
  const [location, setLocation] = useState("")
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [showBiz, setShowBiz] = useState(false)
  const [activeSection, setActiveSection] = useState("overview")

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyAoEItHnh7E9es3rgAXxrHILFtJspawPRI",
    libraries: ["places"],
  })

  const handleSelect = (
    addr: string,
    geo?: { lat: number; lng: number },
  ) => {
    setLocation(addr)
    if (geo) setCoords(geo)
  }

  const openBizModal = () => location.trim() && setShowBiz(true)
  const handleBizChoose = (t: string, c: string) => {
    localStorage.setItem("selectedLocation", location)
    if (coords) {
      localStorage.setItem("lat", String(coords.lat))
      localStorage.setItem("lng", String(coords.lng))
    }
    localStorage.setItem("businessType", t)
    localStorage.setItem("businessCategory", c)
    router.push("/analysis")
  }

  useEffect(() => localStorage.clear(), [])

  const canGenerate = Boolean(location.trim())

  const techStack = [
    { name: "Next.js 14", description: "React framework with App Router", icon: "⚛️" },
    { name: "TypeScript", description: "Type-safe JavaScript", icon: "📘" },
    { name: "Tailwind CSS", description: "Utility-first CSS framework", icon: "🎨" },
    { name: "Framer Motion", description: "Animation library", icon: "🎭" },
    { name: "Google Maps API", description: "Maps, Places, Geocoding", icon: "🗺️" },
    { name: "Chart.js", description: "Data visualization", icon: "📊" },
    { name: "Three.js", description: "3D graphics", icon: "🎮" },
    { name: "Vercel", description: "Deployment platform", icon: "▲" },
  ]

  const apiEndpoints = [
    { endpoint: "/api/geocode", method: "GET", description: "Convert addresses to coordinates" },
    { endpoint: "/api/places", method: "GET", description: "Find nearby places and businesses" },
    { endpoint: "/api/transit", method: "GET", description: "Get transit stations and stops" },
    { endpoint: "/api/place-details", method: "GET", description: "Get detailed place information" },
    { endpoint: "/api/autocomplete", method: "GET", description: "Address autocomplete suggestions" },
  ]

  const scoringFactors = [
    {
      name: "Foot Traffic",
      weight: "30%",
      description: "Pedestrian activity and flow patterns",
      calculation: "Based on nearby restaurants, malls, transit hubs",
      icon: Users,
      color: "text-green-400"
    },
    {
      name: "Safety Index",
      weight: "20%",
      description: "Security and crime risk assessment",
      calculation: "Proximity to hospitals, police, schools vs. risk factors",
      icon: Shield,
      color: "text-blue-400"
    },
    {
      name: "Competition",
      weight: "25%",
      description: "Market saturation analysis",
      calculation: "Number and density of similar businesses",
      icon: TrendingUp,
      color: "text-orange-400"
    },
    {
      name: "Accessibility",
      weight: "25%",
      description: "Transit and transportation access",
      calculation: "Number and variety of transit stations within 2km",
      icon: Bus,
      color: "text-purple-400"
    },
  ]

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white">
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={{ height: "100%", width: "100%" }}
          center={coords ?? NYC}
          zoom={14}
          options={{
            disableDefaultUI: true,
            styles: CLEAN_DARK,
            gestureHandling: "none",
          }}
        >
          <Marker position={coords ?? NYC} />
          <Circle
            center={coords ?? NYC}
            radius={200}
            options={{
              strokeOpacity: 0,
              fillColor: "#00ffff",
              fillOpacity: 0.11,
            }}
          />
        </GoogleMap>
      )}

      <div className="absolute inset-0 flex flex-col md:flex-row bg-slate-900/60 backdrop-blur-sm">
        <div className="flex flex-1 flex-col px-6 pt-10 md:px-14 md:pt-28">
          <div className="mb-10 flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="GeoScope"
              width={50}
              height={50}
              className="rounded-full border-2 border-cyan-500"
            />
            <h1 className="text-xl font-semibold">GeoScope</h1>
          </div>

          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Find your <br />
            <span className="text-cyan-400">shop location</span>
          </h2>

          <div className="relative z-20">
            <LocationAutocomplete
              value={location}
              onChange={setLocation}
              onSelect={handleSelect}
              placeholder="Turn your shop's location into a loan-worthy score"
              className="w-full"
            />
          </div>

          {/* CTA */}
          <AnimatePresence>
            {canGenerate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="mt-8 flex w-full justify-center"
              >
                <Button
                  onClick={openBizModal}
                  className="w-60 h-14 rounded-full bg-gradient-to-r from-cyan-600 to-yellow-600 py-4 text-lg hover:shadow-[0_0_20px_#22d3ee]"
                >
                  Generate Report
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative flex w-full max-w-2xl justify-center flex-col border-t border-slate-800 p-6 md:border-l md:border-t-0 bg-slate-900/40 rounded-t-3xl md:rounded-none overflow-y-auto max-h-screen">
          <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/5 backdrop-blur-xl border border-white/20 mb-6">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white/20 text-xs">Overview</TabsTrigger>
              <TabsTrigger value="docs" className="data-[state=active]:bg-white/20 text-xs">Documentation</TabsTrigger>
              <TabsTrigger value="api" className="data-[state=active]:bg-white/20 text-xs">Technical</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-center text-cyan-300 mb-4">How GeoScope Works</h3>
                  <p className="text-sm text-slate-300 text-center px-2 mb-6">
                    GeoScope helps you find the best shop location by analyzing critical geospatial factors like traffic, safety, and accessibility then generates a location intelligence report in one click.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex h-12 w-24 items-center justify-center rounded-full bg-cyan-600/20">
                      <Zap className="text-cyan-300" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Step 1: Analyze the Location</h4>
                      <p className="text-slate-400 text-sm">
                        Understand foot traffic, nearby services, safety, zoning, and competition.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex h-12 w-24 items-center justify-center rounded-full bg-yellow-600/20">
                      <TrendingUp className="text-yellow-300" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Step 2: Get Your GeoScore</h4>
                      <p className="text-slate-400 text-sm">
                        Receive a score (0–100) that summarizes how optimal your location is for a business.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex h-12 w-24 items-center justify-center rounded-full bg-green-600/20">
                      <Shield className="text-green-300" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Step 3: Get Actionable Insights</h4>
                      <p className="text-slate-400 text-sm">
                        See what's working and what can be improved — like traffic access or business zone.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-6">
                  <h4 className="text-blue-300 font-semibold mb-2">🎯 Key Features</h4>
                  <ul className="text-white/80 space-y-1 text-sm">
                    <li>• Real-time location scoring (0-100)</li>
                    <li>• Interactive 2D/3D maps with overlays</li>
                    <li>• Comprehensive analytics dashboard</li>
                    <li>• Live traffic and safety analysis</li>
                    <li>• Exportable PDF reports</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="docs" className="mt-0">
              <div className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      <span>Project Overview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 text-white/80 space-y-4">
                    <p className="text-sm">
                      GeoScope Credit is a location intelligence platform that analyzes business locations using 
                      Google Maps data to generate a comprehensive GeoScore (0-100). It helps entrepreneurs, 
                      investors, and lenders make data-driven decisions about business locations.
                    </p>
                    
                    <div>
                      <h4 className="text-white font-semibold mb-2">🏗️ Architecture</h4>
                      <ul className="text-white/60 space-y-1 text-sm">
                        <li>• Next.js 14 with App Router</li>
                        <li>• TypeScript for type safety</li>
                        <li>• Google Maps JavaScript API</li>
                        <li>• Real-time scoring algorithms</li>
                        <li>• Vercel Edge Functions</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-2">📊 Scoring Algorithm</h4>
                      <div className="bg-slate-800/50 rounded-lg p-3 text-xs">
                        <code className="text-green-400">
                          GeoScore = (FootTraffic × 0.30) + (Safety × 0.20) + (Competition × 0.25) + (Accessibility × 0.25)
                        </code>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Download className="w-5 h-5 text-green-400" />
                      <span>Installation Guide</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <h4 className="text-white font-semibold mb-2">1. Clone Repository</h4>
                      <div className="bg-slate-800 rounded-lg p-3">
                        <code className="text-green-400 text-xs">
                          git clone https://github.com/yourusername/geoscope-credit.git
                        </code>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-2">2. Install Dependencies</h4>
                      <div className="bg-slate-800 rounded-lg p-3">
                        <code className="text-green-400 text-xs">
                          npm install --legacy-peer-deps
                        </code>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-2">3. Environment Setup</h4>
                      <div className="bg-slate-800 rounded-lg p-3">
                        <code className="text-green-400 text-xs">
                          GOOGLE_MAPS_API_KEY=your_key_here<br/>
                          NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$&#123;GOOGLE_MAPS_API_KEY&#125;
                        </code>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-2">4. Run Development Server</h4>
                      <div className="bg-slate-800 rounded-lg p-3">
                        <code className="text-green-400 text-xs">
                          npm run dev
                        </code>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="api" className="mt-0">
              <div className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Calculator className="w-5 h-5 text-yellow-400" />
                      <span>Scoring Factors</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {scoringFactors.map((factor, index) => (
                      <div key={factor.name} className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center space-x-3 mb-2">
                          <factor.icon className={`w-5 h-5 ${factor.color}`} />
                          <div>
                            <h4 className="text-white font-semibold text-sm">{factor.name}</h4>
                            <Badge variant="outline" className={`${factor.color} border-current text-xs`}>
                              {factor.weight}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-white/80 text-xs mb-2">{factor.description}</p>
                        <div className="bg-slate-800/50 rounded-lg p-2">
                          <p className="text-white/60 text-xs">
                            <strong>Calculation:</strong> {factor.calculation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-xl border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-green-400" />
                      <span>API Endpoints</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {apiEndpoints.map((api, index) => (
                      <div key={api.endpoint} className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="border-green-400 text-green-400 text-xs">
                              {api.method}
                            </Badge>
                            <code className="text-blue-400 font-mono text-xs">{api.endpoint}</code>
                          </div>
                        </div>
                        <p className="text-white/60 text-xs">{api.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="text-yellow-300 font-semibold mb-2">🚀 Deployment</h4>
                  <div className="space-y-2">
                    <div className="bg-slate-800 rounded-lg p-3">
                      <code className="text-green-400 text-xs">
                        # Vercel Deployment<br/>
                        npm i -g vercel<br/>
                        vercel --prod
                      </code>
                    </div>
                    <p className="text-white/60 text-xs">
                      Add environment variables in Vercel dashboard for production deployment.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <footer className="absolute bottom-0 left-0 right-0 flex items-center justify-center space-x-3 border-t border-slate-800 bg-slate-900/70 py-3 backdrop-blur-sm">
        <Image
          src="/logo.png"
          alt="GeoScope"
          width={28}
          height={28}
          className="rounded-full border border-cyan-500"
        />
        <span className="text-sm text-blue-300">
          Coded by Harman • Built in Canada
        </span>
      </footer>

      <BusinessTypeSelector
        isOpen={showBiz}
        onClose={() => setShowBiz(false)}
        onSelect={handleBizChoose}
      />

      {loadError && (
        <div className="absolute inset-x-0 top-0 z-50 bg-red-600 p-3 text-center text-sm font-medium">
          Google Maps failed to load – check API key
        </div>
      )}
    </div>
  )
}