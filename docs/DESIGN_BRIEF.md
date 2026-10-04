# Dua & Ayah Companion — Design Brief

A brief for a UX/UI designer joining the project. It describes what the app is, who it's for, every screen, the visual system as it stands today, and where design help is most wanted.

- **Live code:** https://github.com/JAMA78303/dua-ayah-companion (Next.js web app, installable as a phone app / PWA)
- **Platform:** mobile-first web app; also works on desktop. Bottom tab bar on all sizes.
- **Status:** feature-complete for a first launch, not yet deployed. The current look was built by a developer, not a designer — everything here is open to redesign.

---

## 1. What the app is

A calm, personal companion for Muslims that answers one question: **"I'm feeling something — what does Allah say, and what can I say back?"**

You tell the app how you feel (anxious, grieving, angry, grateful…) by tapping a feeling or typing freely, and it gives you:

1. **An ayah** from the Qur'an that speaks to that feeling, with translation, tafsir, recitation and reflection prompts.
2. **A dua** to make — from the Qur'an or the Sunnah — with Arabic, transliteration and meaning.
3. A place to **reflect**: save it, write a journal entry, share it.

Around that core sit daily-practice features: a swipeable feed, the full Qur'an with recitation, morning/evening adhkar, prayer times, the 99 Names, stories of the prophets and Companions, and a personal dua list.

### Tone

