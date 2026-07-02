#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding='utf-8')


def test_live_engine_and_distribution_docs_remain_present():
    package = read('package.json')
    page = read('app/page.tsx')
    feed = read('lib/live-feed.ts')
    native = read('docs/NATIVE_DISTRIBUTION.md')
    reset = read('docs/LOOP_LOCAL_10X_PRODUCT_RESET.md')
    combined = package + page + feed + native + reset
    for marker in [
        'test:product',
        'getLiveFeed',
        'LiveFeedItem',
        'itraeknotcdtdzaeukan',
        'ryanwortham/loop-local',
        'GitHub write access',
        'Do not paste tokens',
        'Do not push production schema changes',
    ]:
        assert marker in combined, f'missing preserved engine/distribution marker {marker}'
    for forbidden in ['service_role', 'sb_secret_', 'postgresql://postgres:', 'SUPABASE_SERVICE_ROLE_KEY']:
        assert forbidden not in combined, f'forbidden secret marker {forbidden}'


def test_complete_frontend_rebuild_matches_reference_without_touching_engine():
    css = read('app/globals.css')
    design = read('docs/LOOP_LOCAL_DESIGN_SYSTEM.md')
    shell = read('components/app-shell.tsx')
    post = read('components/post-local-wizard.tsx')
    for marker in [
        'Complete frontend rebuild: premium local discovery app',
        'Replace the frontend shell while preserving Supabase, API endpoints, event feed, routing, search logic, filters, maps, and business functionality.',
        'Reference mood: Airbnb clarity, Spotify energy, Apple polish, Google Maps utility, Eventbrite event intent, Instagram Explore image-led browsing.',
    ]:
        assert marker in design, f'design doc missing complete rebuild marker {marker}'
    for marker in [
        'complete-frontend-rebuild',
        '--ll-rebuild-blue: #155EEF',
        '--ll-rebuild-ink: #07112B',
        '--ll-rebuild-bg: #F7F9FC',
        '--ll-rebuild-card: #FFFFFF',
        '--ll-rebuild-cyan: #EAF6FF',
        '--ll-rebuild-radius-xl: 32px',
        '--ll-rebuild-shadow: 0 22px 70px rgba(7, 17, 43, 0.10)',
        '.app-reference-shell',
        '.local-hero-panel',
        '.discovery-phone',
        '.event-detail-preview',
        '.explore-card',
        '.popular-list-row',
        '.mobile-app-tabbar',
    ]:
        assert marker in css, f'CSS missing full rebuild marker {marker}'
    for marker in [
        'complete-frontend-rebuild',
        'app-reference-shell',
        'local-hero-panel',
        'discovery-phone',
        'event-detail-preview',
        'explore-card',
        'popular-list-row',
        'mobile-app-tabbar',
        'value-tile-grid',
        'ticket-action-strip',
    ]:
        assert marker in shell, f'home shell missing reference-inspired rebuild marker {marker}'
    for marker in ['post-local-shell', 'complete-frontend-rebuild', 'post-mobile-reference-shell', 'post-flow-card', 'mobile-app-tabbar']:
        assert marker in post, f'Post Local route missing rebuild marker {marker}'


def test_home_preserves_search_filters_views_and_feed_logic():
    shell = read('components/app-shell.tsx')
    for preserved in [
        'useState',
        'useMemo',
        'setSearchQuery',
        'setLocationQuery',
        'setActiveCategory',
        'setActiveCity',
        'setActiveMoment',
        'setSortBy',
        'setViewMode',
        'matchesMoment',
        'sortItems',
        'eventDetailPath',
        'eventExternalUrl',
        'visibleItems',
        'calendarItems',
        "viewMode === 'card'",
        "viewMode === 'list'",
        "viewMode === 'map'",
        "viewMode === 'calendar'",
        'map-discovery-shell',
        'calendar-view',
        'empty-filter-state',
    ]:
        assert preserved in shell, f'working search/filter/view/feed behavior was removed: {preserved}'


def test_event_media_and_placeholder_assets_stay_intentional():
    shell = read('components/app-shell.tsx')
    css = read('app/globals.css')
    for marker in [
        "item.image_url || '/looplocal-event-placeholder.jpg'",
        "backgroundImage: `url(${eventImage(item)})`",
        '/looplocal-event-placeholder.jpg',
        'quiet-placeholder-image',
        'explore-card-image',
    ]:
        assert marker in shell + css, f'missing media/placeholder marker {marker}'
    assert 'source.unsplash.com' not in shell + css, 'random external placeholder images should not be used'


