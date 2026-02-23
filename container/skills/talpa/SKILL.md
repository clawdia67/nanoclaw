---
name: talpa
description: Manage Cloudflare Tunnel routes - create, remove, and list tunnel connections to local services.
metadata:
  openclaw:
    requires:
      bins:
        - talpa
---

# Talpa — Cloudflare Tunnel Route Manager

Manage Cloudflare Tunnel routes to expose local services through secure tunnels. Create subdomains, route traffic, and manage connections without opening firewall ports.

## When to Use This Skill

- Expose local development servers to the internet
- Share work-in-progress apps with clients or teammates  
- Create temporary public access to local services
- Set up staging environments or demos
- Test webhooks that need public URLs

## Initial Setup

Configure talpa with your Cloudflare credentials (one-time setup):

```bash
talpa setup
```

This stores your Cloudflare API credentials securely in macOS Keychain. You'll need:
- Cloudflare API token with Tunnel and DNS permissions
- Access to a domain managed by Cloudflare

## Create a New Tunnel Route

Expose a local service through a public hostname:

```bash
# Basic web app
talpa dig app.example.com http://localhost:3000

# API server  
talpa dig api.example.com http://localhost:8080

# Development server with specific port
talpa dig staging.example.com http://localhost:5000

# HTTPS local service
talpa dig secure.example.com https://localhost:8443
```

This command:
1. Creates a Cloudflare Tunnel route
2. Adds a CNAME DNS record pointing to the tunnel
3. Routes traffic from the hostname to your local service

## Remove a Tunnel Route

Clean up when you're done with a tunnel:

```bash
# Remove specific tunnel
talpa plug app.example.com

# Remove multiple tunnels
talpa plug staging.example.com
talpa plug api.example.com
```

This command:
1. Removes the tunnel route
2. Deletes the associated CNAME record
3. Stops routing traffic to your local service

## List Active Routes

See all currently active tunnel routes:

```bash
talpa list
```

Returns information about:
- Active hostnames and their target services
- Tunnel status and health
- DNS record status

## Common Use Cases

### Local Development Sharing
```bash
# Share React dev server
talpa dig myapp-dev.example.com http://localhost:3000

# Share API for frontend testing  
talpa dig api-dev.example.com http://localhost:8000
```

### Client Demos
```bash
# Create demo environment
talpa dig demo.example.com http://localhost:4000

# When demo is over, clean up
talpa plug demo.example.com
```

### Webhook Testing
```bash
# Expose webhook endpoint
talpa dig webhooks.example.com http://localhost:9000

# Test with external services like GitHub, Stripe, etc.
```

### Staging Environment
```bash
# Create staging URL
talpa dig staging.example.com http://localhost:8080

# Share with team for testing
# Remove when moving to production
talpa plug staging.example.com
```

## Tips

- **Hostname format**: Use subdomains of domains you control in Cloudflare
- **Service URLs**: Support both HTTP and HTTPS local services
- **Port flexibility**: Any local port works (3000, 8080, 5000, etc.)
- **Clean up**: Always `talpa plug` when done to avoid unused tunnels
- **Multiple tunnels**: You can run several tunnels simultaneously
- **Security**: Tunnels are secured by Cloudflare's network
- **No firewall changes**: Works without opening local network ports

## Troubleshooting

### Setup Issues
```bash
# Re-run setup if credentials expire
talpa setup
```

### Check Active Routes
```bash
# List what's currently running
talpa list

# Remove all if you need to start fresh
talpa plug hostname1.example.com
talpa plug hostname2.example.com
```

### Service Not Reachable
- Verify local service is running on the specified port
- Check hostname spelling matches exactly
- Ensure domain is managed by Cloudflare
- Wait a moment for DNS propagation

### Permission Errors
- Run `talpa setup` to refresh API credentials
- Verify Cloudflare token has Tunnel and DNS permissions
- Check domain is accessible in your Cloudflare account