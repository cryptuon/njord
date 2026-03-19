"""
Data models for fraud detection
"""

from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class FraudFlag(str, Enum):
    """Flags indicating potential fraud indicators"""
    HIGH_VELOCITY = "high_velocity"
    DUPLICATE_CUSTOMER = "duplicate_customer"
    SUSPICIOUS_IP = "suspicious_ip"
    BOT_DETECTED = "bot_detected"
    GEO_MISMATCH = "geo_mismatch"
    DISPOSABLE_EMAIL = "disposable_email"
    DEVICE_ANOMALY = "device_anomaly"
    ABNORMAL_CONVERSION_RATE = "abnormal_conversion_rate"
    DATA_CENTER_IP = "data_center_ip"
    TOR_EXIT_NODE = "tor_exit_node"
    PROXY_DETECTED = "proxy_detected"
    SHORT_SESSION = "short_session"
    INVALID_REFERRER = "invalid_referrer"


class AttributionEvent(BaseModel):
    """Attribution event to be checked for fraud"""
    campaign_id: str
    affiliate_id: str
    action_value: float = Field(ge=0, description="Value in USD")
    customer_hash: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    # Optional enrichment data
    customer_ip: Optional[str] = None
    customer_email: Optional[str] = None
    user_agent: Optional[str] = None
    device_fingerprint: Optional[str] = None
    referrer_url: Optional[str] = None
    session_duration_seconds: Optional[int] = None
    page_views: Optional[int] = None
    geo_country: Optional[str] = None
    geo_city: Optional[str] = None


class FraudCheckResult(BaseModel):
    """Result of fraud detection check"""
    score: int = Field(ge=0, le=100, description="Fraud score 0-100")
    flags: list[FraudFlag] = Field(default_factory=list)
    recommendation: str = Field(pattern="^(approve|review|reject)$")
    confidence: float = Field(ge=0, le=1, default=0.5)
    details: dict = Field(default_factory=dict)

    @property
    def is_fraud(self) -> bool:
        return self.recommendation == "reject"

    @property
    def needs_review(self) -> bool:
        return self.recommendation == "review"


class AffiliateStats(BaseModel):
    """Historical statistics for an affiliate"""
    affiliate_id: str
    total_attributions: int = 0
    total_volume: float = 0.0
    conversion_rate: float = 0.0
    avg_order_value: float = 0.0
    fraud_rate: float = 0.0
    disputes_lost: int = 0
    account_age_days: int = 0
    last_attribution_at: Optional[datetime] = None


class VelocityData(BaseModel):
    """Velocity tracking data"""
    affiliate_id: str
    window_seconds: int
    attribution_count: int
    total_value: float
    unique_customers: int
    first_event_at: datetime
    last_event_at: datetime
