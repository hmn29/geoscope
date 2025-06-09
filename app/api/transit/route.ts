import { type NextRequest, NextResponse } from "next/server"

const GOOGLE_MAPS_API_KEY = "AIzaSyAoEItHnh7E9es3rgAXxrHILFtJspawPRI"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = searchParams.get("radius") || "2000"

    if (!lat || !lng) {
      return NextResponse.json({ error: "Latitude and longitude parameters are required" }, { status: 400 })
    }

    console.log("Fetching transit data for:", lat, lng)

    // Fetch bus stations
    const busUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=bus_station&key=${GOOGLE_MAPS_API_KEY}`

    // Fetch train stations
    const trainUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=train_station&key=${GOOGLE_MAPS_API_KEY}`

    // Fetch subway stations
    const subwayUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=subway_station&key=${GOOGLE_MAPS_API_KEY}`

    const [busResponse, trainResponse, subwayResponse] = await Promise.all([
      fetch(busUrl),
      fetch(trainUrl),
      fetch(subwayUrl),
    ])

    const [busData, trainData, subwayData] = await Promise.all([
      busResponse.json(),
      trainResponse.json(),
      subwayResponse.json(),
    ])

    // Combine all transit results
    const allTransit = [...(busData.results || []), ...(trainData.results || []), ...(subwayData.results || [])]

    // Remove duplicates based on place_id
    const uniqueTransit = allTransit.filter(
      (place, index, self) => index === self.findIndex((p) => p.place_id === place.place_id),
    )

    console.log("Transit stations found:", uniqueTransit.length)

    return NextResponse.json({ results: uniqueTransit, status: "OK" })
  } catch (error) {
    console.error("Transit API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch transit data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export const dynamic = "force-dynamic"
