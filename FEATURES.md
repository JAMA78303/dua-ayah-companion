# FEATURES.md — Dua & Ayah Companion

AI-Optimised Feature Specification for Cursor

## HOW TO USE THIS FILE

This file is the single source of truth for every feature in the Dua & Ayah Companion app.
Each feature is self-contained: it includes priority, classification, description, user flow,
implementation logic with pseudocode, screen mapping, tech stack, code snippets, and known bugs.
Read the entire feature block before implementing. Do not skip the BUGS section.
When Cursor references this file, treat every MUST_HAVE item as a hard dependency before
any NICE_TO_HAVE feature is started.

## METADATA

| Field | Value |
|-------|--------|
| Product | Dua & Ayah Companion |
| Stack | Next.js 14+ (App Router) · TypeScript · Supabase · Tailwind · ShadCN |
| Auth Package | @supabase/ssr (NOT @supabase/auth-helpers — deprecated) |
| DB | Supabase (PostgreSQL + pgvector extension) |
| Hosting | Vercel (frontend) · Supabase Cloud (backend) |
| Phase Map | MVP = Phase 0–1 \| V1 = Phase 2 \| V2 = Phase 3 |

### PRIORITY LEGEND

| Tag | Meaning |
|-----|---------|
| [MVP] | Required for launch. Do not ship without this. |
| [V1] | Post-validation, post-launch. Months 2–4. |
| [V2] | Scale phase. Months 5–18. |
| MUST_HAVE | Core to product value. Never deprioritise. |
| NICE_TO_HAVE | Enhances experience but product works without it. |

## FEATURE INDEX

1. Emotion Input & Intent Mapping
2. Ayah/Dua Card Display
3. User Authentication
4. Save / Favourite System
5. Personal Dua Journal
6. Daily Recommendation Engine
7. Category Browse
8. Onboarding Flow
9. Resonance Feedback (Did This Help?)
10. Content Review Admin System
11. Semantic Search (AI Layer)
12. Audio Recitation
13. Push Notifications / Daily Nudge
14. Streak & Habit Tracking
15. Premium Subscription (Stripe)
16. Supporter Features (V1 roadmap)
17. PWA & Offline Support

---

## 1. EMOTION INPUT & INTENT MAPPING

**Priority:** [MVP]  
**Classification:** MUST_HAVE  
**Phase:** Phase 0 (Week 1–2)

### Description

The core feature of the product. A user types a natural language phrase expressing how they feel
("I feel overwhelmed", "I'm struggling to be patient"), or selects a pre-defined emotion tile.
The system maps the input to an EmotionCategory via a keyword-weight lookup table stored in
Supabase. The matched category is used to query curated ayah/dua pairings.

This is NOT AI-powered in MVP. It is a deterministic keyword → category → content lookup.
The keyword table is config-driven (database-stored) so it can be tuned without redeploying.

### How Users Interact

1. User arrives on home screen.
2. User sees a text input ("How are you feeling right now?") + 5 emotion category tiles below.
3. User types a phrase OR taps a category tile directly.
4. System processes input, returns matched ayah/dua card.
5. If no match: soft error message displayed ("Try describing how you're feeling differently").

### EmotionCategory Enum

```typescript
// types/emotions.ts
export type EmotionCategory =
  | 'anxiety'
  | 'sadness'
  | 'gratitude'
  | 'guidance'
  | 'patience';

// Phase 1 additions:
// | 'grief' | 'hope' | 'forgiveness' | 'anger' | 'loneliness'
// | 'purpose' | 'doubt' | 'gratitude_deep' | 'hardship' | 'tawakkul'
```

### Database Schema

```sql
-- intent_mappings table
CREATE TABLE intent_mappings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword     TEXT NOT NULL,          -- e.g. "I can't stop worrying"
  category    TEXT NOT NULL,          -- references EmotionCategory
  weight      FLOAT DEFAULT 1.0,      -- relevance weight, tunable
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for keyword search performance
CREATE INDEX idx_intent_mappings_category ON intent_mappings(category);

-- Enable RLS
ALTER TABLE intent_mappings ENABLE ROW LEVEL SECURITY;

-- Public read (content is not user-specific)
CREATE POLICY "Anyone can read intent mappings"
  ON intent_mappings FOR SELECT
  TO anon, authenticated
  USING (true);
```

### Implementation Logic (Pseudocode)

