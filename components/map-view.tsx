"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw, Info } from "lucide-react"
import { loadGoogleMapsAPI, isGoogleMapsAPILoaded } from "@/lib/google-maps"
import { motion, AnimatePresence } from "framer-motion"

interface MapViewProps {
  coordinates: { lat: number; lng: number }
  selectedLocation: string
  nearbyPlaces: any[]
  transitStations: any[]
  activeLayer: string
  factors: any[]
  onLayerChange: (layer: string) => void
}

export function MapView({
  coordinates,
  selectedLocation,
  nearbyPlaces = [],
  transitStations = [],
  activeLayer,
  factors = [],
  onLayerChange,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [overlays, setOverlays] = useState<any[]>([])
  const [isMapLoading, setIsMapLoading] = useState(true)
  const [mapLoadError, setMapLoadError] = useState<string | null>(null)
  const [mapLoadAttempts, setMapLoadAttempts] = useState(0)
  const [showParameterInfo, setShowParameterInfo] = useState(false)
  const [locationKey, setLocationKey] = useState("")
  const maxAttempts = 3

  // Generate a unique key for the current location to track changes
  useEffect(() => {
    if (coordinates) {
      setLocationKey(`${coordinates.lat.toFixed(6)}-${coordinates.lng.toFixed(6)}`)
    }
  }, [coordinates])

  // Safety check for factors array
  const safeFactor = factors && factors.length > 0 ? factors.find((f) => f.id === activeLayer) : null

  // Parameter explanations based on score
  const getParameterExplanation = (factor: any) => {
    if (!factor) return "No data available for this parameter."

    const score = factor.score
    let explanation = ""

    switch (factor.id) {
      case "footHeat":
        if (score >= 80) explanation = "Excellent foot traffic - high pedestrian activity throughout the day"
        else if (score >= 60) explanation = "Good foot traffic - moderate pedestrian flow with peak hours"
        else explanation = "Low foot traffic - limited pedestrian activity, may need marketing boost"
        break
      case "hazardHeat":
        if (score >= 80) explanation = "Very safe area - low crime rates and good security presence"
        else if (score >= 60) explanation = "Moderately safe - average safety with some precautions needed"
        else explanation = "Safety concerns - higher crime rates, consider additional security measures"
        break
      case "competitors":
        if (score >= 80) explanation = "Low competition - great opportunity with few direct competitors"
        else if (score >= 60) explanation = "Moderate competition - balanced market with room for growth"
        else explanation = "High competition - saturated market, differentiation strategy needed"
        break
      case "access":
        if (score >= 80) explanation = "Excellent accessibility - multiple transit options and easy access"
        else if (score >= 60) explanation = "Good accessibility - decent transit connections available"
        else explanation = "Limited accessibility - few transit options, customers may need parking"
        break
      default:
        explanation = "Analysis data is being processed..."
    }

    return explanation
  }

  // Initialize Google Maps with proper loading management
  useEffect(() => {
    let isMounted = true

    const initializeMap = async () => {
      if (!isMounted) return

      try {
        setIsMapLoading(true)
        setMapLoadError(null)

        await loadGoogleMapsAPI()

        if (!isGoogleMapsAPILoaded()) {
          throw new Error("Google Maps API failed to load properly")
        }

        if (!mapRef.current) {
          throw new Error("Map container not available")
        }

        console.log("Creating map instance")

        // Clear existing markers and overlays
        markers.forEach((marker) => marker.setMap(null))
        overlays.forEach((overlay) => overlay.setMap(null))
        if (isMounted) {
          setMarkers([])
          setOverlays([])
        }

        // Create map instance with minimal POI visibility
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: coordinates,
          zoom: 15,
          styles: [
            // Hide most POIs but keep city/area names
            {
              featureType: "poi.business",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "poi.school",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "poi.medical",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "poi.attraction",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "poi.government",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "poi.park",
              elementType: "labels",
              stylers: [{ visibility: "simplified" }],
            },
            {
              featureType: "poi.place_of_worship",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "poi.sports_complex",
              stylers: [{ visibility: "off" }],
            },
            // Keep city and area names visible
            {
              featureType: "administrative.locality",
              elementType: "labels.text",
              stylers: [{ visibility: "on" }],
            },
            {
              featureType: "administrative.neighborhood",
              elementType: "labels.text",
              stylers: [{ visibility: "on" }],
            },
            // Hide transit labels but keep stations visible
            {
              featureType: "transit.station",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
            // Dark theme
            { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
            { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#4b6878" }] },
            {
              featureType: "administrative.land_parcel",
              elementType: "labels.text.fill",
              stylers: [{ color: "#64779e" }],
            },
            { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#4b6878" }] },
            { featureType: "landscape.man_made", elementType: "geometry.stroke", stylers: [{ color: "#334e87" }] },
            { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#334155" }] },
            { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#98a5be" }] },
            { featureType: "road", elementType: "labels.text.stroke", stylers: [{ color: "#1e293b" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#475569" }] },
            { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#334155" }] },
            { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#cbd5e1" }] },
            { featureType: "road.highway", elementType: "labels.text.stroke", stylers: [{ color: "#1e293b" }] },
            { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2563eb" }] },
            { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#3b82f6" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#0c4a6e" }] },
            { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4e6d70" }] },
          ],
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        })

        // Add main location marker (RED PIN)
        const mainMarker = new window.google.maps.Marker({
          position: coordinates,
          map: mapInstance,
          title: selectedLocation,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="48" height="60" viewBox="0 0 48 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 0C10.745 0 0 10.745 0 24c0 18 24 36 24 36s24-18 24-36C48 10.745 37.255 0 24 0z" fill="#EF4444"/>
                <circle cx="24" cy="24" r="12" fill="#FFFFFF"/>
                <circle cx="24" cy="24" r="6" fill="#EF4444"/>
                <circle cx="24" cy="24" r="2" fill="#FFFFFF"/>
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(48, 60),
            anchor: new window.google.maps.Point(24, 60),
          },
          zIndex: 1000,
        })

        const newMarkers = [mainMarker]

        // Add 2km analysis radius circle
        const radiusCircle = new window.google.maps.Circle({
          strokeColor: "#3B82F6",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#3B82F6",
          fillOpacity: 0.05,
          map: mapInstance,
          center: coordinates,
          radius: 2000,
        })

        const newOverlays = [radiusCircle]

        // Add nearby places markers
        const infoWindow = new window.google.maps.InfoWindow()

        if (nearbyPlaces && nearbyPlaces.length > 0) {
          for (const place of nearbyPlaces) {
            if (!place.geometry || !place.geometry.location) continue

            let iconColor = "#4CAF50"
            const iconSize = 16

            if (place.types?.includes("bus_station") || place.types?.includes("transit_station")) {
              iconColor = "#2196F3"
            } else if (place.types?.includes("train_station") || place.types?.includes("subway_station")) {
              iconColor = "#9C27B0"
            } else if (place.types?.includes("restaurant") || place.types?.includes("cafe")) {
              iconColor = "#FF9800"
            } else if (place.types?.includes("store") || place.types?.includes("shop")) {
              iconColor = "#F44336"
            }

            const marker = new window.google.maps.Marker({
              position: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng,
              },
              map: mapInstance,
              title: place.name,
              icon: {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                  <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 ${iconSize} ${iconSize}" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="${iconSize / 2}" cy="${iconSize / 2}" r="${iconSize / 2 - 1}" fill="${iconColor}" stroke="#FFFFFF" strokeWidth="2"/>
                  </svg>
                `)}`,
                scaledSize: new window.google.maps.Size(iconSize, iconSize),
                anchor: new window.google.maps.Point(iconSize / 2, iconSize / 2),
              },
              zIndex: 100,
            })

            marker.addListener("click", () => {
              const content = `
                <div style="color: #333; padding: 8px; max-width: 200px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${place.name}</h3>
                  <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${place.vicinity || ""}</p>
                  ${place.rating ? `<div style="margin: 4px 0; font-size: 12px;"><strong>Rating:</strong> ${place.rating}⭐ (${place.user_ratings_total || 0} reviews)</div>` : ""}
                  <div style="margin: 4px 0; font-size: 11px; color: #888;">
                    ${place.types?.slice(0, 3).join(", ") || ""}
                  </div>
                </div>
              `
              infoWindow.setContent(content)
              infoWindow.open(mapInstance, marker)
            })

            newMarkers.push(marker)
          }
        }

        if (isMounted) {
          setMarkers(newMarkers)
          setOverlays(newOverlays)
          setMap(mapInstance)
          setIsMapLoading(false)
        }
      } catch (error) {
        console.error("Failed to initialize Google Maps:", error)
        if (isMounted) {
          setMapLoadError(`Failed to load Google Maps: ${error instanceof Error ? error.message : "Unknown error"}`)
          setIsMapLoading(false)
        }
      }
    }

    if (mapLoadAttempts < maxAttempts) {
      initializeMap()
    }

    return () => {
      isMounted = false
      markers.forEach((marker) => marker.setMap(null))
      overlays.forEach((overlay) => overlay.setMap(null))
    }
  }, [coordinates, selectedLocation, mapLoadAttempts, locationKey]) // Added locationKey to dependencies

  // Update overlays based on active layer
  useEffect(() => {
    if (!map || !window.google) return

    // Clear existing overlays except radius circle and main marker
    overlays.slice(1).forEach((overlay) => overlay.setMap(null))
    markers.slice(1).forEach((marker) => marker.setMap(null))

    const newOverlays = [overlays[0]] // Keep radius circle
    const newMarkers = [markers[0]] // Keep main marker

    if (activeLayer === "footHeat") {
      // Generate realistic foot traffic zones based on nearby amenities
      const trafficSources = nearbyPlaces.filter((place) =>
        place.types?.some((t: string) =>
          ["restaurant", "cafe", "shopping_mall", "store", "transit_station", "bus_station", "train_station"].includes(
            t,
          ),
        ),
      )

      // Create traffic zones around high-activity areas
      trafficSources.slice(0, 8).forEach((source, index) => {
        if (!source.geometry?.location) return

        // Calculate distance from main location
        const distance = Math.sqrt(
          Math.pow(source.geometry.location.lat - coordinates.lat, 2) +
            Math.pow(source.geometry.location.lng - coordinates.lng, 2),
        )

        // Closer places generate higher traffic
        const intensity = Math.max(0.1, 1 - distance * 1000) // Convert to intensity
        const radius = 150 + intensity * 200 // Radius based on intensity

        let color = "#EF4444" // Red for low traffic
        let opacity = 0.15

        if (intensity > 0.7) {
          color = "#10B981" // Green for high traffic
          opacity = 0.3
        } else if (intensity > 0.4) {
          color = "#F59E0B" // Yellow for medium traffic
          opacity = 0.25
        }

        const circle = new window.google.maps.Circle({
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: color,
          fillOpacity: opacity,
          map: map,
          center: {
            lat: source.geometry.location.lat,
            lng: source.geometry.location.lng,
          },
          radius: radius,
        })
        newOverlays.push(circle)
      })

      // Add a high traffic zone near the main location if there are few traffic sources
      if (trafficSources.length < 3) {
        const mainTrafficCircle = new window.google.maps.Circle({
          strokeColor: "#10B981",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#10B981",
          fillOpacity: 0.25,
          map: map,
          center: coordinates,
          radius: 200,
        })
        newOverlays.push(mainTrafficCircle)
      }
    } else if (activeLayer === "hazardHeat") {
      // Generate safety zones based on real factors - CHANGED TO GREEN FOR SAFE AREAS
      const safetyFactors = {
        transitStations: transitStations.length,
        restaurants: nearbyPlaces.filter((p) => p.types?.includes("restaurant")).length,
        hospitals: nearbyPlaces.filter((p) => p.types?.includes("hospital")).length,
        schools: nearbyPlaces.filter((p) => p.types?.includes("school")).length,
      }

      // Create safety zones based on actual amenities
      const safeAreas = [
        ...transitStations.slice(0, 3),
        ...nearbyPlaces.filter((p) => p.types?.includes("hospital")).slice(0, 2),
        ...nearbyPlaces.filter((p) => p.types?.includes("school")).slice(0, 2),
      ]

      safeAreas.forEach((area, index) => {
        if (!area.geometry?.location) return

        const isMajorSafety = area.types?.includes("hospital") || area.types?.includes("police")
        const isTransit = area.types?.some((t) => ["transit_station", "bus_station", "train_station"].includes(t))

        let color = "#10B981" // Green for safe areas
        let opacity = 0.2
        let radius = 300

        if (isMajorSafety) {
          color = "#10B981" // Keep green for hospitals/police
          opacity = 0.35
          radius = 500
        } else if (isTransit) {
          color = "#10B981" // Green for transit areas too
          opacity = 0.25
          radius = 350
        }

        const circle = new window.google.maps.Circle({
          strokeColor: color,
          strokeOpacity: 0.9,
          strokeWeight: 2,
          fillColor: color,
          fillOpacity: opacity,
          map: map,
          center: {
            lat: area.geometry.location.lat,
            lng: area.geometry.location.lng,
          },
          radius: radius,
        })
        newOverlays.push(circle)
      })

      // Add some moderate risk areas (areas with fewer amenities)
      // Use a deterministic approach based on coordinates to ensure different locations get different patterns
      const seed = Math.abs(Math.sin(coordinates.lat * 12.9898 + coordinates.lng * 78.233) * 43758.5453)
      const rand = (o = 0) => {
        const x = Math.sin(seed + o) * 1e4
        return x - Math.floor(x)
      }

      const riskAreas = [
        {
          lat: coordinates.lat + (rand(1) - 0.5) * 0.01,
          lng: coordinates.lng + (rand(2) - 0.5) * 0.01,
        },
        {
          lat: coordinates.lat + (rand(3) - 0.5) * 0.01,
          lng: coordinates.lng + (rand(4) - 0.5) * 0.01,
        },
      ]

      riskAreas.forEach((area) => {
        const circle = new window.google.maps.Circle({
          strokeColor: "#F59E0B",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#F59E0B",
          fillOpacity: 0.2,
          map: map,
          center: area,
          radius: 250,
        })
        newOverlays.push(circle)
      })
    } else if (activeLayer === "competitors") {
      // Show competitor shops with shop icons
      const competitors = nearbyPlaces.filter((place) =>
        place.types?.some((t: string) => ["store", "restaurant", "shop", "establishment", "shopping_mall"].includes(t)),
      )

      competitors.slice(0, 10).forEach((competitor) => {
        if (!competitor.geometry?.location) return

        const marker = new window.google.maps.Marker({
          position: {
            lat: competitor.geometry.location.lat,
            lng: competitor.geometry.location.lng,
          },
          map: map,
          title: competitor.name,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="16" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2"/>
                <rect x="10" y="12" width="16" height="12" rx="2" fill="#FFFFFF"/>
                <rect x="12" y="14" width="12" height="2" fill="#F59E0B"/>
                <rect x="12" y="17" width="8" height="1" fill="#F59E0B"/>
                <rect x="12" y="19" width="10" height="1" fill="#F59E0B"/>
                <rect x="12" y="21" width="6" height="1" fill="#F59E0B"/>
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(36, 36),
            anchor: new window.google.maps.Point(18, 18),
          },
          zIndex: 200,
        })

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="color: #333; padding: 12px; max-width: 250px; font-family: system-ui;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #F59E0B;">🏪 ${competitor.name}</h3>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${competitor.vicinity || ""}</p>
              ${competitor.rating ? `<div style="margin: 4px 0; font-size: 12px;"><strong>Rating:</strong> ${competitor.rating}⭐ (${competitor.user_ratings_total || 0} reviews)</div>` : ""}
              <div style="margin: 8px 0; font-size: 11px; color: #888; background: #FEF3C7; padding: 4px 8px; border-radius: 4px; display: inline-block;">
                Competitor Business
              </div>
            </div>
          `,
        })

        marker.addListener("click", () => {
          infoWindow.open(map, marker)
        })

        newMarkers.push(marker)
      })
    } else if (activeLayer === "access") {
      // Show transit stations with specific icons
      console.log("Showing transit stations:", transitStations.length)

      transitStations.forEach((transit) => {
        if (!transit.geometry?.location) return

        const isTrain = transit.types?.includes("train_station") || transit.types?.includes("subway_station")
        const isBus = transit.types?.includes("bus_station") || transit.types?.includes("transit_station")

        const marker = new window.google.maps.Marker({
          position: {
            lat: transit.geometry.location.lat,
            lng: transit.geometry.location.lng,
          },
          map: map,
          title: transit.name,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="${isTrain ? "#8B5CF6" : "#2196F3"}" stroke="#FFFFFF" strokeWidth="2"/>
                ${
                  isTrain
                    ? `<rect x="8" y="12" width="24" height="16" rx="3" fill="#FFFFFF"/>
                       <circle cx="13" cy="24" r="2" fill="#8B5CF6"/>
                       <circle cx="27" cy="24" r="2" fill="#8B5CF6"/>
                       <rect x="10" y="14" width="20" height="6" fill="#8B5CF6"/>
                       <rect x="12" y="16" width="16" height="2" fill="#FFFFFF"/>`
                    : `<rect x="10" y="10" width="20" height="20" rx="3" fill="#FFFFFF"/>
                       <circle cx="15" cy="26" r="1.5" fill="#2196F3"/>
                       <circle cx="25" cy="26" r="1.5" fill="#2196F3"/>
                       <rect x="12" y="12" width="16" height="10" fill="#2196F3"/>
                       <rect x="14" y="14" width="12" height="6" fill="#FFFFFF"/>`
                }
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 20),
          },
          zIndex: 300,
        })

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="color: #333; padding: 12px; max-width: 250px; font-family: system-ui;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: ${isTrain ? "#8B5CF6" : "#2196F3"};">
                ${isTrain ? "🚊" : "🚌"} ${transit.name}
              </h3>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${transit.vicinity || ""}</p>
              <div style="margin: 8px 0; font-size: 11px; color: #888; background: ${isTrain ? "#F3E8FF" : "#DBEAFE"}; padding: 4px 8px; border-radius: 4px; display: inline-block;">
                ${isTrain ? "Train/Subway Station" : "Bus Station"}
              </div>
            </div>
          `,
        })

        marker.addListener("click", () => {
          infoWindow.open(map, marker)
        })

        newMarkers.push(marker)

        // Add accessibility circle
        const circle = new window.google.maps.Circle({
          strokeColor: isTrain ? "#8B5CF6" : "#2196F3",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: isTrain ? "#8B5CF6" : "#2196F3",
          fillOpacity: 0.1,
          map: map,
          center: {
            lat: transit.geometry.location.lat,
            lng: transit.geometry.location.lng,
          },
          radius: isTrain ? 400 : 200,
        })
        newOverlays.push(circle)
      })

      // If no transit stations found, add a message
      if (transitStations.length === 0) {
        // Create an info window at the center
        const noTransitInfo = new window.google.maps.InfoWindow({
          content: `
            <div style="color: #333; padding: 12px; max-width: 250px; font-family: system-ui;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #EF4444;">
                No Transit Stations Found
              </h3>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">
                No public transit stations were found within 2km of this location.
              </p>
            </div>
          `,
          position: coordinates,
        })

        // Open the info window
        noTransitInfo.open(map)

        // Store it to close later
        newOverlays.push({
          setMap: (m: any) => {
            if (!m) noTransitInfo.close()
          },
        })
      }
    }

    setOverlays(newOverlays)
    setMarkers(newMarkers)
  }, [activeLayer, map, nearbyPlaces, transitStations, coordinates, locationKey]) // Added locationKey to dependencies

  const handleRetry = () => {
    setMapLoadAttempts((prev) => prev + 1)
  }

  return (
    <div className="relative h-full rounded-2xl overflow-hidden bg-slate-900/50">
      {isMapLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/90 z-10 rounded-2xl">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading interactive map...</p>
            <p className="text-cyan-300 text-sm mt-2">Fetching location data...</p>
          </div>
        </div>
      )}

      {mapLoadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/95 z-10 rounded-2xl">
          <div className="text-center p-8 bg-slate-700/90 rounded-xl border border-red-500/30 max-w-md">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-white text-xl font-bold mb-3">Map Unavailable</h3>
            <p className="text-red-200 mb-6">
              Unable to load the interactive map. You can still view the analysis data.
            </p>
            <Button onClick={handleRetry} className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      )}

      <div ref={mapRef} className="w-full h-full" />

      {/* Parameter Info Dropdown */}
      {!mapLoadError && !isMapLoading && safeFactor && (
        <div className="absolute top-6 right-6">
          <Card className="bg-slate-800/95 backdrop-blur-md border border-slate-600/50 max-w-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 bg-gradient-to-r ${safeFactor.color || "from-gray-500 to-gray-400"} rounded-full`}
                  ></div>
                  <span>{safeFactor.name || "Loading..."}</span>
                  <span className="text-cyan-400 font-bold">({safeFactor.score || 0})</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowParameterInfo(!showParameterInfo)}
                  className="text-cyan-400 hover:text-white p-1"
                >
                  <Info className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <AnimatePresence>
              {showParameterInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <CardContent className="pt-0">
                    <p className="text-cyan-200 text-sm">{getParameterExplanation(safeFactor)}</p>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      )}

      {/* Enhanced Legend */}
      {!mapLoadError && !isMapLoading && (
        <div className="absolute bottom-6 left-6 bg-slate-800/95 backdrop-blur-md rounded-xl p-4 border border-slate-600/50 max-w-xs">
          <h4 className="text-white font-semibold mb-3 flex items-center">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></div>
            Map Legend
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-cyan-200">Your Location</span>
            </div>
            {activeLayer === "footHeat" && (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-cyan-200">High Traffic Zone</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-cyan-200">Medium Traffic</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-cyan-200">Low Traffic</span>
                </div>
              </>
            )}
            {activeLayer === "hazardHeat" && (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-cyan-200">Safe Area</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-cyan-200">Moderate Risk</span>
                </div>
              </>
            )}
            {activeLayer === "competitors" && (
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                  🏪
                </div>
                <span className="text-cyan-200">Competitor Businesses</span>
              </div>
            )}
            {activeLayer === "access" && (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xs">
                    🚊
                  </div>
                  <span className="text-cyan-200">
                    Train/Subway (
                    {
                      transitStations.filter(
                        (t) => t.types?.includes("train_station") || t.types?.includes("subway_station"),
                      ).length
                    }
                    )
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs">
                    🚌
                  </div>
                  <span className="text-cyan-200">
                    Bus Stations (
                    {
                      transitStations.filter(
                        (t) => t.types?.includes("bus_station") || t.types?.includes("transit_station"),
                      ).length
                    }
                    )
                  </span>
                </div>
              </>
            )}
            <div className="flex items-center space-x-3 pt-2 border-t border-slate-600/50">
              <div className="w-4 h-4 border-2 border-cyan-400 rounded-full"></div>
              <span className="text-cyan-200">2km Analysis Area</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