def test_post_local_preserves_form_fields_and_uploads():
    post = read('components/post-local-wizard.tsx')
    for marker in [
        'FileDropInput',
        'Business/community/entity name',
        'Contact name',
        'Email',
        'Phone number',
        'Street address',
        'Website',
        'Entity type',
        'Event title',
        'Event date',
        'Start time',
        'End time',
        'Website/ticket link',
        'Submit for Approval',
        'mobile_date_picker_contract',
        'mobile_time_picker_contract',
    ]:
        assert marker in post, f'Post Local field/functionality removed: {marker}'



def test_loop_local_ux_polish_tightens_mobile_cards_detail_nav_and_hierarchy():
    css = read('app/globals.css')
    shell = read('components/app-shell.tsx')
    design = read('docs/LOOP_LOCAL_DESIGN_SYSTEM.md')
    for marker in [
        'UX polish pass: tighter spacing, mobile layout, card density, detail preview, bottom nav, and hierarchy.',
        'Preserve the complete frontend rebuild; polish density and hierarchy without reverting to older palette iterations.',
    ]:
        assert marker in design, f'design doc missing UX polish marker {marker}'
    for marker in [
        'ux-polish-pass',
        '--ll-polish-page-gutter: clamp(10px, 1.4vw, 18px)',
        '--ll-polish-card-gap: 10px',
        '--ll-polish-compact-shadow: 0 10px 30px rgba(7, 17, 43, 0.075)',
        '.complete-frontend-rebuild.ux-polish-pass',
        '.featured-rail.polished-card-density',
        '.popular-list.polished-list-density',
        '.event-detail-preview.polished-detail-preview',
        '.mobile-app-tabbar.polished-bottom-nav',
        '@media (max-width: 520px)',
        'padding-bottom: max(92px, env(safe-area-inset-bottom) + 76px)',
    ]:
        assert marker in css, f'CSS missing UX polish marker {marker}'
    for marker in [
        'ux-polish-pass',
        'polished-card-density',
        'polished-list-density',
        'polished-detail-preview',
        'polished-bottom-nav',
        'polished-view-dock',
    ]:
        assert marker in shell, f'home shell missing UX polish class {marker}'
    for preserved in ['complete-frontend-rebuild', 'app-reference-shell', 'discovery-phone', 'event-detail-preview', 'mobile-app-tabbar']:
        assert preserved in shell + css, f'polish pass must preserve rebuild anchor {preserved}'


def test_loop_local_cards_clamp_text_and_contain_placeholder_brand_art():
    css = read('app/globals.css')
    shell = read('components/app-shell.tsx')
    for marker in [
        'card-overflow-media-fix',
        '--ll-card-media-featured-height: 112px',
        '--ll-card-media-standard-height: 144px',
        '-webkit-line-clamp: 2',
        'overflow-wrap: anywhere',
        'text-overflow: ellipsis',
        'background-size: min(76%, 360px) auto',
        'background-repeat: no-repeat',
        'background-color: #07112B',
        '.quiet-popular-placeholder',
    ]:
        assert marker in css, f'CSS missing card overflow/media fix marker {marker}'
    for marker in [
        "style={hasEventImage ? { backgroundImage: `url(${eventImage(item)})` } : undefined}",
        "className={item.image_url ? 'popular-thumb' : 'popular-thumb quiet-popular-placeholder'}",
        "style={item.image_url ? { backgroundImage: `url(${eventImage(item)})` } : undefined}",
    ]:
        assert marker in shell, f'card markup still forces placeholder crop or missing containment marker {marker}'


def test_loop_local_hero_headline_is_not_oversized_after_polish():
    css = read('app/globals.css')
    for marker in [
        'hero-headline-size-fix',
        '.ux-polish-pass .local-hero-panel h1 { font-size: clamp(2.2rem, 3.9vw, 3.85rem); line-height: .98; letter-spacing: -.065em; }',
        '.ux-polish-pass .hero-logo-lockup { margin-bottom: clamp(20px, 4vh, 34px); }',
        '.ux-polish-pass .hero-subcopy { margin: 14px 0 14px; max-width: 24rem; }',
        '.ux-polish-pass .local-hero-panel { justify-content: flex-start; }',
        '.ux-polish-pass .hero-actions { margin-top: 18px; gap: 9px; }',
        '@media (max-width: 860px)',
        '.ux-polish-pass .local-hero-panel h1 { font-size: clamp(2rem, 9vw, 3.15rem); letter-spacing: -.06em; }',
        '@media (max-width: 520px)',
        '.ux-polish-pass .local-hero-panel h1 { font-size: clamp(1.9rem, 10vw, 2.75rem); }',
    ]:
        assert marker in css, f'CSS missing hero headline size fix marker {marker}'


