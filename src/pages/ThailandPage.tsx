import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { ThailandMap } from '@/components/thailand/ThailandMap'
import { AttractionPanel } from '@/components/thailand/AttractionPanel'
import type { Province, AttractionFilter } from '@/types/thailand.types'

export default function ThailandPage() {
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null)
  const [filter, setFilter] = useState<AttractionFilter>('all')

  function handleProvinceClick(province: Province) {
    if (province.id !== selectedProvince?.id) {
      setFilter('all')
    }
    setSelectedProvince(province)
  }

  return (
    <>
      <Helmet>
        <title>Explore Thailand — Tourist Attractions by Province</title>
        <meta
          name="description"
          content="Click on any province to discover top-rated tourist attractions across Thailand."
        />
      </Helmet>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Hero */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-text-primary mb-3">Explore Thailand</h1>
          <p className="text-text-secondary text-sm max-w-md mx-auto">
            คลิกที่จังหวัดบนแผนที่เพื่อดูสถานที่ท่องเที่ยวที่น่าสนใจ เรียงตามคะแนนสูงสุด
          </p>
        </div>

        {/* Desktop: side-by-side | Mobile: stacked */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Map */}
          <div className="w-full lg:w-[55%]">
            <div className="rounded-card border border-surface-border bg-surface-raised p-4">
              <ThailandMap
                selectedProvinceId={selectedProvince?.id ?? null}
                onProvinceClick={handleProvinceClick}
              />
            </div>
          </div>

          {/* Panel */}
          <div className="w-full lg:w-[45%]">
            <div className="rounded-card border border-surface-border bg-surface-raised p-4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-hidden">
              <AttractionPanel
                province={selectedProvince}
                filter={filter}
                onFilterChange={setFilter}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
