import { type NextRequest, NextResponse } from "next/server"

const GOOGLE_MAPS_API_KEY = "AIzaSyAoEItHnh7E9es3rgAXxrHILFtJspawPRI"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Address parameter is required" }, { status: 400 })
    }

    console.log("Geocoding address:", address)

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("Geocoding API error:", response.status, response.statusText)
      return NextResponse.json({ error: `Geocoding API error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    console.log("Geocoding response:", data)

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Geocoding API status error:", data.status, data.error_message)
      return NextResponse.json({ error: `Geocoding failed: ${data.status}` }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Geocoding error:", error)
    return NextResponse.json(
      {
        error: "Failed to geocode address",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export const dynamic = "force-dynamic"
