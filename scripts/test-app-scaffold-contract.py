#!/usr/bin/env python3
"""Contract checks for the Loop Local app scaffold."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text()


def assert_file(path: str) -> None:
    p = ROOT / path
    assert p.exists(), f"missing {path}"
    assert p.stat().st_size > 0, f"empty {path}"


def test_core_next_files_exist():
    for path in [
        "package.json",
        "next.config.mjs",
        "tsconfig.json",
        "app/layout.tsx",
        "app/page.tsx",
        "app/globals.css",
        "lib/supabase/client.ts",
        "lib/env.ts",
        "components/app-shell.tsx",
        "components/status-card.tsx",
    ]:
        assert_file(path)


def test_package_scripts_and_dependencies():
    pkg = json.loads(read("package.json"))
    for script in ["dev", "build", "lint", "typecheck", "test:contract"]:
        assert script in pkg["scripts"], f"missing script {script}"
    for dep in ["@supabase/supabase-js", "next", "react", "react-dom"]:
        assert dep in pkg["dependencies"], f"missing dependency {dep}"


def test_supabase_env_is_used_safely():
    env = read("lib/env.ts")
    assert "NEXT_PUBLIC_SUPABASE_URL" in env
    assert "NEXT_PUBLIC_SUPABASE_ANON_KEY" in env
    assert "throw new Error" in env
    client = read("lib/supabase/client.ts")
    assert "createClient" in client
    assert "supabase" in client


def test_initial_ui_has_consumer_app_sections():
    page = read("app/page.tsx") + read("components/app-shell.tsx") + read("lib/discovery-truthfulness.ts")
    for needle in [
        "Loop Local",
        "Discover what’s happening near you",
        "Explore Nearby",
        "Post an Event",
        "Discover",
        "Events",
        "Map",
        "Saved",
        "Profile",
        "Upcoming Events",
        "More Local Events",
        "Tonight",
        "complete-frontend-rebuild",
        "app-reference-shell",
        "discovery-phone",
        "event-detail-preview",
    ]:
        assert needle in page, f"missing UI marker {needle}"


def test_post_local_route_matches_current_app_contract():
    for path in [
        "app/post-local/page.tsx",
        "components/file-drop-input.tsx",
        "components/post-local-wizard.tsx",
        "public/looplocal-logo.png",
        "public/looplocal-icon-192.png",
        "references/current-cloudflare-app-snapshot/post-local.html",
        "references/current-cloudflare-app-snapshot/form-fields.json",
    ]:
        assert_file(path)

    route = read("app/post-local/page.tsx") + read("components/post-local-wizard.tsx")
    for needle in [
        "Post Local",
        "Share something locals will actually want to find.",
        "List Your Business",
        "Post an Event",
        "Join as a Community Organization",
        "Step 1: Profile",
        "Start with your profile",
        "logo",
        "contact_name",
        "entity_type",
        "Step 2: First Event or Promotion",
        "post_type",
        "event_image",
        "event_title",
        "event_date",
        "start_time",
        "end_time",
        "Preview your listing",
        "Submit for approval",
        "Submit for Approval",
        "Draft/pending until approved",
    ]:
        assert needle in route, f"missing /post-local marker {needle}"


def test_no_secrets_committed():
    forbidden = ["service_role", "SUPABASE_SERVICE_ROLE_KEY", "sb_secret_", "postgresql://postgres:"]
    for path in ["app/page.tsx", "lib/env.ts", "lib/supabase/client.ts", "README.md"]:
        text = read(path)
        for token in forbidden:
            assert token not in text, f"forbidden secret marker {token} in {path}"


if __name__ == "__main__":
    test_core_next_files_exist()
    test_package_scripts_and_dependencies()
    test_supabase_env_is_used_safely()
    test_initial_ui_has_consumer_app_sections()
    test_post_local_route_matches_current_app_contract()
    test_no_secrets_committed()
    print("loop_local_app_scaffold_contract_ok")
