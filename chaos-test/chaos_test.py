#!/usr/bin/env python3
"""Chaos testing script for the Feature Suggestion Platform."""

import argparse
import asyncio
import time
import uuid
from typing import Any

import aiohttp
from rich.console import Console
from rich.table import Table

console = Console()

BASE_URL = "http://localhost:3000/api"
CONCURRENCY = 50


class ChaosTestResult:
    def __init__(self, name: str):
        self.name = name
        self.passed = False
        self.details = ""
        self.duration = 0.0
        self.requests_ok = 0
        self.requests_fail = 0


async def create_feature(session: aiohttp.ClientSession, text: str, email: str) -> dict[str, Any] | None:
    try:
        async with session.post(
            f"{BASE_URL}/features",
            json={"text": text, "authorEmail": email},
        ) as resp:
            if resp.status == 201:
                return await resp.json()
            return None
    except Exception:
        return None


async def upvote_feature(session: aiohttp.ClientSession, feature_id: str, email: str) -> tuple[int, dict | None]:
    try:
        async with session.post(
            f"{BASE_URL}/features/{feature_id}/upvote",
            json={"email": email},
        ) as resp:
            body = await resp.json() if resp.content_type == "application/json" else None
            return resp.status, body
    except Exception:
        return 0, None


async def list_features(session: aiohttp.ClientSession, page: int = 1, limit: int = 10) -> dict | None:
    try:
        async with session.get(f"{BASE_URL}/features", params={"page": page, "limit": limit}) as resp:
            if resp.status == 200:
                return await resp.json()
            return None
    except Exception:
        return None


# --- Scenario 1: Flood creation ---
async def test_flood_creation(session: aiohttp.ClientSession) -> ChaosTestResult:
    result = ChaosTestResult("Flood creation (200 concurrent)")
    start = time.time()

    tasks = [
        create_feature(session, f"Flood test feature proposal number {i} for stress testing", f"flood{i}@test.com")
        for i in range(200)
    ]
    responses = await asyncio.gather(*tasks)

    result.requests_ok = sum(1 for r in responses if r is not None)
    result.requests_fail = sum(1 for r in responses if r is None)
    result.duration = time.time() - start
    result.passed = result.requests_ok >= 180  # allow some failures under load
    result.details = f"{result.requests_ok}/200 created successfully"
    return result


# --- Scenario 2: Duplicate upvote ---
async def test_duplicate_upvote(session: aiohttp.ClientSession) -> ChaosTestResult:
    result = ChaosTestResult("Duplicate upvote prevention")
    start = time.time()

    feature = await create_feature(session, "Feature to test duplicate upvote prevention", "dup-author@test.com")
    if not feature:
        result.details = "Failed to create test feature"
        result.duration = time.time() - start
        return result

    tasks = [upvote_feature(session, feature["id"], "same-voter@test.com") for _ in range(20)]
    responses = await asyncio.gather(*tasks)

    statuses = [s for s, _ in responses]
    ok_count = statuses.count(201)
    conflict_count = statuses.count(409)

    result.requests_ok = ok_count
    result.requests_fail = conflict_count
    result.duration = time.time() - start
    result.passed = ok_count == 1 and conflict_count == 19
    result.details = f"201s: {ok_count}, 409s: {conflict_count} (expected 1/19)"
    return result


# --- Scenario 3: Upvote nonexistent feature ---
async def test_upvote_nonexistent(session: aiohttp.ClientSession) -> ChaosTestResult:
    result = ChaosTestResult("Upvote nonexistent feature")
    start = time.time()

    random_uuid = str(uuid.uuid4())
    status, _ = await upvote_feature(session, random_uuid, "test@test.com")
    not_found_ok = status == 404

    status2, _ = await upvote_feature(session, "not-a-uuid", "test@test.com")
    invalid_ok = status2 == 400

    result.duration = time.time() - start
    result.passed = not_found_ok and invalid_ok
    result.requests_ok = sum([not_found_ok, invalid_ok])
    result.requests_fail = 2 - result.requests_ok
    result.details = f"Random UUID -> {status} (expect 404), Invalid -> {status2} (expect 400)"
    return result


# --- Scenario 4: Invalid payloads ---
async def test_invalid_payloads(session: aiohttp.ClientSession) -> ChaosTestResult:
    result = ChaosTestResult("Invalid payloads")
    start = time.time()
    checks = 0
    passes = 0

    payloads = [
        ({}, "empty body"),
        ({"text": "short", "authorEmail": "test@test.com"}, "text too short"),
        ({"text": "a" * 100001, "authorEmail": "test@test.com"}, "text too long"),
        ({"text": "Valid feature proposal text here", "authorEmail": "invalid"}, "invalid email"),
        ({"text": "Valid feature proposal text here"}, "missing email"),
        ({"authorEmail": "test@test.com"}, "missing text"),
        ({"text": "<script>alert('xss')</script>padding", "authorEmail": "xss@test.com"}, "XSS payload"),
        ({"text": "'; DROP TABLE authors; --pad", "authorEmail": "sql@test.com"}, "SQL injection"),
    ]

    for payload, label in payloads:
        checks += 1
        try:
            async with session.post(f"{BASE_URL}/features", json=payload) as resp:
                if label in ("XSS payload", "SQL injection"):
                    # These should either succeed (input is just text) or fail validation
                    passes += 1
                elif resp.status == 400:
                    passes += 1
                else:
                    result.details += f"FAIL: {label} -> {resp.status}; "
        except Exception:
            pass

    result.duration = time.time() - start
    result.requests_ok = passes
    result.requests_fail = checks - passes
    result.passed = passes >= 5
    result.details = f"{passes}/{checks} correctly rejected/handled"
    return result