```
FUNCTION matchEmotionFromInput(userInput: string) -> EmotionCategory | null:

  1. NORMALISE input:
     - Convert to lowercase
     - Strip punctuation
     - Trim whitespace

  2. FETCH all intent_mappings from Supabase
     (cache in memory for session — this table changes rarely)

  3. FOR each mapping in intent_mappings:
     - IF normalised input CONTAINS mapping.keyword:
         - Add mapping to candidateMatches[]
         - candidateMatches[i].score = mapping.weight

  4. IF candidateMatches.length === 0:
     - RETURN null  →  trigger zero-result state

  5. SORT candidateMatches by score DESC

  6. RETURN candidateMatches[0].category

  7. USE returned category to query ayah_pairings table
     WHERE emotion_category = returnedCategory
     AND status = 'approved'
     ORDER BY RANDOM()
     LIMIT 3  (rotate through 3 results for variety)
```

**GLOBAL RULE RULE-013:** Keyword matching uses word-boundary regex, not simple `.includes()`.

### TypeScript Implementation (reference)

```typescript
// lib/matching/intentMatcher.ts

import { createClient } from '@/lib/supabase/client'
import type { EmotionCategory } from '@/types/emotions'

interface IntentMapping {
  keyword: string
  category: EmotionCategory
  weight: number
}

// Cache mappings in module scope — avoids re-fetching on every keystroke
let cachedMappings: IntentMapping[] | null = null

async function getMappings(): Promise<IntentMapping[]> {
  if (cachedMappings) return cachedMappings
  const supabase = createClient()
  const { data, error } = await supabase
    .from('intent_mappings')
    .select('keyword, category, weight')
  if (error) throw new Error(`Failed to fetch mappings: ${error.message}`)
  cachedMappings = data
  return cachedMappings
}

export async function matchIntent(
  input: string
): Promise<EmotionCategory | null> {
  const normalised = input.toLowerCase().replace(/[^\w\s]/g, '').trim()
  if (!normalised) return null

  const mappings = await getMappings()
  const candidates = mappings
    .filter(m => normalised.includes(m.keyword.toLowerCase()))
    .sort((a, b) => b.weight - a.weight)

  return candidates[0]?.category ?? null
}
```

Note: Implement word-boundary matching per RULE-013 / BUG-002 (replace `.includes()` with boundary-safe regex).

### Screen Flow

**[Home Screen]**

- User types in EmotionInput component
- `matchIntent()` called on form submit
- IF match → navigate to `/result?category={category}`
- IF no match → show ZeroResultState component (inline, same screen)

**[Emotion Tile Tap]**

- Bypass `matchIntent()`
- Directly navigate to `/result?category={tileCategory}`

### Screens Involved

- `app/page.tsx` — Home screen (contains EmotionInput + CategoryTiles)
- `app/result/page.tsx` — Result screen (receives category via query param or state)
- `components/EmotionInput.tsx`
- `components/CategoryTiles.tsx`
- `components/ZeroResultState.tsx`

### Technologies

- Supabase JS client (@supabase/ssr)
- Next.js App Router — useRouter, useSearchParams
- ShadCN Input, Button
- Tailwind CSS

### Known Bugs & Pitfalls

- **BUG-001:** Cached mappings go stale after admin updates — use SWR/TTL or revalidation (see spec).
- **BUG-002:** Partial keyword false positives — word-boundary matching (RULE-013).
- **BUG-003:** No match for valid phrases — monitor zero-results; expand `intent_mappings`.
- **BUG-004:** Race on rapid submit — `useTransition()` or debounce (~300ms).

---

## 2. AYAH/DUA CARD DISPLAY

**Priority:** [MVP]  
**Classification:** MUST_HAVE  
**Phase:** Phase 0 (Week 2)

### Description

Primary output: Qur'anic ayah (Arabic + translation), paired dua, tafsir summary, reflection prompts.
Content rotation: 3 ayahs per category; one shown per session.

### Database Schema

