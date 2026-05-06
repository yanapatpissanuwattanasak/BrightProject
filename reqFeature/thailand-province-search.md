# Feature Requirement: Thailand Interactive Map & Tourist Attractions

## Overview

Display an interactive SVG map of Thailand's 77 provinces. Clicking a province on the map reveals its top-rated tourist attractions in a side panel, sorted by rating. Attraction data is fetched live from the **Foursquare Places API v3** (free tier, 1 000 req/day, no credit card). Static data in `src/data/thailand.ts` is always the fallback when no API key is set or when the API call fails.

> **Note:** TAT API (`tatapi.tourismthailand.org`) was evaluated but found to be unreachable (domain returns 404 for all endpoints). Replaced by Foursquare.

---

## User Stories

| ID | As a… | I want to… | So that… |
|----|-------|-----------|----------|
| US-01 | Visitor | Click a province on the Thailand map | I can select a region visually without typing |
| US-02 | Visitor | See the selected province highlighted on the map | I know which province is active |
| US-03 | Visitor | See tourist attractions sorted by rating (highest first) | I discover the most recommended places immediately |
| US-04 | Visitor | Filter attractions by category (nature, temple, beach, etc.) | I find places matching my travel interest |
| US-05 | Visitor | See each attraction's rating, category, and a brief description | I can evaluate whether to visit |
| US-06 | Visitor | See a prompt when no province is selected | I understand I need to click the map to begin |
| US-07 | Visitor | See an empty state when no attractions match the filter | I understand there is no data, not a broken UI |

---

## API: Foursquare Places API v3

**Base URL:** `https://api.foursquare.com/v3`  
**Auth:** `Authorization: fsq3{API_KEY}` request header (no "Bearer" prefix)  
**Free tier:** 1 000 API calls/day · no credit card required  
**Docs:** https://docs.foursquare.com/developer/reference/place-search

### How to Get a Free API Key

1. Go to **https://foursquare.com/developers** and click **Sign Up**
2. Create an account (email or Google/GitHub login)
3. From the dashboard, click **Create a new project**
4. Give the project any name (e.g., "thailand-map")
5. Under **API Keys**, copy the key that starts with `fsq3…`
6. Paste it into your `.env` file:
   ```bash
   VITE_FOURSQUARE_API_KEY=fsq3xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
7. Restart the dev server — the app switches from static data to live Foursquare data automatically

> The free Personal plan gives 1 000 place searches per day. No payment info needed.

### Environment Variable

```bash
# .env
VITE_FOURSQUARE_API_KEY=fsq3your_key_here
```

`.env.example` contains `VITE_FOURSQUARE_API_KEY=` (blank value as placeholder).

### Endpoint Used

```
GET /places/search
  ?near={province.tatName}, Thailand   # e.g. "Chiang Mai, Thailand"
  &categories={fsqCategoryIds}          # comma-separated IDs (see table below)
  &limit=10
  &fields=fsq_id,name,categories,rating,description,geocodes,photos
Authorization: fsq3{VITE_FOURSQUARE_API_KEY}
```

Response shape:
```json
{
  "results": [
    {
      "fsq_id": "4b058804f964a520b2a822e3",
      "name": "Doi Inthanon National Park",
      "categories": [{ "id": 16032, "name": "Nature Reserve" }],
      "rating": 9.2,
      "description": "Highest peak in Thailand...",
      "geocodes": { "main": { "latitude": 18.5883, "longitude": 98.4867 } },
      "photos": [{ "prefix": "https://fastly.4sqi.net/img/general/", "suffix": "/photo.jpg" }]
    }
  ]
}
```

> `rating` is on a **0–10 scale** in Foursquare. Divide by 2 to convert to 0–5 stars.  
> `description` and `photos` are available on the free Personal plan.  
> `rating` may be absent for venues with few check-ins — default to `4.0` when missing.

### Foursquare Category ID Mapping

| `AttractionCategory` | Foursquare `categories` IDs | Label |
|----------------------|----------------------------|-------|
| `nature` | `16032,16034,16020` | Nature Reserve, Park, Garden |
| `temple` | `12104` | Temple |
| `beach` | `16019` | Beach |
| `museum` | `10028,10026` | Museum, Art Museum |
| `market` | `17066,17114` | Flea Market, Market |
| `waterfall` | `16042` | Waterfall |
| `viewpoint` | `16046` | Scenic Lookout |
| `historical` | `10027,10017` | Historic Site, Architecture |
| `all` | _(omit `categories` param)_ | All types |

### Rating Conversion

| Foursquare `rating` | Display stars |
|---------------------|--------------|
| 9.0 – 10.0 | ★★★★★ 4.5 – 5.0 |
| 7.0 – 8.9 | ★★★★ 3.5 – 4.4 |
| 5.0 – 6.9 | ★★★ 2.5 – 3.4 |
| < 5.0 or missing | ★★★★ 4.0 (default) |

Formula: `displayRating = fsqRating / 2`, clamped to `[1.0, 5.0]`.

---

## Data Model

### Province (static, stored in `src/data/thailand.ts`)

```ts
interface Province {
  id: string       // slugified TopoJSON NAME_1, e.g. "chiang-mai"
  name: string     // English (matches TopoJSON NAME_1 exactly)
  nameTh: string   // Thai name: "เชียงใหม่"
  tatName: string  // English name passed to Foursquare `near` param
  region: Region
}

