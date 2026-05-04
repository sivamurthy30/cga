"""
Feature Flags — Control features dynamically without redeployment.

In production: swap _FLAGS for a database/Redis-backed store.
This pattern is used by every major tech company (Facebook, Google, Netflix).

Usage:
    from app.feature_flags import flags
    if flags.is_enabled("intelligent_recommendations"):
        # use new engine
"""
import os
import logging

logger = logging.getLogger(__name__)


class FeatureFlags:
    """
    Simple feature flag system.
    Flags can be overridden via environment variables:
        FEATURE_INTELLIGENT_RECOMMENDATIONS=false
    """

    _FLAGS = {
        "intelligent_recommendations": True,   # Context-aware skill recommendations
        "skill_gap_analysis":          True,   # Full gap analysis endpoint
        "event_system":                True,   # Event-driven architecture
        "observability":               True,   # Request logging + metrics
        "resume_transform":            True,   # AI resume transformation
        "salary_heatmap":              True,   # Salary data feature
        "pitch_analysis":              True,   # Pitch Perfect feature
        "code_review":                 True,   # Code reviewer feature
        "new_pricing":                 True,   # New INR pricing
        "maintenance_mode":            False,  # Disable all writes
    }

    def is_enabled(self, flag: str) -> bool:
        # Environment variable overrides (FEATURE_FLAG_NAME=true/false)
        env_key = f"FEATURE_{flag.upper()}"
        env_val = os.getenv(env_key)
        if env_val is not None:
            return env_val.lower() == "true"
        result = self._FLAGS.get(flag, False)
        return result

    def get_all(self) -> dict:
        return {
            flag: self.is_enabled(flag)
            for flag in self._FLAGS
        }

    def set(self, flag: str, value: bool):
        """Runtime override (resets on restart — use DB for persistence)."""
        self._FLAGS[flag] = value
        logger.info(f"[FEATURE FLAG] {flag} → {value}")


flags = FeatureFlags()