- **Gentle, sincere, unhurried.** People open this when they're struggling. Nothing should feel loud, gamified or salesy.
- **Reverent with sacred text.** Arabic Qur'an text is the hero of most screens. It must never be cramped, cut off, decorated over, or treated as a mere graphic.
- **Trustworthy.** Every ayah, hadith and story cites its source (Qur'an reference, hadith collection + grading, or "From the biographies"). Sources are part of the design, not footnotes to hide.

### Who it's for

- Muslims of any level, mostly English-speaking (UK first), reading Arabic to varying degrees — many can't read Arabic fluently and rely on transliteration and translation.
- Primarily on phones, often at emotional moments, often at night.
- Ages roughly 16–45. Some will use it daily (adhkar, Qur'an), some only when something's wrong.

---

## 2. Navigation & information architecture

**Bottom tab bar (5 tabs):** Feed · Discover · Qur'an · Prophets · Names

**Top bar:** app name, settings button (sun icon), Themes button.

```
Feed (/)                    Full-screen swipeable cards: ayah+dua pairings, story chapters,
                            Names of Allah, duas from the Sunnah, mixed.
Discover (/discover)        Hub: today's reflection, Name of the Day, Hadith of the Day,
                            links to every section, "How are you feeling?" input,
                            feeling tiles, Duas from the Prophets.
  ├ Feeling feed (/feed?category=…)
  ├ Result (/result)        One ayah + dua for a feeling — the core screen
  ├ Adhkar (/adhkar)        Morning & evening remembrances with tap counters
  ├ Duas from the Sunnah (/duas)  grouped by situation, filter by feeling
  │   └ How to make dua (/duas/how-to)  guide from Ibn al-Qayyim
  ├ Prayer times (/prayer-times)  times, animated sky, moon, Duha, qibla
  ├ Stories of the Companions (/companions, /companions/[slug])
  ├ My duas (/my-duas)      personal dua list, mark as answered
  ├ My journal (/journal)   reflections on ayat
  └ Saved (/saved)          everything the user saved
Qur'an (/quran)             Surah list → reader (/quran/[n]) with recitation
Prophets (/prophets)        Prophets' duas; Stories of the Prophets (/stories, /stories/[slug])
Names (/names)              99 Names → each Name (/names/[n])
Account                     /login, /signup, /supporter (paid tier)
Admin                       /admin/review (content approval — internal only)
```

**Known IA pain points (please rethink):**
- Discover has become a long list of links — it needs grouping/hierarchy.
- Stories of the Companions are reachable from Discover *and* inside Prophets; neither is obvious.
- Journal, Saved and My duas are three "personal" areas with no shared home (a "Me"/profile tab may help).
- Settings live behind a small sun icon.

---

## 3. Screens

For each: purpose, what's on it, states to design.

### 3.1 Feed (home)
- Full-height cards, swipe/scroll vertically one at a time (TikTok-style, but calm).
- Card types: **Ayah + dua pairing** (Arabic ayah, translation, "Listen" player, related dua, "For anxiety" label), **story chapter**, **Name of Allah**, **Sunnah dua**.
- Actions on every card: Save, Share, Open full.
- Opening state: a short splash with an ayah ("We have not sent down the Qur'an to you to cause you distress — Ta-Ha 2").
- States: loading, end of feed, offline.

### 3.2 Discover
- Today's reflection card, **Name of the Day**, **Hadith of the Day**.
- Link cards: Adhkar, Duas from the Sunnah, Stories of the Companions, Prayer times, My duas, My journal.
- "How are you feeling right now?" free-text box → finds a feeling; zero-result state.
- 11 feeling tiles: Anxiety, Sadness, Gratitude, Guidance, Patience, Guilt, Grief, Hope, Forgiveness, Loneliness, Anger (+ Saved).
- Duas from the Prophets section.

### 3.3 Result — the core screen
Ordered top to bottom:
1. Feeling label ("For grief") and surah reference pill.
2. **Arabic ayah** (large). Words are tappable for word-by-word meaning. While recited, the current word **glows gold**.
3. Translation.
4. Transliteration, audio player (Listen / speed / reciter name).
5. "Open on Quran.com" · "Memorise this ayah" (opens a memorise sheet that hides words progressively).
6. Tafsir summary + expandable deeper tafsir.
7. Reflection prompts.
8. The dua (Arabic, transliteration, translation, citation).
9. Save, "Did this resonate?" feedback, **journal box**.
10. 2–3 Duas from the Sunnah for that feeling.

### 3.4 Qur'an
- Surah list → reader. Each ayah: number, Arabic, translation, Listen controls, Save, ✎ Journal (inline reflection box), ✦ Reflect (opens Result).
- **Recitation:** the ayah being read glows, and the word being read glows gold; "Continuous" mode plays straight through. Reciter picker (13 reciters).
- States: loading verses, load more, audio loading.

### 3.5 Prayer times & qibla
- **Animated sky scene**: sun rises at sunrise, highest at Dhuhr, sets at Maghrib; sky colour changes per prayer (dawn pink at Fajr, golden at Asr, afterglow at Maghrib, stars at night); a mosque silhouette on the horizon; the **moon drawn in its real phase** and position.
- Tapping a prayer previews its sky + shows a **hadith for that prayer**.
- Timetable: Fajr, Sunrise, **Duha (voluntary, a time range)**, Dhuhr, Asr, Maghrib, Isha; next-prayer countdown; last third of the night.
- **Moon card**: phase, % lit, Islamic (Hijri) date, "white days" note mid-month.
- Qibla dial, calculation method settings. Location set via GPS or city search (empty state).

### 3.6 Adhkar
- Morning / evening toggle; each dhikr with Arabic, transliteration, translation, reference and a **tap counter** (e.g. 0/33). Progress kept for the day.

### 3.7 Duas from the Sunnah & How to make dua
- Grouped by situation ("When you're worried", "When you're angry", "When you're fasting and someone is rude to you"…), filter chips by feeling.
- Each dua card: Arabic, repeat count, transliteration, translation, note, hadith link + grading.
- How-to guide: sections (Why ask, How to ask — numbered steps, Times dua is answered, What holds it back…), each point with its references.

### 3.8 Stories of the Prophets & Companions
- Grid of people (Arabic name + English) → story page of numbered chapters.
- Each chapter: title, body, source chips (ayah / hadith / book), Save.
- Companion chapters from early histories carry a **"From the biographies"** label.
- Companion pages end with "Listen to the full story" links (YouTube series *The Firsts*).

### 3.9 99 Names
- List → Name page: Arabic, transliteration, meaning, "Make it a dua", "Live it", Qur'an reference.

### 3.10 Personal: Saved, Journal, My duas
- **Saved:** grouped (Duas, Ayat, Names, Stories); signed-out version shows device-only saves + sign-in prompt. Free accounts capped at 10 saves.
- **Journal:** list of reflections with the ayah they're about; free accounts see last 7 days (upgrade prompt for older).
- **My duas:** user's own dua list, mark answered.

### 3.11 Share sheet
- Bottom sheet with a **4:5 image card preview** and design picker: **Plain, Night, Emerald, Dawn, Parchment** (drawn in-browser). Buttons: Share image, Save image, Copy link.
- Designers: these card designs are a great place to bring craft.

### 3.12 Account & Supporter
- Sign in / sign up (email). Auth modal appears when saving/journaling while signed out.
- **Supporter** (monthly subscription via Stripe): unlimited saves, full journal history. Mission line: profits go to Islamic causes. Must stay low-pressure.

### 3.13 Settings & reminders
- Reciter, theme, push reminders (morning/evening adhkar etc.). On iPhone, reminders need "Add to Home Screen" first — needs a clear explainer.

---

## 4. Visual system (current)

### Themes (user-selectable)
| Theme | Feel | Card | Background | Accent | Gold |
|---|---|---|---|---|---|
| **Abyad** (default) | light, warm white | `#ffffff` | `#faf8f5` | teal `#1a8c8c` | `#c8973a` |
| **Mukhattam** | light, rose | `#ffffff` | `#fff8f8` | maroon `#8c1a1a` | `#c8973a` |
| **Aswad** | dark, near-black | `#16141e` | `#0a0a0f` | gold `#c8973a` | `#e8c97a` |
| **Ahmar** | dark, deep red | `#280c0c` | `#140404` | gold | `#e8c97a` |
| **Akhdar** | dark, deep green | `#0c1e0c` | `#060f06` | gold | `#e8c97a` |
| **Dhahabi** | dark, deep gold/brown | `#241800` | `#140e00` | `#e8c97a` | `#f0d890` |

All colours are CSS variables (`--card-bg`, `--bg-base`, `--accent-primary`, `--gold`, `--text-primary`, `--text-secondary`, `--text-arabic`, `--border`, card gradients per tone). Any redesign should keep a token system so all six themes work.

### Typography
- **Playfair Display** — headings, titles.
- **Nunito** — UI and body text.
- **Scheherazade New** — all Arabic (Qur'an, duas, names).

### Motifs in use
- Faint Islamic geometric (eight-pointed star) background pattern.
- Mosque silhouette (Discover header, prayer sky).
- Gold hairline rules and frames; soft card shadows; rounded cards (~16–20px).
- Gold glow for the recited word / ayah.

---

## 5. Content & Arabic rules (please respect)

- **Arabic is right-to-left** and must use proper Arabic shaping; never letter-space it, set it in all-caps-style tracking, or break words.
- **Qur'an text** is shown in full for its ayah — never truncated with "…" on a card.
- Arabic is typically **1.5–2.5× larger** than the translation beneath it, with generous line height (~2).
- **ﷺ** follows the Prophet's name; Companions' names are shown plainly (we don't currently add (ra)).
- Every sacred item shows its **source**; hadith from collections other than Bukhari/Muslim show a grading (e.g. "Hasan (al-Albani)").
- Avoid imagery of people/faces and living beings in decoration; abstract, geometric, architectural and nature (sky, moon, stars) motifs are appropriate.
- Translation of the Qur'an: Saheeh International.

---

## 6. Accessibility

- Text contrast ≥ 4.5:1 (body) and 3:1 (large) across **all six themes** — gold on white is the riskiest pairing.
- Touch targets ≥ 44×44 px; many current secondary buttons are smaller.
- Respect `prefers-reduced-motion` (sky animations, glow transitions).
- Screen-reader labels for icon-only buttons, the sky scene and the qibla dial.
- Dynamic type: layouts should survive 130% text size.

---

## 7. Where design help is most wanted

1. **A coherent visual identity** — logo/wordmark, app icon, splash; currently just "Companion" in text.
2. **Home & Discover hierarchy** — make "How are you feeling?" the obvious first action; tame the link list.
3. **The Result screen** — it's long; find a clearer rhythm between ayah, dua, reflection and journaling.
4. **Personal area** — unify Saved, Journal, My duas (and maybe settings) under one place.
5. **Story pages** (Prophets & Companions) — they're text-heavy; consider chapter navigation, progress, reading comfort.
6. **Share-card designs** — more templates, consistent with the brand.
7. **Onboarding** — a short first-run explaining feelings → ayah → dua, choosing a theme and reciter, and enabling reminders (with the iPhone Home Screen step).
8. **Empty / loading / error states** everywhere, and the signed-out experience.
9. **Supporter page** — warm, honest, non-pushy.

### Deliverables we'd love
- Brand basics (logo, icon, colour & type tokens mapped to the six themes).
- Mobile designs (375–430 px wide) for the screens above, with dark and light variants.
- Component library: cards (ayah, dua, story chapter, name), buttons, chips, audio player, bottom sheet, tab bar, inputs.
- Prototype of the core flow: feeling → result → save / journal / share.

---

## 8. Practical notes for the designer

- To see the app: run it locally (`npm run dev`) or ask for the deployed link once live.
- Content and data come from the Quran Foundation API, sunnah.com references and Supabase; designs should allow for **variable-length text** (an ayah can be 3 words or 120).
- 13 reciters, 6 themes, 11 feelings, 132 ayah pairings (35 live), 36 Sunnah duas, 25 prophets' stories, 8 Companions' stories, 99 Names.
