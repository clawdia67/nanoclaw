---
name: pinger
description: Send push notifications to an iPhone via the Pinger relay. Supports broadcast, per-user targeting, and opening URLs on tap.
metadata:
  openclaw:
    requires:
      bins:
        - curl
        - jq
---

# Pinger — Push Notifications

Send push notifications to iPhones via the Pinger relay service. Pinger is a Cloud Function that forwards JSON payloads to iOS devices through FCM/APNs.

Base URL: `https://us-central1-clawdia-pinger.cloudfunctions.net`. All endpoints accept `POST` with `Content-Type: application/json`.

## Send a notification (broadcast to all users)

Use this when the user says things like "ping me", "send a notification", "alert everyone", or "push a message".

```bash
curl -s -X POST "https://us-central1-clawdia-pinger.cloudfunctions.net/notify" \
  -H 'Content-Type: application/json' \
  -d "{\"title\": \"$TITLE\", \"message\": \"$MESSAGE\"}" | jq .
```

- `title` (required) — short notification title
- `message` (required) — notification body text

## Send a notification to a specific user

Use this when the user says "send to matt", "notify alice", "ping bob", or specifies a recipient.

```bash
curl -s -X POST "https://us-central1-clawdia-pinger.cloudfunctions.net/notify" \
  -H 'Content-Type: application/json' \
  -d "{\"title\": \"$TITLE\", \"message\": \"$MESSAGE\", \"to\": \"$USERNAME\"}" | jq .
```

- `to` — the target username (alphanumeric, hyphens, underscores). Routes to that user only instead of broadcasting.

## Send a notification with a URL

Use this when the notification should link somewhere — "ping me with the PR link", "send a notification to open this page".

```bash
curl -s -X POST "https://us-central1-clawdia-pinger.cloudfunctions.net/notify" \
  -H 'Content-Type: application/json' \
  -d "{\"title\": \"$TITLE\", \"message\": \"$MESSAGE\", \"url\": \"$URL\"}" | jq .
```

- `url` (optional) — a URL that opens when the user taps the notification. Can be combined with `to` for targeted delivery.

## Claim a username

Registers a unique username for per-user notification routing. Returns a `secretKey` that proves ownership — store it securely.

```bash
curl -s -X POST "https://us-central1-clawdia-pinger.cloudfunctions.net/claimUsername" \
  -H 'Content-Type: application/json' \
  -d "{\"username\": \"$USERNAME\"}" | jq .
```

- `username` — 2–30 chars, alphanumeric/hyphens/underscores, lowercased server-side
- Returns `{"success": true, "secretKey": "..."}` on success, `409` if taken

## Release a username

Frees a previously claimed username. Requires the secret key from the original claim.

```bash
curl -s -X POST "https://us-central1-clawdia-pinger.cloudfunctions.net/releaseUsername" \
  -H 'Content-Type: application/json' \
  -d "{\"username\": \"$USERNAME\", \"secretKey\": \"$SECRET_KEY\"}" | jq .
```

## Response format

All endpoints return JSON. A successful notification returns:

```json
{"success": true, "messageId": "projects/clawdia-pinger/messages/..."}
```

Errors return an `error` field with a human-readable message. HTTP status codes: `400` (bad input), `404` (not found), `409` (username taken), `429` (rate limited — max 30/min), `500` (server error).

## Tips

- Omit `to` to broadcast to every Pinger user. Include `to` for targeted delivery.
- The `url` field works with both broadcast and targeted notifications.
- Usernames are case-insensitive (lowercased server-side).
- Rate limit is 30 requests per minute per IP.
