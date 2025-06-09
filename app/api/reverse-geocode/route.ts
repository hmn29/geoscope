import { type NextRequest, NextResponse } from "next/server"

const GOOGLE_MAPS_API_KEY = "AIzaSyAoEItHnh7E9es3rgAXxrHILFtJspawPRI"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")

    if (!lat || !lng) {
      return NextResponse.json({ error: "Latitude and longitude parameters are required" }, { status: 400 })
    }

    console.log("Reverse geocoding coordinates:", lat, lng)

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("Reverse geocoding API error:", response.status, response.statusText)
      return NextResponse.json(
        { error: `Reverse geocoding API error: ${response.status}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("Reverse geocoding response status:", data.status)

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Reverse geocoding API status error:", data.status, data.error_message)
      return NextResponse.json({ error: `Reverse geocoding failed: ${data.status}` }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Reverse geocoding error:", error)
    return NextResponse.json(
      {
        error: "Failed to reverse geocode coordinates",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export const dynamic = "force-dynamic"
