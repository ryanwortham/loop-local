# Loop Local Design System

Generated: 2026-06-29

## Brand identity

Loop Local is a modern, premium local discovery platform that keeps people connected to their community.

Mission:

> Stay in the loop with everything happening locally.

Users discover:

- Local events
- Community happenings
- Local businesses
- Exclusive deals
- Things to do
- Food & drink
- Entertainment
- Family activities
- Live music
- Festivals
- Seasonal events

## Product feel

The interface must feel:

- Premium
- Trustworthy
- Modern
- Effortless
- Helpful
- Friendly
- Community-focused
- Local-first

Design inspiration combines:

- Apple simplicity and polish
- Linear dark-mode precision
- Stripe cleanliness
- Airbnb usability

## Official colors

```css
--ll-bg-primary: #120D1D;
--ll-bg-secondary: #1B1428;
--ll-bg-deep: #0F0B18;
--ll-accent-primary: #1FB8FF;
--ll-accent-secondary: #3A8DFF;
--ll-accent-indigo: #5E6CFF;
--ll-accent-purple: #6F3BFF;
--ll-warm-accent: #F2B36D;
--ll-rose-accent: #D96C9F;
--ll-text-primary: #FFFFFF;
--ll-text-secondary: #E0D8E8;
--ll-text-muted: #A69AB4;
--ll-brand-gradient: linear-gradient(135deg, #7C4DFF 0%, #5E6CFF 48%, #1FB8FF 100%);
--ll-bg-gradient: linear-gradient(180deg, #120D1D 0%, #181123 48%, #21172D 100%);
```

No new UI colors should be introduced unless they fit this system. If a future state needs a semantic color, derive it from these brand colors or document the exception.

## Typography

Use Inter throughout.

Weights:

- 700 headings
- 600 buttons
- 500 labels
- 400 body

Text must be large, clean, and easy to scan.

## Components

### Buttons

- Border radius: 16–20px
- Primary actions use the brand gradient
- Hover: soft glow + slight translate/scale
- No harsh shadows

### Cards

- Dark navy surface
- Radius: 20–24px
- Border: low-opacity white
- Gentle elevation
- Generous padding

### Icons / marks

- Thin/simple/modern
- White or brand-gradient when appropriate

### Navigation

- Clean and minimal
- Native app feel
- Active states use brand gradient
- Mobile-first bottom navigation

### Motion

Allowed:

- Fade
- Scale
- Soft slide
- Smooth easing

Avoid flashy or distracting animation.

## UX rule

Every interface decision must answer:

> Does this make discovering local events and businesses faster and easier?

## content-first refinement

The brand system should feel premium and quiet, not overdesigned.

Target color distribution:

- 80% dark neutrals
- 15% white and gray typography
- 5% blue/purple accents

Refinement rules:

- Reduce blue/purple brand color usage by roughly 70–80% compared with the initial dark baseline.
- Keep the background primarily `#050B24` with only an extremely subtle gradient.
- Cards should read as dark navy content surfaces, not blue panels.
- Remove heavy glows from containers and cards.
- Use thin borders: `rgba(255, 255, 255, 0.06)`.
- Make typography and event imagery the primary hierarchy.
- Reserve the gradient for primary actions, active navigation, selected filters, progress, small accents, and logo usage.
- Secondary actions should be quiet dark outlined controls.
- Most category chips should be neutral dark chips with subtle borders; selected chips may use the brand gradient.
- Do not tint large sections blue; the interface should recede so events, businesses, photos, and local content become the hero.

## App Store consumer refinement

This refinement keeps the current palette and direction but makes the app feel lighter, more premium, and more content-first.

Rules:

- Only cards should feel like cards.
- Major page sections should breathe without visible outlines.
- Use whitespace instead of framed panels to separate discovery areas.
- Bring browsing above the fold.
- Reduce hero height by roughly 35–40% from the first dark baseline.
- Make event imagery the strongest visual element in event cards.
- Show only scannable default event metadata: title, date/time, venue, distance, and CTA.
- Move address, long summary, price details, and secondary metadata behind later detail/tap states.
- Make placeholder images quiet and clearly secondary to real photography.
- Navigation should feel light and consumer-app-like; inactive tabs should recede.

## Near-zero blue browsing chrome

The discovery/browsing UI should use almost no blue chrome.

Rules:

- Browsing controls should be neutral unless they are the main CTA.
- Date badges, section eyebrows, and placeholder cards should not use blue as their default color.
- Active view tabs should use a neutral selected state, not the brand gradient.
- The mobile active tab should be neutral glass unless it is a high-intent CTA.
- Placeholder images should feel like quiet absence states, not branded blue panels.
- Blue/purple remains available for the logo, primary CTA moments, and rare high-intent actions only.

## Media visibility correction

Media visibility beats over-muting. The previous near-zero-blue pass made the missing-image placeholder too faint, which made cards feel broken instead of premium.

Rules:

- Placeholder media must remain visibly legible even when blue chrome is restrained.
- Neutral UI chrome should never make event cards look empty.
- Real photos and placeholder art should read as the card's visual hero.
- If an event has no source image, the placeholder should be clear, calm, and polished — not invisible.

## Brighter premium card contrast

Cards need to stand out without becoming blue chrome.

Rules:

- Use brighter neutral card surfaces, clearer media, and stronger-but-soft elevation.
- Make event cards feel more tangible than the page background.
- Increase image contrast/brightness slightly so cards feel more colorful through content, not UI chrome.
- Keep blue/purple restrained to primary actions and logo-level accents.
- Do not solve card contrast by tinting cards blue.

## Brand-aware, less-blue palette redesign

Use brand colors as accents, not as the ambient color of the whole interface.

Rules:

- Shift the base scheme toward ink, plum, charcoal, and warm slate neutrals.
- Keep blue as a small brand note, not the page mood.
- Use purple first, then softened indigo, then blue only as the final highlight in the brand gradient.
- Let cards feel warm-premium and local-consumer, not admin-dashboard navy.
- Add warm/rose accent tokens for tiny labels, map moments, and category flavor where needed.
- Preserve content hierarchy: photos, event names, venues, and dates remain the hero.

## Livelier brand palette correction

The app should feel alive, local, and premium — not flat or cave-dark.

Rules:

- Add life with warm ambient light, brighter plum surfaces, rose/amber micro-accents, and clearer media.
- Keep the less-blue direction; blue should not return as ambient chrome.
- Lift the background from near-black into deep plum/ink so the page breathes.
- Give cards enough brightness and warmth to feel like consumer content, not admin panels.
- Let photos and fallback media carry the richest color.
- Use amber, rose, and lavender sparingly for local/community energy.

## Current implementation contract

The app CSS must expose:

```css
.loop-local-design-system
.brand-gradient-control
.dark-navy-surface
.native-app-motion
```

These markers are contract anchors for tests and future designers/developers.
