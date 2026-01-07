#!/bin/bash
# Create discounts table via Supabase

# Load env - NEVER hardcode credentials
source .env.local 2>/dev/null || true

SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"

if [ -z "$SERVICE_KEY" ]; then
  echo "❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable"
  echo "   Set it in .env.local or export it before running this script"
  exit 1
fi

echo "Checking if discounts table exists..."
RESULT=$(curl -s "https://qjgenpwbaquqrvyrfsdo.supabase.co/rest/v1/discounts?select=id&limit=1" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY")

echo "Result: $RESULT"

if echo "$RESULT" | grep -q "Could not find"; then
  echo ""
  echo "Table does not exist. Please create it in the Supabase Dashboard."
  echo ""
  echo "Open: https://supabase.com/dashboard/project/qjgenpwbaquqrvyrfsdo/sql/new"
  echo ""
  echo "And paste the SQL from: supabase/migrations/027_database_discounts.sql"
else
  echo "Table exists! Inserting test data..."

  # Insert test discounts
  curl -s "https://qjgenpwbaquqrvyrfsdo.supabase.co/rest/v1/discounts" \
    -H "apikey: $SERVICE_KEY" \
    -H "Authorization: Bearer $SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: resolution=merge-duplicates" \
    -d '[
      {"code": "SAVE20", "name": "20% Off", "description": "Get 20% off your order", "discount_type": "percent", "discount_percent": 20, "is_active": true},
      {"code": "WELCOME10", "name": "$10 Off First Order", "description": "$10 off orders over $50", "discount_type": "amount", "discount_amount_cents": 1000, "min_amount_cents": 5000, "first_time_only": true, "is_active": true},
      {"code": "JUICE25", "name": "25% Off", "description": "Special 25% discount", "discount_type": "percent", "discount_percent": 25, "is_active": true}
    ]'

  echo ""
  echo "Test discounts created!"
fi
