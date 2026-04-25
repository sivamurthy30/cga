"""
Load & Performance Tests
Validates system handles concurrent requests within acceptable latency.

Run: pytest tests/test_load.py -v -s
"""

import sys
import os
import time
import threading
import pytest

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

PROFILE_PAYLOAD = {
    "target_role": "Full Stack Developer",
    "known_skills": "HTML,CSS",
    "num_projects": 2,
    "experience_years": 1,
    "has_github": True,
    "has_portfolio": False,
    "has_certifications": False,
    "has_quantifiable_metrics": False,
    "learning_speed": 0.6,
}


# ─────────────────────────────────────────────
# SINGLE REQUEST LATENCY
# ─────────────────────────────────────────────

class TestSingleRequestLatency:

    def test_health_under_100ms(self):
        start = time.time()
        res = client.get("/health")
        elapsed = (time.time() - start) * 1000
        assert res.status_code == 200
        print(f"\n  /health latency: {elapsed:.1f}ms")
        assert elapsed < 100

    def test_linucb_recommend_under_500ms(self):
        start = time.time()
        res = client.post("/api/linucb/recommend?top_k=5", json=PROFILE_PAYLOAD)
        elapsed = (time.time() - start) * 1000
        assert res.status_code == 200
        print(f"\n  /api/linucb/recommend latency: {elapsed:.1f}ms")
        assert elapsed < 500

    def test_quiz_generate_under_2000ms(self):
        """Quiz uses Gemini AI — allow up to 2s"""
        start = time.time()
        res = client.post("/api/quiz/generate", json={"skill": "python", "count": 3})
        elapsed = (time.time() - start) * 1000
        assert res.status_code == 200
        print(f"\n  /api/quiz/generate latency: {elapsed:.1f}ms")
        assert elapsed < 2000


# ─────────────────────────────────────────────
# CONCURRENT REQUESTS
# ─────────────────────────────────────────────

class TestConcurrentLoad:

    def _make_recommend_request(self, results: list, idx: int):
        start = time.time()
        try:
            res = client.post("/api/linucb/recommend?top_k=3", json=PROFILE_PAYLOAD)
            elapsed = (time.time() - start) * 1000
            results[idx] = {"status": res.status_code, "latency_ms": elapsed}
        except Exception as e:
            results[idx] = {"status": 500, "latency_ms": 9999, "error": str(e)}

    def test_10_concurrent_recommend_requests(self):
        n = 10
        results = [None] * n
        threads = [
            threading.Thread(target=self._make_recommend_request, args=(results, i))
            for i in range(n)
        ]

        start = time.time()
        for t in threads:
            t.start()
        for t in threads:
            t.join()
        total_elapsed = (time.time() - start) * 1000

        latencies = [r["latency_ms"] for r in results]
        statuses  = [r["status"] for r in results]

        success_rate = sum(1 for s in statuses if s == 200) / n
        avg_latency  = sum(latencies) / n
        max_latency  = max(latencies)

        print(f"\n  Concurrent requests: {n}")
        print(f"  Success rate:        {success_rate:.0%}")
        print(f"  Avg latency:         {avg_latency:.1f}ms")
        print(f"  Max latency:         {max_latency:.1f}ms")
        print(f"  Total wall time:     {total_elapsed:.1f}ms")

        assert success_rate >= 0.9, f"Too many failures: {statuses}"
        assert avg_latency < 1000, f"Average latency too high: {avg_latency:.1f}ms"

    def test_50_sequential_health_checks(self):
        """Baseline throughput test"""
        latencies = []
        for _ in range(50):
            start = time.time()
            res = client.get("/health")
            latencies.append((time.time() - start) * 1000)
            assert res.status_code == 200

        avg = sum(latencies) / len(latencies)
        p95 = sorted(latencies)[int(0.95 * len(latencies))]

        print(f"\n  50 sequential /health requests")
        print(f"  Avg latency: {avg:.1f}ms")
        print(f"  P95 latency: {p95:.1f}ms")

        assert avg < 50
        assert p95 < 100
