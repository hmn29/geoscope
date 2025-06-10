// Google Maps API utility to prevent multiple loads
let isGoogleMapsLoaded = false
let isGoogleMapsLoading = false
let loadPromise: Promise<void> | null = null
let loadAttempts = 0
const MAX_LOAD_ATTEMPTS = 3

export const loadGoogleMapsAPI = async (): Promise<void> => {
  // Only run in browser environment
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Cannot load Google Maps in server environment"))
  }

  // If already loaded in window object, mark as loaded
  if (window.google && window.google.maps) {
    console.log("Google Maps already loaded in window object")
    isGoogleMapsLoaded = true
    return Promise.resolve()
  }

  // Return existing promise if already loading
  if (loadPromise) {
    console.log("Google Maps already loading, returning existing promise")
    return loadPromise
  }

  // Check if we've exceeded max attempts
  if (loadAttempts >= MAX_LOAD_ATTEMPTS) {
    console.error("Exceeded maximum Google Maps load attempts")
    return Promise.reject(new Error("Exceeded maximum Google Maps load attempts"))
  }

  loadAttempts++
  console.log(`Attempting to load Google Maps (attempt ${loadAttempts})`)

  // Check if script already exists in DOM
  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
  if (existingScript && !isGoogleMapsLoading) {
    console.log("Found existing Google Maps script, waiting for it to load")
    isGoogleMapsLoading = true
    loadPromise = new Promise((resolve, reject) => {
      existingScript.addEventListener("load", () => {
        console.log("Existing Google Maps script loaded successfully")
        isGoogleMapsLoaded = true
        isGoogleMapsLoading = false
        resolve()
      })
      existingScript.addEventListener("error", (error) => {
        console.error("Error loading existing Google Maps script:", error)
        isGoogleMapsLoading = false
        loadPromise = null
        reject(new Error("Failed to load Google Maps API from existing script"))
      })
    })
    return loadPromise
  }

  // Create new script if none exists
  console.log("Creating new Google Maps script")
  isGoogleMapsLoading = true
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAoEItHnh7E9es3rgAXxrHILFtJspawPRI&libraries=places,visualization&callback=initGoogleMaps`
    script.async = true
    script.defer = true

    // Define global callback
    window.initGoogleMaps = () => {
      console.log("Google Maps API loaded successfully via callback")
      isGoogleMapsLoaded = true
      isGoogleMapsLoading = false
      resolve()
    }

    script.onload = () => {
      console.log("Google Maps script onload event fired")
      // The callback will handle resolution
    }

    script.onerror = (error) => {
      console.error("Error loading Google Maps script:", error)
      isGoogleMapsLoading = false
      loadPromise = null
      reject(new Error("Failed to load Google Maps API"))
    }

    document.head.appendChild(script)
  })

  return loadPromise
}

export const isGoogleMapsAPILoaded = (): boolean => {
  if (typeof window === "undefined") return false
  return isGoogleMapsLoaded || (window.google && window.google.maps)
}

// Add a global type for the callback
declare global {
  interface Window {
    google: any
    initGoogleMaps: () => void
  }
}