# --- Scenario 5: Race condition upvote_count ---
async def test_race_condition_upvote_count(session: aiohttp.ClientSession) -> ChaosTestResult:
    result = ChaosTestResult("Race condition upvote_count")
    start = time.time()

    feature = await create_feature(session, "Feature to test race condition on upvote count", "race-author@test.com")
    if not feature:
        result.details = "Failed to create test feature"
        result.duration = time.time() - start
        return result

    num_voters = 30
    tasks = [
        upvote_feature(session, feature["id"], f"racer{i}@test.com")
        for i in range(num_voters)
    ]
    responses = await asyncio.gather(*tasks)

    ok_count = sum(1 for s, _ in responses if s == 201)

    # Verify final count
    await asyncio.sleep(0.5)
    listing = await list_features(session, 1, 50)
    final_count = 0
    if listing:
        for f in listing["data"]:
            if f["id"] == feature["id"]:
                final_count = f["upvoteCount"]
                break

    result.duration = time.time() - start
    result.passed = final_count == ok_count
    result.requests_ok = ok_count
    result.requests_fail = num_voters - ok_count
    result.details = f"Successful upvotes: {ok_count}, Final count: {final_count} (match: {final_count == ok_count})"
    return result


# --- Scenario 6: Extreme pagination ---
async def test_extreme_pagination(session: aiohttp.ClientSession) -> ChaosTestResult:
    result = ChaosTestResult("Extreme pagination values")
    start = time.time()
    checks = 0
    passes = 0

    test_cases = [
        (0, 10, 400, "page=0"),
        (-1, 10, 400, "page=-1"),
        (999999, 10, 200, "page=999999"),
        (1, 0, 400, "limit=0"),
        (1, -1, 400, "limit=-1"),
        (1, 99999, 400, "limit=99999"),
    ]

    for page, limit, expected_status, label in test_cases:
        checks += 1
        try:
            async with session.get(f"{BASE_URL}/features", params={"page": page, "limit": limit}) as resp:
                if resp.status == expected_status:
                    passes += 1
                else:
                    result.details += f"FAIL: {label} -> {resp.status} (expected {expected_status}); "
        except Exception:
            pass

    result.duration = time.time() - start
    result.requests_ok = passes
    result.requests_fail = checks - passes
    result.passed = passes >= 4
    result.details = f"{passes}/{checks} returned expected status"
    return result


# --- Scenario 7: Malformed headers ---
async def test_malformed_headers(session: aiohttp.ClientSession) -> ChaosTestResult:
    result = ChaosTestResult("Malformed headers")
    start = time.time()
    checks = 0
    passes = 0

    # Wrong content type
    checks += 1
    try:
        async with session.post(
            f"{BASE_URL}/features",
            data="not json",
            headers={"Content-Type": "text/plain"},
        ) as resp:
            if resp.status in (400, 415):
                passes += 1
    except Exception:
        passes += 1  # connection error is acceptable

    # Invalid JSON
    checks += 1
    try:
        async with session.post(
            f"{BASE_URL}/features",
            data="{invalid json",
            headers={"Content-Type": "application/json"},
        ) as resp:
            if resp.status == 400:
                passes += 1
    except Exception:
        passes += 1

    result.duration = time.time() - start
    result.requests_ok = passes
    result.requests_fail = checks - passes
    result.passed = passes >= 1
    result.details = f"{passes}/{checks} handled correctly"
    return result


# --- Scenario 8: Bizarre emails ---
async def test_bizarre_emails(session: aiohttp.ClientSession) -> ChaosTestResult:
    result = ChaosTestResult("Bizarre email addresses")
    start = time.time()
    checks = 0
    passes = 0

    emails = [
        "user+tag@example.com",
        "very.long.email.address.with.many.dots@subdomain.example.co.uk",
        "a@b.cc",
        "test@localhost",
    ]

    for email in emails:
        checks += 1
        feat = await create_feature(session, f"Bizarre email test for {email}", email)
        if feat is not None:
            passes += 1

    result.duration = time.time() - start
    result.requests_ok = passes
    result.requests_fail = checks - passes
    result.passed = passes >= 2
    result.details = f"{passes}/{checks} accepted"
    return result


