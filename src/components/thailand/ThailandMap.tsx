import { useState } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { useReducedMotion } from 'framer-motion'
import { PROVINCES } from '@/data/thailand'
import type { Province } from '@/types/thailand.types'

const GEO_URL = '/data/thailand-provinces.json'

// Converts TopoJSON NAME_1 → Province.id slug
function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

const provinceById = Object.fromEntries(PROVINCES.map((p) => [p.id, p]))

const REGION_FILL: Record<string, { default: string; hover: string }> = {
  north:     { default: '#243D6B', hover: '#2E4F85' },
  northeast: { default: '#3D2580', hover: '#4D2F9A' },
  central:   { default: '#245340', hover: '#2E6B52' },
  south:     { default: '#533B24', hover: '#6B4D2E' },
  east:      { default: '#245454', hover: '#2E6B6B' },
  west:      { default: '#54402A', hover: '#6B5235' },
}
const FALLBACK_FILL = { default: '#1E1E2E', hover: '#28283E' }

interface Props {
  selectedProvinceId: string | null
  onProvinceClick: (province: Province) => void
}

interface Tooltip {
  name: string
  nameTh: string
  x: number
  y: number
}

export function ThailandMap({ selectedProvinceId, onProvinceClick }: Props) {
  const shouldReduce = useReducedMotion()
  const [tooltip, setTooltip] = useState<Tooltip | null>(null)

  return (
    <div className="relative w-full select-none" style={{ background: '#0E1020', borderRadius: 8 }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [101, 13], scale: 2400 }}
        width={500}
        height={720}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name: string = geo.properties.NAME_1 ?? ''
              // Skip lake boundary geometries
              if (name.includes('Songkhla Lake')) return null

              const id = toSlug(name)
              const province = provinceById[id]
              const isSelected = id === selectedProvinceId
              const regionFill = province ? (REGION_FILL[province.region] ?? FALLBACK_FILL) : FALLBACK_FILL

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => province && onProvinceClick(province)}
                  onMouseEnter={(e) => {
                    if (!province) return
                    const rect = (e.currentTarget as SVGElement)
                      .closest('svg')
                      ?.getBoundingClientRect()
                    const svgRect = (e.currentTarget as SVGElement)
                      .closest('.relative')
                      ?.getBoundingClientRect()
                    if (!rect || !svgRect) return
                    setTooltip({
                      name: province.name,
                      nameTh: province.nameTh,
                      x: e.clientX - svgRect.left,
                      y: e.clientY - svgRect.top,
                    })
                  }}
                  onMouseMove={(e) => {
                    if (!tooltip) return
                    const svgRect = (e.currentTarget as SVGElement)
                      .closest('.relative')
                      ?.getBoundingClientRect()
                    if (!svgRect) return
                    setTooltip((t) =>
                      t ? { ...t, x: e.clientX - svgRect.left, y: e.clientY - svgRect.top } : null,
                    )
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  style={{
                    default: {
                      fill: isSelected ? '#6366F1' : regionFill.default,
                      stroke: '#2D2D3E',
                      strokeWidth: 0.5,
                      outline: 'none',
                    },
                    hover: {
                      fill: isSelected ? '#6366F1' : regionFill.hover,
                      stroke: '#6366F1',
                      strokeWidth: 0.8,
                      outline: 'none',
                      transition: shouldReduce ? 'none' : 'fill 0.15s ease',
                    },
                    pressed: {
                      fill: '#4F46E5',
                      stroke: '#6366F1',
                      strokeWidth: 0.8,
                      outline: 'none',
                    },
                  }}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>

      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg bg-surface-raised border border-surface-border px-3 py-2 shadow-lg"
          style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
        >
          <p className="text-xs font-semibold text-text-primary leading-tight">{tooltip.name}</p>
          <p className="text-xs text-text-muted leading-tight">{tooltip.nameTh}</p>
        </div>
      )}
    </div>
  )
}