type Region = "north" | "south" | "east" | "west" | "central" | "northeast"
```

### Attraction (derived from Foursquare response or static data)

```ts
interface Attraction {
  id: string            // Foursquare fsq_id (or static string for fallback data)
  name: string
  provinceId: string    // matched from selectedProvince.id
  category: AttractionCategory
  rating: number        // 1.0 – 5.0 (converted from Foursquare 0–10)
  description: string   // truncated to 200 chars; empty string if unavailable
  imageUrl: string      // Foursquare photo URL; empty string if unavailable
  coordinates: { lat: number; lon: number }
}

type AttractionCategory =
  | "nature" | "temple" | "beach" | "museum"
  | "market" | "waterfall" | "viewpoint" | "historical"
```

---

## Static Data (Fallback)

- **File:** `src/data/thailand.ts`
- `PROVINCES: Province[]` — 76 provinces with Thai names and bounding region
- `STATIC_ATTRACTIONS: Attraction[]` — 3 attractions per province for 10 key provinces
- Activated automatically when `VITE_FOURSQUARE_API_KEY` is unset:
  ```ts
  const USE_STATIC = !import.meta.env.VITE_FOURSQUARE_API_KEY
  ```
- Also used as silent fallback when the API call throws (network error, CORS, rate limit)
- Key provinces covered: Bangkok, Chiang Mai, Phuket, Krabi, Chiang Rai, Ayutthaya, Kanchanaburi, Nakhon Ratchasima, Phetchabun, Surat Thani

---

## Hook Design

### `useAttractionsByProvince`

```ts
// src/hooks/useAttractionsByProvince.ts
function useAttractionsByProvince(
  province: Province | null,
  filter: AttractionFilter = 'all'
): UseQueryResult<Attraction[]>
```

**When `province` is null:** query disabled (`enabled: false`)

**Live (Foursquare) flow:**
1. `GET /places/search?near={province.tatName}, Thailand&categories={ids}&limit=10&fields=…`
2. Map response `results[]` → `Attraction[]` (divide rating by 2, build photo URL)
3. Sort by `rating` desc
4. On any error → silently return static data for the same province + filter

**Static flow:** filter `STATIC_ATTRACTIONS` by `provinceId` → filter by `category` → sort by `rating` desc

**Query key:** `["attractions", province.id, filter]` — registered in `src/constants/queryKeys.ts`

**Retry:** `retry: false` — fail fast then fall back to static; don't hammer the API

---

## UI Components

### `ThailandMap`

- **Path:** `src/components/thailand/ThailandMap.tsx`
- SVG map via `react-simple-maps` + `<Geographies>` from `public/data/thailand-provinces.json`
- 76 province `<Geography>` paths (lake boundary geometries filtered out)
- **States per path:**
  - Default: `fill: surface-raised`, `stroke: surface-border`
  - Hover: lighter fill, `stroke: primary`, CSS `transition` only
  - Selected: `fill: primary`
- **Tooltip:** province `name` + `nameTh` on hover (CSS-positioned div, pointer-events-none)
- **Props:**
  ```ts
  interface ThailandMapProps {
    selectedProvinceId: string | null
    onProvinceClick: (province: Province) => void
  }
  ```
- `useReducedMotion()` disables hover transition (ADR-003)

### `AttractionCard`

- **Path:** `src/components/thailand/AttractionCard.tsx`
- Displays: image (emoji fallback by category if no URL), name, category badge, `StarRating`, description
- Hover: CSS `transition` only — `border-color` to `primary/40`
- `isLoading` prop renders skeleton layout

### `StarRating`

- **Path:** `src/components/thailand/StarRating.tsx`
- Props: `rating: number` (1.0–5.0)
- Full / half / empty SVG stars + numeric value (e.g. `4.6`)

### `CategoryFilter`

- **Path:** `src/components/thailand/CategoryFilter.tsx`
- Scrollable row of pill buttons: `All` + one per `AttractionCategory`
- Active: `bg-primary text-white` · Inactive: `bg-surface-raised border border-surface-border`
- Changing category does not reset the selected province

### `AttractionPanel`

- **Path:** `src/components/thailand/AttractionPanel.tsx`
- Composes `CategoryFilter` + scrollable `AttractionCard` list
- States:
  - **Idle** (no province): map emoji + "คลิกที่จังหวัดบนแผนที่เพื่อดูสถานที่ท่องเที่ยว"
  - **Loading:** 3 skeleton cards
  - **Empty:** "ไม่พบสถานที่ท่องเที่ยวสำหรับหมวดหมู่นี้"
  - **Error:** never shown — error silently falls back to static data
- Province `nameTh` + `name` as panel heading

---

## Page

### Route

```
/thailand
```

Rendered under `<RootLayout>` (nav + footer). Registered in `src/constants/routes.ts` as `ROUTES.THAILAND`.

### Layout — Desktop (lg+)

```
┌──────────────────────────────────────────────────────────┐
│  Hero: "Explore Thailand"  subtitle (Thai)               │
├───────────────────────────┬──────────────────────────────┤
│                           │  [Province nameTh / idle]    │
│   ThailandMap             │  CategoryFilter pills        │
│   SVG  (~55% width)       ├──────────────────────────────┤
│                           │  AttractionCard ★★★★★  4.9  │
│   click province          │  AttractionCard ★★★★½  4.6  │
│   → highlighted primary   │  AttractionCard ★★★★   4.2  │
│                           │  (scrollable, max 10 items)  │
└───────────────────────────┴──────────────────────────────┘
  Panel: sticky top-6, max-height 100vh − 6rem, overflow-hidden
