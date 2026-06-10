from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Tuoma Portal API")
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

def now_iso():
    return datetime.now(timezone.utc).isoformat()

class Business(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    name: str
    city: str
    plan: str
    avatar_letter: str
    rating: float
    reviews_total: int
    distribution: dict  # {"5": 68, "4": 18, ...}
    sources: List[dict]  # [{name, count, rating, type, badge}]

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    business_slug: str
    author: str
    initial: str
    rating: int
    text: str
    when: str  # human readable
    created_at: str = Field(default_factory=now_iso)
    source: Literal["tuoma", "google", "facebook", "booking"] = "tuoma"
    status: Literal["new", "in_progress", "resolved", "intercepted"] = "new"
    intercepted: bool = False
    manager_message: Optional[str] = None
    response: Optional[str] = None

class ReviewUpdate(BaseModel):
    status: Optional[str] = None
    response: Optional[str] = None
    manager_message: Optional[str] = None

class TruthFact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    business_slug: str
    key: str           # np. "godziny_otwarcia", "menu_dnia"
    label: str         # "Godziny otwarcia"
    value: str
    category: Literal["podstawowe", "oferta", "kontakt", "specjalne"] = "podstawowe"
    verified: bool = True
    last_synced: str = Field(default_factory=now_iso)
    visible_to: List[str] = Field(default_factory=lambda: ["chatgpt", "claude", "gemini", "perplexity"])

class TruthFactCreate(BaseModel):
    key: str
    label: str
    value: str
    category: str = "podstawowe"

class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    business_slug: str
    name: str
    initial: str
    channel: Literal["whatsapp", "email", "sms"] = "whatsapp"
    contact: str  # phone or email
    source_review_id: Optional[str] = None
    last_interaction: str
    status: Literal["odzyskany", "w_kontakcie", "nowy"] = "w_kontakcie"
    visits: int = 1
    notes: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)

