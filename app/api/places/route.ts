import { type NextRequest, NextResponse } from "next/server"

const GOOGLE_MAPS_API_KEY = "AIzaSyAoEItHnh7E9es3rgAXxrHILFtJspawPRI"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = searchParams.get("radius") || "2000"
    const type = searchParams.get("type") || "establishment"

    if (!lat || !lng) {
      return NextResponse.json({ error: "Latitude and longitude parameters are required" }, { status: 400 })
    }

    console.log("Fetching places for:", lat, lng)

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${GOOGLE_MAPS_API_KEY}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("Places API error:", response.status, response.statusText)
      return NextResponse.json({ error: `Places API error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    console.log("Places response status:", data.status)

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Places API status error:", data.status, data.error_message)
      return NextResponse.json({ error: `Places API failed: ${data.status}` }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Places API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch nearby places",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export const dynamic = "force-dynamic"
