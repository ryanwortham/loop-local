#!/usr/bin/env python3
"""Contract checks for the Loop Local 10x product reset foundation."""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(errors='ignore')


def assert_file(path: str) -> Path:
    p = ROOT / path
    assert p.exists(), f"missing {path}"
    assert p.stat().st_size > 0, f"empty {path}"
    return p


def test_reset_brief_exists_and_names_distribution_targets():
    brief = read('docs/LOOP_LOCAL_10X_PRODUCT_RESET.md')
    for marker in [
        '10x better',
        'Less wordy',
        'Web app / PWA',
        'iOS app wrapper',
        'Android app wrapper',
        'Supabase',
        'GitHub',
        'Copy rules',
    ]:
        assert marker in brief, f"missing reset marker {marker}"


def test_pwa_and_native_distribution_foundation_exists():
    for path in [
        'app/manifest.ts',
        'app/icon.png',
        'app/apple-icon.png',
        'public/sw.js',
        'docs/NATIVE_DISTRIBUTION.md',
    ]:
        assert_file(path)

    layout = read('app/layout.tsx')
    for marker in [
        'appleWebApp',
        'openGraph',
        'twitter',
        'themeColor',
        'viewport',
        'manifest',
        'mobile-web-app-capable',
    ]:
        assert marker in layout, f"layout missing mobile/PWA metadata marker {marker}"


def test_package_has_product_contract_script():
    pkg = json.loads(read('package.json'))
    assert 'test:product' in pkg['scripts']
    assert 'test:all' in pkg['scripts']
    assert 'scripts/test-product-reset-contract.py' in pkg['scripts']['test:product']


def test_home_is_intentionally_concise():
    source = read('components/app-shell.tsx') + read('app/page.tsx')
    visible_strings = re.findall(r'>([^<>{}\n]{12,})<|["`]([^"`]{18,})["`]', source)
    words = []
    for a, b in visible_strings:
        words.extend(re.findall(r"[A-Za-z0-9']+", a or b))
    assert len(words) < 1400, f"home shell too wordy: {len(words)} words in source strings"
    for forbidden in ['cockpit', 'operator UX', 'raw JSON', 'app-ready form shell']:
        assert forbidden.lower() not in source.lower(), f"wordy/internal phrase present: {forbidden}"


def test_live_reference_feed_is_wired_into_workbench():
    for path in [
        'lib/live-feed.ts',
        'app/api/feed/route.ts',
    ]:
        assert_file(path)
    page = read('app/page.tsx')
    shell = read('components/app-shell.tsx')
    feed = read('lib/live-feed.ts')
    api = read('app/api/feed/route.ts')
    for marker in [
        'getLiveFeed',
        'feedItems',
        'replaced-gaming-selected-spectacular.trycloudflare.com',
        'live_supabase',
        'items',
    ]:
        assert marker in (page + shell + feed + api), f"missing live data marker {marker}"


def test_event_filters_are_available_for_live_feed():
    shell = read('components/app-shell.tsx')
    css = read('app/globals.css')
    for marker in [
        'useState',
        'searchQuery',
        'activeCategory',
        'activeCity',
        'activeMoment',
        'filteredItems',
        'Search events',
        'All categories',
        'All cities',
        'No events match',
        'Clear filters',
    ]:
        assert marker in shell, f"missing event filter marker {marker}"
    for marker in ['filter-bar', 'filter-input', 'filter-select', 'filter-chip', 'results-summary']:
        assert marker in css, f"missing filter CSS marker {marker}"


def test_app_like_discovery_experience_exists():
    shell = read('components/app-shell.tsx')
    css = read('app/globals.css')
    plan = read('docs/LOOP_LOCAL_PRODUCT_ARCHITECTURE_PLAN.md')
    for marker in [
        'locationQuery',
        'Use my location',
        'Card view',
        'List view',
        'Map view',
        'Calendar view',
        'viewMode',
        'image_url',
        'eventImage',
        'venueLine',
        'priceLine',
        'addressLine',
        'Distance',
    ]:
        assert marker in shell, f"missing app-like discovery marker {marker}"
    for marker in [
        'app-canvas',
        'location-bar',
        'view-switcher',
        'event-image',
        'list-view',
        'map-view',
        'calendar-view',
        'premium-light',
    ]:
        assert marker in css, f"missing app-like discovery CSS marker {marker}"
    assert 'Phase 1 — App experience foundation' in plan


