"use client"

import React, {
  useState,
  useEffect,
  memo,
  useMemo,
  type FC,
} from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Zap,
  TrendingUp,
  Shield,
  BarChart3,
  Globe,
  ArrowRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LocationAutocomplete } from "@/components/location-autocomplete"
import { BusinessTypeSelector } from "@/components/business-type-selector"
import { ThreeDVisualization } from "@/components/3d-visualization"
import { ThreeDReportPreview } from "@/components/3d-report-preview"

/* ------------------------------------------------------------------ */
/*  Memoised Earth-background                                         */
/* ------------------------------------------------------------------ */

interface EarthBackgroundProps {
  windowSize: { width: number; height: number }
  animationActive: boolean
}

const EarthBackground: FC<EarthBackgroundProps> = memo(
  ({ windowSize, animationActive }) => {
    const orbs = useMemo(
      () =>
        Array.from({ length: 5 }).map(() => ({
          x: Math.random() * windowSize.width,
          y: Math.random() * windowSize.height,
          delay: Math.random() * 10,
        })),
      []
    )

    const particles = useMemo(
      () =>
        Array.from({ length: 30 }).map(() => ({
          x: Math.random() * windowSize.width,
          y: Math.random() * windowSize.height,
          delay: Math.random() * 0.3,
        })),
      []
    )

    return (
      <div className="absolute inset-0 overflow-hidden">
        {/* Earth */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: animationActive ? 0.15 : 0,
            scale: animationActive ? 1 : 0.8,
            rotate: animationActive ? 360 : 0,
          }}
          transition={{
            opacity: { duration: 2 },
            scale: { duration: 3 },
            rotate: { duration: 200, repeat: Infinity, ease: "linear" },
          }}
          className="absolute top-1/2 left-1/2 w-[900px] h-[900px] -translate-x-1/2 -translate-y-1/2"
        >
          <ThreeDVisualization type="hero" className="w-full h-full" />
        </motion.div>

        {/* Orbs */}
        {orbs.map((orb, i) => (
          <motion.div
            key={`orb-${i}`}
            className={`absolute w-32 h-32 rounded-full ${
              i % 2 === 0
                ? "bg-gradient-to-r from-blue-500/10 to-cyan-500/5"
                : "bg-gradient-to-r from-purple-500/10 to-pink-500/5"
            }`}
            initial={{ x: orb.x, y: orb.y, scale: 0 }}
            animate={{
              scale: animationActive ? [0, 1, 0.5, 1, 0] : 0,
            }}
            transition={{
              duration: 20 + orb.delay,
              repeat: Infinity,
              times: [0, 0.2, 0.5, 0.8, 1],
              delay: i * 2,
            }}
          />
        ))}

        {/* Particles */}
        {particles.map((p, i) => (
          <motion.div
            key={`particle-${i}`}
            className={`absolute w-1 h-1 rounded-full ${
              i % 3 === 0
                ? "bg-blue-400"
                : i % 3 === 1
                ? "bg-cyan-400"
                : "bg-purple-400"
            }`}
            initial={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
            animate={{
              opacity: animationActive ? [0, 0.7, 0] : 0,
              scale: animationActive ? [0, 1, 0] : 0,
            }}
            transition={{
              duration: 8 + Math.random() * 12,
              times: [0, 0.5, 1],
              repeat: Infinity,
              delay: p.delay,
            }}
          >
            <motion.div
              className={`absolute top-0 left-0 w-6 h-1 -z-10 ${
                i % 3 === 0
                  ? "bg-blue-400/20"
                  : i % 3 === 1
                  ? "bg-cyan-400/20"
                  : "bg-purple-400/20"
              } blur-sm`}
              initial={{ width: 0 }}
              animate={{ width: animationActive ? [0, 6, 0] : 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          </motion.div>
        ))}

        {/* Rings */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={`ring-${i}`}
            className="absolute top-1/2 left-1/2 rounded-full border-2 border-blue-500/10"
            initial={{
              width: 100,
              height: 100,
              x: -50,
              y: -50,
              opacity: 0,
            }}
            animate={{
              width: animationActive ? [100, 600] : 100,
              height: animationActive ? [100, 600] : 100,
              x: animationActive ? [-50, -300] : -50,
              y: animationActive ? [-50, -300] : -50,
              opacity: animationActive ? [0.5, 0] : 0,
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 1.5,
            }}
          />
        ))}
      </div>
    )
  }
)
EarthBackground.displayName = "EarthBackground"

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  const router = useRouter()

  const [location, setLocation] = useState("")
  const [showGenerate, setShowGenerate] = useState(false)
  const [showBusinessSelector, setShowBusinessSelector] = useState(false)
  const [animationActive, setAnimationActive] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 })

  useEffect(() => {
    const timer = setTimeout(() => setAnimationActive(true), 500)
    if (typeof window !== "undefined") {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
      const resize = () =>
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      window.addEventListener("resize", resize)
      return () => {
        clearTimeout(timer)
        window.removeEventListener("resize", resize)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("selectedLocation")
      localStorage.removeItem("analysisTimestamp")
      localStorage.removeItem("businessType")
      localStorage.removeItem("businessCategory")
    }
  }, [])

  const handleLocationSelect = (sel: string) => {
    setLocation(sel)
    setShowGenerate(!!sel.trim())
  }

  const features = [
    {
      icon: TrendingUp,
      title: "Traffic Analysis",
      description: "Live foot traffic patterns and pedestrian density analysis",
      visualType: "traffic",
    },
    {
      icon: Shield,
      title: "Safety Metrics",
      description: "Comprehensive safety scores for your business location",
      visualType: "safety",
    },
    {
      icon: BarChart3,
      title: "Detailed Reports",
      description: "Interactive analysis reports with actionable insights",
      visualType: "report", // stays as report preview
    },
  ]

  const generateScore = () => setShowBusinessSelector(true)

  const handleBusinessTypeSelect = (type: string, cat: string) => {
    localStorage.setItem("businessType", type)
    localStorage.setItem("businessCategory", cat)
    localStorage.setItem("selectedLocation", location)
    localStorage.setItem("analysisTimestamp", Date.now().toString())
    router.push("/analysis")
  }

  return (
    <div className="relative min-h-screen bg-slate-900">
      <EarthBackground
        windowSize={windowSize}
        animationActive={animationActive}
      />

      <BusinessTypeSelector
        isOpen={showBusinessSelector}
        onClose={() => setShowBusinessSelector(false)}
        onSelect={handleBusinessTypeSelect}
      />

      {/* header */}
      <header className="relative z-10 px-8 py-6">
        <div className="flex items-center">
          <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-blue-500 shadow-lg shadow-blue-500/30">
            <Image
              src="/logo.png"
              alt="GeoScope Credit Logo"
              width={64}
              height={64}
              className="object-cover"
            />
          </div>
          <div className="ml-4">
            <h1 className="text-3xl font-bold text-white">GeoScope Credit</h1>
            <p className="text-blue-300">Location Intelligence Platform</p>
          </div>
        </div>
      </header>

      {/* main */}
      <div className="relative z-10 mx-auto max-w-7xl px-8 py-12">
        {/* hero */}
        <div className="mb-16 flex flex-col items-center justify-between gap-12 md:flex-row">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="md:w-1/2"
          >
            <h2 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-cyan-400 to-yellow-400 bg-clip-text text-transparent">
                Business Location
              </span>
            </h2>
            <p className="mb-8 text-lg text-blue-200">
              Comprehensive location intelligence that analyzes foot traffic,
              safety, competition, and accessibility to give you the perfect
              business location score.
            </p>
            <div className="mb-8 flex space-x-6">
              <div className="flex items-center space-x-2 rounded-full border border-blue-700/30 bg-slate-800/50 px-6 py-3">
                <div className="h-3 w-3 animate-pulse rounded-full bg-green-400"></div>
                <span className="font-medium text-green-400">Live Data</span>
              </div>
              <div className="flex items-center space-x-2 rounded-full border border-blue-700/30 bg-slate-800/50 px-6 py-3">
                <Globe className="h-5 w-5 text-purple-400" />
                <span className="font-medium text-purple-400">
                  Global Coverage
                </span>
              </div>
            </div>
          </motion.div>

          {/* Earth animation inside hero */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="h-[500px] md:h-[500px] md:w-2/3 lg:w-1/2"
          >
            <ThreeDVisualization type="hero" className="h-full w-full" />
          </motion.div>
        </div>

        {/* location form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mx-auto mb-20 max-w-2xl"
        >
          <Card className="backdrop-blur-xl bg-slate-800/50 border-cyan-500/30 shadow-2xl">
            <CardContent className="p-8">
              <div className="mb-6 flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-yellow-500">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Start Your Analysis
                  </h3>
                  <p className="text-cyan-300">Enter any address worldwide</p>
                </div>
              </div>

              <div className="space-y-6">
                <LocationAutocomplete
                  value={location}
                  onChange={setLocation}
                  onSelect={handleLocationSelect}
                  placeholder="Enter business address (e.g., 123 Main St, New York, NY)"
                />

                <AnimatePresence>
                  {showGenerate && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Button
                        onClick={generateScore}
                        className="h-16 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-yellow-600 font-semibold text-white shadow-xl transition-all duration-300 hover:from-cyan-700 hover:to-yellow-700 hover:shadow-2xl"
                      >
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center space-x-3"
                        >
                          <Zap className="h-6 w-6" />
                          <span>Generate GeoScope Score</span>
                          <ArrowRight className="h-5 w-5" />
                        </motion.div>
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* features */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h3 className="mb-4 text-4xl font-bold text-white">
              Key Features
            </h3>
            <p className="max-w-2xl text-xl text-blue-200">
              Get comprehensive insights to make informed business location
              decisions
            </p>
          </motion.div>

          <div className="mb-20 grid gap-8 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <Card className="h-full overflow-hidden backdrop-blur-xl border-cyan-500/30 bg-slate-800/30 transition-all duration-500 hover:border-yellow-500/50">
                  <CardContent className="p-0">
                    <div className="relative h-48 overflow-hidden">
                      {f.visualType === "report" ? (
                        <ThreeDReportPreview className="h-full w-full" />
                      ) : (
                        <ThreeDVisualization
                          type={f.visualType as any}
                          className="h-full w-full"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                    </div>
                    <div className="p-6">
                      <div className="mb-4 flex items-center space-x-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-yellow-500 shadow-lg">
                          <f.icon className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="text-xl font-semibold text-white transition-colors group-hover:text-cyan-300">
                          {f.title}
                        </h4>
                      </div>
                      <p className="text-blue-200">{f.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="border-t border-slate-700 py-8"
        >
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-blue-500/50">
              <Image
                src="/logo.png"
                alt="GeoScope Credit"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div className="text-blue-300">
              Coded by Harman • From in Canada
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