```

### Layout — Mobile (< lg)

```
┌─────────────────────────┐
│  Hero                   │
├─────────────────────────┤
│  ThailandMap (full w)   │
├─────────────────────────┤
│  AttractionPanel        │
│  (stacked, full w)      │
└─────────────────────────┘
```

- **File:** `src/pages/ThailandPage.tsx`
- State: `selectedProvince: Province | null`, `filter: AttractionFilter`
- Province change → resets `filter` to `'all'`

---

## Sorting & Filtering Logic

| Behavior | Detail |
|----------|--------|
| Default sort | `rating` descending |
| Tie-breaking | alphabetical by `name` |
| Category filter | Client-side after API response; does not re-fetch |
| Province change | Resets filter to `'all'`, triggers new query |
| Max results | 10 per search (Foursquare `limit=10`) |
| Rating default | `4.0` when Foursquare `rating` field is absent |

---

## Map Interaction States

| State | Province fill | Stroke | Tooltip | Panel |
|-------|--------------|--------|---------|-------|
| Idle | `surface-raised` | `surface-border` | — | Idle prompt |
| Hover | `#1a1a2e` | `primary` | name + nameTh | unchanged |
| Selected | `primary` | `primary` | — | Attractions list |
| Selected + hover | `primary` | `primary` | name + nameTh | unchanged |

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react-simple-maps` | ^3.0.0 | SVG map rendering |
| `@types/react-simple-maps` | ^3.0.0 | TypeScript types for react-simple-maps |
| `topojson-client` | ^3.1.0 | TopoJSON type support |
| `@types/topojson-client` | ^3.1.4 | TypeScript types |
| `prop-types` | ^15.8.1 | Peer dependency of react-simple-maps |

Map data: `public/data/thailand-provinces.json` (~4.5 MB TopoJSON, public domain via GADM, 76 provinces + 2 lake geometries filtered at render time)

---

## Acceptance Criteria

- [x] Thailand SVG map renders all province boundaries
- [x] Hover highlights province + shows tooltip (name EN + TH)
- [x] Clicking selects province — fill changes to primary
- [x] `VITE_FOURSQUARE_API_KEY` unset → static data loads silently
- [x] `VITE_FOURSQUARE_API_KEY` set → Foursquare API called with `near` + `categories`
- [x] Foursquare rating (0–10) converted to display stars (0–5)
- [x] API error → silent fallback to static data (no error state shown)
- [x] Results sorted by `rating` desc (highest first)
- [x] Category pills filter client-side without re-fetching
- [x] Province change resets category to "All" and re-fetches
- [x] Idle / loading / empty states render correctly
- [x] Desktop: map left 55% / panel right 45%, panel sticky
- [x] Mobile: map stacked above panel, full width
- [x] `useReducedMotion()` disables hover transitions (ADR-003)
- [x] `npm run type-check` passes

---

## Out of Scope (Phase 1)

- User-submitted ratings
- Zoom / pan on the map
- Deep-link URL per province (`/thailand/chiang-mai`)
- Pagination beyond 10 results
- Favorites / bookmarking

---

## Known Limitations (Phase 1)

| Limitation | Detail |
|-----------|--------|
| Static coverage | Only 10 provinces have fallback attraction data |
| Foursquare free tier | 1 000 req/day shared across all visitors |
| Rating availability | Foursquare omits `rating` for venues with few check-ins → defaults to 4.0 |
| No CORS proxy | Foursquare supports browser CORS; TAT API did not |

---

## Future Phases

| Phase | Addition |
|-------|----------|
| 2 | Railway API caching Foursquare responses (reduce daily quota pressure) |
| 3 | Admin panel to curate/override attraction data per province |
| 4 | Deep-link routes per province with SEO meta tags |
| 4 | Map zoom / pan controls |
