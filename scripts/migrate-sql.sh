#!/bin/bash

# Configuración
OLD_DB="postgresql://neondb_owner:npg_iQO8A9xRyYgS@ep-noisy-resonance-ab7ui2sq-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
NEW_DB="postgresql://neondb_owner:npg_s8pHjiV1BvAo@ep-divine-wave-abl6po6b-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

echo "📦 Exportando desde BD antigua..."
pg_dump "$OLD_DB" --no-owner --no-acl > db-backup.sql

echo "📥 Importando en BD nueva..."
psql "$NEW_DB" < db-backup.sql

echo "✅ Migración completada"
