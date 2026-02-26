
# Fix Character Extraction Noise in Script Parser

## Status: ✅ Implemented

## Changes Made

### 1. Stopwords moved to database (`parser_stopwords` table)
- Created `parser_stopwords` table with columns: `id`, `word` (unique), `category`, `is_active`, `created_at`, `created_by`
- RLS: authenticated users can read, admins can insert/update/delete
- Seeded with all ~170 existing stopwords across 12 categories

### 2. Edge function updated (`script-parser-stream/index.ts`)
- Fetches active stopwords from `parser_stopwords` table at parse time
- Removed hardcoded `genericSingles` set
- Kept: length gate (≤3 char single words rejected), near-match deduplication, commonWords multi-word filter

### 3. Settings UI (`/settings/stopwords`)
- Full CRUD: add, delete, toggle active/inactive
- Category filter badges with counts
- Search functionality
- Admin-only write access, all authenticated users can view
