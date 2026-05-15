export interface AQILevel {
  min: number
  max: number
  label: string
  emoji: string
  bg: string
  accentColor: string
  particleRgb: string   // "r,g,b" for canvas rgba()
  particleCount: number
  particleSpeed: number
  advice: string
  tip: string
  animation: 'good' | 'moderate' | 'sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous'
}

export const AQI_LEVELS: AQILevel[] = [
  {
    min: 0, max: 50,
    label: 'อากาศดี', emoji: '🌿',
    bg: 'linear-gradient(160deg, #0EA5E9 0%, #38BDF8 45%, #7DD3FC 100%)',
    accentColor: '#0EA5E9',
    particleRgb: '255,255,255',
    particleCount: 8,
    particleSpeed: 0.4,
    advice: 'อากาศบริสุทธิ์ เหมาะสำหรับกิจกรรมกลางแจ้งทุกประเภท ออกกำลังกายได้เต็มที่',
    tip: 'วันนี้อากาศดีมาก ออกไปสูดอากาศบริสุทธิ์ได้เลย 🌿',
    animation: 'good',
  },
  {
    min: 51, max: 100,
    label: 'ปานกลาง', emoji: '🌤️',
    bg: 'linear-gradient(160deg, #D97706 0%, #F59E0B 45%, #FCD34D 100%)',
    accentColor: '#F59E0B',
    particleRgb: '253,230,138',
    particleCount: 18,
    particleSpeed: 0.6,
    advice: 'ผู้ที่ไวต่อมลพิษอาจได้รับผลกระทบบ้าง ควรหลีกเลี่ยงการออกกำลังกายหนักกลางแจ้งเป็นเวลานาน',
    tip: 'อากาศพอใช้ได้ คนทั่วไปออกนอกบ้านได้ตามปกติ 🌤️',
    animation: 'moderate',
  },
  {
    min: 101, max: 150,
    label: 'ไม่ดีต่อกลุ่มเสี่ยง', emoji: '😷',
    bg: 'linear-gradient(160deg, #92400E 0%, #D97706 45%, #F59E0B 100%)',
    accentColor: '#D97706',
    particleRgb: '217,119,6',
    particleCount: 30,
    particleSpeed: 1.1,
    advice: 'เด็ก ผู้สูงอายุ และผู้ป่วยโรคระบบทางเดินหายใจควรลดกิจกรรมกลางแจ้ง และสวมหน้ากากอนามัย',
    tip: 'กลุ่มเสี่ยงควรสวมหน้ากากเมื่อออกนอกบ้าน 😷',
    animation: 'sensitive',
  },
  {
    min: 151, max: 200,
    label: 'ไม่ดี', emoji: '🌫️',
    bg: 'linear-gradient(160deg, #7C2D12 0%, #9A3412 45%, #C2410C 100%)',
    accentColor: '#EA580C',
    particleRgb: '194,65,12',
    particleCount: 40,
    particleSpeed: 1.6,
    advice: 'ทุกคนอาจได้รับผลกระทบ ควรสวมหน้ากาก N95 ลดกิจกรรมกลางแจ้ง และปิดหน้าต่างบ้าน',
    tip: 'หลีกเลี่ยงการออกนอกบ้าน สวมหน้ากาก N95 เสมอ 🌫️',
    animation: 'unhealthy',
  },
  {
    min: 201, max: 300,
    label: 'อันตรายมาก', emoji: '⚠️',
    bg: 'linear-gradient(160deg, #2E1065 0%, #4C1D95 45%, #6D28D9 100%)',
    accentColor: '#7C3AED',
    particleRgb: '124,58,237',
    particleCount: 50,
    particleSpeed: 2.2,
    advice: 'ทุกคนมีความเสี่ยงต่อสุขภาพอย่างมาก งดกิจกรรมกลางแจ้งทุกประเภท อยู่ในอาคารและเปิดเครื่องฟอกอากาศ',
    tip: 'อยู่ในอาคาร ปิดประตูหน้าต่าง เปิดเครื่องฟอกอากาศ ⚠️',
    animation: 'very-unhealthy',
  },
  {
    min: 301, max: Infinity,
    label: 'อันตราย', emoji: '☠️',
    bg: 'linear-gradient(160deg, #0D0005 0%, #450A0A 45%, #7F1D1D 100%)',
    accentColor: '#EF4444',
    particleRgb: '239,68,68',
    particleCount: 50,
    particleSpeed: 3.2,
    advice: 'ฉุกเฉิน! ห้ามออกนอกบ้านโดยเด็ดขาด ปิดประตูหน้าต่างให้สนิท สวมหน้ากาก N95 ในอาคาร และโทรหาแพทย์หากมีอาการ',
    tip: 'อย่าออกจากบ้าน! ปิดหน้าต่างสนิท สวมหน้ากาก N95 ☠️',
    animation: 'hazardous',
  },
]

export function getAQILevel(aqi: number): AQILevel {
  return AQI_LEVELS.find(l => aqi >= l.min && aqi <= l.max) ?? AQI_LEVELS[AQI_LEVELS.length - 1]
}

export function getAQIColor(aqi: number): string {
  return getAQILevel(aqi).accentColor
}
