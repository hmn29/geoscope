# GeoScope Credit

**Location Intelligence Platform for Business Credit Assessment**

[**Live demo → geocred.vercel.app**](https://geocred.vercel.app)

---

## What is GeoScope Credit?

GeoScope Credit is a sophisticated location intelligence platform that analyzes business locations using Google Maps APIs and advanced mathematical algorithms. It generates a comprehensive **GeoScore (0-100)** that helps entrepreneurs, investors, and lenders make data-driven decisions about business locations.

### Key Features

- **Real-time Location Scoring** - Mathematical precision with transparent algorithms
- **Interactive 3D Maps** - Google Earth-style building visualization with 45° tilt views
- **Comprehensive Analytics** - Hourly traffic patterns and weekly trend analysis
- **Transit Analysis** - Public transportation accessibility scoring
- **Safety Assessment** - Crime risk and security infrastructure evaluation
- **Competition Analysis** - Market saturation and competitive landscape insights
- **Responsive Design** - Works seamlessly across all devices
- **Edge Performance** - Sub-second response times with global CDN

---

## Scoring Algorithm
GeoScope uses a **weighted average** of four critical factors:

```
GeoScore = (FootTraffic × 30%) + (Safety × 20%) + (Competition × 25%) + (Accessibility × 25%)
```
### Scoring Factors

| Factor | Weight | Description | Calculation Method |
|--------|--------|-------------|-------------------|
| **Foot Traffic** | 30% | Pedestrian activity and customer flow | Proximity-weighted analysis with exponential decay |
| **Safety Index** | 20% | Security and crime risk assessment | Positive factors vs risk factors with base score of 70 |
| **Competition** | 25% | Market saturation analysis | Multi-zone pressure calculation with distance weighting |
| **Accessibility** | 25% | Public transportation connectivity | Logarithmic scaling with transit variety bonus |

---

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Shadcn/ui** - Modern component library

### Backend & APIs
- **Google Maps Platform** - Core mapping and places data
  - Maps JavaScript API (3D buildings)
  - Places API (nearby search & details)
  - Geocoding API (address resolution)
  - Directions API (transit analysis)
- **Next.js API Routes** - Server-side processing
- **Vercel Edge Functions** - Global deployment

### Visualization
- **Chart.js** - Data visualization
- **Three.js** - 3D graphics and animations
- **Google Maps 3D** - Building visualization

---



## Setup 

### Prerequisites
- Node.js 18+ 
- Google Maps API key with enabled services
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sicaario/geoscope-credit.git
   cd geoscope-credit
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```
3. **Environment setup**
   
   Create `.env.local` in the root directory:
   ```env
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
   ```
4. **Google Maps API setup**
   
   Enable these APIs in [Google Cloud Console](https://console.cloud.google.com/):
   - Maps JavaScript API
   - Places API (New)
   - Geocoding API
   - Directions API

5. **Run development server**
   ```bash
   npm run dev
   ```
---
## Project Structure

```
geoscope-credit/
├── app/                    # Next.js 14 App Router
│   ├── analysis/          # Location analysis page
│   ├── docs/              # Documentation page
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/                # Shadcn/ui components
│   ├── map-view.tsx       # Interactive map component
│   ├── 3d-visualization.tsx # 3D graphics
│   └── location-autocomplete.tsx # Address input
├── lib/                   # Utility libraries
│   ├── location-store.ts  # Scoring algorithms
│   ├── google-maps.ts     # Maps API utilities
│   └── utils.ts           # Helper functions
└── public/                # Static assets
```
---

##  API Reference

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/geocode` | GET | Convert addresses to coordinates |
| `/api/places` | GET | Find nearby businesses and POIs |
| `/api/transit` | GET | Get public transit stations |
| `/api/place-details` | GET | Detailed place information |
| `/api/autocomplete` | GET | Address autocomplete suggestions |

---

##  Features in Detail

### 3D Building Visualization
- **Google Earth-style views** with 45° tilt and rotation
- **Real-time building data** from Google Maps Platform
- **Interactive controls** for exploring the area
- **Seamless 2D/3D switching** for different analysis needs

### Location Intelligence
- **Expandable accordion sections** for detailed insights
- **Real-time data updates** from Google Maps APIs
- **Comprehensive amenity analysis** with ratings and reviews
- **Transit accessibility scoring** with station details

### Mathematical Scoring
- **Deterministic algorithms** for consistent results
- **Proximity-weighted calculations** with exponential decay
- **Multi-zone competition analysis** for market insights
- **Stability metrics** for confidence assessment

 ---

## Security & Performance

### API Security
- **Field masking** to minimize API costs
- **Rate limiting** for production environments
- **Domain restrictions** for API key security
- **Error handling** with graceful fallbacks

### Performance Optimization
- **Edge deployment** on Vercel's global CDN
- **Client-side caching** for analyzed locations
- **Lazy loading** for map components
- **Bundle optimization** with Next.js

---

## License

[MIT](LICENSE) © 2025 Harmanpreet Singh
