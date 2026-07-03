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
        "className={item.image_url ? 'popular-thumb' : 'popular-thumb local-photo-fallback quiet-popular-placeholder'}",
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


def test_loop_local_event_detail_polish_improves_detail_page_hierarchy_and_mobile():
    route = read('app/events/[slug]/page.tsx') + read('components/event-detail-client-actions.tsx')
    css = read('app/globals.css')
    for marker in [
        'event-detail-polish-pass',
        'event-detail-premium-shell',
        'event-detail-sticky-cta-bar',
        'event-detail-quick-facts',
        'event-detail-hero-kicker-row',
        'event-detail-media-safe',
        'event-detail-content-card',
        'event-detail-action-cluster',
        'event-detail-related-polished',
        'Save event',
        'Share event',
        'Add to calendar',
        'Plan your visit',
    ]:
        assert marker in route + css, f'missing event detail polish marker {marker}'
    for preserved in [
        'generateStaticParams',
        'generateMetadata',
        'getEventBySlug',
        'notFound()',
        'eventExternalUrl(event)',
        'eventDetailPath(item)',
        'Reserve / tickets',
        'Get directions',
        'Open in Maps',
    ]:
        assert preserved in route, f'event detail polish removed preserved detail behavior {preserved}'


def test_loop_local_live_data_quality_and_image_fallbacks_are_normalized():
    feed = read('lib/live-feed.ts')
    shell = read('components/app-shell.tsx')
    route = read('app/events/[slug]/page.tsx')
    css = read('app/globals.css')
    for marker in [
        'live-data-quality-pass',
        'normalizeFeedItem',
        'normalizeCategory',
        'cleanTitle',
        'eventVisualKey',
        'eventImageState',
        'categoryPhotoFallback',
        'fallbackVisualLabel',
    ]:
        assert marker in feed, f'missing live data quality helper marker {marker}'
    for marker in [
        'data-image-state={eventImageState(item)}',
        'data-visual-key={eventVisualKey(item)}',
        'local-photo-fallback',
        'fallbackVisualLabel(item)',
    ]:
        assert marker in shell + route, f'missing normalized image fallback markup {marker}'
    for marker in [
        'live-data-quality-pass',
        '.local-photo-fallback',
        '[data-visual-key="live-music"]',
        '[data-visual-key="sports"]',
        '[data-visual-key="family"]',
        '[data-image-state="fallback"]',
        'background-image: var(--ll-category-fallback-gradient)',
    ]:
        assert marker in css, f'missing category fallback CSS marker {marker}'
    for preserved in ['getLiveFeed', 'LiveFeedItem', 'eventDetailPath', 'eventExternalUrl', 'getEventBySlug']:
        assert preserved in feed, f'live data quality pass removed preserved feed helper {preserved}'


def test_loop_local_navigation_interaction_polish_makes_tabs_and_internal_links_real():
    shell = read('components/app-shell.tsx')
    css = read('app/globals.css')
    for marker in [
        'navigation-interaction-polish',
        'handleTabSelect',
        'tabToViewMode',
        'id="map"',
        'id="calendar"',
        'type="button"',
        'setViewMode(tabToViewMode(tab))',
        'aria-pressed={viewMode === tabToViewMode(tab)}',
        'href={eventDetailPath(item)}',
    ]:
        assert marker in shell, f'missing navigation interaction polish marker {marker}'
    for marker in [
        'navigation-interaction-polish',
        '.mobile-app-tabbar button',
        '.mobile-app-tabbar button.active',
        '.mobile-app-tabbar a.active',
    ]:
        assert marker in css, f'missing navigation interaction CSS marker {marker}'
    assert '<a className="map-pin-cluster"' not in shell, 'map pins should use Next Link for internal /events navigation'
    assert '<a href={eventDetailPath(item)}' not in shell, 'event detail internal links should use Link, not raw anchors'


