"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Loader2, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (location: string) => void
  placeholder?: string
  className?: string
}

interface Suggestion {
  description: string
  place_id: string
}

export function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Enter business address...",
  className = "",
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [hasSelected, setHasSelected] = useState(false)
  const [geoLocationError, setGeoLocationError] = useState<string | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Debounced autocomplete - only fetch if user hasn't already selected
  useEffect(() => {
    if (hasSelected) return

    const timer = setTimeout(async () => {
      if (value.length >= 3) {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/autocomplete?input=${encodeURIComponent(value)}`)
          const data = await response.json()

          if (data.predictions) {
            // Limit to top 4 suggestions instead of 5
            setSuggestions(data.predictions.slice(0, 4))
            setShowSuggestions(true)
          }
        } catch (error) {
          console.error("Autocomplete error:", error)
          setSuggestions([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [value, hasSelected])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex])
        }
        break
      case "Escape":
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setHasSelected(true)
    onChange(suggestion.description)
    onSelect(suggestion.description)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.blur()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Reset selection state when user types
    if (hasSelected && newValue !== value) {
      setHasSelected(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsGettingLocation(true)
      setGeoLocationError(null)

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          try {
            // Reverse geocode to get address from coordinates
            const response = await fetch(`/api/reverse-geocode?lat=${latitude}&lng=${longitude}`)

            if (!response.ok) {
              throw new Error("Failed to get address from coordinates")
            }

            const data = await response.json()

            if (data.results && data.results.length > 0) {
              const address = data.results[0].formatted_address
              setHasSelected(true)
              onChange(address)
              onSelect(address)
            } else {
              // Fallback to coordinates if no address found
              const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
              setHasSelected(true)
              onChange(locationString)
              onSelect(locationString)
            }
          } catch (error) {
            console.error("Error reverse geocoding:", error)
            // Fallback to coordinates
            const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            setHasSelected(true)
            onChange(locationString)
            onSelect(locationString)
          } finally {
            setIsGettingLocation(false)
          }
        },
        (error) => {
          console.error("Error getting location:", error)
          let errorMessage = "Unable to get your location. Please allow location access or enter an address manually."

          if (error.code === 1) {
            errorMessage = "Location permission denied. Please enable location services and try again."
          } else if (error.code === 2) {
            errorMessage = "Location unavailable. Please try again or enter an address manually."
          } else if (error.code === 3) {
            errorMessage = "Location request timed out. Please try again or enter an address manually."
          }

          setGeoLocationError(errorMessage)
          setIsGettingLocation(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      )
    } else {
      setGeoLocationError("Geolocation is not supported by this browser.")
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0 && !hasSelected) {
              setShowSuggestions(true)
            }
          }}
          placeholder={placeholder}
          className={`bg-slate-700/50 border-blue-700/50 text-white placeholder-blue-300/70 pr-12 h-14 text-lg rounded-xl ${className}`}
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          </div>
        )}
        {value && !isLoading && hasSelected && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                className="w-3 h-3 bg-white rounded-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && !hasSelected && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-md border border-blue-700/50 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.place_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center space-x-3 p-4 cursor-pointer transition-all duration-200 ${
                  index === selectedIndex ? "bg-blue-600/30 border-l-4 border-blue-400" : "hover:bg-blue-900/20"
                } ${index !== suggestions.length - 1 ? "border-b border-slate-600/30" : ""}`}
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-white text-sm">{suggestion.description}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Location Button */}
      <div className="flex items-center space-x-4 mt-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        <span className="text-blue-300 text-sm font-medium px-4 py-2 bg-slate-800/50 rounded-full">OR</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      </div>

      <Button
        onClick={getCurrentLocation}
        variant="outline"
        disabled={isGettingLocation}
        className="w-full border-blue-600 text-blue-300 hover:bg-blue-900/30 h-14 text-lg rounded-xl mt-4"
      >
        {isGettingLocation ? (
          <>
            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
            Getting Your Location...
          </>
        ) : (
          <>
            <Navigation className="w-5 h-5 mr-3" />
            Use Current Location
          </>
        )}
      </Button>

      {/* Geolocation Error Message */}
      <AnimatePresence>
        {geoLocationError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg flex items-start space-x-2"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-red-200 text-sm">{geoLocationError}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