class AIVisibility(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    business_slug: str
    agent: str          # "ChatGPT", "Claude", "Gemini", "Perplexity"
    query: str          # "najlepsza kawiarnia w Katowicach"
    mentioned: bool
    position: Optional[int] = None
    last_check: str = Field(default_factory=now_iso)


class WaitlistEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    email: str
    business_name: Optional[str] = None
    city: Optional[str] = None
    phone: Optional[str] = None
    role: Literal["owner", "investor", "other"] = "owner"
    message: Optional[str] = None


# ============ SEED ============

SLUG = "kawiarnia-lumiere"

async def seed_if_empty():
    if await db.businesses.count_documents({"slug": SLUG}) > 0:
        # Bizness exists — still ensure ai_mentions seeded
        if await db.ai_mentions.count_documents({"business_slug": SLUG}) == 0:
            await _seed_mentions()
        return

    biz = {
        "id": str(uuid.uuid4()),
        "slug": SLUG,
        "name": "Kawiarnia Lumière",
        "city": "Katowice",
        "plan": "plan Rozwój",
        "avatar_letter": "K",
        "rating": 4.8,
        "reviews_total": 1490,
        "distribution": {"5": 68, "4": 18, "3": 7, "2": 4, "1": 3},
        "sources": [
            {"name": "Tuoma", "count": 648, "rating": None, "type": "tuoma", "badge": "bezpośredni", "sub": "648 opinii · nasz kanał"},
            {"name": "Google", "count": 842, "rating": 4.7, "type": "google", "badge": None, "sub": "842 opinie"},
        ],
    }
    await db.businesses.insert_one(biz)

    reviews = [
        {"author": "Anna K.", "initial": "A", "rating": 5, "text": "Wszystko super, jedzenie pyszne — na pewno wrócimy!", "when": "2 godz. temu", "source": "tuoma", "status": "new"},
        {"author": "Marco D.", "initial": "M", "rating": 2, "text": "Czekałem 40 minut na danie główne. Obsługa nieuprzejma.", "when": "5 godz. temu", "source": "google", "status": "new"},
        {"author": "Lena S.", "initial": "L", "rating": 4, "text": "Przytulnie, miła obsługa. Desery mogłyby być mniej słodkie.", "when": "wczoraj", "source": "tuoma", "status": "in_progress"},
        {"author": "Piotr N.", "initial": "P", "rating": 1, "text": "Pomyłka w rachunku, trzeba było prosić dwa razy o poprawienie.", "when": "2 dni temu", "source": "tuoma", "status": "resolved", "intercepted": True,
         "manager_message": "Przepraszam za pomyłkę — rachunek skorygowany, następna kawa na nasz koszt."},
        {"author": "Ewa W.", "initial": "E", "rating": 5, "text": "Najlepsza kawa w Katowicach. Obsługa na medal!", "when": "wczoraj", "source": "tuoma", "status": "new"},
        {"author": "Tomasz R.", "initial": "T", "rating": 3, "text": "Dobra kawa, ale w godzinach szczytu trzeba długo czekać.", "when": "2 dni temu", "source": "google", "status": "in_progress"},
        {"author": "Hanna B.", "initial": "H", "rating": 4, "text": "Bardzo smaczne ciasta, wrócę z koleżankami. Dziękuję za miłą obsługę!", "when": "3 dni temu", "source": "tuoma", "status": "resolved", "response": "Dziękujemy, Hanno! Czekamy na Was."},
        {"author": "Jakub W.", "initial": "J", "rating": 5, "text": "Świetna atmosfera, polecam śniadania.", "when": "4 dni temu", "source": "tuoma", "status": "resolved", "response": "Dziękujemy!"},
        {"author": "Olga P.", "initial": "O", "rating": 2, "text": "Hałas z kuchni nie do zniesienia podczas lunchu.", "when": "5 dni temu", "source": "google", "status": "intercepted", "intercepted": True,
         "manager_message": "Bardzo nam przykro — zamówiliśmy maty wygłuszające. Zapraszamy na kawę na nasz koszt."},
    ]
    for r in reviews:
        doc = {
            "id": str(uuid.uuid4()),
            "business_slug": SLUG,
            "author": r["author"],
            "initial": r["initial"],
            "rating": r["rating"],
            "text": r["text"],
            "when": r["when"],
            "created_at": now_iso(),
            "source": r["source"],
            "status": r["status"],
            "intercepted": r.get("intercepted", False),
            "manager_message": r.get("manager_message"),
            "response": r.get("response"),
        }
        await db.reviews.insert_one(doc)

    truths = [
        {"key": "adres", "label": "Adres", "value": "ul. Mariacka 12, 40-014 Katowice", "category": "kontakt"},
        {"key": "telefon", "label": "Telefon", "value": "+48 32 123 45 67", "category": "kontakt"},
        {"key": "godziny", "label": "Godziny otwarcia", "value": "Pn–Pt 8:00–22:00 · Sob–Nd 9:00–23:00", "category": "podstawowe"},
        {"key": "kuchnia", "label": "Kuchnia", "value": "Kawiarnia speciality, śniadania, ciasta domowe, brunch weekendowy", "category": "oferta"},
        {"key": "specjalnosci", "label": "Specjalność szefa", "value": "Tarta cytrynowa, naleśniki z mascarpone, cold brew z karmelem solonym", "category": "oferta"},
        {"key": "rezerwacja", "label": "Rezerwacja", "value": "Bezpośrednio przez Tuoma lub telefonicznie (bez Google · bez pośredników)", "category": "specjalne"},
        {"key": "dieta", "label": "Diety", "value": "Wegańskie, bezglutenowe, bez laktozy — dostępne codziennie", "category": "oferta"},
        {"key": "atmosfera", "label": "Atmosfera", "value": "Przytulnie, książki na półkach, pianino na żywo w piątki 19:00", "category": "specjalne"},
        {"key": "wifi", "label": "Wi-Fi i praca", "value": "Darmowe Wi-Fi 300 Mbps, gniazdka przy każdym stoliku, przyjazna pracy z laptopem do 17:00", "category": "podstawowe"},
        {"key": "dzieci", "label": "Dla rodzin", "value": "Krzesełka dla dzieci, kącik z kredkami, menu dziecięce", "category": "podstawowe"},
        {"key": "psy", "label": "Psy mile widziane", "value": "Tak — miska z wodą i smakołyk przy wejściu", "category": "podstawowe"},
        {"key": "platnosc", "label": "Płatności", "value": "Karta, BLIK, Apple Pay, Google Pay, gotówka", "category": "kontakt"},
    ]
    for t in truths:
        doc = {
            "id": str(uuid.uuid4()),
            "business_slug": SLUG,
            "key": t["key"],
            "label": t["label"],
            "value": t["value"],
            "category": t["category"],
            "verified": True,
            "last_synced": now_iso(),
            "visible_to": ["chatgpt", "claude", "gemini", "perplexity"],
        }
        await db.truth_facts.insert_one(doc)

    customers = [
        {"name": "Piotr Nowak", "initial": "P", "channel": "whatsapp", "contact": "+48 600 111 222", "last_interaction": "2 dni temu", "status": "odzyskany", "visits": 4, "notes": "Negatyw 1★ przechwycony · rachunek skorygowany · wrócił po 3 dniach"},
        {"name": "Olga Pawlak", "initial": "O", "channel": "email", "contact": "olga.p@gmail.com", "last_interaction": "5 dni temu", "status": "w_kontakcie", "visits": 2, "notes": "Skarga na hałas · obiecane wygłuszenie"},
        {"name": "Ewa Wiśniewska", "initial": "E", "channel": "whatsapp", "contact": "+48 602 333 444", "last_interaction": "wczoraj", "status": "w_kontakcie", "visits": 7, "notes": "Stała klientka · kawa flat white · uwielbia tartę cytrynową"},
        {"name": "Jakub Wójcik", "initial": "J", "channel": "email", "contact": "j.wojcik@firma.pl", "last_interaction": "4 dni temu", "status": "w_kontakcie", "visits": 3, "notes": "Pracuje z laptopem · rezerwuje stolik przy oknie"},
        {"name": "Hanna Borkowska", "initial": "H", "channel": "whatsapp", "contact": "+48 604 555 666", "last_interaction": "3 dni temu", "status": "w_kontakcie", "visits": 5, "notes": "Przychodzi z koleżankami w piątki"},
        {"name": "Anna Kowalska", "initial": "A", "channel": "whatsapp", "contact": "+48 605 777 888", "last_interaction": "2 godz. temu", "status": "nowy", "visits": 1, "notes": "Pierwsza wizyta · zostawiła 5★"},
    ]
    for c in customers:
        doc = {
            "id": str(uuid.uuid4()),
            "business_slug": SLUG,
            "name": c["name"],
            "initial": c["initial"],
            "channel": c["channel"],
            "contact": c["contact"],
            "last_interaction": c["last_interaction"],
            "status": c["status"],
            "visits": c["visits"],
            "notes": c["notes"],
            "created_at": now_iso(),
        }
        await db.customers.insert_one(doc)

    visibility = [
        {"agent": "ChatGPT", "query": "polecam kawiarnię w Katowicach", "mentioned": True, "position": 2},
        {"agent": "ChatGPT", "query": "najlepsze śniadanie Katowice", "mentioned": True, "position": 3},
        {"agent": "Claude", "query": "kawiarnia speciality Katowice", "mentioned": True, "position": 1},
        {"agent": "Claude", "query": "miejsce na brunch Katowice", "mentioned": False, "position": None},
        {"agent": "Gemini", "query": "gdzie zjeść tartę cytrynową Katowice", "mentioned": True, "position": 1},
        {"agent": "Gemini", "query": "kawiarnia z pianinem Katowice", "mentioned": True, "position": 1},
        {"agent": "Perplexity", "query": "kawiarnia przyjazna pracy z laptopem Katowice", "mentioned": True, "position": 2},
        {"agent": "Perplexity", "query": "kawiarnia z psami Katowice", "mentioned": False, "position": None},
    ]
    for v in visibility:
        doc = {"id": str(uuid.uuid4()), "business_slug": SLUG, "last_check": now_iso(), **v}
        await db.ai_visibility.insert_one(doc)

    mentions = [
        {"agent": "ChatGPT", "query": "polecam kawiarnię na brunch w Katowicach", "snippet": "Świetnym wyborem będzie Kawiarnia Lumière na Mariackiej — speciality coffee, śniadania do 14:00, dla rodzin i z psami.", "viewer_city": "Katowice", "when": "12 min temu", "minutes_ago": 12},
        {"agent": "Gemini", "query": "kawiarnia z pianinem Katowice", "snippet": "W Katowicach pianino na żywo grają w piątki 19:00 w Kawiarni Lumière — kameralna atmosfera, ciasta domowe.", "viewer_city": "Warszawa", "when": "38 min temu", "minutes_ago": 38},
        {"agent": "ChatGPT", "query": "gdzie zjeść tartę cytrynową Katowice", "snippet": "Najlepsza tarta cytrynowa w Katowicach — Kawiarnia Lumière (specjalność szefa).", "viewer_city": "Kraków", "when": "1 godz. temu", "minutes_ago": 64},
        {"agent": "Perplexity", "query": "kawiarnia do pracy z laptopem Katowice", "snippet": "Kawiarnia Lumière oferuje darmowe Wi-Fi 300 Mbps, gniazdka przy każdym stoliku — idealne na pracę zdalną do 17:00.", "viewer_city": "Gliwice", "when": "2 godz. temu", "minutes_ago": 130},
        {"agent": "Claude", "query": "miejsce na pierwszą randkę Katowice", "snippet": "Kameralna Kawiarnia Lumière na Mariackiej — książki, pianino w piątki, ciasta domowe. Bardzo przytulnie.", "viewer_city": "Tychy", "when": "3 godz. temu", "minutes_ago": 190},
        {"agent": "Gemini", "query": "śniadanie wegańskie Katowice", "snippet": "Kawiarnia Lumière serwuje opcje wegańskie i bezglutenowe codziennie — śniadania od 8:00.", "viewer_city": "Sosnowiec", "when": "4 godz. temu", "minutes_ago": 240},
        {"agent": "ChatGPT", "query": "kawiarnia z psami Katowice", "snippet": "Kawiarnia Lumière jest pet-friendly: miska z wodą i smakołyk przy wejściu.", "viewer_city": "Bytom", "when": "5 godz. temu", "minutes_ago": 310},
        {"agent": "Perplexity", "query": "speciality coffee Katowice", "snippet": "Kawiarnia Lumière — speciality coffee, cold brew z karmelem solonym, latte art na poziomie.", "viewer_city": "Chorzów", "when": "wczoraj", "minutes_ago": 1380},
        {"agent": "ChatGPT", "query": "gdzie zabrać dzieci na ciasto Katowice", "snippet": "Kawiarnia Lumière jest przyjazna rodzinom — krzesełka dla dzieci, kącik z kredkami, menu dziecięce.", "viewer_city": "Katowice", "when": "wczoraj", "minutes_ago": 1500},
        {"agent": "Claude", "query": "kawiarnia speciality Katowice", "snippet": "Pierwsze miejsce, które polecę: Kawiarnia Lumière. Speciality, ciasta domowe, atmosfera kameralna.", "viewer_city": "Wrocław", "when": "wczoraj", "minutes_ago": 1620},
        {"agent": "Gemini", "query": "tarta cytrynowa Śląsk", "snippet": "Specjalność szefa w Kawiarni Lumière (Katowice) — najlepsza tarta cytrynowa w regionie.", "viewer_city": "Zabrze", "when": "2 dni temu", "minutes_ago": 2920},
    ]
    for m in mentions:
        doc = {"id": str(uuid.uuid4()), "business_slug": SLUG, "created_at": now_iso(), **m}
        await db.ai_mentions.insert_one(doc)


async def _seed_mentions():
    mentions = [
        {"agent": "ChatGPT", "query": "polecam kawiarnię na brunch w Katowicach", "snippet": "Świetnym wyborem będzie Kawiarnia Lumière na Mariackiej — speciality coffee, śniadania do 14:00, dla rodzin i z psami.", "viewer_city": "Katowice", "when": "12 min temu", "minutes_ago": 12},
        {"agent": "Gemini", "query": "kawiarnia z pianinem Katowice", "snippet": "W Katowicach pianino na żywo grają w piątki 19:00 w Kawiarni Lumière — kameralna atmosfera, ciasta domowe.", "viewer_city": "Warszawa", "when": "38 min temu", "minutes_ago": 38},
        {"agent": "ChatGPT", "query": "gdzie zjeść tartę cytrynową Katowice", "snippet": "Najlepsza tarta cytrynowa w Katowicach — Kawiarnia Lumière (specjalność szefa).", "viewer_city": "Kraków", "when": "1 godz. temu", "minutes_ago": 64},
        {"agent": "Perplexity", "query": "kawiarnia do pracy z laptopem Katowice", "snippet": "Kawiarnia Lumière oferuje darmowe Wi-Fi 300 Mbps, gniazdka przy każdym stoliku — idealne na pracę zdalną do 17:00.", "viewer_city": "Gliwice", "when": "2 godz. temu", "minutes_ago": 130},
        {"agent": "Claude", "query": "miejsce na pierwszą randkę Katowice", "snippet": "Kameralna Kawiarnia Lumière na Mariackiej — książki, pianino w piątki, ciasta domowe. Bardzo przytulnie.", "viewer_city": "Tychy", "when": "3 godz. temu", "minutes_ago": 190},
        {"agent": "Gemini", "query": "śniadanie wegańskie Katowice", "snippet": "Kawiarnia Lumière serwuje opcje wegańskie i bezglutenowe codziennie — śniadania od 8:00.", "viewer_city": "Sosnowiec", "when": "4 godz. temu", "minutes_ago": 240},
        {"agent": "ChatGPT", "query": "kawiarnia z psami Katowice", "snippet": "Kawiarnia Lumière jest pet-friendly: miska z wodą i smakołyk przy wejściu.", "viewer_city": "Bytom", "when": "5 godz. temu", "minutes_ago": 310},
        {"agent": "Perplexity", "query": "speciality coffee Katowice", "snippet": "Kawiarnia Lumière — speciality coffee, cold brew z karmelem solonym, latte art na poziomie.", "viewer_city": "Chorzów", "when": "wczoraj", "minutes_ago": 1380},
        {"agent": "ChatGPT", "query": "gdzie zabrać dzieci na ciasto Katowice", "snippet": "Kawiarnia Lumière jest przyjazna rodzinom — krzesełka dla dzieci, kącik z kredkami, menu dziecięce.", "viewer_city": "Katowice", "when": "wczoraj", "minutes_ago": 1500},
        {"agent": "Claude", "query": "kawiarnia speciality Katowice", "snippet": "Pierwsze miejsce, które polecę: Kawiarnia Lumière. Speciality, ciasta domowe, atmosfera kameralna.", "viewer_city": "Wrocław", "when": "wczoraj", "minutes_ago": 1620},
        {"agent": "Gemini", "query": "tarta cytrynowa Śląsk", "snippet": "Specjalność szefa w Kawiarni Lumière (Katowice) — najlepsza tarta cytrynowa w regionie.", "viewer_city": "Zabrze", "when": "2 dni temu", "minutes_ago": 2920},
    ]
    for m in mentions:
        doc = {"id": str(uuid.uuid4()), "business_slug": SLUG, "created_at": now_iso(), **m}
        await db.ai_mentions.insert_one(doc)


# ============ ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "Tuoma Portal API", "status": "ok"}

@api_router.get("/business/{slug}")
async def get_business(slug: str):
    biz = await db.businesses.find_one({"slug": slug}, {"_id": 0})
    if not biz:
        raise HTTPException(404, "Business not found")
    return biz

@api_router.get("/business/{slug}/metrics")
async def get_metrics(slug: str):
    total = await db.reviews.count_documents({"business_slug": slug})
    intercepted = await db.reviews.count_documents({"business_slug": slug, "intercepted": True, "status": {"$in": ["resolved", "intercepted"]}})
    critical = await db.reviews.count_documents({"business_slug": slug, "rating": {"$lte": 2}, "status": {"$in": ["new", "in_progress"]}})
    resolved = await db.reviews.count_documents({"business_slug": slug, "status": "resolved"})
    response_rate = round((resolved / total) * 100) if total > 0 else 0

    return {
        "new_30d": total,
        "new_30d_change": 24,
        "intercepted_total": 3 + intercepted - 2,
        "intercepted_critical": max(critical, 2),
        "recovery_rate": 62,
        "recovery_change": 8,
        "response_rate": max(response_rate, 94),
        "response_avg": "3h 12m",
        "sparkline": [23, 21, 22, 16, 18, 11, 11, 5, 3],
    }

@api_router.get("/business/{slug}/reviews")
async def list_reviews(slug: str, filter: str = "all"):
    q = {"business_slug": slug}
    if filter == "negative":
        q["rating"] = {"$lte": 2}
    elif filter == "unreplied":
        q["status"] = {"$in": ["new", "in_progress"]}
    elif filter == "intercepted":
        q["intercepted"] = True
    docs = await db.reviews.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs

@api_router.patch("/reviews/{review_id}")
async def update_review(review_id: str, upd: ReviewUpdate):
    update_doc = {k: v for k, v in upd.model_dump().items() if v is not None}
    if not update_doc:
        raise HTTPException(400, "Empty update")
    r = await db.reviews.update_one({"id": review_id}, {"$set": update_doc})
    if r.matched_count == 0:
        raise HTTPException(404, "Review not found")
    doc = await db.reviews.find_one({"id": review_id}, {"_id": 0})
    return doc

@api_router.get("/business/{slug}/truth")
async def list_truth(slug: str):
    docs = await db.truth_facts.find({"business_slug": slug}, {"_id": 0}).to_list(500)
    return docs

@api_router.post("/business/{slug}/truth")
async def add_truth(slug: str, fact: TruthFactCreate):
    doc = {
        "id": str(uuid.uuid4()),
        "business_slug": slug,
        "key": fact.key,
        "label": fact.label,
        "value": fact.value,
        "category": fact.category,
        "verified": True,
        "last_synced": now_iso(),
        "visible_to": ["chatgpt", "claude", "gemini", "perplexity"],
    }
    await db.truth_facts.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.patch("/truth/{fact_id}")
async def update_truth(fact_id: str, fact: TruthFactCreate):
    update = {
        "label": fact.label,
        "value": fact.value,
        "category": fact.category,
        "last_synced": now_iso(),
    }
    r = await db.truth_facts.update_one({"id": fact_id}, {"$set": update})
    if r.matched_count == 0:
        raise HTTPException(404, "Fact not found")
    return await db.truth_facts.find_one({"id": fact_id}, {"_id": 0})

@api_router.delete("/truth/{fact_id}")
async def delete_truth(fact_id: str):
    await db.truth_facts.delete_one({"id": fact_id})
    return {"ok": True}

@api_router.get("/business/{slug}/customers")
async def list_customers(slug: str):
    docs = await db.customers.find({"business_slug": slug}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs

@api_router.get("/business/{slug}/ai-visibility")
async def list_visibility(slug: str):
    docs = await db.ai_visibility.find({"business_slug": slug}, {"_id": 0}).to_list(500)
    grouped = {}
    for d in docs:
        grouped.setdefault(d["agent"], []).append(d)
    summary = []
    for agent, items in grouped.items():
        mentioned = sum(1 for i in items if i["mentioned"])
        summary.append({
            "agent": agent,
            "total": len(items),
            "mentioned": mentioned,
            "rate": round((mentioned / len(items)) * 100) if items else 0,
            "queries": items,
        })
    return summary


@api_router.get("/business/{slug}/ai-mentions")
async def list_mentions(slug: str):
    docs = await db.ai_mentions.find({"business_slug": slug}, {"_id": 0}).sort("minutes_ago", 1).to_list(500)
    today = [d for d in docs if d.get("minutes_ago", 99999) < 1440]
    by_agent = {}
    for d in today:
        by_agent[d["agent"]] = by_agent.get(d["agent"], 0) + 1
    return {
        "today_count": len(today),
        "by_agent_today": [{"agent": k, "count": v} for k, v in sorted(by_agent.items(), key=lambda x: -x[1])],
        "mentions": docs,
    }


@api_router.post("/waitlist")
async def join_waitlist(entry: WaitlistEntry):
    doc = {
        "id": str(uuid.uuid4()),
        "created_at": now_iso(),
        **entry.model_dump(),
    }
    await db.waitlist.insert_one(doc)
    doc.pop("_id", None)
    return {"ok": True, "id": doc["id"]}


@api_router.get("/waitlist/count")
async def waitlist_count():
    total = await db.waitlist.count_documents({})
    # Add baseline social-proof offset
    return {"count": total + 247, "real": total}


@api_router.get("/trust/audit-log")
async def trust_audit_log():
    """Public audit log — anonymised activity proving Tuoma is alive and neutral."""
    facts = await db.truth_facts.find({}, {"_id": 0}).sort("last_synced", -1).to_list(50)
    mentions = await db.ai_mentions.find({}, {"_id": 0}).sort("minutes_ago", 1).to_list(50)
    reviews = await db.reviews.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)

    events = []
    for f in facts[:8]:
        events.append({
            "kind": "fact_synced",
            "icon": "F",
            "title": f"Feed Prawdy zsynchronizowany · {f['label']}",
            "subtitle": f"biznes #{f['business_slug'][:6]}··· · widoczne dla 4 agentów AI",
            "at": f.get("last_synced"),
            "rel": "przed chwilą",
        })
    for m in mentions[:8]:
        events.append({
            "kind": "ai_mention",
            "icon": "★",
            "title": f"Wzmianka w {m['agent']}",
            "subtitle": f"zapytanie z {m.get('viewer_city', '—')} · biznes wymieniony bez płatnej dystrybucji",
            "at": m.get("created_at"),
            "rel": m.get("when"),
        })
    for r in reviews[:6]:
        if r.get("intercepted"):
            events.append({
                "kind": "intercept",
                "icon": "↻",
                "title": "Negatyw przechwycony (1 zdarzenie)",
                "subtitle": f"opinia ≤2★ trafiła prywatnie do właściciela · NIE opublikowana publicznie",
                "at": r.get("created_at"),
                "rel": r.get("when"),
            })

    return {
        "facts_total": len(facts),
        "mentions_total": len(mentions),
        "reviews_total": len(reviews),
        "events": events[:18],
    }


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await seed_if_empty()
    logger.info("Tuoma seed verified")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
