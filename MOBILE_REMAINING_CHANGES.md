# Mobile App — Remaining Changes

## Status
Admin panel changes are complete. The items below are outstanding on the **mobile app** side only.

---

## 1. §5.1 — Low Point ≤ High Point Validation

**Where to fix:** Mobile API endpoint — `app/api/mobile/trip-inspections/route.ts` (or whichever route handles trip inspection creation/update)

**What to add:** Server-side validation that rejects a submission when `lowPoint > highPoint`.

```ts
if (parseFloat(lowPoint) > parseFloat(highPoint)) {
  return NextResponse.json(
    { error: 'Low Point must be less than or equal to High Point' },
    { status: 400 }
  );
}
```

Also add client-side validation in the mobile form (React Hook Form / Zod):

```ts
lowPoint: z.string().refine((val, ctx) => {
  const high = ctx.parent?.highPoint;
  return !high || parseFloat(val) <= parseFloat(high);
}, { message: 'Low Point must be ≤ High Point' }),
```

---

## 2. §6.2 — Trip Listing Card Missing User(s) Column

**Where to fix:** Mobile trip listing component (wherever the trip card is rendered)

**What to add:** Display the `inspectedUsers` field (parsed from JSON array of user IDs → show names or count).

```ts
// Parse and show user count or names
const users = JSON.parse(trip.inspectedUsers || '[]');
// Render: "Alan K., Priya S." or "2 users"
```

The `inspectedUsers` field is already stored in the DB and is now exposed via the admin API. The mobile listing needs to fetch and display it on the card (alongside Trip ID, Street, House No., Status, DateTime).

---

## Summary Table

| Section | Gap | File(s) to change |
|---|---|---|
| §5.1 | `lowPoint ≤ highPoint` validation | `app/api/mobile/trip-inspections/route.ts` + mobile form schema |
| §6.2 | Trip card missing User(s) display | Mobile trip listing card component |

---

---

# Database Migration Required

## What changed
A new column `difficulty_weight` was added to the `company_settings` table in `db/schema.ts`:

```ts
difficultyWeight: decimal('difficulty_weight', { precision: 5, scale: 3 }).default('0.200'),
```

## How to run the migration

### Option A — Generate + Migrate (recommended for production)
```bash
# 1. Generate the new migration SQL file
npm run db:generate

# 2. Apply the migration to the database
npm run db:migrate
```

### Option B — Push directly (simpler, for development)
```bash
npm run db:push
```

> **Note:** `db:push` syncs the schema directly without creating a migration file. Safe for development, but prefer `db:generate` + `db:migrate` for production to keep an audit trail in the `drizzle/` folder.

## What the migration adds
```sql
ALTER TABLE "company_settings"
  ADD COLUMN "difficulty_weight" numeric(5, 3) DEFAULT 0.200;
```

This column stores the configurable difficulty weight constant used in the trip score formula:
```
Trip Score = Length × (1 + (High − Low) × difficulty_weight)
```

It can be updated via **Admin → Settings → Scoring tab**.
