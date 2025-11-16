#!/bin/bash

# Deployment Verification Script
# Run this after pushing to verify Vercel deployment succeeds

set -e

echo "🔍 Verifying Vercel Deployment..."
echo ""

# Get latest deployment
LATEST=$(vercel ls 2>&1 | grep -A 1 "Age.*Deployment" | tail -1)

echo "📦 Latest Deployment:"
echo "$LATEST"
echo ""

# Extract status
if echo "$LATEST" | grep -q "● Ready"; then
    echo "✅ DEPLOYMENT SUCCESSFUL"
    echo ""

    # Extract URL
    URL=$(echo "$LATEST" | awk '{print $2}')
    echo "🌐 Deployment URL: $URL"
    echo ""

    # Test the deployment
    echo "🧪 Testing deployment health..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL" || echo "000")

    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ Site is responding (HTTP $HTTP_CODE)"
    else
        echo "⚠️  Site returned HTTP $HTTP_CODE"
    fi

    exit 0
elif echo "$LATEST" | grep -q "● Building"; then
    echo "⏳ DEPLOYMENT STILL BUILDING"
    echo "   Run this script again in a minute"
    exit 1
elif echo "$LATEST" | grep -q "● Error"; then
    echo "❌ DEPLOYMENT FAILED"
    echo ""
    echo "Getting error details..."

    # Extract deployment URL
    URL=$(echo "$LATEST" | awk '{print $2}')
    echo ""
    echo "📋 Deployment Details:"
    vercel inspect "$URL" 2>&1 | head -50

    exit 1
else
    echo "⚠️  UNKNOWN STATUS"
    echo "$LATEST"
    exit 1
fi
