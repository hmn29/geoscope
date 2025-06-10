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
  Building,
  Cpu,
  Cloud,
} from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

export default function DocsPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("overview")

  // Technology stack with detailed descriptions for developers
  const techStack = [
    { name: "Next.js 14", description: "React framework with App Router and server components", icon: "⚛️" },
    { name: "TypeScript", description: "Type-safe JavaScript for better development experience", icon: "📘" },
    { name: "Tailwind CSS", description: "Utility-first CSS framework for rapid UI development", icon: "🎨" },
    { name: "Framer Motion", description: "Production-ready motion library for React", icon: "🎭" },
    { name: "Google Maps API", description: "Maps, Places, Geocoding, and 3D building visualization", icon: "🗺️" },
    { name: "Chart.js", description: "Flexible JavaScript charting for data visualization", icon: "📊" },
    { name: "Three.js", description: "3D graphics library for immersive visualizations", icon: "🎮" },
    { name: "Vercel", description: "Edge deployment platform with global CDN", icon: "▲" },
  ]

  // API endpoints with comprehensive documentation
  const apiEndpoints = [
    { endpoint: "/api/geocode", method: "GET", description: "Convert addresses to precise coordinates using Google Geocoding API" },
    { endpoint: "/api/places", method: "GET", description: "Find nearby businesses and points of interest within specified radius" },
    { endpoint: "/api/transit", method: "GET", description: "Get public transit stations including buses, trains, and subways" },
    { endpoint: "/api/place-details", method: "GET", description: "Get detailed information about specific places including ratings and hours" },
    { endpoint: "/api/autocomplete", method: "GET", description: "Provide intelligent address autocomplete suggestions" },
  ]

  // Scoring factors with mathematical formulas and business impact
  const scoringFactors = [
    {
      name: "Foot Traffic",
      weight: "30%",
      description: "Pedestrian activity and customer flow patterns throughout the day",
      calculation: "Proximity-weighted analysis of restaurants, malls, transit hubs with exponential decay",
      icon: Users,
      color: "text-green-400",
      formula: "score = Σ(weight × e^(-distance/300m)) + density_bonus"
    },
    {
      name: "Safety Index",
      weight: "20%",
      description: "Comprehensive security and crime risk assessment for the area",
      calculation: "Positive factors (hospitals, police, schools) vs risk factors (bars, nightclubs)",
      icon: Shield,
      color: "text-blue-400",
      formula: "score = 70 + (positive_factors × 0.3) - (risk_factors × 0.2)"
    },
    {
      name: "Competition",
      weight: "25%",
      description: "Market saturation analysis and competitive landscape assessment",
      calculation: "Multi-zone competition pressure with distance-weighted impact",
      icon: TrendingUp,
      color: "text-orange-400",
      formula: "score = 90 - (Σ(competitors_in_zone × zone_weight) × 8)"
    },
    {
      name: "Accessibility",
      weight: "25%",
      description: "Public transportation connectivity and ease of customer access",
      calculation: "Logarithmic scaling of transit stations with variety bonus",
      icon: Bus,
      color: "text-purple-400",
      formula: "score = 30 + (log(stations + 1) × 20) + (transit_types × 5)"
    },
  ]

  return (
    <div className="min-h-screen bg-slate-900 relative">
      {/* Enhanced background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900"></div>
      
      <header className="relative z-10 py-6 px-8 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="rounded-full overflow-hidden border-4 border-blue-500 shadow-lg shadow-blue-500/30 w-16 h-16">
              <Image src="/logo.png" alt="GeoScope Credit Logo" width={64} height={64} className="object-cover" />
            </div>
            <div className="ml-4">
              <h1 className="text-3xl font-bold text-white">GeoScope Documentation</h1>
              <p className="text-blue-300">Complete technical guide and implementation details</p>
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
          <TabsList className="grid w-full grid-cols-5 bg-white/5 backdrop-blur-xl border border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">Overview</TabsTrigger>
            <TabsTrigger value="installation" className="data-[state=active]:bg-white/20">Installation</TabsTrigger>
            <TabsTrigger value="architecture" className="data-[state=active]:bg-white/20">Architecture</TabsTrigger>
            <TabsTrigger value="scoring" className="data-[state=active]:bg-white/20">Scoring Engine</TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-white/20">API Reference</TabsTrigger>
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
                        GeoScope Credit is a sophisticated location intelligence platform that transforms raw geospatial data 
                        into actionable business insights. Using Google Maps APIs and advanced mathematical algorithms, it 
                        generates a comprehensive GeoScore (0-100) that helps entrepreneurs, investors, and lenders make 
                        data-driven decisions about business locations.
                      </p>
                      <p className="mb-4">
                        The platform analyzes multiple geospatial factors including foot traffic patterns, safety metrics, 
                        competitive landscape, and accessibility infrastructure to provide transparent, reliable location assessments.
                      </p>
                      <p className="mb-4">
                        Built with modern web technologies and deployed on Vercel's edge network, GeoScope delivers 
                        real-time analysis with sub-second response times and interactive 3D visualizations.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">Key Features</h3>
                      <ul className="space-y-3">
                        <li className="flex items-center space-x-3">
                          <Target className="w-5 h-5 text-green-400" />
                          <span>Real-time location scoring with mathematical precision</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Building className="w-5 h-5 text-blue-400" />
                          <span>Interactive 2D/3D maps with Google Earth-style buildings</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <BarChart3 className="w-5 h-5 text-purple-400" />
                          <span>Comprehensive analytics with hourly and weekly trends</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Activity className="w-5 h-5 text-orange-400" />
                          <span>Live traffic analysis and safety assessment</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-cyan-400" />
                          <span>Professional PDF reports for stakeholders</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <Cpu className="w-5 h-5 text-red-400" />
                          <span>Edge-optimized performance with global CDN</span>
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
                        className="bg-white/5 backdrop-blur-xl rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="text-2xl mb-2">{tech.icon}</div>
                        <h4 className="text-white font-semibold">{tech.name}</h4>
                        <p className="text-white/60 text-sm">{tech.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Map className="w-6 h-6 text-blue-400" />
                    <span>Google Maps Platform Integration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3">Core APIs Used</h3>
                      <ul className="space-y-2 text-white/80">
                        <li>• <strong>Maps JavaScript API</strong> - Interactive maps with 3D buildings</li>
                        <li>• <strong>Places API</strong> - Nearby search and place details</li>
                        <li>• <strong>Geocoding API</strong> - Address to coordinates conversion</li>
                        <li>• <strong>Directions API</strong> - Transit accessibility analysis</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3">Advanced Features</h3>
                      <ul className="space-y-2 text-white/80">
                        <li>• <strong>3D Building Visualization</strong> - Google Earth-style views</li>
                        <li>• <strong>Real-time Data</strong> - Live business hours and ratings</li>
                        <li>• <strong>Field Masking</strong> - Optimized API usage and costs</li>
                        <li>• <strong>Batch Processing</strong> - Efficient data collection</li>
                      </ul>
                    </div>
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
                        git clone https://github.com/sicaario/geoscope.git<br/>
                        cd geoscope
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
                      Note: We use --legacy-peer-deps due to some package compatibility with React 18 and Chart.js.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">3</span>
                      Environment Configuration
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
                        <h4 className="text-blue-300 font-semibold mb-2">Required APIs (Enable in Google Cloud Console):</h4>
                        <ul className="text-white/80 space-y-1">
                          <li>• Maps JavaScript API</li>
                          <li>• Places API (New)</li>
                          <li>• Geocoding API</li>
                          <li>• Directions API</li>
                        </ul>
                      </div>
                      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                        <h4 className="text-yellow-300 font-semibold mb-2">Important Security Notes:</h4>
                        <ul className="text-white/80 space-y-1 text-sm">
                          <li>• Restrict your API key to specific domains in production</li>
                          <li>• Set up billing alerts to monitor usage</li>
                          <li>• Enable only the APIs you need</li>
                          <li>• Consider implementing rate limiting for production use</li>
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
                      Open <a href="http://localhost:3000" className="text-blue-400 hover:underline">http://localhost:3000</a> in your browser to see the application.
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
                          <h4 className="text-white font-semibold mb-2">📱 Next.js 14 App Router</h4>
                          <p className="text-white/60 text-sm">
                            Modern React framework with file-based routing, server components, and automatic code splitting 
                            for optimal performance.
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <h4 className="text-white font-semibold mb-2">🎨 Shadcn/ui + Tailwind CSS</h4>
                          <p className="text-white/60 text-sm">
                            Comprehensive component library with Tailwind CSS for consistent, responsive design 
                            and rapid development.
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <h4 className="text-white font-semibold mb-2">🗺️ Google Maps Integration</h4>
                          <p className="text-white/60 text-sm">
                            Advanced Maps JavaScript API integration with 3D buildings, custom overlays, 
                            and real-time data visualization.
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <h4 className="text-white font-semibold mb-2">🎭 Framer Motion</h4>
                          <p className="text-white/60 text-sm">
                            Production-ready animations and micro-interactions for enhanced user experience 
                            and visual feedback.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">Backend Architecture</h3>
                      <div className="space-y-4">
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <h4 className="text-white font-semibold mb-2">⚡ Next.js API Routes</h4>
                          <p className="text-white/60 text-sm">
                            Server-side API endpoints for Google Maps API calls, data processing, 
                            and business logic execution.
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <h4 className="text-white font-semibold mb-2">🧮 Mathematical Scoring Engine</h4>
                          <p className="text-white/60 text-sm">
                            Deterministic algorithms for consistent location scoring based on multiple 
                            weighted factors and proximity analysis.
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <h4 className="text-white font-semibold mb-2">💾 Client-side Caching</h4>
                          <p className="text-white/60 text-sm">
                            Local storage implementation for analyzed locations to improve performance 
                            and reduce API calls.
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <h4 className="text-white font-semibold mb-2">🌐 Edge Deployment</h4>
                          <p className="text-white/60 text-sm">
                            Vercel edge functions for global distribution and sub-second response times 
                            worldwide.
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
                    <span>Data Flow & Processing Pipeline</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <h4 className="text-white font-semibold">User Input & Validation</h4>
                        <p className="text-white/60 text-sm">User enters business address with intelligent autocomplete suggestions and validation</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <h4 className="text-white font-semibold">Geocoding & Coordinate Resolution</h4>
                        <p className="text-white/60 text-sm">Address converted to precise coordinates using Google Geocoding API with error handling</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <h4 className="text-white font-semibold">Parallel Data Collection</h4>
                        <p className="text-white/60 text-sm">Concurrent API calls to fetch nearby places, transit stations, and detailed place information</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <h4 className="text-white font-semibold">Mathematical Score Calculation</h4>
                        <p className="text-white/60 text-sm">Advanced algorithms process geospatial data to generate weighted factor scores and overall GeoScore</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="bg-cyan-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</div>
                      <div>
                        <h4 className="text-white font-semibold">Visualization & Caching</h4>
                        <p className="text-white/60 text-sm">Interactive maps, charts, and analytics dashboard with local storage caching for performance</p>
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
                    <span>Mathematical Scoring Algorithm</span>
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
                      <p className="text-yellow-200 text-sm mt-2">
                        Weighted average ensures balanced assessment across all critical business factors
                      </p>
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
                          <div className="bg-slate-800/50 rounded-lg p-3 mb-3">
                            <p className="text-white/60 text-xs">
                              <strong>Method:</strong> {factor.calculation}
                            </p>
                          </div>
                          <div className="bg-slate-800/50 rounded-lg p-3">
                            <p className="text-green-400 text-xs font-mono">
                              {factor.formula}
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
                    <span>Detailed Algorithm Implementation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">🚶 Foot Traffic Calculation</h3>
                    <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                      <code className="text-green-400 block">1. Identify traffic generators (restaurants, malls, transit hubs)</code>
                      <code className="text-green-400 block">2. Calculate distance-weighted impact scores</code>
                      <code className="text-green-400 block">3. Apply exponential decay: impact = weight × e^(-distance/300m)</code>
                      <code className="text-green-400 block">4. Add density bonus for high-traffic clusters</code>
                      <code className="text-green-400 block">5. Normalize to 0-100 scale with realistic variance</code>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">🛡️ Safety Index Calculation</h3>
                    <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                      <code className="text-green-400 block">1. Positive factors: hospitals, police, schools (weight: +0.4 to +1.0)</code>
                      <code className="text-green-400 block">2. Risk factors: bars, nightclubs, high-crime areas (weight: -0.3 to -0.6)</code>
                      <code className="text-green-400 block">3. Base safety score: 70 (neutral urban safety level)</code>
                      <code className="text-green-400 block">4. Final = base + (positive_impact × 0.3) - (risk_impact × 0.2)</code>
                      <code className="text-green-400 block">5. Apply proximity weighting with 1km maximum influence radius</code>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">🏪 Competition Analysis</h3>
                    <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                      <code className="text-green-400 block">1. Filter competitors by business type and relevance</code>
                      <code className="text-green-400 block">2. Calculate competition pressure in concentric zones (200m, 500m, 1km)</code>
                      <code className="text-green-400 block">3. Apply zone weights: 1.0, 0.7, 0.4 respectively for distance decay</code>
                      <code className="text-green-400 block">4. Score = 90 - (total_pressure × 8), minimum 15</code>
                      <code className="text-green-400 block">5. Account for market saturation and competitor quality</code>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">🚌 Accessibility Scoring</h3>
                    <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                      <code className="text-green-400 block">1. Count transit stations within 2km radius</code>
                      <code className="text-green-400 block">2. Base score: 30 + (log(station_count + 1) × 20)</code>
                      <code className="text-green-400 block">3. Variety bonus: +5 points per unique transit type</code>
                      <code className="text-green-400 block">4. Distance weighting: closer stations have higher impact</code>
                      <code className="text-green-400 block">5. Final score capped at 95 with realistic distribution</code>
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
                    <span>API Endpoints Reference</span>
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
                    <span>API Usage Examples</span>
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
                        &nbsp;&nbsp;&nbsp;&nbsp;&#125;,<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;"place_id": "ChIJ2eUgeAK6j4ARbn5u_wAGqWA"<br/>
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
                        &nbsp;&nbsp;&nbsp;&nbsp;"user_ratings_total": 1250,<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;"price_level": 2,<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;"geometry": &#123; "location": &#123; "lat": 37.423, "lng": -122.084 &#125; &#125;,<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;"opening_hours": &#123; "open_now": true &#125;<br/>
                        &nbsp;&nbsp;&#125;]<br/>
                        &#125;
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Transit API</h3>
                    <div className="bg-slate-800 rounded-lg p-4">
                      <code className="text-green-400 text-sm">
                        GET /api/transit?lat=37.4224764&lng=-122.0842499&radius=2000<br/><br/>
                        Response:<br/>
                        &#123;<br/>
                        &nbsp;&nbsp;"results": [&#123;<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;"name": "Mountain View Transit Center",<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;"types": ["transit_station", "bus_station"],<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;"vicinity": "600 W Evelyn Ave, Mountain View",<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;"geometry": &#123; "location": &#123; "lat": 37.394, "lng": -122.076 &#125; &#125;<br/>
                        &nbsp;&nbsp;&#125;]<br/>
                        &#125;
                      </code>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-blue-300 font-semibold mb-2">💡 Performance Tips:</h4>
                    <ul className="text-white/80 space-y-1 text-sm">
                      <li>• Use field masking to request only needed data fields</li>
                      <li>• Implement client-side caching for repeated requests</li>
                      <li>• Batch multiple API calls when possible</li>
                      <li>• Set appropriate radius limits to control response size</li>
                      <li>• Monitor API usage to stay within quotas</li>
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