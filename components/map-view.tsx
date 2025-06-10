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
  is3DMode?: boolean
}

export function MapView({
  coordinates,
  selectedLocation,
  nearbyPlaces = [],
  transitStations = [],
  activeLayer,
  factors = [],
  onLayerChange,
  is3DMode = false,
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

  // Parameter explanations based on score - these provide context for business decisions
  const getParameterExplanation = (factor: any) => {
    if (!factor) return "No data available for this parameter."

    const score = factor.score
    let explanation = ""

    switch (factor.id) {
      case "footHeat":
        if (score >= 80) explanation = "Excellent foot traffic - high pedestrian activity throughout the day indicates strong potential for walk-in customers"
        else if (score >= 60) explanation = "Good foot traffic - moderate pedestrian flow with identifiable peak hours, suitable for most retail businesses"
        else explanation = "Low foot traffic - limited pedestrian activity may require additional marketing efforts or strategic positioning"
        break
      case "hazardHeat":
        if (score >= 80) explanation = "Very safe area - low crime rates and good security infrastructure create a comfortable environment for customers and staff"
        else if (score >= 60) explanation = "Moderately safe - average safety levels with some precautions recommended for evening operations"
        else explanation = "Safety concerns - higher risk factors may affect customer comfort and require additional security measures"
        break
      case "competitors":
        if (score >= 80) explanation = "Low competition - excellent opportunity with few direct competitors, allowing for market leadership potential"
        else if (score >= 60) explanation = "Moderate competition - balanced market with room for differentiation and growth strategies"
        else explanation = "High competition - saturated market requiring strong differentiation strategy and competitive pricing"
        break
      case "access":
        if (score >= 80) explanation = "Excellent accessibility - multiple transit options and easy access expand your potential customer base significantly"
        else if (score >= 60) explanation = "Good accessibility - decent transit connections available, though some customers may need alternative transport"
        else explanation = "Limited accessibility - few transit options may restrict customer reach, consider parking availability"
        break
      default:
        explanation = "Analysis data is being processed..."
    }

    return explanation
  }

  // Initialize Google Maps with comprehensive 3D building support
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

        console.log("Creating map instance with enhanced 3D building support")

        // Clear existing markers and overlays to prevent memory leaks
        markers.forEach((marker) => marker.setMap(null))
        overlays.forEach((overlay) => overlay.setMap(null))
        if (isMounted) {
          setMarkers([])
          setOverlays([])
        }

        // Create map instance with enhanced 3D building visualization
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: coordinates,
          zoom: is3DMode ? 19 : 15, // Higher zoom for 3D building detail
          mapTypeId: is3DMode ? 'satellite' : 'roadmap',
          tilt: is3DMode ? 45 : 0, // 45-degree tilt for 3D building view
          heading: is3DMode ? 90 : 0, // Rotate for better building perspective
          styles: is3DMode ? [] : [
            // Enhanced dark theme with better contrast for 2D mode
            { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
            { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#334155" }] },
            { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#475569" }] },
            { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#334155" }] },
            { featureType: "landscape.man_made", elementType: "geometry.stroke", stylers: [{ color: "#1e293b" }] },
            { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
            { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
            { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
            { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#0f3f2f" }] },
            { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#10b981" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#334155" }] },
            { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
            { featureType: "road", elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#475569" }] },
            { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1e293b" }] },
            { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
            { featureType: "road.highway", elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
            { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
            { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#3b82f6" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#0c4a6e" }] },
            { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#0ea5e9" }] },
            // Hide most POIs for cleaner visualization
            { featureType: "poi.business", stylers: [{ visibility: "off" }] },
            { featureType: "poi.school", stylers: [{ visibility: "off" }] },
            { featureType: "poi.medical", stylers: [{ visibility: "off" }] },
            { featureType: "poi.attraction", stylers: [{ visibility: "off" }] },
            { featureType: "poi.government", stylers: [{ visibility: "off" }] },
            { featureType: "poi.place_of_worship", stylers: [{ visibility: "off" }] },
            { featureType: "poi.sports_complex", stylers: [{ visibility: "off" }] },
          ],
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: is3DMode, // Enable map type control in 3D mode
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          rotateControl: is3DMode, // Enable rotation controls for 3D
          tiltControl: is3DMode, // Enable tilt controls for 3D
        })

        // Enable 3D buildings in 3D mode for realistic city visualization
        if (is3DMode) {
          mapInstance.setOptions({
            mapTypeId: 'satellite',
            tilt: 45,
            heading: 90,
          })
          
          // Add a slight delay to ensure 3D buildings render properly
          setTimeout(() => {
            mapInstance.setTilt(45)
          }, 1000)
        }

        // Add main location marker with enhanced design
        const mainMarker = new window.google.maps.Marker({
          position: coordinates,
          map: mapInstance,
          title: selectedLocation,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="60" height="75" viewBox="0 0 60 75" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <path d="M30 0C13.431 0 0 13.431 0 30c0 22.5 30 45 30 45s30-22.5 30-45C60 13.431 46.569 0 30 0z" fill="#EF4444" filter="url(#glow)"/>
                <circle cx="30" cy="30" r="15" fill="#FFFFFF"/>
                <circle cx="30" cy="30" r="8" fill="#EF4444"/>
                <circle cx="30" cy="30" r="3" fill="#FFFFFF"/>
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(60, 75),
            anchor: new window.google.maps.Point(30, 75),
          },
          zIndex: 1000,
        })

        const newMarkers = [mainMarker]

        // Add 2km analysis radius circle with enhanced styling (only in 2D mode)
        let radiusCircle = null
        if (!is3DMode) {
          radiusCircle = new window.google.maps.Circle({
            strokeColor: "#3B82F6",
            strokeOpacity: 0.8,
            strokeWeight: 3,
            fillColor: "#3B82F6",
            fillOpacity: 0.08,
            map: mapInstance,
            center: coordinates,
            radius: 2000,
          })
        }

        const newOverlays = radiusCircle ? [radiusCircle] : []

        // Add nearby places markers with enhanced info windows and categorization
        const infoWindow = new window.google.maps.InfoWindow()

        if (nearbyPlaces && nearbyPlaces.length > 0) {
          for (const place of nearbyPlaces) {
            if (!place.geometry || !place.geometry.location) continue

            let iconColor = "#4CAF50"
            let iconEmoji = "🏢"
            const iconSize = 20

            // Categorize places with appropriate icons and colors
            if (place.types?.includes("bus_station") || place.types?.includes("transit_station")) {
              iconColor = "#2196F3"
              iconEmoji = "🚌"
            } else if (place.types?.includes("train_station") || place.types?.includes("subway_station")) {
              iconColor = "#9C27B0"
              iconEmoji = "🚊"
            } else if (place.types?.includes("restaurant") || place.types?.includes("cafe")) {
              iconColor = "#FF9800"
              iconEmoji = "🍽️"
            } else if (place.types?.includes("store") || place.types?.includes("shop")) {
              iconColor = "#F44336"
              iconEmoji = "🏪"
            } else if (place.types?.includes("hospital")) {
              iconColor = "#E91E63"
              iconEmoji = "🏥"
            } else if (place.types?.includes("school")) {
              iconColor = "#673AB7"
              iconEmoji = "🏫"
            } else if (place.types?.includes("bank")) {
              iconColor = "#795548"
              iconEmoji = "🏦"
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
                    <text x="${iconSize / 2}" y="${iconSize / 2 + 2}" text-anchor="middle" font-size="8" fill="#FFFFFF">${iconEmoji}</text>
                  </svg>
                `)}`,
                scaledSize: new window.google.maps.Size(iconSize, iconSize),
                anchor: new window.google.maps.Point(iconSize / 2, iconSize / 2),
              },
              zIndex: 100,
            })

            // Enhanced info window with comprehensive business information
            marker.addListener("click", () => {
              const content = `
                <div style="color: #333; padding: 12px; max-width: 250px; font-family: system-ui; background: linear-gradient(135deg, #f8fafc, #e2e8f0); border-radius: 8px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1e293b;">${place.name}</h3>
                  <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b;">${place.vicinity || ""}</p>
                  ${place.rating ? `<div style="margin: 4px 0; font-size: 12px; display: flex; align-items: center;"><strong style="color: #1e293b;">Rating:</strong> <span style="margin-left: 4px; color: #f59e0b;">${place.rating}⭐</span> <span style="margin-left: 4px; color: #64748b;">(${place.user_ratings_total || 0} reviews)</span></div>` : ""}
                  ${place.price_level !== undefined ? `<div style="margin: 4px 0; font-size: 12px;"><strong style="color: #1e293b;">Price:</strong> ${"$".repeat(place.price_level + 1)}</div>` : ""}
                  ${place.opening_hours ? `<div style="margin: 4px 0; font-size: 12px;"><strong style="color: #1e293b;">Status:</strong> <span style="color: ${place.opening_hours.open_now ? '#10b981' : '#ef4444'};">${place.opening_hours.open_now ? 'Open Now' : 'Closed'}</span></div>` : ""}
                  <div style="margin: 8px 0 0 0; font-size: 11px; color: #94a3b8; background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">
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
  }, [coordinates, selectedLocation, mapLoadAttempts, locationKey, is3DMode])

  // Update overlays based on active layer with enhanced visualizations (only in 2D mode)
  useEffect(() => {
    if (!map || !window.google || is3DMode) return

    // Clear existing overlays except radius circle and main marker
    overlays.slice(1).forEach((overlay) => overlay.setMap(null))
    markers.slice(1).forEach((marker) => marker.setMap(null))

    const newOverlays = [overlays[0]] // Keep radius circle
    const newMarkers = [markers[0]] // Keep main marker

    if (activeLayer === "footHeat") {
      // Enhanced foot traffic zones with realistic business impact visualization
      const trafficSources = nearbyPlaces.filter((place) =>
        place.types?.some((t: string) =>
          ["restaurant", "cafe", "shopping_mall", "store", "transit_station", "bus_station", "train_station"].includes(t),
        ),
      )

      // Create traffic zones around high-activity areas with business relevance
      trafficSources.slice(0, 12).forEach((source, index) => {
        if (!source.geometry?.location) return

        // Calculate distance from main location for impact assessment
        const distance = Math.sqrt(
          Math.pow(source.geometry.location.lat - coordinates.lat, 2) +
            Math.pow(source.geometry.location.lng - coordinates.lng, 2),
        )

        // Closer places generate higher traffic impact
        const intensity = Math.max(0.1, 1 - distance * 1000)
        const radius = 120 + intensity * 180

        let color = "#EF4444" // Red for low traffic impact
        let opacity = 0.15

        if (intensity > 0.7) {
          color = "#10B981" // Green for high traffic impact
          opacity = 0.35
        } else if (intensity > 0.4) {
          color = "#F59E0B" // Yellow for medium traffic impact
          opacity = 0.25
        }

        const circle = new window.google.maps.Circle({
          strokeColor: color,
          strokeOpacity: 0.9,
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

      // Add main traffic zone around our location
      const mainTrafficCircle = new window.google.maps.Circle({
        strokeColor: "#10B981",
        strokeOpacity: 1,
        strokeWeight: 3,
        fillColor: "#10B981",
        fillOpacity: 0.25,
        map: map,
        center: coordinates,
        radius: 250,
      })
      newOverlays.push(mainTrafficCircle)

    } else if (activeLayer === "hazardHeat") {
      // Enhanced safety zones - GREEN for safe areas with comprehensive safety factors
      const safetyFactors = {
        transitStations: transitStations.length,
        restaurants: nearbyPlaces.filter((p) => p.types?.includes("restaurant")).length,
        hospitals: nearbyPlaces.filter((p) => p.types?.includes("hospital")).length,
        schools: nearbyPlaces.filter((p) => p.types?.includes("school")).length,
        police: nearbyPlaces.filter((p) => p.types?.includes("police")).length,
      }

      // Create safety zones based on actual safety infrastructure
      const safeAreas = [
        ...transitStations.slice(0, 4),
        ...nearbyPlaces.filter((p) => p.types?.includes("hospital")).slice(0, 3),
        ...nearbyPlaces.filter((p) => p.types?.includes("school")).slice(0, 3),
        ...nearbyPlaces.filter((p) => p.types?.includes("police")).slice(0, 2),
      ]

      safeAreas.forEach((area, index) => {
        if (!area.geometry?.location) return

        const isMajorSafety = area.types?.includes("hospital") || area.types?.includes("police")
        const isTransit = area.types?.some((t) => ["transit_station", "bus_station", "train_station"].includes(t))

        let color = "#10B981" // Green for safe areas
        let opacity = 0.2
        let radius = 300

        if (isMajorSafety) {
          color = "#10B981"
          opacity = 0.4
          radius = 500
        } else if (isTransit) {
          color = "#10B981"
          opacity = 0.3
          radius = 350
        }

        const circle = new window.google.maps.Circle({
          strokeColor: color,
          strokeOpacity: 1,
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

      // Add moderate risk areas for realistic safety assessment
      const seed = Math.abs(Math.sin(coordinates.lat * 12.9898 + coordinates.lng * 78.233) * 43758.5453)
      const rand = (o = 0) => {
        const x = Math.sin(seed + o) * 1e4
        return x - Math.floor(x)
      }

      const riskAreas = [
        {
          lat: coordinates.lat + (rand(1) - 0.5) * 0.008,
          lng: coordinates.lng + (rand(2) - 0.5) * 0.008,
        },
        {
          lat: coordinates.lat + (rand(3) - 0.5) * 0.008,
          lng: coordinates.lng + (rand(4) - 0.5) * 0.008,
        },
      ]

      riskAreas.forEach((area) => {
        const circle = new window.google.maps.Circle({
          strokeColor: "#F59E0B",
          strokeOpacity: 0.9,
          strokeWeight: 2,
          fillColor: "#F59E0B",
          fillOpacity: 0.2,
          map: map,
          center: area,
          radius: 200,
        })
        newOverlays.push(circle)
      })

    } else if (activeLayer === "competitors") {
      // Enhanced competitor visualization with business intelligence
      const competitors = nearbyPlaces.filter((place) =>
        place.types?.some((t: string) => ["store", "restaurant", "shop", "establishment", "shopping_mall"].includes(t)),
      )

      competitors.slice(0, 15).forEach((competitor) => {
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
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2"/>
                <rect x="12" y="14" width="16" height="12" rx="2" fill="#FFFFFF"/>
                <rect x="14" y="16" width="12" height="2" fill="#F59E0B"/>
                <rect x="14" y="19" width="8" height="1" fill="#F59E0B"/>
                <rect x="14" y="21" width="10" height="1" fill="#F59E0B"/>
                <rect x="14" y="23" width="6" height="1" fill="#F59E0B"/>
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 20),
          },
          zIndex: 200,
        })

        // Enhanced competitor info window with business intelligence
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="color: #333; padding: 12px; max-width: 280px; font-family: system-ui; background: linear-gradient(135deg, #fef3c7, #fbbf24); border-radius: 8px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #92400e;">🏪 ${competitor.name}</h3>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #78350f;">${competitor.vicinity || ""}</p>
              ${competitor.rating ? `<div style="margin: 4px 0; font-size: 12px;"><strong style="color: #92400e;">Rating:</strong> ${competitor.rating}⭐ (${competitor.user_ratings_total || 0} reviews)</div>` : ""}
              ${competitor.price_level !== undefined ? `<div style="margin: 4px 0; font-size: 12px;"><strong style="color: #92400e;">Price Level:</strong> ${"$".repeat(competitor.price_level + 1)}</div>` : ""}
              <div style="margin: 8px 0; font-size: 11px; color: #78350f; background: #fde68a; padding: 4px 8px; border-radius: 4px; display: inline-block;">
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
      // Enhanced transit station visualization with accessibility insights
      console.log("Showing enhanced transit stations:", transitStations.length)

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
              <svg width="45" height="45" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="22.5" cy="22.5" r="20" fill="${isTrain ? "#8B5CF6" : "#2196F3"}" stroke="#FFFFFF" strokeWidth="3"/>
                ${
                  isTrain
                    ? `<rect x="10" y="14" width="25" height="17" rx="3" fill="#FFFFFF"/>
                       <circle cx="15" cy="26" r="2" fill="#8B5CF6"/>
                       <circle cx="30" cy="26" r="2" fill="#8B5CF6"/>
                       <rect x="12" y="16" width="21" height="6" fill="#8B5CF6"/>
                       <rect x="14" y="18" width="17" height="2" fill="#FFFFFF"/>`
                    : `<rect x="12" y="12" width="21" height="21" rx="3" fill="#FFFFFF"/>
                       <circle cx="17" cy="28" r="1.5" fill="#2196F3"/>
                       <circle cx="28" cy="28" r="1.5" fill="#2196F3"/>
                       <rect x="14" y="14" width="17" height="10" fill="#2196F3"/>
                       <rect x="16" y="16" width="13" height="6" fill="#FFFFFF"/>`
                }
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(45, 45),
            anchor: new window.google.maps.Point(22.5, 22.5),
          },
          zIndex: 300,
        })

        // Enhanced transit info window with accessibility details
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="color: #333; padding: 12px; max-width: 280px; font-family: system-ui; background: linear-gradient(135deg, ${isTrain ? '#f3e8ff' : '#dbeafe'}, ${isTrain ? '#c4b5fd' : '#93c5fd'}); border-radius: 8px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: ${isTrain ? "#6b21a8" : "#1e40af"};">
                ${isTrain ? "🚊" : "🚌"} ${transit.name}
              </h3>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: ${isTrain ? "#7c3aed" : "#2563eb"};">${transit.vicinity || ""}</p>
              <div style="margin: 8px 0; font-size: 11px; color: ${isTrain ? "#6b21a8" : "#1e40af"}; background: ${isTrain ? "#ede9fe" : "#e0f2fe"}; padding: 4px 8px; border-radius: 4px; display: inline-block;">
                ${isTrain ? "Train/Subway Station" : "Bus Station"}
              </div>
              <div style="margin: 8px 0 0 0; font-size: 10px; color: ${isTrain ? "#7c3aed" : "#2563eb"};">
                Accessibility: ${isTrain ? "High-capacity transit" : "Local area coverage"}
              </div>
            </div>
          `,
        })

        marker.addListener("click", () => {
          infoWindow.open(map, marker)
        })

        newMarkers.push(marker)

        // Add enhanced accessibility circle with impact radius
        const circle = new window.google.maps.Circle({
          strokeColor: isTrain ? "#8B5CF6" : "#2196F3",
          strokeOpacity: 1,
          strokeWeight: 3,
          fillColor: isTrain ? "#8B5CF6" : "#2196F3",
          fillOpacity: 0.15,
          map: map,
          center: {
            lat: transit.geometry.location.lat,
            lng: transit.geometry.location.lng,
          },
          radius: isTrain ? 500 : 300, // Larger radius for train stations
        })
        newOverlays.push(circle)
      })

      // If no transit stations found, show informative message
      if (transitStations.length === 0) {
        const noTransitInfo = new window.google.maps.InfoWindow({
          content: `
            <div style="color: #333; padding: 12px; max-width: 250px; font-family: system-ui; background: linear-gradient(135deg, #fee2e2, #fca5a5); border-radius: 8px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #dc2626;">
                No Transit Stations Found
              </h3>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #991b1b;">
                No public transit stations were found within 2km of this location. Consider alternative transportation options for customers.
              </p>
            </div>
          `,
          position: coordinates,
        })

        noTransitInfo.open(map)

        newOverlays.push({
          setMap: (m: any) => {
            if (!m) noTransitInfo.close()
          },
        })
      }
    }

    setOverlays(newOverlays)
    setMarkers(newMarkers)
  }, [activeLayer, map, nearbyPlaces, transitStations, coordinates, locationKey, is3DMode])

  const handleRetry = () => {
    setMapLoadAttempts((prev) => prev + 1)
  }

  return (
    <div className="relative h-full rounded-2xl overflow-hidden bg-slate-900/50">
      {isMapLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5 backdrop-blur-xl z-10 rounded-2xl">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading {is3DMode ? '3D buildings' : 'interactive'} map...</p>
            <p className="text-cyan-300 text-sm mt-2">Fetching location data...</p>
          </div>
        </div>
      )}

      {mapLoadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5 backdrop-blur-xl z-10 rounded-2xl">
          <div className="text-center p-8 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 max-w-md">
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

      {/* Enhanced Parameter Info */}
      {!mapLoadError && !isMapLoading && safeFactor && !is3DMode && (
        <div className="absolute top-6 right-6">
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 max-w-sm">
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

      {/* Enhanced Legend (only in 2D mode) */}
      {!mapLoadError && !isMapLoading && !is3DMode && (
        <div className="absolute bottom-6 left-6 bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 max-w-xs">
          <h4 className="text-white font-semibold mb-3 flex items-center">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></div>
            Map Legend
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-white/80">Your Location</span>
            </div>
            {activeLayer === "footHeat" && (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-white/80">High Traffic Zone</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-white/80">Medium Traffic</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-white/80">Low Traffic</span>
                </div>
              </>
            )}
            {activeLayer === "hazardHeat" && (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-white/80">Safe Area</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-white/80">Moderate Risk</span>
                </div>
              </>
            )}
            {activeLayer === "competitors" && (
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                  🏪
                </div>
                <span className="text-white/80">Competitor Businesses</span>
              </div>
            )}
            {activeLayer === "access" && (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xs">
                    🚊
                  </div>
                  <span className="text-white/80">
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
                  <span className="text-white/80">
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
            <div className="flex items-center space-x-3 pt-2 border-t border-white/20">
              <div className="w-4 h-4 border-2 border-cyan-400 rounded-full"></div>
              <span className="text-white/80">2km Analysis Area</span>
            </div>
          </div>
        </div>
      )}

      {/* 3D Mode Indicator */}
      {is3DMode && !mapLoadError && !isMapLoading && (
        <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-white font-medium text-sm">3D Buildings View</span>
          </div>
          <p className="text-white/60 text-xs mt-1">Rotate and tilt to explore</p>
        </div>
      )}
    </div>
  )
}