```sql
CREATE TABLE ayah_pairings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surah             INTEGER NOT NULL,
  ayah_number       INTEGER NOT NULL,
  arabic_text       TEXT NOT NULL,
  translation       TEXT NOT NULL,
  emotion_category  TEXT NOT NULL,
  tafsir_source     TEXT NOT NULL,
  inclusion_reason  TEXT,
  tafsir_summary    TEXT NOT NULL,
  reflection_prompts TEXT[] NOT NULL,
  tone_tag          TEXT CHECK (tone_tag IN ('comfort', 'warning', 'balance')),
  dua_text          TEXT NOT NULL,
  dua_transliteration TEXT,
  dua_translation   TEXT NOT NULL,
  status            TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_notes    TEXT,
  reviewed_at       TIMESTAMPTZ,
  reviewed_by       UUID REFERENCES auth.users(id),
  embedding         vector(1536),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ayah_pairings_category
  ON ayah_pairings(emotion_category)
  WHERE status = 'approved';

ALTER TABLE ayah_pairings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read approved pairings"
  ON ayah_pairings FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "Admins can insert pairings"
  ON ayah_pairings FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) IN (SELECT id FROM admin_users));
```

**RULE-005 / RULE-006:** Never `.select('*')` on `ayah_pairings`; never expose `inclusion_reason` client-side.

### Query Logic (reference)

```typescript
// lib/content/fetchPairings.ts

export async function fetchPairingsForCategory(
  category: EmotionCategory,
  limit: number = 3
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ayah_pairings')
    .select(`
      id, surah, ayah_number, arabic_text, translation,
      tafsir_summary, reflection_prompts, tone_tag,
      dua_text, dua_transliteration, dua_translation
    `)
    .eq('emotion_category', category)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  const randomIndex = Math.floor(Math.random() * (data?.length ?? 1))
  return data?.[randomIndex] ?? null
}
```

Prefer client-side random selection or `ORDER BY RANDOM()` in SQL per BUG-008.

### Component Structure

`components/AyahCard.tsx` — props include surah, ayahNumber, arabicText, translation, tafsirSummary, reflectionPrompts, dua fields, toneTag, optional onSave.

Render order: reference → Arabic (RTL) → translation → divider → tafsir → reflections → dua header → dua → actions.

**RULE-014:** Arabic elements use `dir="rtl"` and `lang="ar"`.

### Arabic Text Rendering

```typescript
// CRITICAL: Arabic requires RTL direction and correct font
// Install: add to app/layout.tsx Google Fonts link

// globals.css
@import url('https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap');

// Usage in component:
<p
  dir="rtl"
  lang="ar"
  className="font-scheherazade text-3xl leading-loose text-right"
>
  {arabicText}
</p>
```

### Screen Flow

**[Result Screen]** `/result?category=…`

- AyahCard rendered with matched pairing
- User reads, scrolls, reflects
- Taps “Save” → requires auth → redirects to `/login` (returns after auth) _or_ AuthModal per auth section
- Taps “Did this resonate?” → submits `resonance_feedback` row
- Taps back → returns to Home

### Screens Involved

- `app/result/page.tsx` — Primary display screen
- `components/AyahCard.tsx` — Main card component
- `components/ReflectionPrompt.tsx` — Renders reflection question(s)
- `components/DuaSection.tsx` — Renders dua with Arabic + translation

### Known Bugs & Pitfalls

- **BUG-005:** FOUT — preload fonts, `font-display: swap`.
- **BUG-006:** RTL in LTR flex — wrap Arabic in own RTL container.
- **BUG-007:** Accidental `inclusion_reason` exposure — explicit selects only.
- **BUG-008:** SSR random — client or DB randomness.

---

## 3. USER AUTHENTICATION

**Priority:** [MVP]  
**Classification:** MUST_HAVE  
**Phase:** Phase 0 (Week 3)

Email + password with Google OAuth. Use **@supabase/ssr** exclusively (NOT `@supabase/auth-helpers`). Auth required for saves, journaling, daily recommendations. Anonymous users can complete the core emotional loop without signing in. Auth is prompted contextually (e.g. when saving), not as a gate on first load.

### Implementation — server client

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            /* Server Component — ignore */
          }
        },
      },
    }
  )
}
```

### Implementation — browser client

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Middleware (session refresh)

```typescript
// middleware.ts — REQUIRED for session refresh
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### Protected route pattern

```typescript
// app/(protected)/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <>{children}</>
}
```

Use `getUser()` NOT `getSession()` for server-side checks (RULE-009).

### Screen Flow

**[Save — unauthenticated]** AyahCard Save → AuthGuard → slide-up AuthModal (preferred) or `/login` → after auth, save completes; user keeps current ayah.

**[`/login`]** Email/password + Google OAuth → success → redirect to `?next=` (e.g. `/saved`).

### Screens Involved

- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`
- `app/(auth)/callback/route.ts` — OAuth callback
- `components/AuthModal.tsx`
- `middleware.ts`

### Known Bugs & Pitfalls

- **BUG-009:** `getUser()` can hang after long browser inactivity (SSR). Wrap client `getUser()` in `Promise.race` with ~10s timeout; on timeout clear stale session and redirect to login / sign out.
- **BUG-010:** `@supabase/auth-helpers` imports cause session bugs — use `@supabase/ssr` only; add to project rules.
- **BUG-011:** Tables without RLS policies — enable RLS and policies on every table (RULE-002–003, RULE-010).
- **BUG-012:** Service role in client — never `NEXT_PUBLIC_` for service role (RULE-008).
- **BUG-013:** OAuth redirect mismatch — register `http://localhost:3000/auth/callback` and production callback in Supabase Auth and Google Cloud Console.

---

## 4. SAVE / FAVOURITE SYSTEM

**Priority:** [MVP]  
**Classification:** MUST_HAVE  
**Phase:** Phase 0 (Week 3)

Authenticated users save ayah/dua pairings. Free tier: up to 10 saved items; premium: unlimited.

### Database Schema

```sql
CREATE TABLE saved_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pairing_id  UUID NOT NULL REFERENCES ayah_pairings(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pairing_id)
);

CREATE INDEX idx_saved_items_user ON saved_items(user_id);

ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own saves"
  ON saved_items FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users insert own saves"
  ON saved_items FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users delete own saves"
  ON saved_items FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);
```

### Implementation Logic (pseudocode)

1. `handleSave(pairingId)`: if not authenticated → AuthModal; if free tier count ≥ 10 → UpgradePrompt.
2. Upsert / toggle `saved_items`; on conflict idempotent.
3. UI: saved state + toast “Saved to your collection”.

### TypeScript — toggle save

```typescript
// lib/saves/toggleSave.ts

export async function toggleSave(pairingId: string): Promise<'saved' | 'removed'> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')

  const { data: existing } = await supabase
    .from('saved_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('pairing_id', pairingId)
    .single()

  if (existing) {
    await supabase.from('saved_items').delete().eq('id', existing.id)
    return 'removed'
  } else {
    await supabase.from('saved_items').insert({ user_id: user.id, pairing_id: pairingId })
    return 'saved'
  }
}
```

### Screen Flow

AyahCard Save → `handleSave` → AuthModal / `UpgradeModal` (Supporter upsell: “Go deeper.”) → success animation + toast.

`/saved`: list with join to `ayah_pairings`; tap to expand; delete via gesture/menu.

### Screens Involved

- `components/AyahCard.tsx`
- `app/(protected)/saved/page.tsx`
- `components/SaveButton.tsx`
- `components/UpgradeModal.tsx`

### Known Bugs & Pitfalls

- **BUG-014:** Optimistic UI desync — rollback on failure + toast error.
- **BUG-015:** Double-tap duplicate — disable button ~500ms after tap; DB UNIQUE still applies.
- **BUG-016:** Free-tier limit race across tabs — enforce limit in DB (trigger or constraint), not only in app code.

---

## 5. PERSONAL DUA JOURNAL

**Priority:** [MVP]  
**Classification:** MUST_HAVE  
**Phase:** Phase 0 (Week 4)

Private reflection notes per pairing; timestamped; foundation for spiritual diary. Free: 7-day history visible; premium: full history.

### Database Schema

```sql
CREATE TABLE journal_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pairing_id  UUID NOT NULL REFERENCES ayah_pairings(id) ON DELETE CASCADE,
  content     TEXT NOT NULL CHECK (char_length(content) <= 2000),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_journal_user ON journal_entries(user_id, created_at DESC);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their journal"
  ON journal_entries FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
```

### Pseudocode

- `saveJournalEntry(pairingId, content)`: validate length; upsert (optional: one entry per user+pairing per day).
- `fetchJournalEntries`: order by `created_at` DESC; free tier filter last 7 days + premium CTA.

### Server Component example

```typescript
// app/(protected)/journal/page.tsx — Server Component

import { createClient } from '@/lib/supabase/server'

export default async function JournalPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: entries } = await supabase
    .from('journal_entries')
    .select(`
      id, content, created_at, updated_at,
      ayah_pairings (
        surah, ayah_number, translation, emotion_category
      )
    `)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return <JournalList entries={entries} />
}
```

### Screen Flow

AyahCard “Add Reflection” → inline textarea → save → confirmation.

`/journal`: chronological list; tap for full view; older entries blurred for free tier + upgrade CTA.

### Screens Involved

