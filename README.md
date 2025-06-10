# GeoScope Credit

Location‑aware credit‑scoring for small businesses
*Finance Track · Google Maps Platform Awards Hackathon 2025*

[**Live demo → geocred.vercel.app**](https://geocred.vercel.app)

---

![GeoScope Credit – Stack Overview](https://ik.imagekit.io/yh66k1zse/ChatGPT%20Image%20Jun%209%202025%20Project%20Overview.jpeg?updatedAt=1749476251841)
![GeoScope Credit – Request Lifecycle](https://ik.imagekit.io/yh66k1zse/PNG%20image%206.png?updatedAt=1749476263422)

---

## Why GeoScope?

Traditional credit bureaus rarely consider **where** a micro‑retailer operates. Yet rent, foot‑traffic and safety outside the door directly affect cash‑flow. **GeoScope Credit** turns raw Google Maps data into a transparent **GeoScore 0‑100** with a lender‑ready PDF report—all in ≈2 ms from a Vercel Edge Function.

|  Factor                   |  Why it matters                               |
| ------------------------- | --------------------------------------------- |
| **Foot Traffic Index**    | Predicts walk‑in sales                        |
| **Competition Density**   | Impacts local market share                    |
| **Safety Index**          | Affects insurance premiums & customer comfort |
| **Transit Accessibility** | Expands catchment area                        |

A straight average keeps the maths obvious for underwriters and easy to debug on the fly.

---

## Setup 

### 1. Clone & install

```bash
npm install --legacy-peer-deps 
```

### 2. Environment

Create a `.env.local` at the project root:

```env
GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
```

### 3. Run the dev server

```bash
npm run dev
```

Edge Functions run locally via Next.js middleware; no separate backend is required.

---


---

## Google Maps Platform & AI Building Blocks

|  Service                                       |  Used For                                                     |  Why AI Matters                                                                    |
| ---------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Maps JavaScript API**                        | Embeds the interactive map (+ Circle overlays, heatmaps)      | Handles vector rendering & smooth WebGL transitions                                |
| **Geocoding API**                              | Converts free‑text addresses to precise coordinates           | Supports GPT‑style autocompletion, typo tolerance                                  |
| **Places API — Nearby Search & Place Details** | Identifies shops, restaurants, schools etc. within 2 km       | *Places AI* surfaces live busyness & advanced fields (beta) for Foot‑Traffic Index |
| **Routes API (Directions – Transit mode)**     | Counts transit stops & computes peak travel‑time              | AI‑optimised routing ensures realistic accessibility scores                        |
| **Places AI: Foot‑Traffic Insights**           | (Beta) Returns hourly popularity without third‑party datasets | Replaces hacky web‑scrapes with a supported endpoint                               |
| **Maps SDK for Node.js**                       | Server‑side calls from Vercel Edge                            | Single SDK = smaller bundle → faster cold‑starts                                   |

> **Note** All requests use field‑masking to pay only for the data we need.

---

## Scoring Engine Explained

The engine lives in **`/lib/location‑store.ts`** and follows four steps:

1. **Bucketing nearby places**

   ```ts
   const allStores = nearby.filter(p => p.types?.includes('store'))
   const restaurants = nearby.filter(p => p.types?.includes('restaurant'))
   ```

2. **Factor functions** (Simplified):

   ```ts
   const footTraffic = getFootTrafficScore(coords, nearby)
   const safety      = getSafetyScore(coords, nearby)
   const accessibility = getAccessibilityScore(transitStations)
   const competition = scoreCompetition(relevantComps.length)
   ```

   *Circular‑area detection* checks whether the target falls inside a 200 m or 300 m radius of high/medium‑traffic generators (malls, transit hubs etc.).

3. **Straight average**

   ```ts
   const geoScore = Math.round((footTraffic + safety + competition + accessibility) / 4)
   ```

4. **Diagnostics** → hourly & weekly mock series and per‑factor rationale for full transparency.

> **No ML cold‑starts** — the score is 100 % deterministic and runs in O(*n*) over ≈200 JSON place results.
---

## Why I built this way

Traditional credit bureaus ignore the **place** a micro-retailer operates from, yet location can make or break cash-flow. **GeoScope Credit** analyses three geospatial signals today—and more to come—and returns a transparent **GeoScore 0-100** plus a lender-ready PDF report.

| Factor                       | Why it matters                                  | 
| ---------------------------- | ----------------------------------------------- |
| **Foot Traffic Index**       | Predicts walk-in sales                          |
| **Competition Density**      | Impacts market share                            | 
| **Safety Index**             | Affects insurance & customer comfort            | 
| **Transit Accessibility**    | Drives customer reach                           |


---

### Why a Straight Average?

- **Transparency for underwriters** – every factor contributes 25%; no hidden weightings.
- **Edge-friendly** – pure TypeScript, no ML model to cold-start; runs in ≈ 2 ms inside a Vercel Edge Function.
- **Easy to tune** – we can drop in a 5th factor (e.g., Prosperity Index) or switch to weighted average later.
- **Data-light** – heuristics based on domain rules work globally without a giant labelled dataset.

---

## License

[MIT](LICENSE) © 2025 Harmanpreet Singh
