#!/bin/bash

# =====================================================
# SANITY BACKUP SCRIPT
# =====================================================
# This script exports all Sanity data before migration
# to Supabase for e-commerce management.
#
# Run this before starting the migration process!
# =====================================================

set -e

BACKUP_DIR="backups/sanity"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="sanity-export-${TIMESTAMP}.tar.gz"

echo "🔒 Starting Sanity backup..."
echo "Backup directory: ${BACKUP_DIR}"
echo "Backup file: ${BACKUP_FILE}"
echo ""

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Export Sanity dataset
echo "📦 Exporting Sanity dataset..."
npx sanity dataset export production "${BACKUP_DIR}/${BACKUP_FILE}"

echo ""
echo "✅ Backup complete!"
echo "Backup saved to: ${BACKUP_DIR}/${BACKUP_FILE}"
echo ""
echo "Backup file size:"
ls -lh "${BACKUP_DIR}/${BACKUP_FILE}"
echo ""
echo "⚠️  IMPORTANT: Keep this backup safe!"
echo "   Store it in a secure location before proceeding with migration."