- `components/AyahCard.tsx`
- `components/JournalTextarea.tsx`
- `app/(protected)/journal/page.tsx`
- `components/JournalEntryCard.tsx`

### Known Bugs & Pitfalls

- **BUG-017:** Lost text on navigate — draft to `localStorage` keyed by `pairingId`; clear on successful save.
- **BUG-018:** 2000-char limit — `maxLength={2000}` + live counter in UI.
- **BUG-019:** JOIN returns empty ayah — ensure `ayah_pairings` SELECT policy includes `authenticated` (approved-only rows).

---

## 6. DAILY RECOMMENDATION ENGINE

**Priority:** [MVP]  
**Classification:** MUST_HAVE  
**Phase:** Phase 0 (Week 4)

Deterministic daily pairing for all users (same calendar day); Phase 1+: personalisation.

### Pseudocode

1. `seed = YYYYMMDD` integer.
2. Count approved `ayah_pairings`.
3. `daily_index = seed % total_count`.
4. Fetch one row at offset `daily_index` (ordered consistently, e.g. `created_at ASC`).
5. ISR / cache: revalidate 86400s.

### API route example

```typescript
// app/api/daily/route.ts

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const revalidate = 86400

export async function GET() {
  const supabase = createClient()

  const today = new Date()
  const seed = parseInt(
    `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`,
    10
  )

  const { count } = await supabase
    .from('ayah_pairings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  const offset = seed % (count ?? 1)

  const { data } = await supabase
    .from('ayah_pairings')
    .select(
      'id, surah, ayah_number, arabic_text, translation, tafsir_summary, reflection_prompts, dua_text, dua_translation, tone_tag'
    )
    .eq('status', 'approved')
    .order('created_at', { ascending: true })
    .range(offset, offset)
    .single()

  return NextResponse.json(data)
}
```

### Screen Flow

Home: “Today’s Reflection” card above emotion input → tap → `/result` with daily pairing; badge “Today’s Dua & Ayah”.

### Known Bugs & Pitfalls

- **BUG-020:** Midnight boundary is server TZ (often UTC) — document for MVP; Phase 1: user timezone in seed.
- **BUG-021:** Modulo skew — consider seeded shuffle or `daily_rotation` table updated by cron.

---

## 7. CATEGORY BROWSE

**Priority:** [MVP]  
**Classification:** MUST_HAVE  
**Phase:** Phase 0 (Week 2)

Five emotion tiles on home; tap navigates directly to results.

```typescript
// components/CategoryTiles.tsx

const CATEGORIES: {
  id: EmotionCategory
  label: string
  emoji: string
  description: string
}[] = [
  { id: 'anxiety', label: 'Anxiety', emoji: '🌊', description: 'Worry, overwhelm, fear' },
  { id: 'sadness', label: 'Sadness', emoji: '🌧️', description: 'Grief, loss, despair' },
  { id: 'gratitude', label: 'Gratitude', emoji: '☀️', description: 'Thankfulness, contentment' },
  { id: 'guidance', label: 'Guidance', emoji: '🧭', description: 'Lost, uncertain, seeking' },
  { id: 'patience', label: 'Patience', emoji: '⏳', description: 'Waiting, enduring, persisting' },
]

// On tile tap: router.push(`/result?category=${category.id}`)
```

### Screen Flow

Home → 2-column (mobile) / 3-column (tablet) grid → tap → `/result?category={id}`.

---

## 8. ONBOARDING FLOW

**Priority:** [MVP]  
**Classification:** MUST_HAVE  
**Phase:** Phase 0 (Week 3–4)

3-screen intro, first-time only, skippable, stored in `localStorage`.

**Screen 1:** What the app does — core loop.  
**Screen 2:** Methodology — classical tafsir (e.g. Ibn Kathir).  
**Screen 3:** “Start with how you’re feeling” — preview → Get started → home.

```typescript
// hooks/useOnboarding.ts — client hook ('use client')
import { useEffect, useState } from 'react'

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('onboarding-complete')
    if (!seen) setShowOnboarding(true)
  }, [])

  const completeOnboarding = () => {
    localStorage.setItem('onboarding-complete', 'true')
    setShowOnboarding(false)
  }

  return { showOnboarding, completeOnboarding }
}
```

---

## 9. RESONANCE FEEDBACK ("DID THIS HELP?")

**Priority:** [MVP]  
**Classification:** MUST_HAVE  
**Phase:** Phase 0 (Week 2)

