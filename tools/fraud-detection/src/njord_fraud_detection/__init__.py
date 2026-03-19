"""
Njord Fraud Detection
ML-powered fraud detection for Njord Protocol bridge operators
"""

__version__ = "0.1.0"

from .detector import FraudDetector
from .models import AttributionEvent, FraudCheckResult, FraudFlag
from .scorer import FraudScorer

__all__ = [
    "FraudDetector",
    "AttributionEvent",
    "FraudCheckResult",
    "FraudFlag",
    "FraudScorer",
]
