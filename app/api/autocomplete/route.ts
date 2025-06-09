import { type NextRequest, NextResponse } from "next/server"

const GOOGLE_MAPS_API_KEY = "AIzaSyAoEItHnh7E9es3rgAXxrHILFtJspawPRI"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const input = searchParams.get("input")

    if (!input || input.length < 3) {
      return NextResponse.json({ predictions: [] })
    }

    console.log("Autocomplete for:", input)

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=address&key=${GOOGLE_MAPS_API_KEY}`

    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok) {
      console.error("Autocomplete API error:", response.status, response.statusText)
      return NextResponse.json({ error: `Autocomplete API error: ${response.status}` }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Autocomplete error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch autocomplete suggestions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export const dynamic = "force-dynamic"
