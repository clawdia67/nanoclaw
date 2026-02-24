---
name: nginx
description: Configure, manage, and troubleshoot nginx web server — reverse proxy, load balancing, SSL/TLS, caching, rate limiting, and more.
metadata:
  openclaw:
    requires:
      bins:
        - nginx
---

# nginx — Web Server & Reverse Proxy

Configure and manage nginx (v1.28.0+). Use this skill when asked to set up web serving, reverse proxying, load balancing, SSL termination, caching, rate limiting, or any nginx configuration task.

Full docs: https://nginx.org/en/docs/

## Quick Reference

### Config Location (this machine — nix-darwin user-space nginx)

```
# Main config (Nix-managed, don't edit directly)
~/.config/nginx/nginx.conf

# Site configs — drop .conf files here to serve them
~/.config/nginx/sites-enabled/<name>.conf

# Logs
~/.config/nginx/logs/error.log
~/.config/nginx/logs/access.log
```

### From inside the container

**Do not run nginx commands from the container** — nginx runs on the host, not in the container.

To deploy a new site config, write it to `/mnt/nginx-sites/<name>.conf`. A host-side file watcher detects the change and reloads nginx automatically. No manual reload needed.

To test a config for syntax errors before writing it, use `nginx -t` locally on the host if needed.

### Measurement Units

**Sizes:** `k`/`K` (KB), `m`/`M` (MB), `g`/`G` (GB). No suffix = bytes.
**Time:** `ms`, `s` (default), `m` (minutes), `h`, `d`, `w`, `M` (30d), `y` (365d). Combinable: `1h 30m`.

### Config Structure

```nginx
# Main context
user nobody;
worker_processes auto;          # Match CPU cores
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;    # Max connections per worker
    # use kqueue;               # macOS optimal (auto-detected)
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile      on;
    keepalive_timeout 65;

    # Log format
    log_format main '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent"';
    access_log /var/log/nginx/access.log main;

    server {
        listen 80;
        server_name example.com;
        root /var/www/html;

        location / {
            index index.html;
        }
    }
}
```

## Request Processing

nginx processes requests in this order:
1. Match `listen` directive (IP:port)
2. Match `server_name` via Host header
3. Match `location` block

**Server name precedence:** exact name → longest wildcard starting with `*` → longest wildcard ending with `*` → first matching regex.

**Location matching order:**
1. Exact match `=` (stops search)
2. Prefix with `^~` (stops if longest match)
3. Regular expressions `~` (case-sensitive) / `~*` (case-insensitive) — first match wins
4. Longest prefix match (no modifier)

```nginx
location = /exact { }           # Exact match only
location ^~ /static/ { }       # Prefix, no regex check after
location ~ \.php$ { }          # Case-sensitive regex
location ~* \.(gif|jpg|png)$ { }  # Case-insensitive regex
location /prefix/ { }          # Regular prefix
location / { }                 # Catch-all
```

## Reverse Proxy

```nginx
server {
    listen 80;
    server_name app.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Key proxy directives:**
- `proxy_pass` — backend URL
- `proxy_set_header` — pass headers to backend
- `proxy_connect_timeout 60s` — connection timeout
- `proxy_read_timeout 60s` — read timeout
- `proxy_buffering on|off` — response buffering
- `proxy_buffer_size 4k|8k` — header buffer size
- `proxy_buffers 8 4k|8k` — response buffers
- `proxy_next_upstream error timeout` — failover conditions

## WebSocket Proxying

```nginx
# Required: map for Connection header
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    location /ws/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_read_timeout 3600s;  # Keep alive for long connections
    }
}
```

## Load Balancing

```nginx
upstream backend {
    # Methods: round-robin (default), least_conn, ip_hash
    least_conn;

    server srv1.example.com weight=3;
    server srv2.example.com;
    server srv3.example.com backup;     # Only used if others fail
    server srv4.example.com down;       # Marked as permanently unavailable

    # Health check params on server line:
    # max_fails=3 fail_timeout=30s
    keepalive 32;                       # Keep connections to upstreams
}

