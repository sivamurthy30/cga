import json
from pathlib import Path
from fastapi import APIRouter, HTTPException

router = APIRouter()

# Resolve path relative to THIS file — works regardless of cwd
# app/routes/roadmap.py → parents[0]=routes, [1]=app, [2]=backend, then /data/roadmaps
ROADMAP_DIR = Path(__file__).resolve().parents[2] / "data" / "roadmaps"


def _read_json(path: Path):
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"{path.name} not found")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# ── Static/named routes MUST come before /{roadmap_id} ──────────────────────

@router.get("/list")
async def list_roadmaps():
    """Return all available roadmaps from the index file."""
    index_file = ROADMAP_DIR / "roadmaps_index.json"
    if index_file.exists():
        index_data = _read_json(index_file)
        return {
            "roadmaps": list(index_data.get("roadmaps", {}).values()),
            "total": len(index_data.get("roadmaps", {})),
        }

    # Fallback: scan directory
    roadmaps = []
    for f in sorted(ROADMAP_DIR.glob("*.json")):
        if f.stem in ("roadmaps_index", "roadmaps", "roadmap_nodes",
                      "roadmap_edges", "topics", "routes", "d3_graph",
                      "frontend_roadmap"):
            continue
        try:
            data = _read_json(f)
            if "id" in data and "name" in data:
                roadmaps.append({
                    "id": data["id"],
                    "name": data["name"],
                    "icon": data.get("icon", "🗺️"),
                    "totalNodes": data.get("totalNodes", len(data.get("nodes", []))),
                })
        except Exception:
            continue
    return {"roadmaps": roadmaps, "total": len(roadmaps)}


@router.get("/nodes")
async def get_roadmap_nodes():
    nodes = _read_json(ROADMAP_DIR / "roadmap_nodes.json")
    return {"nodes": nodes, "total": len(nodes)}


@router.get("/edges")
async def get_roadmap_edges():
    edges = _read_json(ROADMAP_DIR / "roadmap_edges.json")
    return {"edges": edges, "total": len(edges)}


@router.get("/topics")
async def get_roadmap_topics():
    topics = _read_json(ROADMAP_DIR / "topics.json")
    return {"topics": topics, "total": len(topics)}


@router.get("/complete")
async def get_complete_roadmap():
    nodes  = _read_json(ROADMAP_DIR / "roadmap_nodes.json")
    edges  = _read_json(ROADMAP_DIR / "roadmap_edges.json")
    topics = _read_json(ROADMAP_DIR / "topics.json")
    return {
        "nodes": nodes, "edges": edges, "topics": topics,
        "roadmap": "frontend-developer",
        "total_nodes": len(nodes), "total_edges": len(edges),
        "total_topics": len(topics),
    }


# ── Dynamic route LAST ───────────────────────────────────────────────────────

@router.get("/{roadmap_id}")
async def get_roadmap(roadmap_id: str):
    """Fetch a roadmap JSON by its ID (e.g. frontend-developer)."""
    roadmap_file = ROADMAP_DIR / f"{roadmap_id}.json"

    if not roadmap_file.exists():
        # Try underscore variant (frontend_roadmap → frontend-developer)
        alt = ROADMAP_DIR / f"{roadmap_id.replace('-', '_')}.json"
        if alt.exists():
            roadmap_file = alt
        else:
            available = [
                f.stem for f in ROADMAP_DIR.glob("*.json")
                if f.stem not in ("roadmaps_index", "roadmaps", "roadmap_nodes",
                                  "roadmap_edges", "topics", "routes",
                                  "d3_graph", "frontend_roadmap")
            ]
            raise HTTPException(
                status_code=404,
                detail=f"Roadmap '{roadmap_id}' not found. Available: {available}",
            )

    data = _read_json(roadmap_file)

    # Ensure nodes have the shape the frontend expects
    nodes = data.get("nodes", [])
    for node in nodes:
        if "data" not in node:
            node["data"] = {}
        d = node["data"]
        d.setdefault("title", node.get("title", "Untitled"))
        d.setdefault("description", node.get("description", ""))
        d.setdefault("learningTime", node.get("learningTime", "2-4 hours"))
        d.setdefault("level", node.get("level", "beginner"))
        d.setdefault("resources", node.get("resources", f"/resources/{node.get('id', '')}"))
        d.setdefault("subtopics", node.get("subtopics", []))
        d.setdefault("tools", node.get("tools", []))

    data["nodes"] = nodes
    return data
