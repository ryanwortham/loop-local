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
    assert len(words) < 650, f"home shell too wordy: {len(words)} words in source strings"
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
    test_supabase_and_github_status_are_documented_without_secrets()
    print('loop_local_10x_product_reset_contract_ok')
