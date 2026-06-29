# Loop Local Product Architecture + Build Plan

> **For Hermes:** Use `test-driven-development` for each implementation slice. Preserve working live-feed and filter behavior. Do not blindly rebuild or delete functional code.

**Goal:** Transform the current Loop Local workbench into a complete, polished, location-based local events platform that can grow into a real web/PWA + iOS + Android business.

**Architecture:** Keep the current Next.js App Router foundation, live feed wiring, PWA metadata, and event filter work. Incrementally add a real consumer discovery experience, auth/account flows, organization dashboards, admin approval, Supabase schema, storage, permissions, and Stripe-ready monetization.

**Tech Stack:** Next.js 16 App Router, React, TypeScript, Supabase Auth/Postgres/Storage/RLS, future Stripe, future Capacitor for iOS/Android wrappers.

---

## 1. Current inspection

### Keep

- Next.js + TypeScript scaffold in `/Users/promax/AI/workspaces/loop-local`.
- PWA foundation: `app/manifest.ts`, icons, `public/sw.js`, mobile metadata.
- Live feed adapter/proxy:
  - `lib/live-feed.ts`
  - `app/api/feed/route.ts`
- Real data parity from the actual app:
  - source: `live_supabase`
  - count: `141`
  - first event: `Matt Maeson - Watch My Step Tour`
- Event search/category/city/sort/moment filters in `components/app-shell.tsx`.
- `/post-local` wizard as a starting point for poster onboarding.
- Supabase migrations imported from recovery repo.
- Product/distribution docs already created.

### Improve immediately

- Current shell is still too lightweight and visually generic.
- It still feels like a landing page/feed, not a full mobile app.
- Event cards need images, price, venue, address, source/status, and stronger hierarchy.
- Discovery needs Card/List/Map/Calendar modes.
- Location entry/share-location affordance needs to be first-class.
- Filters need to become an advanced filter panel over time.
- The UI should move from dark/bot-like to bright, premium, mobile app-like.

### Missing app capabilities

- Supabase Auth user accounts.
- User preferences and saved events.
- Event poster accounts.
- Business/org/municipality/nonprofit dashboards.
- Admin approval system.
- Supabase Storage-backed image uploads.
- Role-based permissions/RLS.
- Stripe-ready pricing tables and checkout placeholders.
- Real map integration.
- Calendar/date browsing.
- Event detail pages.
- Business/org profile pages.
- GitHub write/push auth.
- Native wrapper scaffolding.

---

## 2. Product principles

1. **Do not clone the old app.** Use it as reference/data source while building a better product.
2. **Preserve working functionality.** Live feed and filters must keep passing tests.
3. **Mobile-first app feel.** Bottom tabs, compact surfaces, native-like cards, fast filters.
4. **Location-first.** The core question is: “What is worth doing near me right now?”
5. **Less copy, more utility.** Cards should carry the experience, not paragraphs.
6. **Business-ready.** Posting, approvals, monetization, and admin controls are first-class.
7. **Supabase as product backend.** Auth, DB, storage, RLS, and edge/API integration must be designed together.

---

## 3. Target app information architecture

### Consumer

- `/` — Discover
  - Location bar
  - Search
  - Quick filters
  - Card/List/Map/Calendar views
  - Personalized sections
- `/events/[slug]` — Event detail
- `/businesses/[slug]` — Venue/business/org profile
- `/saved` — Saved/favorite events
- `/profile` — Preferences/account

### Event posting

- `/post-local` — Public posting wizard
- `/dashboard` — Poster/business dashboard
- `/dashboard/events` — Manage submitted events
- `/dashboard/organization` — Org profile/settings
- `/dashboard/billing` — Stripe-ready posting plan/status

### Admin

- `/admin` — Review queue and metrics
- `/admin/events` — Approve/reject/edit events
- `/admin/users` — User management
- `/admin/organizations` — Organization verification and pricing flags
- `/admin/categories` — Category taxonomy
- `/admin/pricing` — Free/discount/paid posting rules