def test_loop_local_saved_and_share_interactions_are_real_not_static_icons():
    shell = read('components/app-shell.tsx')
    route = read('app/events/[slug]/page.tsx') + read('components/event-detail-client-actions.tsx')
    css = read('app/globals.css')
    for marker in [
        'saved-share-interaction-pass',
        'useEffect',
        'savedEventIds',
        'toggleSavedEvent',
        'isSavedEvent',
        'localStorage.setItem',
        'looplocal:saved-events',
        'handleShareEvent',
        'navigator.share',
        'navigator.clipboard.writeText',
        'saved-events-panel',
        'showSavedPanel',
    ]:
        assert marker in shell, f'missing saved/share homepage marker {marker}'
    for marker in [
        'event-detail-client-actions',
        'SavedShareActions',
        'saved-share-interaction-pass',
        'looplocal:saved-events',
        'navigator.share',
        'navigator.clipboard.writeText',
    ]:
        assert marker in route, f'missing saved/share event detail marker {marker}'
    for marker in [
        'saved-share-interaction-pass',
        '.saved-events-panel',
        '.event-actions button.is-saved',
        '.event-detail-sticky-cta-bar button.is-saved',
    ]:
        assert marker in css, f'missing saved/share CSS marker {marker}'
    for preserved in ['eventDetailPath(item)', 'eventExternalUrl(heroEvent)', 'viewMode', 'handleTabSelect']:
        assert preserved in shell, f'saved/share pass removed preserved behavior {preserved}'


def test_loop_local_post_local_draft_validation_and_live_preview_are_real():
    post = read('components/post-local-wizard.tsx')
    css = read('app/globals.css')
    for marker in [
        'post-local-functional-draft-pass',
        'PostLocalDraft',
        'defaultDraft',
        'draftStatus',
        'submitStatus',
        'validationErrors',
        'updateDraft',
        'validateDraft',
        'handleSubmit',
        'localStorage.setItem',
        'looplocal:post-local-draft',
        'looplocal:post-local-submissions',
        'value={draft.eventTitle}',
        'value={draft.entityName}',
        'value={draft.eventCategory}',
        'Live draft preview',
        'Required before review',
        'Ready for review',
        'Draft saved locally',
    ]:
        assert marker in post, f'missing Post Local functional draft marker {marker}'
    for marker in [
        'post-local-functional-draft-pass',
        '.post-draft-status-bar',
        '.post-validation-summary',
        '.ll-field-error',
        '.post-submit-success',
    ]:
        assert marker in css, f'missing Post Local functional draft CSS marker {marker}'
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
        assert preserved in post, f'functional draft pass removed preserved field/functionality {preserved}'


def test_loop_local_pending_post_submissions_surface_in_discovery_review_panel():
    shell = read('components/app-shell.tsx')
    post = read('components/post-local-wizard.tsx')
    css = read('app/globals.css')
    for marker in [
        'post-submission-review-panel-pass',
        'LocalSubmission',
        'pendingSubmissions',
        'showSubmissionPanel',
        'loadPendingSubmissions',
        'clearPendingSubmissions',
        'looplocal:post-local-submissions',
        'pending-submissions-panel',
        'Review queue',
        'Pending local submissions',
        'Open Post Local',
    ]:
        assert marker in shell, f'missing pending submission review panel marker {marker}'
    for marker in [
        'looplocal:post-local-submissions',
        'pending_review',
    ]:
        assert marker in post, f'Post Local submission storage marker missing {marker}'
    for marker in [
        'post-submission-review-panel-pass',
        '.pending-submissions-panel',
        '.pending-submission-card',
        '.pending-submission-empty',
    ]:
        assert marker in css, f'missing pending submission CSS marker {marker}'
    for preserved in ['saved-events-panel', 'showSavedPanel', 'handleTabSelect', 'eventDetailPath(item)', 'getLiveFeed']:
        assert preserved in shell + read('lib/live-feed.ts'), f'pending submission panel removed preserved behavior {preserved}'


def test_loop_local_local_publish_workflow_approves_submissions_into_discovery_feed():
    shell = read('components/app-shell.tsx')
    css = read('app/globals.css')
    for marker in [
        'local-publish-workflow-pass',
        'approvedLocalItems',
        'localSubmissionToFeedItem',
        'approveLocalSubmission',
        'removeLocalSubmission',
        'combinedFeedItems',
        'looplocal:approved-local-events',
        'Approve to discovery',
        'Remove',
        'Locally approved',
        'local-approved-badge',
    ]:
        assert marker in shell, f'missing local publish workflow marker {marker}'
    for marker in [
        'local-publish-workflow-pass',
        '.local-approved-badge',
        '.pending-submission-actions button.approve-local',
        '.pending-submission-actions button.remove-local',
    ]:
        assert marker in css, f'missing local publish workflow CSS marker {marker}'
    for preserved in [
        'feedItems',
        'getLiveFeed',
        'looplocal:post-local-submissions',
        'pending-submissions-panel',
        'saved-events-panel',
        'eventDetailPath(item)',
        'sortItems(filtered, sortBy)',
    ]:
        assert preserved in shell + read('lib/live-feed.ts'), f'local publish workflow removed preserved behavior {preserved}'


