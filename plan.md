# Plan: Time Box Feature Redesign

## Problem Statement

ระบบปัจจุบันบังคับให้ทุก block มี start/end time คงที่บน 24-hour grid ซึ่งไม่เหมาะสำหรับการจัดการงานในชีวิตจริง เพราะ:
- 1 block = 1 งาน เท่านั้น
- ต้องรู้เวลาชัดเจนก่อนจึงจะเพิ่มงานได้
- ไม่รองรับ "กลุ่มงาน" ที่ทำในช่วงเวลาเดียวกัน

## Goal

เปลี่ยนจาก **timeline grid** → **slot-based day board** ที่:
- แต่ละ "time slot" กำหนดเวลาแบบ optional (อาจมีหรือไม่มีก็ได้)
- ใน 1 slot ใส่ task ได้ไม่จำกัด เป็น checklist
- UI เหมาะสำหรับ plan + track งานใน 1 วัน

---

## New Data Model

### ก่อน (Block-based)
```typescript
Block {
  id, title, start, end,   // start/end เป็น minutes (required)
  typeId, color, note
}
DaySchedule { date, blocks: Block[] }
```

### หลัง (Slot + Task)
```typescript
Task {
  id: string
  title: string
  done: boolean
  typeId?: string
  estimatedMinutes?: number
  note?: string
}

TimeSlot {
  id: string
  label: string            // "Morning", "Deep Work", "9:00-12:00"
  startTime?: string       // HH:MM — optional
  endTime?: string         // HH:MM — optional
  color: string
  tasks: Task[]
  collapsed?: boolean
}

DaySchedule {
  date: string
  slots: TimeSlot[]
  unscheduled: Task[]      // tasks ที่ยังไม่ assign slot
}
```

---