Micro-survey: “Did this resonate?” Yes / Not really. Stored anonymously; `user_id` optional.

### Database Schema

```sql
CREATE TABLE resonance_feedback (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pairing_id  UUID NOT NULL REFERENCES ayah_pairings(id),
  user_id     UUID REFERENCES auth.users(id),
  response    BOOLEAN NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE resonance_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
  ON resonance_feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

Reads/aggregates: admin / server only.

```typescript
// components/ResonanceSurvey.tsx — concept

async function submitResonance(pairingId: string, response: boolean) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  await supabase.from('resonance_feedback').insert({
    pairing_id: pairingId,
    user_id: user?.id ?? null,
    response,
  })
}
```

### Known Bugs & Pitfalls

- **BUG-022:** Survey too early — show after scroll past reflection section or after ~15s (Intersection Observer).

---

## 10. CONTENT REVIEW ADMIN SYSTEM

**Priority:** [MVP]  
**Classification:** MUST_HAVE  
**Phase:** Phase 0 (Week 1)

Internal workflow: **MVP** — Supabase Studio to set `ayah_pairings.status`, `reviewer_notes`. Only `approved` rows are public. Phase 1: optional `/admin` app.

### Admin Users Table

```sql
CREATE TABLE admin_users (
  id   UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT DEFAULT 'reviewer'
);
-- Manually insert reviewer auth user IDs
```

### Content Review Checklist (document in DB comment)

Before `approved`: verify surah/ayah, `inclusion_reason`, faithful `tafsir_summary`, tone, dua attribution/transliteration, scholarly appropriateness.

```sql
COMMENT ON TABLE ayah_pairings IS 'See content review checklist before approving any row.';
```

---

## 11. SEMANTIC SEARCH (AI LAYER)

**Priority:** [V1]  
**Classification:** MUST_HAVE (for V1)  
**Phase:** Phase 2 (Months 4–6)

Replaces keyword matching with vector similarity. User input → embedding (`text-embedding-3-small`) → pgvector cosine search.

### Prerequisites

- pgvector enabled in Supabase
- `embedding` populated on approved `ayah_pairings`
- HNSW index after seeding

### Database Setup

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE INDEX ON ayah_pairings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE OR REPLACE FUNCTION match_pairings(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.70,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id uuid,
  surah int,
  ayah_number int,
  arabic_text text,
  translation text,
  tafsir_summary text,
  reflection_prompts text[],
  dua_text text,
  dua_translation text,
  tone_tag text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id, surah, ayah_number, arabic_text, translation,
    tafsir_summary, reflection_prompts, dua_text, dua_translation, tone_tag,
    1 - (embedding <=> query_embedding) AS similarity
  FROM ayah_pairings
  WHERE status = 'approved'
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```

### TypeScript — API route (server-only)

```typescript
// app/api/semantic-search/route.ts
// SERVER-SIDE ONLY — OpenAI key must never reach client

import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  const { query } = await req.json()

  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  })
  const queryEmbedding = embeddingResponse.data[0].embedding

  const supabase = createClient()
  const { data, error } = await supabase.rpc('match_pairings', {
    query_embedding: queryEmbedding,
    match_threshold: 0.70,
    match_count: 3,
  })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
```

### Embedding Generation (batch seeding)

```typescript
// scripts/generate-embeddings.ts — server/script only, service role

async function seedEmbeddings() {
  const supabase = createAdminClient()
  const openai = new OpenAI()

  const { data: pairings } = await supabase
    .from('ayah_pairings')
    .select('id, tafsir_summary, dua_translation, translation')
    .eq('status', 'approved')
    .is('embedding', null)

  for (const pairing of pairings ?? []) {
    const text = `Ayah: ${pairing.translation}. Tafsir: ${pairing.tafsir_summary}. Dua: ${pairing.dua_translation}`

    const { data } = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })

    await supabase
      .from('ayah_pairings')
      .update({ embedding: data[0].embedding })
      .eq('id', pairing.id)

    await new Promise(r => setTimeout(r, 150))
  }
}
```

### Known Bugs & Pitfalls

- **BUG-023:** HNSW built before embeddings seeded — seed first, index after; verify with `EXPLAIN ANALYZE`.
- **BUG-024:** `match_threshold` too high → zero results — start ~0.60; tune with PostHog.
- **BUG-025:** Approximate index returns fewer than `match_count` with filters — pgvector 0.8.0+ iterative scans; `SET hnsw.ef_search = 100`.
- **BUG-026:** OpenAI key in client bundle — only API routes / server actions (RULE-007).
- **BUG-027:** Clamp similarity: `GREATEST(0, 1 - (embedding <=> query_embedding))` when documenting scores.

