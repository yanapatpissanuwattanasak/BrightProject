# Rock Paper Scissors Game — Feature Plan

## Overview

เกมเป่ายิ้งฉุบแบบ turn-based ระหว่างผู้เล่นกับ Bot  
ผู้เล่นเลือกตัวละครจาก `src/data/hero/` แล้วต่อสู้กัน  
ใครแพ้ครบ 3 ครั้งก่อนแพ้เกม

---

## Files ที่ต้องสร้าง / แก้ไข

| Action | File | หน้าที่ |
|--------|------|---------|
| สร้าง | `src/pages/RpsPage.tsx` | หน้าเกมหลัก (standalone) |
| สร้าง | `src/data/hero.ts` | โหลด hero GIF ทั้งหมดจาก folder |
| แก้ไข | `src/constants/routes.ts` | เพิ่ม `RPS: '/rps'` |
| แก้ไข | `src/App.tsx` | register route `/rps` → `RpsPage` |

---

## Hero Data — `src/data/hero.ts`

ใช้ `import.meta.glob` อ่านทุกไฟล์ใน `hero/` อัตโนมัติ  
ไม่ต้อง hardcode ชื่อไฟล์ — เพิ่มไฟล์ใน folder → โผล่ในเกมทันที

```ts
const modules = import.meta.glob('./hero/*.gif', { eager: true })

export interface Hero {
  id: number
  name: string
  src: string
}

export const HEROES: Hero[] = Object.entries(modules).map(([path, mod], i) => ({
  id: i,
  name: `Hero ${i + 1}`,
  src: (mod as { default: string }).default,
}))
```

---

## Game State

```ts
type Phase = 'select' | 'battle' | 'gameover'
type Choice = 'rock' | 'paper' | 'scissors'
type RoundResult = 'win' | 'lose' | 'draw' | null

interface GameState {
  phase: Phase
  playerHero: Hero | null
  botHero: Hero | null        // สุ่มจาก HEROES ตอนผู้เล่นกดเลือกตัวละคร
  playerHp: number            // 0–3
  botHp: number               // 0–3
  playerChoice: Choice | null
  botChoice: Choice | null
  roundResult: RoundResult
  isRevealing: boolean        // true ช่วงแสดงผลก่อน reset
}
```

---

## Screen Flow

```
[Select Screen]
  ─ แสดง grid ของ Hero ทั้งหมดจาก HEROES
  ─ กดเลือก Hero → สุ่ม botHero → เข้า battle phase

[Battle Screen]
  ─ ผู้เล่นกด ✊ / ✋ / ✌️
  ─ Bot สุ่ม choice พร้อมกัน
  ─ แสดง choice ทั้งสองฝั่ง + ผลลัพธ์ (1.2s)
  ─ ลด HP ฝั่งที่แพ้ + animation
  ─ ถ้า HP ใดถึง 0 → gameover phase

[Game Over Screen]
  ─ แสดง Win / Lose
  ─ ปุ่ม "เล่นใหม่" → reset กลับ select phase
```

---

## Battle Screen Layout

```
┌──────────────────────────────────────────────┐
│                  ← กลับ (top-left)            │
├──────────────────────────────────────────────┤
│                                              │
│  ❤️ ❤️ ❤️   Player        Bot   ❤️ ❤️ ❤️  │  ← HP bars
│                                              │
│  ┌──────────┐              ┌──────────┐      │
│  │          │              │          │      │
│  │  GIF     │   VS         │  GIF     │      │  ← Heroes
│  │ (ปกติ)   │              │ (flip X) │      │
│  └──────────┘              └──────────┘      │
│   Player                       Bot           │
│                                              │
│         ✊        ✋        ✌️              │  ← Choice buttons
│                                              │
│            [ ผลลัพธ์ round ]                 │  ← Result overlay
│                                              │
└──────────────────────────────────────────────┘
```

- **Player hero** — แสดง GIF ปกติ ฝั่งซ้าย
- **Bot hero** — `transform: scaleX(-1)` หันหน้าเข้าหาผู้เล่น ฝั่งขวา
- **Choice reveal** — แสดง icon ✊/✋/✌️ เหนือหัวตัวละครทั้งสองฝั่ง
- **Result text** — WIN / LOSE / DRAW กลางหน้าจอ fade in/out
- **HP** — ❤️ 3 ดวงต่อฝ่าย ดวงที่หายมี fade+shake animation
- **ตัวละคร** — มี shake animation เมื่อโดน hit

---

## RPS Logic

```ts
function resolveRound(player: Choice, bot: Choice): RoundResult {
  if (player === bot) return 'draw'
  if (
    (player === 'rock'     && bot === 'scissors') ||
    (player === 'scissors' && bot === 'paper')   ||
    (player === 'paper'    && bot === 'rock')
  ) return 'win'
  return 'lose'
}
```

---

## Animations (Framer Motion)

| ชนิด | Target | Effect |
|------|--------|--------|
| Hero shake | ตัวละครที่แพ้ round | `x: [0, -8, 8, -6, 6, 0]` duration 0.4s |
| HP heart lose | หัวใจที่หาย | scale 0→1.3→0 + opacity 1→0 |
| Choice reveal | icon เหนือหัว hero | opacity + y: 10→0 delay เล็กน้อย |
| Result text | กลางหน้าจอ | scale 0.8→1.05→1 + opacity fade |
| Phase transition | ทุก phase | AnimatePresence mode="wait" |
| Game over | overlay | opacity 0→1 + y 20→0 |

---

## Route & App Registration

**`src/constants/routes.ts`** — เพิ่ม:
```ts
RPS: '/rps-game',
```

**`src/App.tsx`** — เพิ่ม route ใต้ TAROT (standalone ไม่ครอบด้วย RootLayout):
```tsx
<Route path={ROUTES.RPS} element={<RpsPage />} />
```

---

## Design Style

- Background: `bg-[#07050f]` + Aurora orbs เหมือน TarotPage
- Font: white / indigo tones
- Card select: border glow เมื่อ hover
- ปุ่ม choice: rounded-xl ขนาดใหญ่ พร้อม icon emoji + label
- HP hearts: ❤️ เต็ม / 🖤 หมด

---

## Constraints

- ไม่มี API / Firebase — logic ทั้งหมดเป็น client-side state
- ไม่มี test suite (ตาม project convention)
- Standalone page — ไม่ใช้ RootLayout (ไม่มี nav/footer)
- Hero ใหม่เพิ่มได้โดยวางไฟล์ `.gif` ใน `src/data/hero/` เท่านั้น
