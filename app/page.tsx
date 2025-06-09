"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Zap, TrendingUp, Shield } from "lucide-react"

import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  Circle,
} from "@react-google-maps/api"

import { LocationAutocomplete } from "@/components/location-autocomplete"
import { BusinessTypeSelector } from "@/components/business-type-selector"
import { Button } from "@/components/ui/button"


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
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  )
  const [showBiz, setShowBiz] = useState(false)

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
              placeholder="Turn your shop’s location into a loan-worthy score"
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

        <div className="relative flex w-full max-w-sm justify-center flex-col border-t border-slate-800 p-10 md:border-l md:border-t-0 bg-slate-900/40 rounded-t-3xl md:rounded-none">
          <h3 className="mb-4 text-2xl font-bold text-center text-cyan-300">How GeoScope Works</h3>
          <p className="mb-8 text-sm text-slate-300 text-center px-2">
            GeoScope helps you find the best shop location by analyzing critical geospatial factors like traffic, safety, and accessibility then generates a location intelligence report in one click.
          </p>

          <div className="space-y-8">
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
                  See what’s working and what can be improved — like traffic access or business zone.
                </p>
              </div>
            </div>
          </div>
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