---

## 12. AUDIO RECITATION

**Priority:** [V1]  
**Classification:** NICE_TO_HAVE  
**Phase:** Phase 1.5 (Month 3)

External link to Quran.com for each ayah; no self-hosted audio in MVP.

```typescript
const quranComUrl = `https://quran.com/${surah}/${ayahNumber}`
// <a href={quranComUrl} target="_blank" rel="noopener noreferrer">Listen on Quran.com</a>
```

### Known Bugs & Pitfalls

- **BUG-028:** Autoplay blocked — no autoplay; explicit tap; `<audio controls>`.
- **BUG-029:** iframe CSP — e.g. `frame-src https://quran.com` in `next.config.js`.

---

## 13. PUSH NOTIFICATIONS / DAILY NUDGE

**Priority:** [V1]  
**Classification:** NICE_TO_HAVE  
**Phase:** Phase 1 (Month 2–3)

Web Push daily “Today’s Dua & Ayah”; VAPID; store subscriptions in Supabase.

```typescript
// lib/notifications/subscribe.ts (concept)

export async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  })
  await supabase.from('push_subscriptions').upsert({
    user_id: currentUser.id,
    subscription: JSON.stringify(subscription),
    created_at: new Date().toISOString(),
  })
}
```

### Known Bugs & Pitfalls

- **BUG-030:** iOS before 16.4 — detect `PushManager`; in-app fallback reminder.
- **BUG-031:** SW update orphans subscription — on `activate`, re-subscribe and upsert endpoint.

---

## 14. STREAK & HABIT TRACKING

**Priority:** [V1]  
**Classification:** NICE_TO_HAVE  
**Phase:** Phase 1 (Month 2–3)

Premium feature: consecutive days with at least one core-loop interaction.

```sql
CREATE TABLE user_activity (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date      DATE NOT NULL,
  UNIQUE(user_id, date)
);

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own activity" ON user_activity FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
```

**Pseudocode:** On successful authenticated ayah view → upsert `(user_id, today)`. `calculateStreak`: walk dates descending from today.

---

## 15. PREMIUM SUBSCRIPTION (STRIPE)

**Priority:** [V1]  
**Classification:** MUST_HAVE (for V1)  
**Phase:** Phase 1 (Month 2)

Monthly (£4.99) and annual (£39.99); webhooks update Supabase profile flags.

```typescript
// app/api/stripe/checkout/route.ts
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { priceId, userId } = await req.json()
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_URL}/premium?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/premium?cancelled=true`,
    metadata: { userId },
  })
  return Response.json({ url: session.url })
}
```

Webhook route: handle `customer.subscription.created` / `deleted`; update `profiles.is_premium`, etc.

```sql
ALTER TABLE profiles ADD COLUMN is_premium BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN subscription_expires_at TIMESTAMPTZ;
```

### Known Bugs & Pitfalls

- **BUG-032:** Webhook signature in dev — Stripe CLI `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
- **BUG-033:** Premium lag after payment — poll `/api/subscription-status` on success URL (RULE-015: verify webhook signature).

---

## 16. SUPPORTER FEATURES (V1)

Post-hackathon **Supporter** tier capabilities. Billing remains Stripe + `profiles.is_premium` (or successor flag); these items ship after core auth and cloud saves are stable.

### 16a. Collections

**Priority:** [V1]  
**Classification:** MUST_HAVE  
**Phase:** Phase 1

- `saved_items` gains **`collection_name TEXT`** nullable — user-defined labels; null = “uncategorised” or default inbox.
- UI to **create, rename, and delete** collections; **assign / move** saves between collections.
- **Supporter-gated:** free users keep flat favourites list without named collections.

### 16b. Personalised daily recommendation

**Priority:** [V1]  
**Classification:** MUST_HAVE  
**Phase:** Phase 1

- **Query** authenticated user’s dominant **`emotion_category`** from **`journal_entries`** and **`saved_items`** (joined to `ayah_pairings`) over the **last 30 days** (weighted counts or simple mode).
- **Weight** the deterministic daily pairing selection toward that category (e.g. biased random or filtered pool).
- **Supporter-gated:** subscribers get personalised pick; **free users** keep the existing **global** daily recommendation unchanged.
- **Fallback:** insufficient signal → same behaviour as global.

