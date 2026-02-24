---
name: talpa
description: Manage Cloudflare Tunnel routes - create, remove, and list tunnel connections to local services.
---

# Talpa — Cloudflare Tunnel Route Manager

Manage Cloudflare Tunnel routes to expose local services through secure tunnels. Create subdomains, route traffic, and manage connections without opening firewall ports.

Talpa runs on the **host** (credentials are in macOS Keychain). Use the MCP tools below — do NOT run `talpa` directly in Bash.

## MCP Tools

### `talpa_dig` — Create a tunnel route

Exposes a local service through a public hostname.

```
talpa_dig(hostname: "myapp.oio.party", service: "http://localhost:8081")
```

This creates a Cloudflare Tunnel route, adds a CNAME DNS record, and starts routing traffic from the hostname to your local service.

### `talpa_plug` — Remove a tunnel route

Stops routing and removes the DNS record.

```
talpa_plug(hostname: "myapp.oio.party")
```

### `talpa_list` — List active routes

Shows all currently active tunnel routes with hostnames, targets, and status.

```
talpa_list()
```

## When to Use

- Expose local development servers to the internet
- Share work-in-progress apps with clients or teammates
- Create temporary public access to local services
- Set up staging environments or demos
- Test webhooks that need public URLs

## Common Patterns

### Local Development Sharing
```
talpa_dig(hostname: "myapp-dev.oio.party", service: "http://localhost:3000")
```

### Client Demo
```
# Create
talpa_dig(hostname: "demo.oio.party", service: "http://localhost:4000")

# Clean up when done
talpa_plug(hostname: "demo.oio.party")
```

### Webhook Testing
```
talpa_dig(hostname: "webhooks.oio.party", service: "http://localhost:9000")
```

## Tips

- **Hostname format**: Use subdomains of domains managed in Cloudflare
- **Service URLs**: Must point to localhost or 127.0.0.1
- **Clean up**: Always `talpa_plug` when done to avoid unused tunnels
- **Multiple tunnels**: You can run several tunnels simultaneously
- **Main group only**: These tools are restricted to the main group

## Troubleshooting

- If tunnel creation fails, verify the local service is running on the specified port
- Check hostname spelling matches exactly when removing
- Use `talpa_list` to see what's currently active
- DNS propagation may take a moment after creating a tunnel
