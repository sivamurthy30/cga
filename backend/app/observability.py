"""
Observability Layer — Production-grade logging, metrics, and error tracking.

Tracks:
- Every API request (method, path, status, latency)
- Slow requests (> 500ms)
- Error rates
- User activity patterns

This is what separates a student project from a production system.
"""
import time
import logging
import uuid
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("deva.observability")

# Simple in-memory metrics (swap for Prometheus in production)
_metrics = {
    "total_requests":  0,
    "total_errors":    0,
    "slow_requests":   0,   # > 500ms
    "request_times":  [],   # last 100 latencies
}


class ObservabilityMiddleware(BaseHTTPMiddleware):
    """
    Logs every request with:
    - Unique request ID (for tracing)
    - Method + path
    - Response status
    - Latency in ms
    - Slow request warnings
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = str(uuid.uuid4())[:8]
        start      = time.perf_counter()

        # Attach request ID for downstream use
        request.state.request_id = request_id

        try:
            response = await call_next(request)
            latency  = round((time.perf_counter() - start) * 1000, 2)

            _metrics["total_requests"] += 1
            _metrics["request_times"].append(latency)
            if len(_metrics["request_times"]) > 100:
                _metrics["request_times"].pop(0)

            level = logging.WARNING if latency > 500 else logging.INFO
            if latency > 500:
                _metrics["slow_requests"] += 1

            if response.status_code >= 400:
                _metrics["total_errors"] += 1

            logger.log(
                level,
                f"[{request_id}] {request.method} {request.url.path} "
                f"→ {response.status_code} ({latency}ms)"
                + (" ⚠️ SLOW" if latency > 500 else "")
            )

            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time"] = f"{latency}ms"
            return response

        except Exception as exc:
            latency = round((time.perf_counter() - start) * 1000, 2)
            _metrics["total_errors"] += 1
            logger.error(
                f"[{request_id}] {request.method} {request.url.path} "
                f"→ UNHANDLED ERROR ({latency}ms): {exc}",
                exc_info=True
            )
            raise


def get_metrics() -> dict:
    times = _metrics["request_times"]
    avg   = round(sum(times) / len(times), 2) if times else 0
    p95   = round(sorted(times)[int(len(times) * 0.95)], 2) if len(times) >= 20 else avg
    return {
        "total_requests": _metrics["total_requests"],
        "total_errors":   _metrics["total_errors"],
        "error_rate":     round(_metrics["total_errors"] / max(_metrics["total_requests"], 1) * 100, 2),
        "slow_requests":  _metrics["slow_requests"],
        "avg_latency_ms": avg,
        "p95_latency_ms": p95,
    }
