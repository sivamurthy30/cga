import json
from pathlib import Path
from fastapi import APIRouter, HTTPException

router = APIRouter()

PROJECT_ROOT = Path(__file__).resolve().parents[3]
ROADMAP_DIR = PROJECT_ROOT / "backend" / "data" / "roadmaps"


def _read_json_file(path: Path):
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"{path.name} not found")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/list")
async def list_roadmaps():
    """Get list of all available roadmaps"""
    index_file = ROADMAP_DIR / "roadmaps_index.json"
    if index_file.exists():
        index_data = _read_json_file(index_file)
        return {
            "roadmaps": list(index_data.get("roadmaps", {}).values()),
            "total": len(index_data.get("roadmaps", {}))
        }
    
    # Fallback: scan directory for roadmap files
    roadmaps = []
    for file in ROADMAP_DIR.glob("*-developer.json"):
        try:
            data = _read_json_file(file)
            roadmaps.append({
                "id": data.get("id"),
                "name": data.get("name"),
                "icon": data.get("icon", "🗺️"),
                "totalNodes": data.get("totalNodes", 0)
            })
        except:
            continue
    
    return {"roadmaps": roadmaps, "total": len(roadmaps)}


@router.get("/{roadmap_id}")
async def get_roadmap_by_id(roadmap_id: str):
    """Get specific roadmap by ID"""
    roadmap_file = ROADMAP_DIR / f"{roadmap_id}.json"
    
    if not roadmap_file.exists():
        raise HTTPException(
            status_code=404, 
            detail=f"Roadmap '{roadmap_id}' not found. Use /api/roadmap/list to see available roadmaps."
        )
    
    roadmap_data = _read_json_file(roadmap_file)
    return roadmap_data


@router.get("/nodes")
async def get_roadmap_nodes():
    """Legacy endpoint - get default roadmap nodes"""
    nodes = _read_json_file(ROADMAP_DIR / "roadmap_nodes.json")
    return {"nodes": nodes, "total": len(nodes)}


@router.get("/edges")
async def get_roadmap_edges():
    """Legacy endpoint - get default roadmap edges"""
    edges = _read_json_file(ROADMAP_DIR / "roadmap_edges.json")
    return {"edges": edges, "total": len(edges)}


@router.get("/topics")
async def get_roadmap_topics():
    """Legacy endpoint - get default roadmap topics"""
    topics = _read_json_file(ROADMAP_DIR / "topics.json")
    return {"topics": topics, "total": len(topics)}


@router.get("/complete")
async def get_complete_roadmap():
    """Legacy endpoint - get complete default roadmap"""
    nodes = _read_json_file(ROADMAP_DIR / "roadmap_nodes.json")
    edges = _read_json_file(ROADMAP_DIR / "roadmap_edges.json")
    topics = _read_json_file(ROADMAP_DIR / "topics.json")
    return {
        "nodes": nodes,
        "edges": edges,
        "topics": topics,
        "roadmap": "frontend-developer",
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "total_topics": len(topics),
    }