def test_loop_local_operator_handoff_exports_local_review_queue_json():
    shell = read('components/app-shell.tsx')
    css = read('app/globals.css')
    for marker in [
        'operator-handoff-export-pass',
        'buildOperatorHandoffPayload',
        'copyOperatorHandoff',
        'downloadOperatorHandoff',
        'operatorExportStatus',
        'loop-local-review-queue.json',
        'Copy queue JSON',
        'Download JSON',
        'Operator handoff',
        'pendingCount',
        'approvedCount',
        'navigator.clipboard.writeText',
        'URL.createObjectURL',
    ]:
        assert marker in shell, f'missing operator handoff export marker {marker}'
    for marker in [
        'operator-handoff-export-pass',
        '.operator-handoff-card',
        '.operator-handoff-actions',
        '.operator-export-status',
    ]:
        assert marker in css, f'missing operator handoff export CSS marker {marker}'
    for preserved in [
        'looplocal:post-local-submissions',
        'looplocal:approved-local-events',
        'approveLocalSubmission',
        'removeLocalSubmission',
        'combinedFeedItems',
    ]:
        assert preserved in shell, f'operator handoff export removed preserved local workflow {preserved}'


def test_loop_local_operator_handoff_import_restores_review_queue_json():
    shell = read('components/app-shell.tsx')
    css = read('app/globals.css')
    for marker in [
        'operator-handoff-import-pass',
        'importOperatorHandoff',
        'parseOperatorHandoffPayload',
        'operatorImportText',
        'setOperatorImportText',
        'Import queue JSON',
        'Paste exported review queue JSON',
        'pendingSubmissions: parsed.pendingSubmissions',
        'approvedLocalEvents: parsed.approvedLocalEvents',
        'localStorage.setItem(\'looplocal:post-local-submissions\'',
        'localStorage.setItem(\'looplocal:approved-local-events\'',
    ]:
        assert marker in shell, f'missing operator handoff import marker {marker}'
    for marker in [
        'operator-handoff-import-pass',
        '.operator-import-area',
        '.operator-import-area textarea',
    ]:
        assert marker in css, f'missing operator handoff import CSS marker {marker}'
    for preserved in [
        'buildOperatorHandoffPayload',
        'copyOperatorHandoff',
        'downloadOperatorHandoff',
        'approveLocalSubmission',
        'combinedFeedItems',
    ]:
        assert preserved in shell, f'operator import removed preserved export/local workflow {preserved}'


def test_loop_local_review_queue_status_lifecycle_controls_are_local_and_exported():
    shell = read('components/app-shell.tsx')
    css = read('app/globals.css')
    for marker in [
        'review-status-lifecycle-pass',
        'SubmissionStatus',
        'updateLocalSubmissionStatus',
        'needs_changes',
        'approved_local',
        'published_local',
        'Needs changes',
        'Approve only',
        'Publish locally',
        'statusUpdatedAt',
        'reviewStatusCounts',
        'needsChangesCount',
        'publishedCount',
    ]:
        assert marker in shell, f'missing review status lifecycle marker {marker}'
    for marker in [
        'review-status-lifecycle-pass',
        '.review-status-summary',
        '.pending-submission-actions button.needs-changes-local',
        '.pending-submission-actions button.approve-only-local',
        '.pending-submission-actions button.publish-local',
    ]:
        assert marker in css, f'missing review status lifecycle CSS marker {marker}'
    for preserved in [
        'buildOperatorHandoffPayload',
        'pendingSubmissions',
        'approveLocalSubmission',
        'removeLocalSubmission',
        'operator-handoff-import-pass',
        'looplocal:post-local-submissions',
    ]:
        assert preserved in shell, f'review status lifecycle removed preserved local workflow {preserved}'


def test_loop_local_reviewer_notes_attach_to_local_submissions_and_handoff():
    shell = read('components/app-shell.tsx')
    css = read('app/globals.css')
    for marker in [
        'reviewer-notes-pass',
        'reviewerNote',
        'reviewerNoteUpdatedAt',
        'updateLocalSubmissionReviewerNote',
        'Reviewer note',
        'Internal note for changes, approval context, or publish handoff',
        'value={submission.reviewerNote || \'\'}',
        'onChange={(event) => updateLocalSubmissionReviewerNote(index, event.target.value)}',
        'reviewerNoteUpdatedAt: new Date().toISOString()',
    ]:
        assert marker in shell, f'missing reviewer notes marker {marker}'
    for marker in [
        'reviewer-notes-pass',
        '.reviewer-note-field',
        '.reviewer-note-field textarea',
    ]:
        assert marker in css, f'missing reviewer notes CSS marker {marker}'
    for preserved in [
        'buildOperatorHandoffPayload',
        'parseOperatorHandoffPayload',
        'updateLocalSubmissionStatus',
        'statusUpdatedAt',
        'looplocal:post-local-submissions',
    ]:
        assert preserved in shell, f'reviewer notes removed preserved review workflow {preserved}'


