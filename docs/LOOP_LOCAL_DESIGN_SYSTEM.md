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
--ll-bg-primary: #050B24;
--ll-bg-secondary: #0A1538;
--ll-accent-primary: #1FB8FF;
--ll-accent-secondary: #3A8DFF;
--ll-accent-purple: #6F3BFF;
--ll-text-primary: #FFFFFF;
--ll-text-secondary: #C8D2E6;
--ll-text-muted: #7B89A8;
--ll-brand-gradient: linear-gradient(135deg, #1FB8FF 0%, #3A8DFF 45%, #6F3BFF 100%);
--ll-bg-gradient: linear-gradient(180deg, #050B24 0%, #07102D 100%);
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

## Current implementation contract

The app CSS must expose:

```css
.loop-local-design-system
.brand-gradient-control
.dark-navy-surface
.native-app-motion
```

These markers are contract anchors for tests and future designers/developers.
