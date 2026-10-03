# Loop Local App Store Submission Packet

Updated: 2026-10-02

## Current state

Repo-side App Store preparation completed in this packet:

- public privacy, terms, support, and delete-account pages;
- footer/account links to those pages;
- canonical metadata moved to `https://trylooplocal.com`;
- 1024x1024 marketing icon generated at `store-assets/app-store/loop-local-app-icon-1024.png`;
- current native distribution plan in `docs/NATIVE_DISTRIBUTION.md`.

## Information to enter in App Store Connect

```text
App name: Loop Local
Subtitle: Find local events nearby
Primary category: Lifestyle
Secondary category: Entertainment
Content rights: The app may show user-submitted/local business content and linked third-party event details.
Age rating: Complete Apple questionnaire; likely suitable for a broad audience unless external links/content change the rating.
Privacy Policy URL: https://trylooplocal.com/privacy
Support URL: https://trylooplocal.com/support
Marketing URL: https://trylooplocal.com
```

Description draft:

```text
Loop Local helps you discover what is happening nearby, from live music and food events to community fundraisers, local markets, and neighborhood updates.

Browse upcoming events, save plans, open event details, share links, and submit local listings for review through Post Local. Businesses and community organizers can send events or business updates into the operator review queue before they appear publicly.
```

Review notes draft:

```text
No sign-in is required to browse discovery. Sign-in is used for synced saved events, account settings, and operator review access. Post Local submissions remain pending until reviewed by an operator.

Please use the supplied demo account for any authenticated review steps. Operator-only screens may not be visible to a standard demo account unless operator permissions are assigned before review.
```

## Apple-account tasks still required

These require the account owner in Apple Developer or App Store Connect:

- enroll or confirm Apple Developer Program membership;
- create the App Store Connect app record;
- register bundle ID `com.looplocal.app`;
- choose the legal seller name;
- add support/contact information;
- answer app privacy labels;
- answer export compliance and age rating;
- create private demo account credentials for App Review;
- upload screenshots;
- upload TestFlight build from Xcode.

## Build notes

The current web app is not a static export. Build the iOS app as a native shell around the production app or create a dedicated native/mobile bundle. Do not submit an unmodified webview that offers no native affordances.

Minimum native features to include before submission:

- launch screen;
- safe-area aware navigation;
- event share sheet;
- map/directions handoff;
- calendar handoff;
- support/legal/delete-account routes reachable in-app;
- camera/photo-library permission strings if image upload is enabled.
