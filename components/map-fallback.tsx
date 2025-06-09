"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MapFallbackProps {
  error: string
  selectedLocation: string
  coordinates: { lat: number; lng: number }
  onRetry: () => void
  maxAttemptsReached?: boolean
}

export function MapFallback({
  error,
  selectedLocation,
  coordinates,
  onRetry,
  maxAttemptsReached = false,
}: MapFallbackProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-800/90 z-10">
      <div className="text-center p-6 bg-slate-700/80 rounded-lg border border-red-500/30 max-w-md">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-white text-lg font-bold mb-2">
          {maxAttemptsReached ? "Map Unavailable" : "Map Loading Error"}
        </h3>
        <p className="text-red-200 mb-4">
          {maxAttemptsReached
            ? "We're unable to load the map at this time. You can still view the analysis data below."
            : error}
        </p>
        <div className="bg-slate-800/80 p-4 rounded-lg mb-4">
          <p className="text-blue-300 text-sm">Location: {selectedLocation}</p>
          <p className="text-blue-300 text-sm">
            Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </p>
        </div>
        <Button onClick={onRetry} className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          {maxAttemptsReached ? "Try Again" : "Retry Loading Map"}
        </Button>
      </div>
    </div>
  )
}