# --- Scenario 9: Stress test listing ---
async def test_stress_listing(session: aiohttp.ClientSession) -> ChaosTestResult:
    result = ChaosTestResult("Stress test listing")
    start = time.time()

    # Create many features
    tasks = [
        create_feature(session, f"Stress test feature number {i} for load testing", f"stress{i}@test.com")
        for i in range(100)
    ]
    await asyncio.gather(*tasks)

    # Concurrent listing
    list_tasks = [list_features(session, page=p, limit=10) for p in range(1, 20) for _ in range(5)]
    responses = await asyncio.gather(*list_tasks)

    ok_count = sum(1 for r in responses if r is not None)
    total = len(list_tasks)

    result.duration = time.time() - start
    result.requests_ok = ok_count
    result.requests_fail = total - ok_count
    result.passed = ok_count >= total * 0.9
    result.details = f"{ok_count}/{total} listing requests succeeded"
    return result


# --- Scenario 10: Cache consistency ---
async def test_cache_consistency(session: aiohttp.ClientSession) -> ChaosTestResult:
    result = ChaosTestResult("Cache consistency")
    start = time.time()

    # Create a feature
    feature = await create_feature(session, "Cache consistency test feature proposal", "cache-test@test.com")
    if not feature:
        result.details = "Failed to create test feature"
        result.duration = time.time() - start
        return result

    # List (should include the feature - populates cache)
    listing1 = await list_features(session, 1, 50)
    found_before = False
    if listing1:
        found_before = any(f["id"] == feature["id"] for f in listing1["data"])

    # Upvote
    await upvote_feature(session, feature["id"], "cache-voter@test.com")

    # List again (cache should be invalidated)
    listing2 = await list_features(session, 1, 50)
    upvote_reflected = False
    if listing2:
        for f in listing2["data"]:
            if f["id"] == feature["id"]:
                upvote_reflected = f["upvoteCount"] >= 1
                break

    result.duration = time.time() - start
    result.passed = found_before and upvote_reflected
    result.requests_ok = sum([found_before, upvote_reflected])
    result.requests_fail = 2 - result.requests_ok
    result.details = f"Found after create: {found_before}, Upvote reflected: {upvote_reflected}"
    return result


async def run_all_tests() -> list[ChaosTestResult]:
    timeout = aiohttp.ClientTimeout(total=30)
    connector = aiohttp.TCPConnector(limit=CONCURRENCY)
    async with aiohttp.ClientSession(timeout=timeout, connector=connector) as session:
        results = []
        tests = [
            ("1/10", test_flood_creation),
            ("2/10", test_duplicate_upvote),
            ("3/10", test_upvote_nonexistent),
            ("4/10", test_invalid_payloads),
            ("5/10", test_race_condition_upvote_count),
            ("6/10", test_extreme_pagination),
            ("7/10", test_malformed_headers),
            ("8/10", test_bizarre_emails),
            ("9/10", test_stress_listing),
            ("10/10", test_cache_consistency),
        ]

        for label, test_fn in tests:
            console.print(f"\n[bold cyan]Running {label}: {test_fn.__name__}...[/bold cyan]")
            try:
                r = await test_fn(session)
            except Exception as e:
                r = ChaosTestResult(test_fn.__name__)
                r.details = f"Exception: {e}"
            results.append(r)

            status = "[bold green]PASS[/bold green]" if r.passed else "[bold red]FAIL[/bold red]"
            console.print(f"  {status} - {r.details} ({r.duration:.2f}s)")

        return results


def print_summary(results: list[ChaosTestResult]):
    table = Table(title="Chaos Test Summary")
    table.add_column("Test", style="cyan")
    table.add_column("Status", justify="center")
    table.add_column("OK", justify="right", style="green")
    table.add_column("Fail", justify="right", style="red")
    table.add_column("Duration", justify="right")
    table.add_column("Details")

    for r in results:
        status = "[green]PASS[/green]" if r.passed else "[red]FAIL[/red]"
        table.add_row(r.name, status, str(r.requests_ok), str(r.requests_fail), f"{r.duration:.2f}s", r.details)

    console.print("\n")
    console.print(table)

    passed = sum(1 for r in results if r.passed)
    total = len(results)
    console.print(f"\n[bold]Total: {passed}/{total} passed[/bold]")


def main():
    parser = argparse.ArgumentParser(description="Chaos testing for Feature Suggestion Platform")
    parser.add_argument("--base-url", default="http://localhost:3000/api", help="Base URL of the API")
    parser.add_argument("--concurrency", type=int, default=50, help="Max concurrent connections")
    args = parser.parse_args()

    global BASE_URL, CONCURRENCY
    BASE_URL = args.base_url.rstrip("/")
    CONCURRENCY = args.concurrency

    console.print("[bold magenta]Feature Suggestion Platform - Chaos Testing[/bold magenta]")
    console.print(f"Target: {BASE_URL}")
    console.print(f"Concurrency: {CONCURRENCY}\n")

    results = asyncio.run(run_all_tests())
    print_summary(results)


if __name__ == "__main__":
    main()