def test_missing_event_images_use_branded_loop_local_fallback():
    for path in [
        'public/looplocal-logo-app.jpg',
        'public/looplocal-logo-app.png',
        'public/looplocal-event-placeholder.jpg',
        'public/looplocal-event-placeholder.png',
        'public/looplocal-icon-192.png',
        'public/looplocal-icon-512.png',
        'app/icon.png',
        'app/apple-icon.png',
    ]:
        assert_file(path)
    shell = read('components/app-shell.tsx')
    css = read('app/globals.css')
    layout = read('app/layout.tsx')
    manifest = read('app/manifest.ts')
    for marker in [
        "'/looplocal-event-placeholder.jpg'",
        'hasEventImage',
        'event-image-fallback',
        'brand-logo-image',
        'Loop Local',
    ]:
        assert marker in shell, f"missing supplied event fallback marker {marker}"
    assert "'/looplocal-logo-app.png'" not in shell, 'square app logo still used as event-card fallback'
    assert 'source.unsplash.com' not in shell, 'random external event fallback image still present'
    assert "'/looplocal-event-fallback.svg'" not in shell, 'old generated SVG fallback still used by cards'
    for marker in ['event-image-fallback', 'brand-logo-image']:
        assert marker in css, f"missing fallback/logo CSS marker {marker}"
    for marker in ['/looplocal-icon-512.png', '/looplocal-logo-app.png']:
        assert marker in (layout + manifest), f"metadata missing canonical logo marker {marker}"


def test_loop_local_design_system_is_authoritative():
    design = read('docs/LOOP_LOCAL_DESIGN_SYSTEM.md')
    css = read('app/globals.css')
    shell = read('components/app-shell.tsx')
    for marker in [
        '#050B24',
        '#0A1538',
        '#1FB8FF',
        '#3A8DFF',
        '#6F3BFF',
        '#C8D2E6',
        '#7B89A8',
        'linear-gradient(135deg, #1FB8FF 0%, #3A8DFF 45%, #6F3BFF 100%)',
        'Stay in the loop with everything happening locally.',
    ]:
        assert marker in design, f"design system doc missing marker {marker}"
    for marker in [
        'loop-local-design-system',
        '--ll-bg-primary: #050B24',
        '--ll-bg-secondary: #0A1538',
        '--ll-accent-primary: #1FB8FF',
        '--ll-accent-secondary: #3A8DFF',
        '--ll-accent-purple: #6F3BFF',
        '--ll-text-secondary: #C8D2E6',
        '--ll-text-muted: #7B89A8',
        '--ll-brand-gradient: linear-gradient(135deg, #1FB8FF 0%, #3A8DFF 45%, #6F3BFF 100%)',
        '--ll-bg-gradient: linear-gradient(180deg, #050B24 0%, #07102D 100%)',
        'brand-gradient-control',
        'dark-navy-surface',
        'native-app-motion',
    ]:
        assert marker in css, f"CSS missing design-system marker {marker}"
    for forbidden in ['#ff5a5f', '#f8f7f2', '#fffaf4', '#3ecf8e', '#0071e3']:
        assert forbidden.lower() not in css.lower(), f"legacy/off-brand color still present: {forbidden}"
    assert 'loop-local-design-system' in shell


def test_loop_local_quiet_premium_refinement_limits_brand_color_usage():
    css = read('app/globals.css')
    design = read('docs/LOOP_LOCAL_DESIGN_SYSTEM.md')
    for marker in [
        'content-first refinement',
        '80% dark neutrals',
        '5% blue/purple accents',
        'Reserve the gradient for primary actions, active navigation, selected filters, progress, small accents, and logo usage.',
    ]:
        assert marker in design, f"design system doc missing quiet refinement marker {marker}"
    for marker in [
        '--ll-border: rgba(255, 255, 255, 0.06)',
        '--ll-surface: #0A1538',
        '--ll-surface-strong: #0B163A',
        '--ll-glow: 0 10px 24px rgba(31, 184, 255, 0.10)',
        'quiet-content-first',
        'neutral-event-chip',
        'quiet-navigation',
        'content-hero-card',
    ]:
        assert marker in css, f"CSS missing quiet refinement marker {marker}"
    assert css.count('var(--ll-brand-gradient)') <= 8, 'brand gradient is overused; keep it for important actions/selected states only'
    assert css.count('rgba(31, 184, 255') <= 8, 'blue tint is overused; keep accents subtle and sparse'
    for forbidden in [
        'box-shadow: 0 16px 44px rgba(0, 0, 0, 0.28)',
        'rgba(31, 184, 255, 0.22)',
        'rgba(111, 59, 255, 0.20)',
        'background: var(--ll-brand-gradient);\n  box-shadow: var(--ll-glow);\n}',
    ]:
        assert forbidden not in css, f"overdesigned/heavy visual treatment still present: {forbidden}"