## New UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: ← 15 May 2026 →    [+ Add Slot]    [Dashboard]    │
├──────────────┬──────────────────────────────────────────────┤
│  SIDEBAR     │  DAY BOARD                                    │
│              │                                               │
│  Stats:      │  ┌─────────────────┐  ┌─────────────────┐   │
│  ✓ 3/8 done  │  │ 🟣 Morning       │  │ 🔵 Deep Work    │   │
│  ⏱ 4h planned│  │ 9:00 - 12:00    │  │ 13:00 - 15:00  │   │
│              │  ├─────────────────┤  ├─────────────────┤   │
│  By type:    │  │ ☑ Task A        │  │ ☐ Task D        │   │
│  Work  ████  │  │ ☐ Task B        │  │ ☐ Task E        │   │
│  Study ██    │  │ ☐ Task C        │  │ + Add task      │   │
│              │  │ + Add task      │  └─────────────────┘   │
│  Types:      │  └─────────────────┘                         │
│  [Manage]    │                                               │
│              │  ┌─────────────────────────────────────────┐ │
│  [Clear Day] │  │ 📋 Unscheduled                          │ │
│              │  │ ☐ Task F  ☐ Task G                      │ │
│              │  └─────────────────────────────────────────┘ │
└──────────────┴──────────────────────────────────────────────┘
```

---

## Files to Change

### 1. Types (ปรับโครงสร้าง)
**`src/types/timeblock.ts`**
- ลบ `Block` interface
- เพิ่ม `Task` interface
- เพิ่ม `TimeSlot` interface
- อัปเดต `DaySchedule` ให้ใช้ `slots` + `unscheduled` แทน `blocks`
- ลบ `Summary` เดิม เพิ่ม `DaySummary` ที่นับ tasks แทน blocks

### 2. Utilities (ปรับ logic)
**`src/lib/timeblock.ts`**
- ลบ: `assignLanes`, `maxLanes`, `snapToInterval` (ไม่ใช้แล้ว)
- คง: `minutesToTime`, `timeToMinutes`, `todayString`, `generateId`, `getMonthDates`
- แก้: `loadSchedule` / `saveSchedule` ให้รองรับ schema ใหม่ + migrate เดิม
- เพิ่ม: `computeDaySummary(schedule)` นับ tasks completed, estimated time by type
- เพิ่ม: `migrateOldSchedule(old)` แปลง blocks → slot เดียวชื่อ "Imported" (backward compat)

### 3. Hook (เพิ่ม operations ใหม่)
**`src/hooks/useTimeBlocking.ts`**
- Slot CRUD: `addSlot`, `updateSlot`, `deleteSlot`, `reorderSlots`
- Task CRUD: `addTask`, `updateTask`, `deleteTask`, `toggleTask`, `moveTask`
- `addUnscheduledTask`, `moveTaskToSlot`
- ลบ: `addBlock`, `updateBlock`, `deleteBlock`, `clearDay` (เพิ่ม clearDay ใหม่ล้าง slots)

### 4. Page (ปรับ layout)
**`src/pages/TimeBlockingPage.tsx`**
- ลบ tab "Calendar" และ "Types" — รวมเป็น view เดียว
- Tab เหลือ 2: **Day** (หลัก) | **Dashboard**
- เพิ่ม `<DayBoard>` component แทน `<HorizontalGrid>`

### 5. Components ใหม่

| File | หน้าที่ |
|------|---------|
| `src/components/timeblocking/DayBoard.tsx` | Main board แสดง slots ทั้งหมด + unscheduled |
| `src/components/timeblocking/SlotCard.tsx` | Card ของ 1 slot + task list ภายใน |
| `src/components/timeblocking/TaskItem.tsx` | แถว task เดียว (checkbox, title, done strike-through) |
| `src/components/timeblocking/AddTaskForm.tsx` | Inline input เพิ่ม task ใน slot |
| `src/components/timeblocking/SlotModal.tsx` | Modal create/edit slot (label, time optional, color) |
| `src/components/timeblocking/TaskModal.tsx` | Modal edit task (title, type, estimated time, note) |

### 6. Components แก้ไข

| File | การเปลี่ยนแปลง |
|------|----------------|
| `src/components/timeblocking/TimeblockSidebar.tsx` | แสดง tasks done/total, estimated hours, type breakdown |
| `src/components/timeblocking/Dashboard.tsx` | ปรับ analytics ให้นับ tasks แทน block hours |
| `src/components/timeblocking/BlockTypeManager.tsx` | ใช้ต่อได้เลย (types ยังคงอยู่) |

### 7. Components ลบออก (deprecated)

| File | เหตุผล |
|------|--------|
| `src/components/timeblocking/HorizontalGrid.tsx` | แทนที่ด้วย DayBoard |
| `src/components/timeblocking/TimelineGrid.tsx` | ไม่ใช้แล้ว |
| `src/components/timeblocking/TimelineBlock.tsx` | ไม่ใช้แล้ว |
| `src/components/timeblocking/BlockModal.tsx` | แทนที่ด้วย SlotModal + TaskModal |

---

## Interaction Design

### การเพิ่ม Slot
- กด `[+ Add Slot]` → `SlotModal` เปิดขึ้นมา
- ใส่ label (required), start/end time (optional), เลือกสี
- สร้าง slot card ใหม่ใน board

### การเพิ่ม Task
- กด `+ Add task` ใน slot → `AddTaskForm` (inline input) ปรากฏ
- พิมพ์ชื่องาน → Enter = บันทึก, Escape = ยกเลิก
- Task ใหม่ขึ้นด้านล่างสุดของ slot

### การแก้ไข Task
- Click ที่ชื่อ task → `TaskModal` เปิด
- แก้ title, typeId, estimatedMinutes, note

### Toggle Done
- Click checkbox → `task.done` toggle → title ขีดทับ (line-through)

### Slot Collapse
- Click header ของ slot → ซ่อน/แสดง task list

---

## Migration Strategy

ข้อมูล localStorage เดิม (`timeblocking-schedules`) ใช้ schema `blocks[]` ซึ่งไม่ตรงกับ schema ใหม่

- `loadSchedule()` จะตรวจว่าข้อมูลมี `blocks` หรือ `slots`
- ถ้าเจอ `blocks` (เก่า) → แปลงเป็น slot เดียวชื่อ `"Migrated"` ที่มี task 1 ชิ้นต่อ block เดิม
- บันทึก schema ใหม่ทับ

---

## Implementation Order

1. `src/types/timeblock.ts` — ปรับ types
2. `src/lib/timeblock.ts` — ปรับ utils + migrate
3. `src/hooks/useTimeBlocking.ts` — ปรับ hook
4. `src/components/timeblocking/SlotModal.tsx` — สร้างใหม่
5. `src/components/timeblocking/TaskModal.tsx` — สร้างใหม่
6. `src/components/timeblocking/TaskItem.tsx` — สร้างใหม่
7. `src/components/timeblocking/AddTaskForm.tsx` — สร้างใหม่
8. `src/components/timeblocking/SlotCard.tsx` — สร้างใหม่
9. `src/components/timeblocking/DayBoard.tsx` — สร้างใหม่
10. `src/components/timeblocking/TimeblockSidebar.tsx` — ปรับ
11. `src/components/timeblocking/Dashboard.tsx` — ปรับ
12. `src/pages/TimeBlockingPage.tsx` — ปรับ layout
13. ลบ HorizontalGrid, TimelineGrid, TimelineBlock, BlockModal

---

## Scope: Not Included

- Drag-and-drop task ระหว่าง slots (ทำหลังได้)
- Recurring tasks / templates
- Backend sync (ยังคงเป็น localStorage only)
- Mobile responsive (ทำแยกต่างหาก)
