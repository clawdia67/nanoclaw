---
name: gemini-image
description: Generate high-quality images using Google Gemini 3 Pro Image with support for multi-turn editing and Google Search grounding.
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

# Gemini Image — AI Image Generation

Generate high-quality images using Google's Gemini 3 Pro Image model. Supports text-to-image generation, multi-turn editing with reference images, and Google Search grounding for up-to-date content.

Base URL: `https://generativelanguage.googleapis.com/v1beta`. Authentication via `x-goog-api-key: $GEMINI_API_KEY`.

## When to Use This Skill

- Generate images from text prompts
- Create visualizations of current events or data (with Google Search grounding)
- Multi-turn image editing with reference images
- Generate character consistency across variations
- Visual content creation for presentations or social media

## Basic Image Generation

```bash
PROMPT="A futuristic city skyline at sunset with flying cars"

curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST \
  -d "{
    \"contents\": [{
      \"parts\": [{\"text\": \"$PROMPT\"}]
    }]
  }"
```

## Generate with Google Search Grounding

For current events, real-time data, or factual content:

```bash
PROMPT="Generate a visualization of the current weather in Tokyo"

curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST \
  -d "{
    \"contents\": [{
      \"parts\": [{\"text\": \"$PROMPT\"}]
    }],
    \"tools\": [{\"googleSearch\": {}}]
  }"
```

## Multi-turn Image Editing

Edit or modify existing images using reference images:

```bash
REFERENCE_IMAGE_PATH="/path/to/reference.jpg"
EDIT_PROMPT="Change the character's outfit to a red dress"

REFERENCE_BASE64=$(base64 -i "$REFERENCE_IMAGE_PATH")

curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST \
  -d "{
    \"contents\": [{
      \"parts\": [
        {\"inlineData\": {\"mimeType\": \"image/jpeg\", \"data\": \"$REFERENCE_BASE64\"}},
        {\"text\": \"$EDIT_PROMPT\"}
      ]
    }]
  }"
```

## Character Consistency

Generate the same character across multiple variations:

```bash
CHARACTER_PROMPT="A cyberpunk detective with neon blue hair and chrome augmentations"
VARIATION_PROMPT="Show this character in different poses: standing confidently, sitting at a desk, walking in the rain"

curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST \
  -d "{
    \"contents\": [{
      \"parts\": [{\"text\": \"$CHARACTER_PROMPT. $VARIATION_PROMPT. Maintain consistent character design across all poses.\"}]
    }]
  }"
```

## Save Generated Image

Extract and save the generated image from the API response:

```bash
RESPONSE=$(curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST \
  -d "{
    \"contents\": [{
      \"parts\": [{\"text\": \"$PROMPT\"}]
    }]
  }")

# Extract image data and save
echo "$RESPONSE" | jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data' | base64 -d > generated_image.jpg

echo "Image saved as generated_image.jpg"
```

## Complete Generation Script

```bash
#!/bin/bash

generate_image() {
  local prompt="$1"
  local use_search="${2:-false}"
  local output_file="${3:-generated_image.jpg}"
  local send_discord="${4:-false}"
  
  local tools_config=""
  if [ "$use_search" = "true" ]; then
    tools_config=',"tools": [{"googleSearch": {}}]'
  fi
  
  local response=$(curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -X POST \
    -d "{
      \"contents\": [{
        \"parts\": [{\"text\": \"$prompt\"}]
      }]$tools_config
    }")
  
  if echo "$response" | jq -e '.candidates[0].content.parts[] | select(.inlineData)' > /dev/null; then
    echo "$response" | jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data' | base64 -d > "$output_file"
    echo "✅ Image generated successfully: $output_file"
    
    # Image is saved locally — send it back via the chat channel
    if [ "$send_discord" = "true" ]; then
      echo "📤 Image saved to: $PWD/$output_file"
      echo "ℹ️  To send via WhatsApp, use the router to attach the file path as media."
    fi
    
    return 0
  else
    echo "❌ Error generating image:"
    echo "$response" | jq .
    return 1
  fi
}

# Usage examples:
# generate_image "A majestic mountain landscape" false "mountain.jpg" false
# generate_image "Current SpaceX rocket launch" true "spacex.jpg" false  
# generate_image "Cool PS1-style artwork" false "artwork.jpg" true  # Auto-send to Discord
```

## Auto-Send to Discord

The generate script supports automatically sending images to Discord upon generation:

```bash
# Generate and auto-send to Discord
generate_image "Your prompt here" false "output.jpg" true
```

The Discord target is hardcoded to `user:404271843286188043` (Boss). Modify the script to change the target or make it configurable.

## Control Output Through Prompts

Since the API doesn't expose configuration options for aspect ratio or size, use prompt engineering:

```bash
# For specific aspect ratios, include in prompt:
PROMPT="A wide panoramic landscape (16:9 aspect ratio) with mountains and forest"
PROMPT="A square social media post image (1:1 aspect ratio) with a cat"
PROMPT="A vertical mobile wallpaper (9:16 aspect ratio) with abstract patterns"

# For specific styles or quality:
PROMPT="A photorealistic portrait in 4K resolution with sharp details"
PROMPT="A minimalist vector illustration with clean lines"
PROMPT="A detailed digital artwork suitable for large print"
```

## Features

- **High Quality Generation:** Produces high-resolution images
- **Multi-turn Editing:** Use reference images for iterative editing
- **Character Consistency:** Maintain character identity across variations
- **Google Search Grounding:** Real-time information integration
- **SynthID Watermarks:** All images include invisible watermarks
- **Fast Generation:** Optimized for speed with quality

## Tips

- Be specific in prompts for better results
- Include aspect ratio and style requirements in the text prompt
- Use Google Search grounding for current events or factual content
- Reference images improve editing accuracy
- Character consistency works best with detailed initial descriptions
- Test different prompt variations for your use case

## Model

- `gemini-3-pro-image-preview` — Current preview model
- Production model names may change as the API moves out of preview

## Environment Setup

Set your Gemini API key:

```bash
export GEMINI_API_KEY="your_api_key_here"
```

Get your API key from [Google AI Studio](https://aistudio.google.com/) or use existing Vertex AI credentials.