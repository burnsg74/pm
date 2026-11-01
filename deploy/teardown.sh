#!/usr/bin/env bash
# Remove pm.localhost: nginx site, pm2 process, hosts lines. Never touches vault data or the repo.
set -euo pipefail
NGINX_SERVERS="$(brew --prefix 2>/dev/null || echo /opt/homebrew)/etc/nginx/servers"

rm -f "$NGINX_SERVERS/pm.conf"
nginx -t && nginx -s reload || true
pm2 delete pm-api 2>/dev/null || true
pm2 save
sudo sed -i '' '/[[:space:]]pm\.localhost$/d' /etc/hosts || echo "remove the pm.localhost lines from /etc/hosts manually"
echo "removed. Vault data (10 Projects/PM/data) and this folder are untouched."
