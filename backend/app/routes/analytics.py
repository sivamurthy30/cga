"""
Routes for System 4: Async Analytics
- POST /analytics/resume/upload  → enqueues Celery task, returns task_id
- POST /analytics/github/analyze → enqueues Celery task, returns task_id
- GET  /analytics/task/{task_id} → poll task status
- WS   /analytics/ws/{task_id}  → stream real-time progress
"""

from __future__ import annotations
import uuid
from fastapi import APIRouter, UploadFile, File, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from app.services.async_tasks import (
    process_resume_task,
    process_github_task,
    ws_manager,
    celery_app,
)

router = APIRouter()


# ---------------------------------------------------------------------------
# Resume upload — async
# ---------------------------------------------------------------------------
@router.post("/resume/upload")
async def async_resume_upload(file: UploadFile = File(...)):
    """
    Accept a resume file, enqueue background processing, return task_id.
    Connect to WS /analytics/ws/{task_id} to receive streamed results.
    """
    allowed = {"pdf", "docx", "doc", "txt"}
    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    file_bytes = await file.read()
    task_id = str(uuid.uuid4())

    # Enqueue — pass bytes as hex string (JSON-serialisable)
    process_resume_task.apply_async(
        args=[task_id, file_bytes.hex(), file.filename],
        task_id=task_id,
    )

    return {
        "task_id": task_id,
        "status": "queued",
        "ws_url": f"/api/analytics/ws/{task_id}",
        "poll_url": f"/api/analytics/task/{task_id}",
    }


# ---------------------------------------------------------------------------
# GitHub analysis — async
# ---------------------------------------------------------------------------
class GithubRequest(BaseModel):
    github_username: str


@router.post("/github/analyze")
async def async_github_analyze(req: GithubRequest):
    """
    Enqueue GitHub profile analysis. Returns task_id for WS streaming.
    """
    task_id = str(uuid.uuid4())
    process_github_task.apply_async(
        args=[task_id, req.github_username],
        task_id=task_id,
    )
    return {
        "task_id": task_id,
        "status": "queued",
        "ws_url": f"/api/analytics/ws/{task_id}",
        "poll_url": f"/api/analytics/task/{task_id}",
    }


# ---------------------------------------------------------------------------
# Poll task status (fallback for clients without WS)
# ---------------------------------------------------------------------------
@router.get("/task/{task_id}")
async def get_task_status(task_id: str):
    """Poll the status and result of a background task."""
    result = celery_app.AsyncResult(task_id)
    response = {"task_id": task_id, "status": result.status}
    if result.ready():
        if result.successful():
            response["result"] = result.result
        else:
            response["error"] = str(result.result)
    return response


# ---------------------------------------------------------------------------
# WebSocket — stream task progress
# ---------------------------------------------------------------------------
@router.websocket("/ws/{task_id}")
async def websocket_task_stream(websocket: WebSocket, task_id: str):
    """
    WebSocket endpoint.
    Client connects here after receiving task_id from the upload endpoints.
    Server pushes progress events until 'done' or 'error'.
    """
    await ws_manager.connect(task_id, websocket)
    try:
        # Keep connection alive until client disconnects
        while True:
            # Heartbeat — wait for any message from client (ping/pong)
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(task_id)
