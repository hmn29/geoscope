"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Code,
  Database,
  Map,
  Zap,
  Users,
  Shield,
  Bus,
  TrendingUp,
  Download,
  ExternalLink,
  GitBranch,
  Terminal,
  Globe,
  Layers,
  Calculator,
  BarChart3,
  Settings,
  FileText,
  Lightbulb,
  Target,
  Activity,
} from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

export default function DocsPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("overview")

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
    <div className="min-h-screen bg-slate-900 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900"></div>
      
      <header className="relative z-10 py-6 px-8 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="rounded-full overflow-hidden border-4 border-blue-500 shadow-lg shadow-blue-500/30 w-16 h-16">
              <Image src="/logo.png" alt="GeoScope Credit Logo" width={64} height={64} className="object-cover" />
            </div>
            <div className="ml-4">
              <h1 className="text-3xl font-bold text-white">GeoScope Documentation</h1>
              <p className="text-blue-300">Complete guide to location intelligence</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-cyan-600 text-cyan-300 hover:bg-cyan-900/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to App
            </Button>
            <Button
              onClick={() => window.open("https://github.com/yourusername/geoscope-credit", "_blank")}
              variant="outline"
              className="border-green-600 text-green-300 hover:bg-green-900/30"
            >
              <GitBranch className="w-4 h-4 mr-2" />
              GitHub
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-8 py-12 relative z-10">
        <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-white/5 backdrop-blur-xl border border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">Overview</TabsTrigger>
            <TabsTrigger value="installation" className="data-[state=active]:bg-white/20">Installation</TabsTrigger>
            <TabsTrigger value="architecture" className="data-[state=active]:bg-white/20">Architecture</TabsTrigger>
            <TabsTrigger value="scoring" className="data-[state=active]:bg-white/20">Scoring</TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-white/20">API</TabsTrigger>
            <TabsTrigger value="deployment" className="data-[state=active]:bg-white/20">Deployment</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <Card className="bg-white/5 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Lightbulb className="w-6 h-6 text-yellow-400" />
                    <span>Project Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-white/80">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">What is GeoScope Credit?</h3>
                      <p className="mb-4">
                        GeoScope Credit is a location intelligence platform that analyzes business locations using 
                        Google Maps data to generate a comprehensive GeoScore (0-100). It helps entrepreneurs, 
                        investors, and lenders make data-driven decisions about business locations.
                      </p>
                      <p className="mb-4">
                        The platform combines multiple geospatial factors including foot traffic, safety, 
                        competition density, and accessibility to provide transparent, actionable insights.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">Key Features</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-green-400" />
                          <span>Real-time location scoring (0-100)</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Map className="w-4 h-4 text-blue-400" />
                          <span>Interactive 2D/3D maps with overlays</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4 text-purple-400" />
                          <span>Comprehensive analytics dashboard</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-orange-400" />
                          <span>Live traffic and safety analysis</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-cyan-400" />
                          <span>Exportable PDF reports</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Code className="w-6 h-6 text-green-400" />
                    <span>Technology Stack</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {techStack.map((tech, index) => (
                      <motion.div
                        key={tech.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/5 backdrop-blur-xl rounded-lg p-4 border border-white/10"
                      >
                        <div className="text-2xl mb-2">{tech.icon}</div>
                        <h4 className="text-white font-semibold">{tech.name}</h4>
                        <p className="text-white/60 text-sm">{tech.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="installation" className="mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <Card className="bg-white/5 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Download className="w-6 h-6 text-green-400" />
                    <span>Quick Start Guide</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">1</span>
                      Clone the Repository
                    </h3>
                    <div className="bg-slate-800 rounded-lg p-4 border border-white/10">
                      <code className="text-green-400">
                        git clone https://github.com/yourusername/geoscope-credit.git<br/>
                        cd geoscope-credit
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">2</span>
                      Install Dependencies
                    </h3>
                    <div className="bg-slate-800 rounded-lg p-4 border border-white/10">
                      <code className="text-green-400">
                        npm install --legacy-peer-deps
                      </code>
                    </div>
                    <p className="text-white/60 text-sm mt-2">
                      Note: We use --legacy-peer-deps due to some package compatibility issues with React 18.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">3</span>
                      Environment Setup
                    </h3>
                    <p className="text-white/80 mb-4">Create a <code className="bg-slate-800 px-2 py-1 rounded">.env.local</code> file in the root directory:</p>
                    <div className="bg-slate-800 rounded-lg p-4 border border-white/10">
                      <code className="text-green-400">
                        GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here<br/>
                        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$&#123;GOOGLE_MAPS_API_KEY&#125;
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">4</span>
                      Google Maps API Setup
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <h4 className="text-blue-300 font-semibold mb-2">Required APIs:</h4>
                        <ul className="text-white/80 space-y-1">
                          <li>• Maps JavaScript API</li>
                          <li>• Places API</li>
                          <li>• Geocoding API</li>
                          <li>• Directions API</li>
                        </ul>
                      </div>
                      <p className="text-white/60 text-sm">
                        Visit the <a href="https://console.cloud.google.com/" target="_blank" className="text-blue-400 hover:underline">Google Cloud Console</a> to enable these APIs and get your API key.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">5</span>
                      Run Development Server
                    </h3>
                    <div className="bg-slate-800 rounded-lg p-4 border border-white/10">
                      <code className="text-green-400">
                        npm run dev
                      </code>
                    </div>
                    <p className="text-white/60 text-sm mt-2">
                      Open <a href="http://localhost:3000" className="text-blue-400 hover:underline">http://localhost:3000</a> in your browser.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="architecture" className="mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <Card className="bg-white/5 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Layers className="w-6 h-6 text-purple-400" />
                    <span>System Architecture</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">Frontend Architecture</h3>
                      <div className="space-y-4">
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <h4 className="text-white font-semibold mb-2">📱 Next.js App Router</h4>
                          <p className="text-white/60 text-sm">
                            Modern React framework with file-based routing, server components, and optimized performance.
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <h4 className="text-white font-semibold mb-2">🎨 Component Library</h4>
                          <p className="text-white/60 text-sm">
                            Shadcn/ui components with Tailwind CSS for consistent, responsive design.
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <h4 className="text-white font-semibold mb-2">🗺️ Map Integration</h4>
                          <p className="text-white/60 text-sm">
                            Google Maps JavaScript API with custom overlays and 3D satellite view.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">Backend Architecture</h3>
                      <div className="space-y-4">
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <h4 className="text-white font-semibold mb-2">⚡ API Routes</h4>
                          <p className="text-white/60 text-sm">
                            Next.js API routes for server-side Google Maps API calls and data processing.
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <h4 className="text-white font-semibold mb-2">🧮 Scoring Engine</h4>
                          <p className="text-white/60 text-sm">
                            Mathematical algorithms for consistent location scoring based on multiple factors.
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <h4 className="text-white font-semibold mb-2">💾 Local Storage</h4>
                          <p className="text-white/60 text-sm">
                            Client-side caching for analyzed locations to improve performance.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Database className="w-6 h-6 text-blue-400" />
                    <span>Data Flow</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <h4 className="text-white font-semibold">User Input</h4>
                        <p className="text-white/60 text-sm">User enters business address with autocomplete suggestions</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <h4 className="text-white font-semibold">Geocoding</h4>
                        <p className="text-white/60 text-sm">Address converted to precise coordinates using Google Geocoding API</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <h4 className="text-white font-semibold">Data Collection</h4>
                        <p className="text-white/60 text-sm">Parallel API calls to fetch nearby places, transit stations, and place details</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <h4 className="text-white font-semibold">Score Calculation</h4>
                        <p className="text-white/60 text-sm">Mathematical algorithms process data to generate factor scores and overall GeoScore</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="bg-cyan-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</div>
                      <div>
                        <h4 className="text-white font-semibold">Visualization</h4>
                        <p className="text-white/60 text-sm">Interactive maps, charts, and analytics dashboard display results</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="scoring" className="mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <Card className="bg-white/5 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Calculator className="w-6 h-6 text-yellow-400" />
                    <span>Scoring Algorithm</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                      <h3 className="text-yellow-300 font-semibold mb-2">📊 Final Score Calculation</h3>
                      <div className="bg-slate-800 rounded-lg p-4">
                        <code className="text-green-400">
                          GeoScore = (FootTraffic × 0.30) + (Safety × 0.20) + (Competition × 0.25) + (Accessibility × 0.25)
                        </code>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {scoringFactors.map((factor, index) => (
                        <motion.div
                          key={factor.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white/5 rounded-lg p-6 border border-white/10"
                        >
                          <div className="flex items-center space-x-3 mb-4">
                            <factor.icon className={`w-8 h-8 ${factor.color}`} />
                            <div>
                              <h4 className="text-white font-semibold">{factor.name}</h4>
                              <Badge variant="outline" className={`${factor.color} border-current`}>
                                {factor.weight}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-white/80 text-sm mb-3">{factor.description}</p>
                          <div className="bg-slate-800/50 rounded-lg p-3">
                            <p className="text-white/60 text-xs">
                              <strong>Calculation:</strong> {factor.calculation}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Settings className="w-6 h-6 text-blue-400" />
                    <span>Algorithm Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">🚶 Foot Traffic Calculation</h3>
                    <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                      <code className="text-green-400 block">1. Identify traffic generators (restaurants, malls, transit)</code>
                      <code className="text-green-400 block">2. Calculate distance-weighted scores</code>
                      <code className="text-green-400 block">3. Apply exponential decay: score = weight × e^(-distance/300m)</code>
                      <code className="text-green-400 block">4. Add density bonus for high-traffic clusters</code>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">🛡️ Safety Index Calculation</h3>
                    <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                      <code className="text-green-400 block">1. Positive factors: hospitals, police, schools (weight: +0.4 to +1.0)</code>
                      <code className="text-green-400 block">2. Risk factors: bars, nightclubs (weight: -0.3 to -0.6)</code>
                      <code className="text-green-400 block">3. Base score: 70 (neutral safety level)</code>
                      <code className="text-green-400 block">4. Final = base + (positive × 0.3) - (risk × 0.2)</code>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">🏪 Competition Analysis</h3>
                    <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                      <code className="text-green-400 block">1. Filter competitors by business type</code>
                      <code className="text-green-400 block">2. Calculate competition pressure in zones (200m, 500m, 1km)</code>
                      <code className="text-green-400 block">3. Apply zone weights: 1.0, 0.7, 0.4 respectively</code>
                      <code className="text-green-400 block">4. Score = 90 - (pressure × 8), min 15</code>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">🚌 Accessibility Scoring</h3>
                    <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                      <code className="text-green-400 block">1. Count transit stations within 2km</code>
                      <code className="text-green-400 block">2. Base score: 30 + (log(count + 1) × 20)</code>
                      <code className="text-green-400 block">3. Variety bonus: +5 per unique transit type</code>
                      <code className="text-green-400 block">4. Final score capped at 95</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="api" className="mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <Card className="bg-white/5 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Globe className="w-6 h-6 text-green-400" />
                    <span>API Endpoints</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {apiEndpoints.map((api, index) => (
                      <motion.div
                        key={api.endpoint}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/5 rounded-lg p-4 border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="border-green-400 text-green-400">
                              {api.method}
                            </Badge>
                            <code className="text-blue-400 font-mono">{api.endpoint}</code>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white/60 hover:bg-white/10"
                            onClick={() => navigator.clipboard.writeText(api.endpoint)}
                          >
                            Copy
                          </Button>
                        </div>
                        <p className="text-white/60 text-sm">{api.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Terminal className="w-6 h-6 text-purple-400" />
                    <span>Example Usage</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Geocoding API</h3>
                    <div className="bg-slate-800 rounded-lg p-4">
                      <code className="text-green-400 text-sm">
                        GET /api/geocode?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA<br/><br/>
                        Response:<br/>
                        &#123;<br/>
                        &nbsp;&nbsp;"results": [&#123;<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;"formatted_address": "1600 Amphitheatre Pkwy, Mountain View, CA",<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;"geometry": &#123;<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"location": &#123; "lat": 37.4224764, "lng": -122.0842499 &#125;<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;&#125;<br/>
                        &nbsp;&nbsp;&#125;]<br/>
                        &#125;
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Places API</h3>
                    <div className="bg-slate-800 rounded-lg p-4">
                      <code className="text-green-400 text-sm">
                        GET /api/places?lat=37.4224764&lng=-122.0842499&radius=2000&type=establishment<br/><br/>
                        Response:<br/>
                        &#123;<br/>
                        &nbsp;&nbsp;"results": [&#123;<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;"name": "Starbucks",<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;"types": ["cafe", "food", "store"],<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;"rating": 4.2,<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;"geometry": &#123; "location": &#123; "lat": 37.423, "lng": -122.084 &#125; &#125;<br/>
                        &nbsp;&nbsp;&#125;]<br/>
                        &#125;
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="deployment" className="mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <Card className="bg-white/5 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Zap className="w-6 h-6 text-yellow-400" />
                    <span>Deployment Guide</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">🚀 Vercel Deployment (Recommended)</h3>
                    <div className="space-y-4">
                      <div className="bg-slate-800 rounded-lg p-4">
                        <code className="text-green-400">
                          # Install Vercel CLI<br/>
                          npm i -g vercel<br/><br/>
                          # Deploy<br/>
                          vercel --prod
                        </code>
                      </div>
                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <h4 className="text-blue-300 font-semibold mb-2">Environment Variables:</h4>
                        <p className="text-white/60 text-sm mb-2">Add these in your Vercel dashboard:</p>
                        <ul className="text-white/80 space-y-1 text-sm">
                          <li>• GOOGLE_MAPS_API_KEY</li>
                          <li>• NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">🐳 Docker Deployment</h3>
                    <div className="bg-slate-800 rounded-lg p-4">
                      <code className="text-green-400">
                        # Build image<br/>
                        docker build -t geoscope-credit .<br/><br/>
                        # Run container<br/>
                        docker run -p 3000:3000 \<br/>
                        &nbsp;&nbsp;-e GOOGLE_MAPS_API_KEY=your_key \<br/>
                        &nbsp;&nbsp;geoscope-credit
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">⚙️ Build Configuration</h3>
                    <div className="bg-slate-800 rounded-lg p-4">
                      <code className="text-green-400">
                        # Production build<br/>
                        npm run build<br/><br/>
                        # Start production server<br/>
                        npm start
                      </code>
                    </div>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                    <h4 className="text-yellow-300 font-semibold mb-2">⚠️ Important Notes:</h4>
                    <ul className="text-white/80 space-y-1 text-sm">
                      <li>• Ensure Google Maps APIs are enabled and have sufficient quota</li>
                      <li>• Set up proper domain restrictions for API keys in production</li>
                      <li>• Monitor API usage to avoid unexpected charges</li>
                      <li>• Consider implementing rate limiting for production use</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}