server {
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";  # Enable keepalive to upstream
    }
}
```

**Load balancing methods:**
- **round-robin** (default) — weighted distribution
- **least_conn** — fewest active connections
- **ip_hash** — sticky sessions by client IP
- **hash $key** — custom hash key

## SSL/TLS (HTTPS)

```nginx
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name example.com;

    ssl_certificate     /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # Session caching (reduces SSL handshakes)
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 10m;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /path/to/chain.pem;
    resolver 8.8.8.8 8.8.4.4 valid=300s;

    location / {
        root /var/www/html;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}
```

**Certificate chains:** Concatenate server cert + intermediates: `cat server.crt ca-bundle.crt > fullchain.pem`

**SNI:** Multiple HTTPS sites on one IP — works automatically with modern clients via TLS Server Name Indication.

**Combined HTTP/HTTPS:**
```nginx
server {
    listen 80;
    listen 443 ssl;
    ssl_certificate ...;
    ssl_certificate_key ...;
}
```

## HTTP/3 (QUIC)

```nginx
server {
    listen 443 ssl;
    listen 443 quic reuseport;  # Enable QUIC

    ssl_protocols TLSv1.3;      # Required for QUIC

    # Advertise HTTP/3 support
    add_header Alt-Svc 'h3=":443"; ma=86400';

    # Optional QUIC settings
    # quic_retry on;            # Address validation
    # ssl_early_data on;        # 0-RTT
}
```

## Caching

```nginx
http {
    # Define cache zone
    proxy_cache_path /var/cache/nginx levels=1:2
                     keys_zone=my_cache:10m
                     max_size=1g
                     inactive=60m
                     use_temp_path=off;

    server {
        location / {
            proxy_pass http://backend;
            proxy_cache my_cache;
            proxy_cache_valid 200 302 10m;
            proxy_cache_valid 404 1m;
            proxy_cache_use_stale error timeout updating
                                  http_500 http_502 http_503 http_504;
            proxy_cache_background_update on;
            proxy_cache_lock on;

            add_header X-Cache-Status $upstream_cache_status;
        }
    }
}
```

**Cache key:** Default `$scheme$proxy_host$request_uri`. Customize with `proxy_cache_key`.
**Bypass:** `proxy_cache_bypass $cookie_nocache $arg_nocache;`
**Don't cache:** `proxy_no_cache $cookie_nocache;`

## Gzip Compression

```nginx
http {
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 4;          # 1-9, higher = more CPU
    gzip_min_length 256;
    gzip_types
        text/plain
        text/css
        text/javascript
        application/javascript
        application/json
        application/xml
        image/svg+xml;
}
```

⚠️ **BREACH warning:** Gzip with SSL can expose data via BREACH attacks. Mitigate by disabling compression for sensitive responses or using CSRF tokens.

## Rate Limiting

```nginx
http {
    # Define zone: 10MB shared memory, 10 req/sec per IP
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    server {
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            # burst=20: allow 20 excess requests
            # nodelay: don't queue, serve immediately up to burst
            limit_req_status 429;
        }
    }
}
```

**Rate formats:** `10r/s` (per second), `30r/m` (per minute).
**Multiple zones:** Stack `limit_req` directives for per-IP + per-server limits.

## Access Control

```nginx
# IP-based
location /admin/ {
    allow 192.168.1.0/24;
    allow 10.0.0.0/8;
    deny all;
}

# Basic auth
location /secure/ {
    auth_basic "Restricted Area";
    auth_basic_user_file /etc/nginx/.htpasswd;
    # Generate: openssl passwd -apr1 'password'
}

# Combined (satisfy any = OR, satisfy all = AND)
location /protected/ {
    satisfy any;
    allow 192.168.1.0/24;
    deny all;
    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/.htpasswd;
}
```

## Rewrites & Redirects

```nginx
# Simple redirect
server {
    listen 80;
    server_name old.example.com;
    return 301 https://new.example.com$request_uri;
}

# Rewrite rules
location /download/ {
    rewrite ^(/download/.*)/media/(.*)\..*$ $1/mp3/$2.mp3 break;
    # Flags: last (re-search locations), break (stop rewriting),
    #        redirect (302), permanent (301)
}