### 16c. Shareable ayah cards

**Priority:** [V1]  
**Classification:** MUST_HAVE  
**Phase:** Phase 1

- **Server-side image generation** (e.g. **Satori** or **`@vercel/og`**) — no client canvas for final asset.
- **Route:** `GET /api/og/ayah?pairingId={uuid}` → returns a **styled PNG** (Arabic + translation snippet + branding), cache headers appropriate for CDN.
- **Supporter-gated download** (high-res / branded file or direct download).
- **Free users:** **share a link only** (opens app or public preview URL); no gated PNG download.

### 16d. Monthly reflection digest

**Priority:** [V1]  
**Classification:** MUST_HAVE  
**Phase:** Phase 1

- **Cron:** **Vercel Cron** or **Supabase `pg_cron`** — runs **1st of each month** (UTC or documented TZ).
- **Aggregate** prior month’s **`journal_entries`** grouped by **`emotion_category`** (via pairing join); include **most-saved ayahs** (from `saved_items` + pairings).
- **Email** via **Resend** (or equivalent): subject + HTML body with top themes and ayah references.
- **Supporter-gated:** only paying subscribers receive the digest; no spam for free tier.

---

## 17. PWA & OFFLINE SUPPORT

**Priority:** [MVP] — **Classification:** NICE_TO_HAVE (basic) / MUST_HAVE (install prompt)  
**Phase:** Phase 0 (Week 4)

Install prompt, offline last 7 saved pairings (IndexedDB), SW caching.

```javascript
// next.config.js — concept with next-pwa
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: 'CacheFirst',
      options: { cacheName: 'google-fonts', expiration: { maxAgeSeconds: 86400 * 365 } },
    },
  ],
})
```

```json
// public/manifest.json
{
  "name": "Dua & Ayah Companion",
  "short_name": "Companion",
  "theme_color": "#1A8C8C",
  "background_color": "#1A1A2E",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Offline:** saved pairings → IndexedDB on save; daily rec → SW cache; fonts CacheFirst; API NetworkFirst with short timeout fallback.

### Known Bugs & Pitfalls

- **BUG-034:** No `beforeinstallprompt` on iOS — banner: Share → Add to Home Screen.
- **BUG-035:** Stale SW after deploy — `skipWaiting: true`; version cache names per deploy.

---

## GLOBAL IMPLEMENTATION RULES FOR CURSOR

| Rule | Constraint |
|------|------------|
| RULE-001 | Use @supabase/ssr — never @supabase/auth-helpers |
| RULE-002 | Always enable RLS immediately after CREATE TABLE |
| RULE-003 | Always create at least one policy after enabling RLS |
| RULE-004 | Use `(SELECT auth.uid())` not `auth.uid()` in RLS policies |
| RULE-005 | Never `.select('*')` on ayah_pairings |
| RULE-006 | inclusion_reason must NEVER appear in client-facing queries |
| RULE-007 | OpenAI API calls SERVER-SIDE ONLY |
| RULE-008 | SUPABASE_SERVICE_ROLE_KEY never prefixed NEXT_PUBLIC_ |
| RULE-009 | Never `getSession()` for server auth checks — use `getUser()` |
| RULE-010 | Every migration: ENABLE RLS + ≥1 policy |
| RULE-011 | EXPLAIN ANALYZE after adding indexes |
| RULE-012 | Non-approved content invisible to public queries |
| RULE-013 | Keyword matching: word-boundary regex |
| RULE-014 | Arabic: dir="rtl" and lang="ar" |
| RULE-015 | Stripe webhook must verify signature |

---

## ENVIRONMENT VARIABLES REQUIRED

```bash
# .env.local

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
NEXT_PUBLIC_URL=http://localhost:3000
```

---

## DEPENDENCY LIST

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "@supabase/ssr": "latest",
    "@supabase/supabase-js": "latest",
    "openai": "^4.0.0",
    "stripe": "^14.0.0",
    "@shadcn/ui": "latest",
    "tailwindcss": "^3.0.0",
    "next-pwa": "^5.6.0",
    "posthog-js": "latest"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "latest",
    "@types/react": "latest"
  },
  "forbidden": [
    "@supabase/auth-helpers-nextjs",
    "@supabase/auth-helpers-react"
  ]
}
```

---

**FEATURES.md — Last updated May 2026 — v1.0**

This file is the authoritative feature specification. Update it before implementing any feature change.