def test_loop_local_review_queue_status_filters_scope_visible_submissions():
    shell = read('components/app-shell.tsx')
    css = read('app/globals.css')
    for marker in [
        'review-queue-filter-pass',
        'ReviewQueueFilter',
        'activeReviewFilter',
        'setActiveReviewFilter',
        'reviewQueueFilters',
        'filteredPendingSubmissions',
        "activeReviewFilter === 'all'",
        "submission.status === activeReviewFilter",
        'All reviews',
        'Pending',
        'Needs changes',
        'Approved only',
        'showing ${filteredPendingSubmissions.length}',
    ]:
        assert marker in shell, f'missing review queue filter marker {marker}'
    for marker in [
        'review-queue-filter-pass',
        '.review-queue-filter-row',
        '.review-queue-filter-row button.active',
    ]:
        assert marker in css, f'missing review queue filter CSS marker {marker}'
    for preserved in [
        'reviewer-notes-pass',
        'updateLocalSubmissionReviewerNote',
        'updateLocalSubmissionStatus',
        'buildOperatorHandoffPayload',
        'approveLocalSubmission',
    ]:
        assert preserved in shell, f'review queue filters removed preserved workflow {preserved}'


def test_loop_local_review_queue_search_scopes_submissions_without_mutating_queue():
    shell = read('components/app-shell.tsx')
    css = read('app/globals.css')
    for marker in [
        'review-queue-search-pass',
        'reviewQueueSearch',
        'setReviewQueueSearch',
        'reviewSubmissionSearchText',
        'reviewSearchQuery',
        'filteredPendingSubmissions',
        'submission.reviewerNote',
        'submission.entityName',
        'submission.eventTitle',
        'Search review queue',
        'Title, entity, status, note…',
        'value={reviewQueueSearch}',
        'onChange={(event) => setReviewQueueSearch(event.target.value)}',
    ]:
        assert marker in shell, f'missing review queue search marker {marker}'
    for marker in [
        'review-queue-search-pass',
        '.review-queue-search-field',
        '.review-queue-search-field input',
    ]:
        assert marker in css, f'missing review queue search CSS marker {marker}'
    for preserved in [
        'review-queue-filter-pass',
        'activeReviewFilter',
        'reviewer-notes-pass',
        'updateLocalSubmissionReviewerNote',
        'buildOperatorHandoffPayload',
        'looplocal:post-local-submissions',
    ]:
        assert preserved in shell, f'review queue search removed preserved workflow {preserved}'


def test_loop_local_mobile_webview_layout_containment_prevents_desktop_overlap():
    css = read('app/globals.css')
    layout = read('app/layout.tsx')
    for marker in [
        'mobile-webview-layout-containment-pass',
        'width: \'device-width\'',
        'initialScale: 1',
        '@media (max-width: 920px)',
        '.complete-frontend-rebuild.mobile-webview-layout-containment-pass',
        'grid-template-columns: minmax(0, 1fr)',
        '.mobile-webview-layout-containment-pass .local-hero-panel { display: none; }',
        '.mobile-webview-layout-containment-pass .event-detail-preview { display: none; }',
        '.mobile-webview-layout-containment-pass .discovery-phone',
        'width: min(100%, 430px)',
        'max-width: 100vw',
        'overflow-x: hidden',
        'overscroll-behavior-x: none',
        '.mobile-webview-layout-containment-pass .featured-rail.polished-card-density',
        'grid-auto-columns: minmax(188px, 74vw)',
        '.mobile-webview-layout-containment-pass .mobile-app-tabbar.polished-bottom-nav',
        'left: max(8px, env(safe-area-inset-left))',
    ]:
        assert marker in css + layout, f'missing mobile webview containment marker {marker}'
    for preserved in [
        'review-queue-search-pass',
        'saved-share-interaction-pass',
        'navigation-interaction-polish',
        'eventDetailPath(item)',
        'getLiveFeed',
    ]:
        assert preserved in css + read('components/app-shell.tsx') + read('lib/live-feed.ts'), f'mobile containment removed preserved behavior {preserved}'


