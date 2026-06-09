"""Backend tests for Tuoma Portal API - kawiarnia-lumiere slug."""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://ai-recommends-3.preview.emergentagent.com').rstrip('/')
SLUG = "kawiarnia-lumiere"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


# ---- Business ----
def test_get_business(s):
    r = s.get(f"{BASE_URL}/api/business/{SLUG}")
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["slug"] == SLUG
    assert d["rating"] == 4.8
    assert isinstance(d["distribution"], dict)
    assert isinstance(d["sources"], list) and len(d["sources"]) >= 2
    names = [src["name"] for src in d["sources"]]
    assert "Tuoma" in names and "Google" in names


def test_get_business_404(s):
    r = s.get(f"{BASE_URL}/api/business/nope")
    assert r.status_code == 404


# ---- Metrics ----
def test_get_metrics(s):
    r = s.get(f"{BASE_URL}/api/business/{SLUG}/metrics")
    assert r.status_code == 200
    d = r.json()
    for k in ["new_30d", "recovery_rate", "response_rate", "intercepted_total"]:
        assert k in d, f"missing {k}"


# ---- Reviews ----
def test_list_reviews(s):
    r = s.get(f"{BASE_URL}/api/business/{SLUG}/reviews")
    assert r.status_code == 200
    arr = r.json()
    assert isinstance(arr, list)
    assert len(arr) >= 8, f"expected >=8 reviews, got {len(arr)}"
    sample = arr[0]
    for k in ["author", "rating", "text", "source", "status", "intercepted"]:
        assert k in sample


def test_reviews_filter_negative(s):
    r = s.get(f"{BASE_URL}/api/business/{SLUG}/reviews", params={"filter": "negative"})
    assert r.status_code == 200
    arr = r.json()
    assert len(arr) > 0
    for rv in arr:
        assert rv["rating"] <= 2


def test_reviews_filter_unreplied(s):
    r = s.get(f"{BASE_URL}/api/business/{SLUG}/reviews", params={"filter": "unreplied"})
    assert r.status_code == 200
    for rv in r.json():
        assert rv["status"] in ("new", "in_progress")


def test_patch_review(s):
    arr = s.get(f"{BASE_URL}/api/business/{SLUG}/reviews", params={"filter": "unreplied"}).json()
    assert arr, "no unreplied review to patch"
    rid = arr[0]["id"]
    payload = {"status": "resolved", "response": "TEST_response_text"}
    r = s.patch(f"{BASE_URL}/api/reviews/{rid}", json=payload)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["status"] == "resolved"
    assert d["response"] == "TEST_response_text"


# ---- Truth ----
def test_list_truth(s):
    r = s.get(f"{BASE_URL}/api/business/{SLUG}/truth")
    assert r.status_code == 200
    arr = r.json()
    assert len(arr) >= 12, f"expected >=12 facts, got {len(arr)}"
    cats = {f["category"] for f in arr}
    assert cats & {"podstawowe", "oferta", "kontakt", "specjalne"}


def test_truth_crud(s):
    # create
    payload = {"key": "TEST_key", "label": "TEST Label", "value": "TEST val", "category": "oferta"}
    r = s.post(f"{BASE_URL}/api/business/{SLUG}/truth", json=payload)
    assert r.status_code == 200, r.text
    d = r.json()
    fid = d["id"]
    assert d["label"] == "TEST Label"
    # verify via list
    arr = s.get(f"{BASE_URL}/api/business/{SLUG}/truth").json()
    assert any(f["id"] == fid for f in arr)
    # update
    upd = {"key": "TEST_key", "label": "TEST Updated", "value": "v2", "category": "kontakt"}
    r = s.patch(f"{BASE_URL}/api/truth/{fid}", json=upd)
    assert r.status_code == 200
    assert r.json()["label"] == "TEST Updated"
    # delete
    r = s.delete(f"{BASE_URL}/api/truth/{fid}")
    assert r.status_code == 200
    arr = s.get(f"{BASE_URL}/api/business/{SLUG}/truth").json()
    assert not any(f["id"] == fid for f in arr)


# ---- Customers ----
def test_list_customers(s):
    r = s.get(f"{BASE_URL}/api/business/{SLUG}/customers")
    assert r.status_code == 200
    arr = r.json()
    assert len(arr) >= 6
    for c in arr:
        for k in ["notes", "channel", "status", "name"]:
            assert k in c


# ---- AI Visibility ----
def test_ai_visibility(s):
    r = s.get(f"{BASE_URL}/api/business/{SLUG}/ai-visibility")
    assert r.status_code == 200
    arr = r.json()
    agents = {a["agent"] for a in arr}
    assert {"ChatGPT", "Claude", "Gemini", "Perplexity"}.issubset(agents)
    for a in arr:
        assert "rate" in a and isinstance(a["rate"], int)
        assert "queries" in a and isinstance(a["queries"], list)
