"""
CLI interface for Njord Fraud Detection
"""

import argparse
import asyncio
import json
from datetime import datetime

from .detector import FraudDetector
from .models import AttributionEvent


def main():
    parser = argparse.ArgumentParser(
        description="Njord Fraud Detection CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Check a single attribution
  njord-fraud check --campaign ABC123 --affiliate XYZ789 --value 99.99

  # Start API server
  njord-fraud serve --port 8080 --redis redis://localhost:6379

  # Train model on historical data
  njord-fraud train --data ./training_data.csv --output ./model.pkl
        """,
    )

    subparsers = parser.add_subparsers(dest="command", help="Commands")

    # Check command
    check_parser = subparsers.add_parser("check", help="Check a single attribution")
    check_parser.add_argument("--campaign", required=True, help="Campaign ID")
    check_parser.add_argument("--affiliate", required=True, help="Affiliate ID")
    check_parser.add_argument("--value", type=float, required=True, help="Action value in USD")
    check_parser.add_argument("--customer", help="Customer identifier")
    check_parser.add_argument("--email", help="Customer email")
    check_parser.add_argument("--ip", help="Customer IP address")
    check_parser.add_argument("--redis", help="Redis URL")
    check_parser.add_argument("--json", action="store_true", help="Output as JSON")

    # Serve command
    serve_parser = subparsers.add_parser("serve", help="Start API server")
    serve_parser.add_argument("--port", type=int, default=8080, help="Server port")
    serve_parser.add_argument("--host", default="0.0.0.0", help="Server host")
    serve_parser.add_argument("--redis", help="Redis URL")
    serve_parser.add_argument("--model", help="Path to trained model")

    # Train command
    train_parser = subparsers.add_parser("train", help="Train fraud detection model")
    train_parser.add_argument("--data", required=True, help="Path to training data CSV")
    train_parser.add_argument("--output", required=True, help="Path to save model")

    args = parser.parse_args()

    if args.command == "check":
        asyncio.run(run_check(args))
    elif args.command == "serve":
        run_serve(args)
    elif args.command == "train":
        run_train(args)
    else:
        parser.print_help()


async def run_check(args):
    """Run fraud check on a single attribution"""
    import hashlib

    detector = FraudDetector(redis_url=args.redis)

    # Generate customer hash
    customer_id = args.customer or f"{args.campaign}_{datetime.utcnow().isoformat()}"
    customer_hash = hashlib.sha256(customer_id.encode()).hexdigest()

    event = AttributionEvent(
        campaign_id=args.campaign,
        affiliate_id=args.affiliate,
        action_value=args.value,
        customer_hash=customer_hash,
        customer_email=args.email,
        customer_ip=args.ip,
    )

    result = await detector.check(event)

    if args.json:
        print(json.dumps({
            "score": result.score,
            "recommendation": result.recommendation,
            "flags": [f.value for f in result.flags],
            "confidence": result.confidence,
            "details": result.details,
        }, indent=2))
    else:
        print(f"\nFraud Check Result")
        print(f"==================")
        print(f"Score: {result.score}/100")
        print(f"Recommendation: {result.recommendation.upper()}")
        print(f"Confidence: {result.confidence:.2%}")
        if result.flags:
            print(f"Flags: {', '.join(f.value for f in result.flags)}")
        print()

    detector.close()


def run_serve(args):
    """Start HTTP API server"""
    print(f"Starting fraud detection API server on {args.host}:{args.port}")
    print("API server not yet implemented - use as library instead")
    # TODO: Implement FastAPI/Flask server


def run_train(args):
    """Train fraud detection model"""
    import pandas as pd
    from pathlib import Path
    from .scorer import FraudScorer

    print(f"Training model from {args.data}")

    # Load training data
    df = pd.read_csv(args.data)

    # Expected columns: action_value, session_duration, page_views, velocity_count,
    #                   total_attributions, conversion_rate, avg_order_value,
    #                   fraud_rate, account_age_days
    feature_columns = [
        "action_value", "session_duration", "page_views", "velocity_count",
        "total_attributions", "conversion_rate", "avg_order_value",
        "fraud_rate", "account_age_days",
    ]

    # Filter to required columns
    available = [c for c in feature_columns if c in df.columns]
    if not available:
        print(f"Error: No valid feature columns found. Expected: {feature_columns}")
        return

    print(f"Using features: {available}")
    training_data = df[available].fillna(0).values

    # Train model
    scorer = FraudScorer()
    scorer.train(training_data)

    # Save model
    output_path = Path(args.output)
    scorer.save_model(output_path)
    print(f"Model saved to {output_path}")


if __name__ == "__main__":
    main()
