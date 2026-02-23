---
name: gemini
description: Process images, documents, PDFs, audio, and video using Google Gemini's multimodal capabilities.
metadata:
  openclaw:
    requires:
      bins:
        - curl
        - jq
        - base64
      environment:
        - GEMINI_API_KEY
---

# Gemini — Multimodal Media Processing

Process images, documents, PDFs, audio, and video using Google Gemini's multimodal API. Use this skill when you need to analyze, describe, extract text from, or answer questions about media files.

Base URL: `https://generativelanguage.googleapis.com/v1beta`. Authentication via `x-goog-api-key: $GEMINI_API_KEY`.

## When to Use This Skill

- Analyzing images (photos, screenshots, diagrams, charts)
- Extracting text from images or scanned documents (OCR)
- Processing PDFs and documents
- Transcribing or analyzing audio files
- Analyzing video content
- Any task involving media that Claude cannot process directly

## Process an Image File

```bash
IMAGE_PATH="/path/to/image.jpg"
MIME_TYPE="image/jpeg"  # or image/png, image/gif, image/webp
PROMPT="Describe this image in detail"

IMAGE_BASE64=$(base64 -i "$IMAGE_PATH")

curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"contents\": [{
      \"parts\": [
        {\"inline_data\": {\"mime_type\": \"$MIME_TYPE\", \"data\": \"$IMAGE_BASE64\"}},
        {\"text\": \"$PROMPT\"}
      ]
    }],
    \"generationConfig\": {\"temperature\": 0.4, \"maxOutputTokens\": 2048}
  }" | jq -r '.candidates[0].content.parts[0].text'
```

## Process a PDF Document

```bash
PDF_PATH="/path/to/document.pdf"
PROMPT="Summarize this document"

PDF_BASE64=$(base64 -i "$PDF_PATH")

curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"contents\": [{
      \"parts\": [
        {\"inline_data\": {\"mime_type\": \"application/pdf\", \"data\": \"$PDF_BASE64\"}},
        {\"text\": \"$PROMPT\"}
      ]
    }],
    \"generationConfig\": {\"temperature\": 0.3, \"maxOutputTokens\": 4096}
  }" | jq -r '.candidates[0].content.parts[0].text'
```

## Extract Text from Image (OCR)

```bash
IMAGE_PATH="/path/to/document-scan.png"
IMAGE_BASE64=$(base64 -i "$IMAGE_PATH")

curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"contents\": [{
      \"parts\": [
        {\"inline_data\": {\"mime_type\": \"image/png\", \"data\": \"$IMAGE_BASE64\"}},
        {\"text\": \"Extract all text from this image. Return only the extracted text, preserving formatting.\"}
      ]
    }],
    \"generationConfig\": {\"temperature\": 0.1, \"maxOutputTokens\": 4096}
  }" | jq -r '.candidates[0].content.parts[0].text'
```

## Process Audio File

```bash
AUDIO_PATH="/path/to/audio.mp3"
MIME_TYPE="audio/mp3"  # or audio/wav, audio/aac, audio/ogg, audio/flac
PROMPT="Transcribe this audio"

AUDIO_BASE64=$(base64 -i "$AUDIO_PATH")

curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"contents\": [{
      \"parts\": [
        {\"inline_data\": {\"mime_type\": \"$MIME_TYPE\", \"data\": \"$AUDIO_BASE64\"}},
        {\"text\": \"$PROMPT\"}
      ]
    }],
    \"generationConfig\": {\"temperature\": 0.2, \"maxOutputTokens\": 8192}
  }" | jq -r '.candidates[0].content.parts[0].text'
```

## Process Video File

```bash
VIDEO_PATH="/path/to/video.mp4"
MIME_TYPE="video/mp4"  # or video/webm, video/mov, video/avi
PROMPT="Describe what happens in this video"

VIDEO_BASE64=$(base64 -i "$VIDEO_PATH")

curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"contents\": [{
      \"parts\": [
        {\"inline_data\": {\"mime_type\": \"$MIME_TYPE\", \"data\": \"$VIDEO_BASE64\"}},
        {\"text\": \"$PROMPT\"}
      ]
    }],
    \"generationConfig\": {\"temperature\": 0.4, \"maxOutputTokens\": 4096}
  }" | jq -r '.candidates[0].content.parts[0].text'
```

## Multiple Images

```bash
IMAGE1_BASE64=$(base64 -i "/path/to/image1.jpg")
IMAGE2_BASE64=$(base64 -i "/path/to/image2.jpg")

curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"contents\": [{
      \"parts\": [
        {\"inline_data\": {\"mime_type\": \"image/jpeg\", \"data\": \"$IMAGE1_BASE64\"}},
        {\"inline_data\": {\"mime_type\": \"image/jpeg\", \"data\": \"$IMAGE2_BASE64\"}},
        {\"text\": \"Compare these two images.\"}
      ]
    }],
    \"generationConfig\": {\"temperature\": 0.4, \"maxOutputTokens\": 2048}
  }" | jq -r '.candidates[0].content.parts[0].text'
```

## Models

- `gemini-3-flash-preview` — Fast, multimodal, recommended default
- `gemini-3-pro-preview` — Higher quality for complex tasks

## MIME Types

**Images:** `image/jpeg`, `image/png`, `image/gif`, `image/webp`
**Documents:** `application/pdf`
**Audio:** `audio/mp3`, `audio/wav`, `audio/aac`, `audio/ogg`, `audio/flac`
**Video:** `video/mp4`, `video/webm`, `video/mov`, `video/avi`

## Tips

- Use lower temperature (0.1-0.3) for OCR and factual extraction
- Use higher temperature (0.4-0.7) for creative descriptions
- Base64 encoding increases file size by ~33%
- For very large files, check token limits via `GET /v1beta/models/gemini-3-flash-preview`