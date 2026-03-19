"""
Main fraud detector orchestrating all checks
"""

from typing import Optional
from datetime import datetime, timedelta
import redis
from pathlib import Path

from .models import (
    AttributionEvent,
    FraudCheckResult,
    FraudFlag,
    AffiliateStats,
    VelocityData,
)
from .scorer import FraudScorer, RuleBasedScorer


class FraudDetector:
    """
    Main fraud detection class that combines ML scoring with rule-based checks.

    Usage:
        detector = FraudDetector(redis_url="redis://localhost:6379")
        result = await detector.check(event)
        if result.is_fraud:
            reject_attribution()
    """

    def __init__(
        self,
        redis_url: Optional[str] = None,
        model_path: Optional[Path] = None,
        velocity_window_seconds: int = 3600,
        max_velocity_count: int = 100,
        fraud_score_threshold: int = 60,
        review_score_threshold: int = 30,
    ):
        self.redis: Optional[redis.Redis] = None
        if redis_url:
            self.redis = redis.from_url(redis_url)

        self.ml_scorer = FraudScorer(model_path)
        self.rule_scorer = RuleBasedScorer()

        self.velocity_window = velocity_window_seconds
        self.max_velocity = max_velocity_count
        self.fraud_threshold = fraud_score_threshold
        self.review_threshold = review_score_threshold

    async def check(self, event: AttributionEvent) -> FraudCheckResult:
        """
        Run all fraud checks on an attribution event.

        Returns:
            FraudCheckResult with score, flags, and recommendation
        """
        score = 0
        flags: list[FraudFlag] = []
        details: dict = {}

        # 1. Velocity check
        velocity_score, velocity_flags = await self._check_velocity(event)
        score += velocity_score
        flags.extend(velocity_flags)
        details["velocity"] = {"score": velocity_score, "flags": [f.value for f in velocity_flags]}

        # 2. Email check
        email_score, email_flags = self.rule_scorer.check_email(event.customer_email)
        score += email_score
        flags.extend(email_flags)
        details["email"] = {"score": email_score, "flags": [f.value for f in email_flags]}

        # 3. IP check
        ip_score, ip_flags = self.rule_scorer.check_ip(event.customer_ip, event.geo_country)
        score += ip_score
        flags.extend(ip_flags)
        details["ip"] = {"score": ip_score, "flags": [f.value for f in ip_flags]}

        # 4. Session check
        session_score, session_flags = self.rule_scorer.check_session(
            event.session_duration_seconds, event.page_views
        )
        score += session_score
        flags.extend(session_flags)
        details["session"] = {"score": session_score, "flags": [f.value for f in session_flags]}

        # 5. Duplicate customer check
        dup_score, dup_flags = await self._check_duplicate(event)
        score += dup_score
        flags.extend(dup_flags)
        details["duplicate"] = {"score": dup_score, "flags": [f.value for f in dup_flags]}

        # 6. ML anomaly scoring
        affiliate_stats = await self._get_affiliate_stats(event.affiliate_id)
        velocity_count = await self._get_velocity_count(event.affiliate_id)
        ml_score, confidence = self.ml_scorer.score(event, affiliate_stats, velocity_count)
        score += ml_score // 2  # Weight ML score at 50%
        details["ml"] = {"score": ml_score, "confidence": confidence}

        # Cap at 100
        score = min(score, 100)

        # Determine recommendation
        if score >= self.fraud_threshold:
            recommendation = "reject"
        elif score >= self.review_threshold:
            recommendation = "review"
        else:
            recommendation = "approve"

        # Remove duplicate flags
        flags = list(set(flags))

        # Record this event for future velocity/duplicate checks
        await self._record_event(event)

        return FraudCheckResult(
            score=score,
            flags=flags,
            recommendation=recommendation,
            confidence=confidence,
            details=details,
        )

    async def _check_velocity(self, event: AttributionEvent) -> tuple[int, list[FraudFlag]]:
        """Check attribution velocity for this affiliate"""
        if not self.redis:
            return 0, []

        count = await self._get_velocity_count(event.affiliate_id)

        if count > self.max_velocity:
            return 40, [FraudFlag.HIGH_VELOCITY]
        elif count > self.max_velocity // 2:
            return 20, [FraudFlag.HIGH_VELOCITY]

        return 0, []

    async def _get_velocity_count(self, affiliate_id: str) -> int:
        """Get recent attribution count for affiliate"""
        if not self.redis:
            return 0

        key = f"njord:velocity:{affiliate_id}"
        try:
            count = self.redis.zcount(
                key,
                datetime.utcnow().timestamp() - self.velocity_window,
                "+inf"
            )
            return count or 0
        except Exception:
            return 0

    async def _check_duplicate(self, event: AttributionEvent) -> tuple[int, list[FraudFlag]]:
        """Check for duplicate customer hash"""
        if not self.redis:
            return 0, []

        key = f"njord:customer:{event.campaign_id}:{event.customer_hash}"
        try:
            exists = self.redis.exists(key)
            if exists:
                return 30, [FraudFlag.DUPLICATE_CUSTOMER]
        except Exception:
            pass

        return 0, []

    async def _get_affiliate_stats(self, affiliate_id: str) -> Optional[AffiliateStats]:
        """Get historical stats for affiliate"""
        if not self.redis:
            return None

        key = f"njord:affiliate_stats:{affiliate_id}"
        try:
            data = self.redis.hgetall(key)
            if data:
                return AffiliateStats(
                    affiliate_id=affiliate_id,
                    total_attributions=int(data.get(b"total_attributions", 0)),
                    total_volume=float(data.get(b"total_volume", 0)),
                    conversion_rate=float(data.get(b"conversion_rate", 0)),
                    avg_order_value=float(data.get(b"avg_order_value", 0)),
                    fraud_rate=float(data.get(b"fraud_rate", 0)),
                    disputes_lost=int(data.get(b"disputes_lost", 0)),
                    account_age_days=int(data.get(b"account_age_days", 0)),
                )
        except Exception:
            pass

        return None

    async def _record_event(self, event: AttributionEvent):
        """Record event for velocity and duplicate tracking"""
        if not self.redis:
            return

        try:
            # Velocity tracking (sorted set with timestamp)
            velocity_key = f"njord:velocity:{event.affiliate_id}"
            self.redis.zadd(velocity_key, {event.customer_hash: event.timestamp.timestamp()})
            self.redis.expire(velocity_key, self.velocity_window * 2)

            # Customer hash tracking
            customer_key = f"njord:customer:{event.campaign_id}:{event.customer_hash}"
            self.redis.setex(customer_key, timedelta(days=30), "1")
        except Exception:
            pass

    async def update_affiliate_stats(
        self,
        affiliate_id: str,
        stats: AffiliateStats,
    ):
        """Update affiliate statistics in Redis"""
        if not self.redis:
            return

        key = f"njord:affiliate_stats:{affiliate_id}"
        try:
            self.redis.hset(key, mapping={
                "total_attributions": stats.total_attributions,
                "total_volume": stats.total_volume,
                "conversion_rate": stats.conversion_rate,
                "avg_order_value": stats.avg_order_value,
                "fraud_rate": stats.fraud_rate,
                "disputes_lost": stats.disputes_lost,
                "account_age_days": stats.account_age_days,
            })
        except Exception:
            pass

    def close(self):
        """Close Redis connection"""
        if self.redis:
            self.redis.close()
