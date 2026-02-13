# Auto-Select Script Type on Upload

## Overview

Add an AI-powered auto-detection step that runs when the user drops/selects a file, automatically pre-selecting the correct script type (feature, comic, web_series, etc.) before they click "Upload & Parse."

## How It Works

1. **On file drop**: After the file is selected, extract a text sample from it client-side (first ~5KB for .txt/.fountain/.highland; for PDFs, use the file's raw bytes sent to a lightweight edge function).
2. **Call a new edge function** (`classify-script-type`) that reuses the existing `classifyScriptType` AI logic (Gemini Flash Lite) to return a predicted type + confidence score.
3. **Auto-select the type** in the UI with a visual indicator showing it was AI-suggested (e.g., a small sparkle icon + "Auto-detected" badge). The user can still override it manually.

## Technical Details

### 1. New Edge Function: `classify-script-type`

- Accepts a text sample (string, max ~5KB) via POST
- Runs the existing Gemini Flash Lite classification prompt (already proven in `script-parser-stream`)
- Returns `{ scriptType: string, confidence: number }`
- Lightweight and fast (~1-2s response time)

### 2. Client-Side Text Extraction (ScriptUpload.tsx)

- For text-based formats (.fountain, .txt, .highland): read the first 5KB using `FileReader.readAsText()`
- For .fdx: read as text and extract dialogue/scene content from XML
- For .pdf and .docx: send the raw file to the edge function which will handle extraction
- Trigger classification in the `onDrop` callback after file selection

### 3. UI Changes (ScriptUpload.tsx)

- Add state: `autoDetectedType`, `classifying` (boolean), `classificationConfidence`
- While classifying: show a subtle spinner next to "Script Type" label
- On result: auto-set `scriptType` to the detected value; show an "Auto-detected" badge next to the selected type pill
- Low confidence (<60%): don't auto-select, just show a suggestion tooltip
- User can always click a different type to override (badge disappears on manual selection)

### 4. Edge Function Implementation

```
POST /classify-script-type
Body: { textSample: string, fileName: string }
Response: { scriptType: string, confidence: number }
```

The function will:

- Use the proven classification prompt from `classifyScriptType` in script-parser-stream
- Use Gemini 2.5 Flash Lite for speed
- Return result in under 2 seconds

### 5. Handling PDFs and DOCX

- For binary formats, the edge function will accept a base64-encoded chunk (first ~50KB of the file)
- Use basic heuristics on the raw text extraction (PDF text layer) to get a sample
- If no text can be extracted client-side, skip auto-detection (the parser will classify during parsing anyway)

6. Prompt the user if the system classification is different from the user classification. Give the options to either change or accept the system selection. Take the confirmation from the user and move ahead.
7. Put auto classification behind a feature flag with ability to turn it off at any point if not required. Add it to the configurations page for toggling the feature. 

## What Stays the Same

- User-selected type remains authoritative (per existing constraint)
- The parser's built-in classification stage still runs as a safety net
- All 12 script types remain supported
- Episode length class selector still appears when web_series is selected (auto-detected or manual)