def test_loop_local_app_store_consumer_refinement_prioritizes_content():
    css = read('app/globals.css')
    shell = read('components/app-shell.tsx')
    design = read('docs/LOOP_LOCAL_DESIGN_SYSTEM.md')
    for marker in [
        'App Store consumer refinement',
        'Only cards should feel like cards.',
        'Bring browsing above the fold.',
        'Make placeholder images quiet and clearly secondary to real photography.',
    ]:
        assert marker in design, f"design system doc missing App Store refinement marker {marker}"
    for marker in [
        'compact-consumer-hero',
        'unframed-discovery-section',
        'content-first-event-card',
        'scannable-event-meta',
        'quiet-placeholder-image',
        'subtle-active-nav',
        '--ll-card-radius: 30px',
        '--ll-card-shadow: 0 16px 36px rgba(0, 0, 0, 0.20)',
        '--ll-section-border: transparent',
    ]:
        assert marker in css, f"CSS missing App Store refinement marker {marker}"
    for marker in [
        'compact-consumer-hero',
        'content-first-event-card',
        'scannable-event-meta',
        'no-image-label',
    ]:
        assert marker in shell, f"shell missing App Store refinement marker {marker}"
    assert 'shortSummary(item)' not in shell, 'event cards still show dense summary text by default'
    assert 'addressLine(item) ||' not in shell, 'event cards still show address by default instead of hiding secondary details'
    assert css.count('border: 1px solid var(--ll-border);') <= 12, 'too many bordered containers; rely more on whitespace'
    assert 'grid-template-columns: minmax(0, 1fr) minmax(340px, .82fr)' not in css, 'hero still uses oversized two-column treatment'
    assert 'font-size: clamp(3rem, 8vw, 5.9rem)' not in css, 'hero headline is still too tall'
    assert 'min-height: 218px;' not in css, 'event image is not prominent enough for the refined card hierarchy'


def test_loop_local_browsing_ui_uses_near_zero_blue_chrome():
    css = read('app/globals.css')
    design = read('docs/LOOP_LOCAL_DESIGN_SYSTEM.md')
    for marker in [
        'Near-zero blue browsing chrome',
        'Browsing controls should be neutral unless they are the main CTA.',
        'Date badges, section eyebrows, and placeholder cards should not use blue as their default color.',
    ]:
        assert marker in design, f"design system doc missing near-zero-blue marker {marker}"
    for marker in [
        'near-zero-blue-chrome',
        '--ll-accent-browsing: rgba(255, 255, 255, 0.72)',
        '--ll-placeholder-opacity: .10',
        'neutral-active-view',
        'muted-date-badge',
        'muted-section-eyebrow',
    ]:
        assert marker in css, f"CSS missing near-zero-blue marker {marker}"
    assert css.count('var(--ll-brand-gradient)') <= 1, 'brand gradient still appears outside the main CTA level'
    for forbidden in [
        'background: var(--ll-brand-gradient);\n}\n\n.range-tabs button.active,\n.view-switcher button.active',
        'background: var(--ll-brand-gradient);\n  box-shadow: var(--ll-glow);',
        'color: var(--ll-accent-primary);\n  font-size: .74rem',
        'color: var(--ll-accent-primary);\n  background: rgba(255,255,255,.055);',
        'opacity: .34;',
    ]:
        assert forbidden not in css, f"browsing UI still has too much blue/chroma: {forbidden}"


def test_supabase_and_github_status_are_documented_without_secrets():
    native = read('docs/NATIVE_DISTRIBUTION.md')
    reset = read('docs/LOOP_LOCAL_10X_PRODUCT_RESET.md')
    combined = native + reset
    for marker in [
        'itraeknotcdtdzaeukan',
        'ryanwortham/loop-local',
        'GitHub write access',
        'Do not paste tokens',
        'Do not push production schema changes',
    ]:
        assert marker in combined, f"missing access marker {marker}"
    for forbidden in ['service_role', 'sb_secret_', 'postgresql://postgres:', 'SUPABASE_SERVICE_ROLE_KEY']:
        assert forbidden not in combined, f"forbidden secret marker {forbidden}"


if __name__ == '__main__':
    test_reset_brief_exists_and_names_distribution_targets()
    test_pwa_and_native_distribution_foundation_exists()
    test_package_has_product_contract_script()
    test_home_is_intentionally_concise()
    test_live_reference_feed_is_wired_into_workbench()
    test_event_filters_are_available_for_live_feed()
    test_app_like_discovery_experience_exists()
    test_missing_event_images_use_branded_loop_local_fallback()
    test_loop_local_design_system_is_authoritative()
    test_loop_local_quiet_premium_refinement_limits_brand_color_usage()
    test_loop_local_app_store_consumer_refinement_prioritizes_content()
    test_loop_local_browsing_ui_uses_near_zero_blue_chrome()
    test_supabase_and_github_status_are_documented_without_secrets()
    print('loop_local_10x_product_reset_contract_ok')
