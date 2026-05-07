# Feature Requirement: Thailand Interactive Map & Tourist Attractions

## Overview

Display an interactive SVG map of Thailand's 77 provinces. Clicking a province on the map reveals its top-rated tourist attractions in a side panel, sorted by popularity (viewer count). Attraction data is fetched live from the **TAT Data API v2** (Tourism Authority of Thailand). Static data in `src/data/thailand.ts` is the fallback when no API key is set or when the API call fails.

---

## User Stories

| ID | As a… | I want to… | So that… |
|----|-------|-----------|----------|
| US-01 | Visitor | Click a province on the Thailand map | I can select a region visually without typing |
| US-02 | Visitor | See the selected province highlighted on the map | I know which province is active |
| US-03 | Visitor | See tourist attractions sorted by popularity (highest first) | I discover the most visited places immediately |
| US-04 | Visitor | Filter attractions by category (nature, temple, beach, etc.) | I find places matching my travel interest |
| US-05 | Visitor | See each attraction's category and a brief description | I can evaluate whether to visit |
| US-06 | Visitor | See a prompt when no province is selected | I understand I need to click the map to begin |
| US-07 | Visitor | See an empty state when no attractions match the filter | I understand there is no data, not a broken UI |

---

## API: TAT Data API v2

**Base URL:** `https://tatdataapi.io/api/v2` (accessed via `/tat-api` proxy to avoid CORS)  
**Auth:** `x-api-key: {API_KEY}` request header  
**Docs:** https://tatdataapi.io/api/docs-json  
**CORS:** TAT API does not allow browser requests directly — all calls go through a proxy:
- **Dev:** Vite proxy (`/tat-api` → `https://tatdataapi.io/api/v2`) configured in `vite.config.ts`
- **Production:** Nginx `proxy_pass` configured in `nginx.conf`

### How to Get an API Key

1. Register at **https://tatdataapi.io**
2. Obtain your API key from the developer console
3. Paste it into your `.env` file:
   ```bash
   VITE_TAT_API_KEY=your_key_here
   ```
4. Restart the dev server — the app switches from static data to live TAT data automatically

### Environment Variable

```bash
# .env
VITE_TAT_API_KEY=your_key_here
```

`.env.example` contains `VITE_TAT_API_KEY=` (blank value as placeholder).

### Endpoint Used

```
GET /places
  ?province_id={province.tatId}    # TAT numeric province ID (stored in Province.tatId)
  &place_category_id=3             # 3 = Attraction only
  &limit=10
  &has_name=true
  &has_thumbnail=true
  &keyword={categoryKeyword}       # optional — see table below
Accept-Language: en
x-api-key: {VITE_TAT_API_KEY}
```

Response shape:
```json
{
  "data": [
    {
      "placeId": "6235",
      "name": "Doi Inthanon National Park",
      "introduction": "Highest peak in Thailand...",
      "category": { "categoryId": 3, "name": "Attraction" },
      "latitude": "18.5883",
      "longitude": "98.4867",
      "thumbnailUrl": ["https://dmc.tatdataapi.io/assets/photo.jpg"],
      "viewer": 510
    }
  ],
  "pagination": { "pageNumber": 1, "pageSize": 10, "total": 543 }
}
```

> `rating` is not provided by TAT API — defaults to `4.0` for all attractions.  
> `viewer` (view count) is used for sorting: higher viewer count = shown first.  
> `introduction` may be `null` — displayed as empty string.

### Category Keyword Mapping

TAT API has no attraction sub-categories. Category filtering uses the `keyword` param:

| `AttractionCategory` | `keyword` param | Label |
|----------------------|----------------|-------|
| `nature` | _(omit keyword)_ | All attractions |
| `temple` | `temple` | Temple / Shrine |
| `beach` | `beach` | Beach |
| `museum` | `museum` | Museum |
| `market` | `market` | Market |
| `waterfall` | `waterfall` | Waterfall |
| `viewpoint` | `viewpoint` | Viewpoint |
| `historical` | `historical` | Historical Site |
| `all` | _(omit keyword)_ | All types |

---

## Data Model

### Province (static, stored in `src/data/thailand.ts`)

```ts
interface Province {
  id: string       // slugified TopoJSON NAME_1, e.g. "chiang-mai"
  name: string     // English (matches TopoJSON NAME_1 exactly)
  nameTh: string   // Thai name: "เชียงใหม่"
  tatName: string  // English display name
  tatId: number    // TAT Data API numeric province ID (used in API calls)
  region: Region
}

type Region = "north" | "south" | "east" | "west" | "central" | "northeast"
```

### Attraction (derived from TAT API response or static data)

```ts
interface Attraction {
  id: string            // TAT placeId (or static string for fallback data)
  name: string
  provinceId: string    // matched from selectedProvince.id
  category: AttractionCategory
  rating: number        // always 4.0 (TAT API does not provide ratings)
  description: string   // from TAT `introduction`; empty string if null
  imageUrl: string      // first item of TAT `thumbnailUrl[]`; empty string if none
  coordinates: { lat: number; lon: number }
}

type AttractionCategory =
  | "nature" | "temple" | "beach" | "museum"
  | "market" | "waterfall" | "viewpoint" | "historical"
```

---

## Static Data (Fallback)

- **File:** `src/data/thailand.ts`
- `PROVINCES: Province[]` — 77 provinces with Thai names, TAT IDs, and bounding region
- `STATIC_ATTRACTIONS: Attraction[]` — 3 attractions per province for 10 key provinces
- Activated automatically when `VITE_TAT_API_KEY` is unset:
  ```ts
  const USE_STATIC = !import.meta.env.VITE_TAT_API_KEY
  ```
