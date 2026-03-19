"""
Fraud scoring logic
"""

import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import Optional
import pickle
from pathlib import Path

from .models import AttributionEvent, FraudFlag, AffiliateStats


class FraudScorer:
    """ML-based fraud scoring using Isolation Forest for anomaly detection"""

    def __init__(self, model_path: Optional[Path] = None):
        self.model: Optional[IsolationForest] = None
        self.scaler: Optional[StandardScaler] = None

        if model_path and model_path.exists():
            self.load_model(model_path)
        else:
            self._init_default_model()

    def _init_default_model(self):
        """Initialize with default untrained model"""
        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.1,  # Expect ~10% anomalies
            random_state=42,
            n_jobs=-1,
        )
        self.scaler = StandardScaler()

    def extract_features(
        self,
        event: AttributionEvent,
        affiliate_stats: Optional[AffiliateStats] = None,
        velocity_count: int = 0,
    ) -> np.ndarray:
        """Extract numerical features from attribution event"""
        features = [
            event.action_value,
            event.session_duration_seconds or 0,
            event.page_views or 0,
            velocity_count,
        ]

        if affiliate_stats:
            features.extend([
                affiliate_stats.total_attributions,
                affiliate_stats.conversion_rate,
                affiliate_stats.avg_order_value,
                affiliate_stats.fraud_rate,
                affiliate_stats.account_age_days,
            ])
        else:
            features.extend([0, 0, 0, 0, 0])

        return np.array(features).reshape(1, -1)

    def score(
        self,
        event: AttributionEvent,
        affiliate_stats: Optional[AffiliateStats] = None,
        velocity_count: int = 0,
    ) -> tuple[int, float]:
        """
        Calculate fraud score for an attribution event.

        Returns:
            tuple: (score 0-100, confidence 0-1)
        """
        features = self.extract_features(event, affiliate_stats, velocity_count)

        if self.model is None or not hasattr(self.model, "offset_"):
            # Model not fitted, return heuristic score
            return self._heuristic_score(event, affiliate_stats, velocity_count)

        # Scale features
        scaled_features = self.scaler.transform(features)

        # Get anomaly score from Isolation Forest
        # Returns -1 for anomalies, 1 for normal
        raw_score = self.model.decision_function(scaled_features)[0]

        # Convert to 0-100 scale (lower decision function = more anomalous)
        # Typical range is [-0.5, 0.5], map to [0, 100]
        normalized = (0.5 - raw_score) * 100
        score = int(np.clip(normalized, 0, 100))

        # Calculate confidence based on distance from threshold
        confidence = min(1.0, abs(raw_score) * 2)

        return score, confidence

    def _heuristic_score(
        self,
        event: AttributionEvent,
        affiliate_stats: Optional[AffiliateStats],
        velocity_count: int,
    ) -> tuple[int, float]:
        """Fallback heuristic scoring when ML model not available"""
        score = 0

        # High velocity
        if velocity_count > 50:
            score += 30
        elif velocity_count > 20:
            score += 15

        # Very high value
        if event.action_value > 1000:
            score += 10

        # Very short session
        if event.session_duration_seconds and event.session_duration_seconds < 5:
            score += 20

        # No page views
        if event.page_views is not None and event.page_views < 2:
            score += 15

        # Affiliate stats checks
        if affiliate_stats:
            # High fraud rate history
            if affiliate_stats.fraud_rate > 0.05:
                score += 25
            # Very new account
            if affiliate_stats.account_age_days < 7:
                score += 10
            # Abnormal conversion rate
            if affiliate_stats.conversion_rate > 0.5:
                score += 15

        return min(score, 100), 0.5  # Lower confidence for heuristic

    def train(self, training_data: np.ndarray):
        """Train the model on historical data"""
        self.scaler = StandardScaler()
        scaled_data = self.scaler.fit_transform(training_data)
        self.model.fit(scaled_data)

    def save_model(self, path: Path):
        """Save trained model to disk"""
        with open(path, "wb") as f:
            pickle.dump({"model": self.model, "scaler": self.scaler}, f)

    def load_model(self, path: Path):
        """Load trained model from disk"""
        with open(path, "rb") as f:
            data = pickle.load(f)
            self.model = data["model"]
            self.scaler = data["scaler"]


class RuleBasedScorer:
    """Rule-based fraud scoring for specific checks"""

    # Known disposable email domains
    DISPOSABLE_DOMAINS = {
        "tempmail.com", "throwaway.com", "mailinator.com", "guerrillamail.com",
        "10minutemail.com", "trashmail.com", "fakeinbox.com", "sharklasers.com",
    }

    # Known data center IP ranges (simplified)
    DATA_CENTER_ASNS = {"AS14061", "AS16509", "AS15169", "AS8075"}  # DO, AWS, Google, MS

    @classmethod
    def check_email(cls, email: Optional[str]) -> tuple[int, list[FraudFlag]]:
        """Check email for fraud indicators"""
        if not email:
            return 0, []

        score = 0
        flags = []

        domain = email.split("@")[-1].lower()

        if domain in cls.DISPOSABLE_DOMAINS:
            score += 25
            flags.append(FraudFlag.DISPOSABLE_EMAIL)

        return score, flags

    @classmethod
    def check_ip(cls, ip: Optional[str], geo_country: Optional[str] = None) -> tuple[int, list[FraudFlag]]:
        """Check IP for fraud indicators"""
        if not ip:
            return 0, []

        score = 0
        flags = []

        # In production, would check against IP intelligence services
        # For now, basic checks

        # Check if private/localhost
        if ip.startswith(("10.", "192.168.", "172.16.", "127.")):
            score += 30
            flags.append(FraudFlag.SUSPICIOUS_IP)

        return score, flags

    @classmethod
    def check_session(
        cls,
        duration_seconds: Optional[int],
        page_views: Optional[int],
    ) -> tuple[int, list[FraudFlag]]:
        """Check session metrics for bot-like behavior"""
        score = 0
        flags = []

        if duration_seconds is not None and duration_seconds < 3:
            score += 25
            flags.append(FraudFlag.BOT_DETECTED)
            flags.append(FraudFlag.SHORT_SESSION)

        if page_views is not None and page_views < 1:
            score += 15
            flags.append(FraudFlag.BOT_DETECTED)

        return score, flags
