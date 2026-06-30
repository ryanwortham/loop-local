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
        'primaryUrl',
        'visibleItems',
        'calendarItems',
        "viewMode === 'card'",
        "viewMode === 'list'",
        "viewMode === 'map'",
        "viewMode === 'calendar'",
        'map-view',
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
    test_old_incremental_design_artifacts_removed()
    print('loop_local_complete_frontend_rebuild_contract_ok')