def test_loop_local_real_event_detail_pages_exist_and_cards_link_internally():
    shell = read('components/app-shell.tsx')
    route = read('app/events/[slug]/page.tsx')
    css = read('app/globals.css')
    feed = read('lib/live-feed.ts')
    for marker in [
        'event-detail-route-real-page',
        'getEventBySlug',
        'generateStaticParams',
        'generateMetadata',
        'notFound()',
        'EventDetailPage',
        'event-detail-page-shell',
        'event-detail-hero-panel',
        'event-detail-info-card',
        'event-detail-map-card',
        'event-detail-related-card',
        'Back to Discover',
        'Get directions',
        'View source',
        'Reserve / tickets',
    ]:
        assert marker in route + css, f'missing real event detail page marker {marker}'
    for marker in [
        'export function eventSlug',
        'export function eventDetailPath',
        'export function eventExternalUrl',
        'export async function getEventBySlug',
        'eventDetailPath(item)',
    ]:
        assert marker in feed + shell, f'missing detail routing/data helper marker {marker}'
    assert 'href={eventDetailPath(item)}' in shell, 'event cards must link to internal /events/[slug] detail pages'
    assert 'href={eventExternalUrl(heroEvent)}' in shell, 'hero detail preview must preserve external ticket/source CTA separately'


def test_loop_local_map_experience_upgrade_preserves_map_mode_and_adds_discovery_ui():
    shell = read('components/app-shell.tsx')
    css = read('app/globals.css')
    for marker in [
        'map-experience-upgrade',
        'map-discovery-shell',
        'map-control-bar',
        'map-radius-chip',
        'map-neighborhood-chip',
        'map-canvas-premium',
        'map-route-line',
        'map-pin-cluster',
        'map-selected-event-card',
        'map-side-results',
        'Open event',
        'Directions',
    ]:
        assert marker in shell + css, f'missing map upgrade marker {marker}'
    for preserved in [
        "viewMode === 'map'",
        'visibleItems.slice(0, 10)',
        'setViewMode',
        'eventDetailPath(item)',
        'distanceLine(item)',
    ]:
        assert preserved in shell, f'map upgrade removed preserved feed/view behavior {preserved}'


def test_loop_local_post_local_premium_wizard_preserves_fields_and_improves_flow():
    post = read('components/post-local-wizard.tsx')
    css = read('app/globals.css')
    for marker in [
        'post-local-premium-wizard',
        'post-local-command-center',
        'post-wizard-shell-grid',
        'post-wizard-stage-card',
        'post-wizard-stepper',
        'post-wizard-trust-card',
        'post-wizard-live-preview',
        'post-wizard-mobile-dock',
        'Premium submission flow',
        'Start with your profile',
        'Build the first post',
        'Preview your listing',
        'Submit for approval',
    ]:
        assert marker in post + css, f'missing premium Post Local wizard marker {marker}'
    for preserved in [
        'FileDropInput',
        'Business/community/entity name',
        'Contact name',
        'Email',
        'Phone number',
        'Street address',
        'Website',
        'Entity type',
        'Event title',
        'Event date',
        'Start time',
        'End time',
        'Website/ticket link',
        'Submit for Approval',
        'mobile_date_picker_contract',
        'mobile_time_picker_contract',
    ]:
        assert preserved in post, f'premium wizard removed Post Local field/functionality {preserved}'

def test_old_incremental_design_artifacts_removed():
    combined = read('app/globals.css') + read('components/app-shell.tsx') + read('components/post-local-wizard.tsx')
    for forbidden in [
        'professional-consumer-redesign',
        'reference-full-site-surfaces',
        'professional-event-card',
        'professional-filter-system',
        'feed-layout-shell',
        'dark-navy-surface',
        'less-blue-brand-palette',
        'reference-navy-blue-palette',
        'background: var(--ll-hero-overlay)',
        '--ll-navy-panel:',
    ]:
        assert forbidden not in combined, f'old incremental design artifact remains after full rebuild: {forbidden}'


if __name__ == '__main__':
    test_live_engine_and_distribution_docs_remain_present()
    test_complete_frontend_rebuild_matches_reference_without_touching_engine()
    test_home_preserves_search_filters_views_and_feed_logic()
    test_event_media_and_placeholder_assets_stay_intentional()
    test_post_local_preserves_form_fields_and_uploads()
    test_loop_local_ux_polish_tightens_mobile_cards_detail_nav_and_hierarchy()
    test_loop_local_cards_clamp_text_and_contain_placeholder_brand_art()
    test_loop_local_hero_headline_is_not_oversized_after_polish()
    test_loop_local_real_event_detail_pages_exist_and_cards_link_internally()
    test_loop_local_map_experience_upgrade_preserves_map_mode_and_adds_discovery_ui()
    test_loop_local_post_local_premium_wizard_preserves_fields_and_improves_flow()
    test_old_incremental_design_artifacts_removed()
    print('loop_local_complete_frontend_rebuild_contract_ok')
