# Loop Local Native Distribution

Updated: 2026-10-02

## Current verdict

Loop Local is ready for App Store preparation, but not for a public App Store submission until the Apple-account tasks and native build are completed.

The web app now has the public support/legal pages Apple expects:

- `https://trylooplocal.com/privacy`
- `https://trylooplocal.com/terms`
- `https://trylooplocal.com/support`
- `https://trylooplocal.com/delete-account`

The current repo-side App Store marketing icon is:

```text
store-assets/app-store/loop-local-app-icon-1024.png
```

## Recommended sequence

### 1. Ship TestFlight before public App Store

Use TestFlight as the first native distribution milestone. It lets the team test login, saved events, Post Local, uploads, event details, support/legal links, and operator access on real iPhones before App Review.

### 2. Use a native iOS wrapper with app-specific polish

Do not submit a plain website wrapper. The iOS app should include enough native behavior to be a real app experience:

- stable app icon and launch screen;
- native status-bar/safe-area handling;
- share sheet for event links;
- map/directions handoff from event detail pages;
- calendar handoff for dated events;
- support/legal/account deletion links available in-app;
- graceful offline/loading states;
- camera/photo-library permission descriptions if uploads are exposed in the native build.

### 3. Keep the Next/Vercel app as the shared core

The current product is a server-rendered Next app with Supabase-backed dynamic routes. A native build should either:

- use a small native shell that loads `https://trylooplocal.com` and adds native affordances, or
- create a separate static/exportable mobile bundle later if the app architecture changes.

Do not point Capacitor at `.next` as if it were a static web directory. That old June note was stale for the current Next runtime.

## Apple-side requirements

These cannot be completed from this repo alone:

- Apple Developer Program membership, normally paid yearly.
- App Store Connect app record.
- Bundle ID, recommended: `com.looplocal.app`.
- Signing team and provisioning profile in Xcode.
- App privacy labels in App Store Connect.
- Export compliance answers.
- Age rating questionnaire.
- App Review contact information.
- Demo/test account for Apple Review.
- Final screenshots uploaded in App Store Connect.

## Access and safety notes

Repository: `https://github.com/ryanwortham/loop-local`

GitHub write access is now available on this Mac through the `ryanwortham` GitHub CLI identity. SSH may still default to a different local GitHub identity, so token-safe HTTPS pushes may be needed when publishing from this machine.

Do not paste tokens into Telegram or commit them to the repo.

Supabase project:

```text
itraeknotcdtdzaeukan / Local Loop App
```

Do not push production schema changes or mutate production data without explicit approval.

## Suggested App Store metadata

```text
Name: Loop Local
Subtitle: Find local events nearby
Category: Lifestyle
Secondary category: Entertainment
Bundle ID: com.looplocal.app
SKU: loop-local-ios
Privacy Policy URL: https://trylooplocal.com/privacy
Support URL: https://trylooplocal.com/support
Marketing URL: https://trylooplocal.com
```

Short description:

```text
Loop Local helps you find events, food, music, deals, and community activity near you.
```

Promotional text:

```text
Discover what is happening nearby, save events, share plans, and submit local listings for review.
```

Keywords:

```text
local events,things to do,food,music,community,deals,nearby,St Louis
```

Review notes:

```text
Loop Local is a local discovery app for events and business activity. Users can browse events without signing in. Sign-in is used for synced saved events, account settings, and operator review access. Post Local submissions are reviewed before publication.
```

## App Privacy labels draft

Confirm these in App Store Connect before submission:

| Data type | Collected | Linked to user | Used for tracking |
| --- | --- | --- | --- |
| Email address | Yes, for accounts and submission contact | Yes | No |
| Name/display name | Yes, for profiles/operator display | Yes | No |
| User ID | Yes, Supabase auth/account records | Yes | No |
| Photos/media | Yes, when submitted with local listings | May be linked to submitter | No |
| Location | Not precise by default in the current app | No, unless native location is added | No |
| Diagnostics | Limited operational logs/health signals | Not intentionally linked | No |

If the native build requests device location, camera, photo library, analytics, advertising, or push notifications, update this table before submission.

## Required native permission copy

Only add these to the native app if the feature is enabled:

```text
NSCameraUsageDescription: Loop Local uses the camera so you can add a photo to a local event or business submission.
NSPhotoLibraryUsageDescription: Loop Local uses your photo library so you can choose an image for a local event or business submission.
NSLocationWhenInUseUsageDescription: Loop Local uses your location to show nearby events and improve distance sorting.
```

## Screenshot set to capture

Capture iPhone screenshots from the production app after the native shell is available:

1. Discover screen with upcoming events.
2. Event detail page with save/share/action controls.
3. Past events tab.
4. Post Local submission flow.
5. Account/support screen.

## Pre-submit checklist

- [x] Public privacy page exists.
- [x] Public terms page exists.
- [x] Public support page exists.
- [x] Public account/data deletion request page exists.
- [x] 1024x1024 App Store icon exists in repo.
- [ ] Apple Developer account is active.
- [ ] App Store Connect app record exists.
- [ ] Bundle ID `com.looplocal.app` is registered.
- [ ] Native iOS wrapper is implemented.
- [ ] Real iPhone smoke test passes.
- [ ] TestFlight build uploaded.
- [ ] App privacy labels are confirmed.
- [ ] Screenshots are captured and uploaded.
- [ ] Apple Review demo account is created and documented privately.

## Commands after native project exists

```bash
npm ci
npm run test:all
npm run build
```

Then build/archive from Xcode using the configured Apple signing team. Do not commit provisioning profiles, certificates, `.env.local`, API keys, or App Store Connect credentials.
