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


def test_initial_ui_has_operator_sections():
    page = read("app/page.tsx") + read("components/app-shell.tsx")
    for needle in [
        "Local Loop",
        "Today",
        "Last 3 days",
        "Last 7 days",
        "This month",
        "Places",
        "Loops",
        "Events",
        "Admin",
        "Supabase",
    ]:
        assert needle in page, f"missing UI marker {needle}"


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
    test_initial_ui_has_operator_sections()
    test_no_secrets_committed()
    print("loop_local_app_scaffold_contract_ok")