# Conditional
if ($request_uri ~* "^/old-path/(.*)$") {
    return 301 /new-path/$1;
}
```

⚠️ **if is evil** in location context — only use `return` and `rewrite` inside `if`. Other directives may behave unexpectedly.

## Headers

```nginx
# Add response headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Cache control
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 30d;
    add_header Cache-Control "public, no-transform";
}

# CORS
location /api/ {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
    add_header Access-Control-Allow-Headers "Authorization, Content-Type";
    if ($request_method = OPTIONS) {
        return 204;
    }
}
```

⚠️ `add_header` directives are NOT inherited if any `add_header` exists at current level. Use `add_header_inherit merge;` (1.29.3+) to fix.

## Logging

```nginx
# Custom format
log_format json escape=json '{'
    '"time": "$time_iso8601",'
    '"remote_addr": "$remote_addr",'
    '"request": "$request",'
    '"status": $status,'
    '"body_bytes_sent": $body_bytes_sent,'
    '"request_time": $request_time,'
    '"upstream_response_time": "$upstream_response_time"'
'}';

access_log /var/log/nginx/access.json json;

# Conditional logging (skip 2xx/3xx)
map $status $loggable {
    ~^[23] 0;
    default 1;
}
access_log /var/log/nginx/access.log combined if=$loggable;

# Buffered/compressed logging
access_log /var/log/nginx/access.log.gz combined gzip flush=5m;

# Disable for specific location
location /health {
    access_log off;
    return 200 "ok";
}
```

## Common Patterns

### Static Files + Reverse Proxy
```nginx
server {
    listen 80;
    server_name app.example.com;
    root /var/www/app/public;

    location / {
        try_files $uri $uri/ @backend;
    }

    location @backend {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Drop Requests Without Host
```nginx
server {
    listen 80 default_server;
    server_name "";
    return 444;  # Close connection (nginx-specific)
}
```

### Client Upload Size
```nginx
client_max_body_size 100m;  # Default: 1m — increase for file uploads
```

### Timeouts Tuning
```nginx
# Client
client_body_timeout 60s;
client_header_timeout 60s;
keepalive_timeout 75s;

# Proxy
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
```

## Core Directives Quick Ref

| Directive | Default | Context | Purpose |
|-----------|---------|---------|---------|
| `worker_processes` | 1 | main | Worker count (`auto` = CPU cores) |
| `worker_connections` | 512 | events | Max connections per worker |
| `worker_rlimit_nofile` | — | main | Max open files per worker |
| `error_log` | error | main,http,server,location | Error log path + level |
| `include` | — | any | Include other config files |
| `sendfile` | off | http,server,location | Efficient file serving |
| `tcp_nopush` | off | http,server,location | Optimize sendfile packets |
| `tcp_nodelay` | on | http,server,location | Disable Nagle's algorithm |
| `pcre_jit` | off | main | JIT compile regexes |

## Performance Tuning

```nginx
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;
    multi_accept on;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    keepalive_requests 1000;

    # Open file cache
    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;

    # Buffer sizes
    client_body_buffer_size 16k;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 8k;
}
```

**Max connections formula:** `worker_processes × worker_connections`

## Troubleshooting

Run these on the **host** (not from inside the container):

```bash
# Test config syntax
nginx -c ~/.config/nginx/nginx.conf -t

# Check version and build options
nginx -V

# Check error log
tail -f ~/.config/nginx/logs/error.log

# Check access log
tail -f ~/.config/nginx/logs/access.log

# Verify listening ports
lsof -i :8080 -i :8443

# Manually reload (normally handled by the watcher automatically)
nginx -c ~/.config/nginx/nginx.conf -s reload

# Graceful stop / restart via launchd
launchctl kickstart -k gui/$(id -u)/org.nixos.nginx
```

**Common errors:**
- `bind() failed: Address already in use` → Another process on port 80/443
- `could not build the server_names_hash` → Increase `server_names_hash_bucket_size`
- `413 Request Entity Too Large` → Increase `client_max_body_size`
- `502 Bad Gateway` → Backend server down or misconfigured `proxy_pass`
- `504 Gateway Timeout` → Increase `proxy_read_timeout`
