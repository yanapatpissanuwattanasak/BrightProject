import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { CategoryFilter } from './CategoryFilter'
import { AttractionCard } from './AttractionCard'
import { useAttractionsByProvince } from '@/hooks/useAttractionsByProvince'
import type { Province, AttractionFilter } from '@/types/thailand.types'

interface Props {
  province: Province | null
  filter: AttractionFilter
  onFilterChange: (f: AttractionFilter) => void
}

export function AttractionPanel({ province, filter, onFilterChange }: Props) {
  const { data, isLoading, isError } = useAttractionsByProvince(province, filter)

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div>
        {province ? (
          <>
            <p className="text-lg font-bold text-text-primary">{province.nameTh}</p>
            <p className="text-sm text-text-muted">{province.name}</p>
          </>
        ) : (
          <p className="text-sm text-text-muted">เลือกจังหวัด</p>
        )}
      </div>

      {/* Category filter */}
      <CategoryFilter value={filter} onChange={onFilterChange} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {!province && (
          <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
            <span className="text-4xl">🗺️</span>
            <p className="text-sm text-text-muted">คลิกที่จังหวัดบนแผนที่<br />เพื่อดูสถานที่ท่องเที่ยว</p>
          </div>
        )}

        {province && isLoading && (
          <>
            <AttractionCard isLoading />
            <AttractionCard isLoading />
            <AttractionCard isLoading />
          </>
        )}

        {province && isError && (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
            <span className="text-3xl">⚠️</span>
            <p className="text-sm text-text-muted">โหลดข้อมูลไม่สำเร็จ<br />กรุณาลองใหม่อีกครั้ง</p>
          </div>
        )}

        {province && !isLoading && !isError && data?.length === 0 && (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
            <span className="text-3xl">🔍</span>
            <p className="text-sm text-text-muted">ไม่พบสถานที่ท่องเที่ยว<br />สำหรับหมวดหมู่นี้</p>
          </div>
        )}

        {province && !isLoading && !isError && data && data.length > 0 &&
          data.map((attraction, i) => (
            <ScrollReveal key={attraction.id} delay={i * 0.08}>
              <AttractionCard attraction={attraction} />
            </ScrollReveal>
          ))
        }
      </div>
    </div>
  )
}
