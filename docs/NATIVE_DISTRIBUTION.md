# Loop Local Native + Distribution Path

Generated: 2026-06-29

## Current source/build status

Actual current product reference:

```text
https://replaced-gaming-selected-spectacular.trycloudflare.com
```

Local rebuild/workbench:

```text
/Users/promax/AI/workspaces/loop-local
http://127.0.0.1:3001
```

GitHub repository:

```text
https://github.com/ryanwortham/loop-local
```

GitHub write access is not configured locally yet. Read/clone works. To publish commits, authenticate locally:

```bash
brew install gh
gh auth login
gh auth setup-git
```

Do not paste tokens into Telegram or commit them to the repo.

Supabase project:

```text
itraeknotcdtdzaeukan / Local Loop App
```

Do not push production schema changes or mutate production data without explicit approval.

## Distribution strategy

### Phase 1 — Installable web app / PWA

The web app is the shared core for every platform.

Required artifacts:

```text
app/manifest.ts
app/icon.png
app/apple-icon.png
public/sw.js
metadata in app/layout.tsx
```

User value:

- Open from browser.
- Add to Home Screen on iOS.
- Install from Chrome/Edge on Android/desktop.
- Same Supabase backend.
- Fastest iteration loop.

### Phase 2 — Apple/iOS app

Recommended wrapper:

```text
Capacitor iOS
```

Target bundle id:

```text
com.looplocal.app
```

Needed before App Store/TestFlight:

- Apple Developer account.
- App Store Connect app record.
- Xcode signing team.
- Privacy nutrition labels.
- App privacy manifest.
- 1024x1024 app icon.
- iPhone screenshots.
- TestFlight build.

Build path when ready:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init "Loop Local" com.looplocal.app --web-dir=.next
npx cap add ios
npx cap open ios
```

Note: for production Capacitor, the Next app may need static export or a bundled web build strategy. Decide after core routes stabilize.

### Phase 3 — Google/Android app

Recommended wrapper:

```text
Capacitor Android
```

Target package id:

```text
com.looplocal.app
```

Needed before Play Store:

- Google Play Developer account.
- Android signing key.
- Adaptive icons.
- Feature graphic.
- Phone screenshots.
- Closed testing track.
- Data safety form.

Build path when ready:

```bash
npm install @capacitor/android
npx cap add android
npx cap open android
```

## Local-first operating rules

1. Every feature starts in the local workbench.
2. Run tests before commits.
3. Supabase migrations are staged locally first.
4. Production Supabase changes require approval.
5. GitHub publishing requires authenticated credentials on the Mac.
6. No secrets in source, docs, screenshots, logs, or chat.

## Quality bar

The app should feel like:

```text
Apple polish + Google utility + Supabase reliability
```

Design requirements:

- Mobile-first.
- Minimal copy.
- Native-feeling bottom tabs.
- Fast event discovery.
- Map/search/category first.
- Save/share/call/directions on cards.
- Business posting simplified into steps.
- Admin/moderation separated from public UX.

## Current blocker list

### GitHub publish blocker

```text
GitHub write access is missing locally.
```

Fix with `gh auth login` or a local credential store.

### App Store / Play Store blockers

```text
Developer accounts and signing credentials are not configured.
```

Do not attempt paid developer account actions without explicit approval.

### Production Supabase blocker

```text
Schema mutations require explicit approval.
```

Local migrations and local Supabase testing are OK.
