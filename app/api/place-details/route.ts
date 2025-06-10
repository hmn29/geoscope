import { type NextRequest, NextResponse } from "next/server"

const GOOGLE_MAPS_API_KEY = "AIzaSyAoEItHnh7E9es3rgAXxrHILFtJspawPRI"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const placeId = searchParams.get("place_id")

    if (!placeId) {
      return NextResponse.json({ error: "Place ID parameter is required" }, { status: 400 })
    }

    console.log("Fetching place details for:", placeId)

    const fields = [
      "place_id",
      "name",
      "vicinity",
      "formatted_address",
      "geometry",
      "types",
      "rating",
      "user_ratings_total",
      "price_level",
      "opening_hours",
      "photos",
      "website",
      "formatted_phone_number",
      "business_status"
    ].join(",")

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fields}&key=${GOOGLE_MAPS_API_KEY}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("Place Details API error:", response.status, response.statusText)
      return NextResponse.json({ error: `Place Details API error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    console.log("Place Details response status:", data.status)

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Place Details API status error:", data.status, data.error_message)
      return NextResponse.json({ error: `Place Details API failed: ${data.status}` }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Place Details API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch place details",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export const dynamic = "force-dynamic"