"""
Lightweight embedding engine — no sentence-transformers needed.
Uses character n-gram + word co-occurrence vectors for semantic similarity.
Fast, offline, good enough for career Q&A retrieval.
"""
import re, math
from collections import Counter
from functools import lru_cache

# ── Tokenisation ──────────────────────────────────────────────────────────────
def _tokens(text: str) -> list[str]:
    t = text.lower()
    words = re.findall(r'\b[a-z]{2,}\b', t)
    # Add bigrams for better phrase matching
    bigrams = [f"{words[i]}_{words[i+1]}" for i in range(len(words)-1)]
    return words + bigrams

# ── IDF over the whole KB (built once at startup) ────────────────────────────
_idf_cache: dict = {}
_kb_ref: list = []

def build_index(kb: list) -> None:
    """Call once at startup with the full knowledge base."""
    global _idf_cache, _kb_ref
    _kb_ref = kb
    N = len(kb)
    df: Counter = Counter()
    for chunk in kb:
        doc = chunk.get("content","") + " " + " ".join(chunk.get("tags",[]))
        df.update(set(_tokens(doc)))
    _idf_cache = {t: math.log((N + 1) / (df[t] + 1)) + 1 for t in df}

def _vec(text: str) -> dict[str, float]:
    toks = _tokens(text)
    tf = Counter(toks)
    total = len(toks) or 1
    return {t: (c / total) * _idf_cache.get(t, 1.0) for t, c in tf.items()}

def _cosine(a: dict, b: dict) -> float:
    common = set(a) & set(b)
    if not common: return 0.0
    dot = sum(a[k] * b[k] for k in common)
    return dot / (math.sqrt(sum(v*v for v in a.values())) *
                  math.sqrt(sum(v*v for v in b.values())) + 1e-9)

# ── Retrieve top-k chunks ─────────────────────────────────────────────────────
def retrieve(query: str, intent: str, top_k: int = 3) -> list[dict]:
    """Return top_k most relevant KB chunks for the query."""
    candidates = [c for c in _kb_ref if intent in c.get("intents", [])]
    if not candidates:
        candidates = _kb_ref

    q_vec = _vec(query)
    scored = sorted(candidates, key=lambda c: _cosine(q_vec, _vec(
        c.get("content","") + " " + " ".join(c.get("tags",[]))
    )), reverse=True)
    return scored[:top_k]