- Also used as silent fallback when the API call throws (network error, rate limit)
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

**Live (TAT) flow:**
1. `GET /tat-api/places?province_id={province.tatId}&place_category_id=3&limit=10&has_name=true&has_thumbnail=true[&keyword={category}]`
2. Filter out places with null names
3. Sort by `viewer` desc (most viewed first)
4. Map response `data[]` → `Attraction[]` (rating defaults to 4.0)
5. On any error → silently return static data for the same province + filter

**Static flow:** filter `STATIC_ATTRACTIONS` by `provinceId` → filter by `category` → sort by `rating` desc

**Query key:** `["attractions", province.id, filter]` — registered in `src/constants/queryKeys.ts`

**Retry:** `retry: false` — fail fast then fall back to static

---

## UI Components

### `ThailandMap`

- **Path:** `src/components/thailand/ThailandMap.tsx`
- SVG map via `react-simple-maps` + `<Geographies>` from `public/data/thailand-provinces.json`
- 77 province `<Geography>` paths (lake boundary geometries filtered out)
- Province fill color is **region-based** (muted dark tones):

| Region | Default fill | Hover fill |
|--------|-------------|------------|
| north | `#243D6B` | `#2E4F85` |
| northeast | `#3D2580` | `#4D2F9A` |
| central | `#245340` | `#2E6B52` |
| south | `#533B24` | `#6B4D2E` |
| east | `#245454` | `#2E6B6B` |
| west | `#54402A` | `#6B5235` |

- **Map background:** `#0E1020` (dark navy, ocean-like)
- **Selected province:** `fill: #6366F1` (primary)
- **Stroke:** `#2D2D3E` default, `#6366F1` on hover/selected
- **Tooltip:** province `name` + `nameTh` on hover
- `useReducedMotion()` disables hover transition (ADR-003)

### `AttractionCard`

- **Path:** `src/components/thailand/AttractionCard.tsx`
- Displays: image (emoji fallback by category if no URL), name, category badge, `StarRating`, description
- Hover: CSS `transition` only — `border-color` to `primary/40`

### `StarRating`

- **Path:** `src/components/thailand/StarRating.tsx`
- Props: `rating: number` (1.0–5.0)
- Full / half / empty SVG stars + numeric value

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

---

## Homepage Integration

`ThailandCard` component (`src/components/home/ThailandCard.tsx`) renders in the **More Projects** grid on `HomePage`. It links to `/thailand` and uses a map-gradient thumbnail matching the region color palette.

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
│   region-colored          │  AttractionCard ★★★★★  4.0  │
│   background #0E1020      │  AttractionCard ★★★★★  4.0  │
│   click province          │  AttractionCard ★★★★★  4.0  │
│   → highlighted primary   │  (sorted by viewer count)    │
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

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react-simple-maps` | ^3.0.0 | SVG map rendering |
| `@types/react-simple-maps` | ^3.0.0 | TypeScript types |
| `topojson-client` | ^3.1.0 | TopoJSON type support |
| `@types/topojson-client` | ^3.1.4 | TypeScript types |
| `prop-types` | ^15.8.1 | Peer dependency of react-simple-maps |

Map data: `public/data/thailand-provinces.json` (~4.5 MB TopoJSON, public domain via GADM)

---

## Acceptance Criteria

- [x] Thailand SVG map renders all province boundaries with region-based colors
- [x] Hover highlights province with brighter region tone + shows tooltip (name EN + TH)
- [x] Clicking selects province — fill changes to primary (`#6366F1`)
- [x] `VITE_TAT_API_KEY` unset → static data loads silently
- [x] `VITE_TAT_API_KEY` set → TAT API called via proxy with `province_id` + optional `keyword`
- [x] Results sorted by `viewer` count desc (most popular first)
- [x] API error → silent fallback to static data (no error state shown)
- [x] Category pills filter via keyword param — triggers new query
- [x] Province change resets category to "All" and re-fetches
- [x] Idle / loading / empty states render correctly
- [x] Desktop: map left 55% / panel right 45%, panel sticky
- [x] Mobile: map stacked above panel, full width
- [x] `useReducedMotion()` disables hover transitions (ADR-003)
- [x] CORS handled via Vite proxy (dev) and Nginx proxy (production)
- [x] `ThailandCard` appears in "More Projects" section on HomePage
- [x] `npm run type-check` passes

---

## Out of Scope (Phase 1)

- User-submitted ratings
- Zoom / pan on the map
- Deep-link URL per province (`/thailand/chiang-mai`)
- Pagination beyond 10 results
- Favorites / bookmarking
- Server-side caching of TAT API responses

---

## Known Limitations (Phase 1)

| Limitation | Detail |
|-----------|--------|
| Static coverage | Only 10 provinces have fallback attraction data |
| No ratings | TAT API does not provide attraction ratings — all display as 4.0 stars |
| Keyword filtering | TAT API has no sub-categories; keyword search may miss some relevant places |
| CORS proxy required | TAT API blocks browser requests — must go through proxy |

---

## Future Phases

| Phase | Addition |
|-------|----------|
| 2 | NestJS backend caches TAT API responses (reduce latency, add rate-limit protection) |
| 3 | Admin panel to curate/override attraction data per province |
| 4 | Deep-link routes per province with SEO meta tags |
| 4 | Map zoom / pan controls |
