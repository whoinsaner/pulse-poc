

# Plan: Surface Cinema Tradition on the Report

## Problem
The cinema tradition is collected at upload and detected by the CinemaTraditionAgent during analysis, but it is never displayed in the report. Users cannot see which tradition was applied or how it shaped the evaluation.

## Changes

### 1. Project Snapshot — `src/components/report/ProjectSnapshot.tsx`
Add a "Cinema Tradition" badge/row to the project metadata section:
- Read `cinema_tradition` from the script record (already available via the scripts table)
- Read the CinemaTraditionAgent's output from analysis results for `tradition_confidence` and `format_type_clarity` scores
- Display: tradition name (formatted), confidence score, and format type
- If tradition is "auto_detect" or null, show the AI-detected value from the agent output

### 2. Report Cover / Overview — `src/pages/report/ReportCover.tsx` or `ReportOverview.tsx`
Add a small "Evaluated under: [Tradition Name] tradition" label near the script metadata so it's immediately visible when opening a report.

### 3. Story Diagnosis or dedicated section
Optionally add a brief "Tradition Context" callout card that explains how the detected tradition influenced the analysis (e.g., "This script was evaluated against Kollywood narrative conventions including interval structure, moral closure, and dual-protagonist architecture").

## Technical Details
- The `CinemaTraditionAgent` output includes `tradition_confidence` and `format_type_clarity` parameters, plus observations with the detected tradition name
- The script record has `cinema_tradition` column (user-selected or null for auto-detect)
- Agent results are stored in `analysis_results` table and already fetched by the report pages
- No database changes needed — just surface existing data

