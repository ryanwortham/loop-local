# Loop Local 10x Product Reset

Generated: 2026-06-29

## Source of truth for inspiration

Actual current app provided by user:

```text
https://replaced-gaming-selected-spectacular.trycloudflare.com
```

Fresh audit result:

```text
HTTP 200
Title: Loop Local
Home HTML size: 539,846 bytes
Home text size: 39,116 characters
Post Local HTML size: 72,237 bytes
```

The current app proves the concept, data model, and discovery categories. It should be treated as product inspiration and recovery material, **not** as the final UX.

## User directive

Build something **10x better**:

- Less wordy.
- Premium Apple-quality user experience.
- Available as a web app.
- Installable like an app.
- Ready for Apple/iOS and Google/Android packaging.
- Backed by Supabase.
- Stored in GitHub.
- Locally accessible at all times for continued work.

## Product north star

Loop Local is the fastest way to answer:

> What is worth doing near me right now?

The app should feel like a native local-discovery app, not a website full of copy.

## What is wrong with the current app

### 1. Too much text

The home page exposes many labels, explanations, repeated action words, category descriptions, and internal status phrases. The user should see decisions, not paragraphs.

Replace:

```text
Long descriptions, repeated labels, technical/internal copy, multi-line explanations
```

With:

```text
Short verbs, visual cards, swipeable rails, contextual chips, one-line prompts
```

### 2. The core action is buried

A local discovery app should prioritize:

1. Near me now
2. Tonight
3. This weekend
4. Food / music / family / deals
5. Post something local

### 3. It feels web-first, not app-first

The new version should feel like:

- Apple Maps + App Store editorial polish
- Google local discovery speed
- Supabase-grade backend clarity for operators

### 4. Business posting flow is too much form at once

The posting flow should become a native-feeling wizard:

```text
Who are you? → What are you posting? → Add media → Preview → Submit
```

Each step should have one clear job.

## 10x UX principles

### 1. Three-second value

Within three seconds, a user should know:

- What is happening nearby
- What starts soon
- What is popular
- What they can save/share

### 2. One-screen home

Mobile first:

```text
Hero search
Location pill
Happening now rail
Tonight rail
Categories
Map preview
Bottom tabs
```

No large blocks of prose.

### 3. Native-app rhythm

Use:

- Bottom tab bar
- Large tap targets
- Horizontal card rails
- Pull-to-refresh-ready structure
- Sticky search/location shell
- Native date/time controls
- Share/save/directions/call actions

### 4. Premium visual language

Blend:

- Apple: space, restraint, clean SF/system typography, cinematic sections
- Google: fast local utility, maps/search/categories, direct actions
- Supabase: reliable operator/backend foundation, dark admin/dev surfaces

### 5. Progressive distribution

Ship in this order:

1. **Web app / PWA**: fastest, shareable, installable.
2. **iOS app wrapper**: Capacitor or Expo wrapper around the same app when ready.
3. **Android app wrapper**: same shared web core.
4. **Store polish**: icons, screenshots, privacy labels, app manifests.

## New information architecture

### Public user app

```text
/
  Discover / home

/events
  Event list with filters

/events/[slug]
  Event detail with save/share/call/website/directions

/businesses
  Local business directory

/businesses/[slug]
  Business profile with events/deals/follow/claim

/map
  Map-first discovery

/saved
  Saved events/businesses

/profile
  User profile/preferences

/post-local
  Submit business/event/promotion/community item
```

### Operator app

```text
/admin
  Moderation dashboard

/admin/submissions
  Pending posts/businesses

/admin/events
  Event management

/admin/businesses
  Business management

/admin/analytics
  Views/clicks/saves/follows
```

## Bottom tabs

Primary mobile tabs:

```text
Discover
Events
Map
Saved
Profile
```

Floating action:

```text
Post
```

## Copy rules

### Max lengths

| Copy type | Max length |
|---|---:|
| Hero headline | 6 words |
| Card title | 8 words |
| Card subtitle | 12 words |
| CTA | 3 words |
| Empty state title | 5 words |
| Empty state body | 18 words |
| Form helper text | 12 words |

### Preferred verbs

```text
Find
Save
Share
Post
Claim
Follow
Call
Go
```

### Avoid

```text
Long explanations
Internal status phrases
Repeated labels
Technical implementation copy
Marketing fluff
```

## Visual direction

### User app

- Light-first with Apple-style white/soft-gray canvas.
- High-contrast event imagery.
- SF/system font stack.
- Apple Blue for global actions.
- Category color used only as small chips/accents.
- Cards feel native, not dashboard-like.

### Operator/admin app

- Supabase-inspired dark mode.
- Clear tables, filters, moderation queues.
- Green only for healthy/approved states.
- Amber for pending.
- Red for rejected/needs attention.

## App foundation requirements

### Web/PWA

Must include:

- `manifest.webmanifest`
- Apple touch icons
- `theme-color`
- iOS status bar metadata
- Open Graph/Twitter metadata
- installable icon set
- service worker strategy or documented PWA path
- responsive/mobile-first shell

### iOS/Apple path

Preferred path:

```text
Web core → Capacitor iOS wrapper → Xcode project → App Store Connect
```

Need later:

- Apple Developer account
- bundle id, likely `com.looplocal.app`
- app icon set
- privacy manifest
- screenshots
- TestFlight setup

### Android/Google path

Preferred path:

```text
Web core → Capacitor Android wrapper → Google Play Console
```

Need later:

- Google Play Developer account
- package id, likely `com.looplocal.app`
- adaptive icons
- store listing assets
- closed testing track

## Supabase foundation

Current linked project:

```text
itraeknotcdtdzaeukan / Local Loop App
```

Core tables/functions should support:

- profiles
- businesses
- events
- submissions
- saved_events
- follows
- event_analytics
- moderation status
- media storage metadata
- nearby events function

Rule: develop migrations locally first. Do not push production schema changes without explicit approval.

## GitHub foundation

Repo:

```text
https://github.com/ryanwortham/loop-local
```

Current limitation:

```text
Read access works. Write access needs local GitHub auth.
```

Required to publish work:

```bash
brew install gh
gh auth login
gh auth setup-git
```

Do not paste tokens into chat.

## First build milestone

Milestone name:

```text
Loop Local App Core v1
```

Deliverables:

1. New premium mobile-first discover home.
2. Installable PWA metadata/icons.
3. Event/business card system.
4. `/post-local` simplified wizard.
5. Supabase client/read layer.
6. Local migrations staged, not pushed.
7. GitHub-ready commits.
8. Native wrapper plan documented.

## Acceptance criteria

The rebuilt app is not acceptable until:

- It loads locally.
- It builds cleanly.
- It has fewer words than the current home page by design.
- It has PWA metadata.
- It has clear Apple/iOS and Google/Android packaging docs.
- It can be worked on locally at any time.
- It has a GitHub remote configured.
- Supabase project link is documented and verified.
- No secrets are printed or committed.