---

## 4. Supabase target model

Core tables to converge toward:

- `profiles`
- `organizations`
- `organization_members`
- `events`
- `event_categories`
- `event_media`
- `event_saves`
- `event_preferences`
- `event_submissions`
- `admin_reviews`
- `pricing_rules`
- `posting_orders`
- `featured_event_slots`

Role model:

- `user`
- `event_poster`
- `organization_admin`
- `municipality_admin`
- `nonprofit_admin`
- `moderator`
- `admin`

RLS direction:

- Public can read approved/published events.
- Users can manage their profile/preferences/saves.
- Organization members can manage their own org/events.
- Admin/moderator roles can review/approve/edit.
- Storage policies restrict uploads to owning organization/user.

No production schema mutation should happen without explicit approval.

---

## 5. Implementation phases

### Phase 1 — App experience foundation

- Preserve live feed and filters.
- Add premium light/mobile design system.
- Add location bar.
- Add Card/List/Map/Calendar views.
- Upgrade event cards with image, venue, address, price, source, and status.
- Keep production preview tunnel verified.

### Phase 2 — Event detail + richer discovery

- Add `/events/[slug]` route.
- Add event detail page with image, map/address, time, price, ticket link, save/share.
- Add business/venue linkout.
- Add filter URL state.
- Add improved sorting: distance, date, recently added, featured.

### Phase 3 — Accounts + saved events

- Add Supabase Auth client/server helpers.
- Add sign in/up pages.
- Add profile/preferences page.
- Add saved events table and UI.
- Start with local/dev-safe policies and no secret printing.

### Phase 4 — Posting dashboard

- Upgrade `/post-local` into production poster flow.
- Add org creation/profile.
- Add event draft/submission dashboard.
- Add Supabase Storage image upload path.
- Add submission status: draft/submitted/approved/rejected.

### Phase 5 — Admin + approval

- Add admin dashboard shell.
- Add review queue.
- Add approve/reject/edit controls.
- Add category/pricing management.
- Add spam/removal controls.

### Phase 6 — Monetization

- Add Stripe-ready pricing model docs/schema.
- Add checkout placeholder routes behind feature flags.
- Add free/discounted org classes for municipalities, schools, nonprofits, churches, community groups.
- Do not connect paid actions without explicit approval.

### Phase 7 — Native readiness

- Harden PWA.
- Add Capacitor scaffold when web app is stable.
- Prepare iOS/Android icons/splash/deep links.
- Document App Store / Play Store launch checklist.

---

## 6. Immediate next implementation slice

### Task 1: App-like discovery foundation

**Objective:** Make the home discovery experience feel like a real premium app while preserving live feed and filters.

**Files:**

- Modify: `components/app-shell.tsx`
- Modify: `app/globals.css`
- Modify: `scripts/test-product-reset-contract.py`

**Acceptance:**

- Contract test enforces:
  - location bar
  - Card/List/Map/Calendar view modes
  - event image rendering
  - venue/address/price metadata
  - premium light design markers
- `npm run test:all` passes.
- `npm run build` passes.
- Public production preview contains key markers.

### Task 2: Event detail route

Add `/events/[slug]` using the live feed as source first, then swap to Supabase-backed reads later.

### Task 3: Supabase schema plan

Create a migration proposal file for the complete product schema, but do not apply it to production until approved.

---

## 7. Known blockers

- GitHub write/push auth not configured locally.
- Native app publishing requires Apple/Google developer account actions and explicit approval.
- Stripe/payment actions require explicit approval.
- Production Supabase schema/data changes require explicit approval.

---

## 8. Current preview

Production preview tunnel:

```text
https://seeing-tagged-dist-ranging.trycloudflare.com
```

Local production server:

```text
http://127.0.0.1:3002
```