def test_loop_local_mobile_first_homepage_polish_feels_intentional_after_containment():
    css = read('app/globals.css')
    shell = read('components/app-shell.tsx')
    for marker in [
        'mobile-first-homepage-polish-pass',
        'mobile-first-topbar-polish',
        'mobile-first-feed-rhythm',
        'mobile-first-touch-targets',
        'mobile-first-bottom-nav-clearance',
        '.mobile-first-homepage-polish-pass .phone-topbar',
        '.mobile-first-homepage-polish-pass .phone-logo',
        '.mobile-first-homepage-polish-pass .search-field',
        '.mobile-first-homepage-polish-pass .category-chip-row',
        '.mobile-first-homepage-polish-pass .explore-card',
        '.mobile-first-homepage-polish-pass .popular-list-row',
        '.mobile-first-homepage-polish-pass .mobile-app-tabbar.polished-bottom-nav',
        'min-height: 44px',
        'padding-bottom: max(128px, env(safe-area-inset-bottom) + 108px)',
        'scroll-margin-bottom: 118px',
        'touch-action: manipulation',
    ]:
        assert marker in css + shell, f'missing mobile-first homepage polish marker {marker}'
    for preserved in [
        'mobile-webview-layout-containment-pass',
        'review-queue-search-pass',
        'setShowSavedPanel',
        'mobile-app-tabbar',
        'getLiveFeed',
    ]:
        assert preserved in css + shell + read('lib/live-feed.ts'), f'mobile-first polish removed preserved behavior {preserved}'


def test_loop_local_mobile_tap_reliability_makes_menu_and_buttons_clickable():
    shell = read('components/app-shell.tsx')
    css = read('app/globals.css')
    for marker in [
        'mobile-tap-reliability-pass',
        'showMobileMenu',
        'setShowMobileMenu',
        'toggleMobileMenu',
        'mobile-menu-panel',
        'aria-expanded={showMobileMenu}',
        'onClick={toggleMobileMenu}',
        "onClick={() => setShowSavedPanel(true)}",
        'setShowMobileMenu(false)',
        'Open Post Local',
        'Review queue',
    ]:
        assert marker in shell, f'missing mobile tap reliability shell marker {marker}'
    for marker in [
        'mobile-tap-reliability-pass',
        '.mobile-tap-reliability-pass button',
        '.mobile-tap-reliability-pass a',
        '.mobile-tap-reliability-pass input',
        '.mobile-tap-reliability-pass select',
        '.mobile-tap-reliability-pass textarea',
        'pointer-events: auto',
        '.mobile-tap-reliability-pass .mobile-menu-panel',
        'z-index: 38',
        '.mobile-tap-reliability-pass .mobile-app-tabbar.polished-bottom-nav',
        'z-index: 44',
        '.mobile-tap-reliability-pass .view-mode-dock.polished-view-dock',
        'position: static',
    ]:
        assert marker in css, f'missing mobile tap reliability css marker {marker}'
    for preserved in [
        'mobile-first-homepage-polish-pass',
        'mobile-webview-layout-containment-pass',
        'handleTabSelect',
        'setShowSubmissionPanel(true)',
        'setViewMode(tabToViewMode(tab))',
    ]:
        assert preserved in shell + css, f'mobile tap reliability removed preserved behavior {preserved}'


def test_loop_local_mobile_interaction_qa_hardens_home_and_post_local_taps():
    shell = read('components/app-shell.tsx')
    post = read('components/post-local-wizard.tsx')
    css = read('app/globals.css')
    for marker in [
        'mobile-interaction-qa-pass',
        'mobile-qa-target',
        'mobile-qa-home-menu',
        'mobile-qa-post-dock',
        'id="profile"',
        'id="submit-for-approval"',
        'href="#submit-for-approval"',
        'aria-label="Post Local mobile tabs"',
        'aria-label="Open Review Queue"',
        'aria-label="Open Saved Events"',
    ]:
        assert marker in shell + post, f'missing mobile interaction QA shell/post marker {marker}'
    for marker in [
        'mobile-interaction-qa-pass',
        '.mobile-interaction-qa-pass .mobile-qa-target',
        '.mobile-interaction-qa-pass :is(button, a, input, select, textarea):focus-visible',
        '.mobile-interaction-qa-pass :is(button, a):active',
        'outline: 3px solid rgba(21,94,239,.28)',
        '-webkit-tap-highlight-color: rgba(21,94,239,.18)',
        'scroll-margin-top: 82px',
        'scroll-margin-bottom: 126px',
        '.post-mobile-reference-shell.mobile-interaction-qa-pass .post-wizard-mobile-dock',
        'z-index: 46',
    ]:
        assert marker in css, f'missing mobile interaction QA CSS marker {marker}'
    assert 'href="#profile">◉ Profile</a>' not in post, 'dead mobile #profile dock link should be replaced with a real profile target label'
    for preserved in [
        'mobile-tap-reliability-pass',
        'post-local-functional-draft-pass',
        'handleSubmit',
        'FileDropInput',
        'looplocal:post-local-submissions',
    ]:
        assert preserved in shell + post + css, f'mobile interaction QA removed preserved behavior {preserved}'


