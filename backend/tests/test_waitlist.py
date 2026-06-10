"""Tests for waitlist landing page endpoints."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://ai-recommends-3.preview.emergentagent.com").rstrip("/")


@pytest.fixture
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ============ waitlist count ============
class TestWaitlistCount:
    def test_count_returns_real_and_offset(self, api):
        r = api.get(f"{BASE_URL}/api/waitlist/count", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "count" in data and "real" in data
        assert isinstance(data["count"], int) and isinstance(data["real"], int)
        # Offset 247 spec
        assert data["count"] == data["real"] + 247


# ============ waitlist POST ============
class TestWaitlistPost:
    def test_post_minimal_fields(self, api):
        payload = {"name": "TEST_Min User", "email": "test_min@example.com"}
        r = api.post(f"{BASE_URL}/api/waitlist", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("ok") is True
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0

    def test_post_full_fields(self, api):
        payload = {
            "name": "TEST_Full User",
            "email": "test_full@example.com",
            "business_name": "TEST Cafe",
            "city": "Katowice",
            "role": "investor",
            "message": "Hello",
        }
        r = api.post(f"{BASE_URL}/api/waitlist", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["ok"] is True

    def test_post_increments_count(self, api):
        before = api.get(f"{BASE_URL}/api/waitlist/count").json()["real"]
        api.post(
            f"{BASE_URL}/api/waitlist",
            json={"name": "TEST_Counter", "email": "test_counter@example.com"},
            timeout=15,
        )
        after = api.get(f"{BASE_URL}/api/waitlist/count").json()["real"]
        assert after == before + 1

    def test_post_invalid_role_rejected(self, api):
        payload = {"name": "TEST_Bad", "email": "bad@example.com", "role": "bogus"}
        r = api.post(f"{BASE_URL}/api/waitlist", json=payload, timeout=15)
        assert r.status_code == 422

    def test_post_missing_required_rejected(self, api):
        r = api.post(f"{BASE_URL}/api/waitlist", json={"name": "Only Name"}, timeout=15)
        assert r.status_code == 422