def test_loop_local_mobile_browser_smoke_test_harness_exists_for_real_clicks():
    pkg = read('package.json')
    smoke = read('scripts/mobile-interaction-smoke.mjs') if (ROOT / 'scripts/mobile-interaction-smoke.mjs').exists() else ''
    for marker in [
        '"test:mobile:smoke"',
        'mobile-interaction-smoke.mjs',
        '@playwright/test',
    ]:
        assert marker in pkg, f'missing mobile browser smoke package marker {marker}'
    for marker in [
        'mobile-browser-smoke-pass',
        'chromium.launch',
        'iPhone 14 Pro',
        'assertClickable',
        'document.elementFromPoint',
        'Open Review Queue',
        'Open Saved Events',
        'Post Local mobile tabs',
        'submit-for-approval',
        'mobile-qa-target',
        'mobile-menu-panel',
        'console.log(\'loop_local_mobile_interaction_smoke_ok\')',
    ]:
        assert marker in smoke, f'missing mobile browser smoke harness marker {marker}'


def test_loop_local_mobile_smoke_full_runner_builds_starts_tests_and_cleans_up():
    pkg = read('package.json')
    runner = read('scripts/run-mobile-smoke-with-server.mjs') if (ROOT / 'scripts/run-mobile-smoke-with-server.mjs').exists() else ''
    for marker in [
        '"test:mobile:full"',
        'run-mobile-smoke-with-server.mjs',
        'test:mobile:smoke',
    ]:
        assert marker in pkg, f'missing self-contained mobile smoke package marker {marker}'
    for marker in [
        'mobile-smoke-full-runner-pass',
        'spawn',
        'npm run build',
        'npm run start -- -p',
        'waitForServer',
        'LOOP_LOCAL_SMOKE_URL',
        'npm run test:mobile:smoke',
        'killServer',
        'SIGTERM',
        'loop_local_mobile_smoke_full_runner_ok',
    ]:
        assert marker in runner, f'missing self-contained mobile smoke runner marker {marker}'

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
    test_loop_local_event_detail_polish_improves_detail_page_hierarchy_and_mobile()
    test_loop_local_live_data_quality_and_image_fallbacks_are_normalized()
    test_loop_local_navigation_interaction_polish_makes_tabs_and_internal_links_real()
    test_loop_local_saved_and_share_interactions_are_real_not_static_icons()
    test_loop_local_post_local_draft_validation_and_live_preview_are_real()
    test_loop_local_pending_post_submissions_surface_in_discovery_review_panel()
    test_loop_local_local_publish_workflow_approves_submissions_into_discovery_feed()
    test_loop_local_operator_handoff_exports_local_review_queue_json()
    test_loop_local_operator_handoff_import_restores_review_queue_json()
    test_loop_local_review_queue_status_lifecycle_controls_are_local_and_exported()
    test_loop_local_reviewer_notes_attach_to_local_submissions_and_handoff()
    test_loop_local_review_queue_status_filters_scope_visible_submissions()
    test_loop_local_review_queue_search_scopes_submissions_without_mutating_queue()
    test_loop_local_mobile_webview_layout_containment_prevents_desktop_overlap()
    test_loop_local_mobile_first_homepage_polish_feels_intentional_after_containment()
    test_loop_local_mobile_tap_reliability_makes_menu_and_buttons_clickable()
    test_loop_local_mobile_interaction_qa_hardens_home_and_post_local_taps()
    test_loop_local_mobile_browser_smoke_test_harness_exists_for_real_clicks()
    test_loop_local_mobile_smoke_full_runner_builds_starts_tests_and_cleans_up()
    test_old_incremental_design_artifacts_removed()
    print('loop_local_complete_frontend_rebuild_contract_ok')
