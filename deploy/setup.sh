#!/usr/bin/env bash
# Idempotent setup for http://pm.localhost
#   seed vault data (only if missing) -> build frontend -> link nginx conf -> hosts -> pm2 pm-api (+save)
#   -> nginx via brew services -> verify
# Safe to re-run. Asks before replacing an existing nginx conf or removing dangling nginx site links.
# Never overwrites vault data: seeding only creates files that do not exist yet.
#   deploy/setup.sh [--fix-broken-links]
set -euo pipefail

APP=pm
HOST=pm.localhost
PORT=4000
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BREW_PREFIX="$(brew --prefix 2>/dev/null || echo /opt/homebrew)"
NGINX_SERVERS="$BREW_PREFIX/etc/nginx/servers"
CONF_SRC="$ROOT/deploy/nginx/$APP.conf"
CONF_DST="$NGINX_SERVERS/$APP.conf"
export VAULT_PATH="${VAULT_PATH:-/Users/greg/Library/CloudStorage/Dropbox/Notebooks/Work}"
export DATA_DIR="${DATA_DIR:-10 Projects/PM/data}"
FIX_LINKS=0
[[ "${1:-}" == "--fix-broken-links" ]] && FIX_LINKS=1

say() { printf '\n==> %s\n' "$*"; }
ask() { read -r -p "$1 [y/N] " reply; [[ "$reply" =~ ^[Yy]$ ]]; }

for bin in node npm nginx pm2 curl; do
  command -v "$bin" >/dev/null || { echo "missing required tool: $bin" >&2; exit 1; }
done

say "Vault data ($VAULT_PATH/$DATA_DIR)"
[[ -d "$VAULT_PATH" ]] || { echo "vault not found: $VAULT_PATH" >&2; exit 1; }
(cd "$ROOT" && node scripts/seed.mjs prod)

say "Port $PORT"
if lsof -nP -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1 && ! pm2 describe "$APP-api" >/dev/null 2>&1; then
  echo "Port $PORT is in use by something other than pm2 $APP-api. Aborting." >&2
  exit 1
fi

say "Build frontend"
(cd "$ROOT/frontend" && { [[ -d node_modules ]] || npm install; } && npm run build)

say "nginx site"
mkdir -p "$NGINX_SERVERS"
if [[ -e "$CONF_DST" || -L "$CONF_DST" ]]; then
  if [[ "$(readlink "$CONF_DST" || true)" == "$CONF_SRC" ]]; then
    echo "already linked"
  elif ask "$CONF_DST exists and is not this app's conf. Replace it?"; then
    ln -sfn "$CONF_SRC" "$CONF_DST"
  else
    echo "left $CONF_DST alone; aborting" >&2
    exit 1
  fi
else
  ln -s "$CONF_SRC" "$CONF_DST"
  echo "linked $CONF_DST"
fi

# A dangling symlink in servers/ makes `nginx -t` fail for every site.
for link in "$NGINX_SERVERS"/*; do
  [[ -L "$link" && ! -e "$link" ]] || continue
  echo "dangling nginx site link: $link -> $(readlink "$link")"
  if [[ $FIX_LINKS -eq 1 ]] || ask "Remove it?"; then rm "$link"; echo "removed"; fi
done
nginx -t

say "hosts ($HOST)"
# .localhost resolves natively in Chrome/Firefox/curl; Safari needs explicit lines (IPv4 and IPv6).
missing=()
for line in "127.0.0.1 $HOST" "::1 $HOST"; do
  if grep -qE "^[[:space:]]*${line%% *}[[:space:]]+.*\b${HOST}\b" /etc/hosts; then
    echo "present: $line"
  else
    missing+=("$line")
  fi
done
if [[ ${#missing[@]} -gt 0 ]]; then
  if printf '%s\n' "${missing[@]}" | sudo -n tee -a /etc/hosts >/dev/null 2>&1 \
     || { [[ -t 0 ]] && printf '%s\n' "${missing[@]}" | sudo tee -a /etc/hosts >/dev/null; }; then
    echo "added: ${missing[*]}"
  else
    echo "could not edit /etc/hosts (sudo needs a password). Run this once in a terminal:" >&2
    for line in "${missing[@]}"; do echo "  echo '$line' | sudo tee -a /etc/hosts" >&2; done
  fi
fi

say "pm2 $APP-api"
pm2 startOrReload "$ROOT/deploy/ecosystem.config.cjs" --update-env
pm2 save

say "nginx (brew services)"
NGINX_PID="$(cat "$BREW_PREFIX/var/run/nginx.pid" 2>/dev/null || true)"
NGINX_OWNER="$([[ -n "$NGINX_PID" ]] && ps -o user= -p "$NGINX_PID" 2>/dev/null | tr -d ' ' || true)"
if [[ -n "$NGINX_OWNER" && "$NGINX_OWNER" != "$(id -un)" ]]; then
  # A root-owned master (e.g. from an earlier `sudo nginx`) cannot be signalled by this user, and a second
  # user-level nginx would fight over port 80. Reload it with sudo if possible, otherwise tell the user.
  if sudo -n nginx -s reload 2>/dev/null; then
    echo "reloaded root-owned nginx"
  else
    echo "nginx master (pid $NGINX_PID) runs as $NGINX_OWNER; could not reload it. Run once:" >&2
    echo "  sudo pkill nginx; brew services restart nginx     # moves nginx to your user launchd job (preferred)" >&2
    echo "  (or: sudo nginx -s reload)" >&2
  fi
elif brew services list | awk '$1=="nginx"{print $2}' | grep -q started; then
  nginx -s reload || brew services restart nginx
else
  brew services start nginx
fi
sleep 1

say "Verify"
fail=0
check() { local label="$1"; shift; if "$@" >/dev/null 2>&1; then echo "ok   $label"; else echo "FAIL $label"; fail=1; fi; }
check "API health (direct)"      curl -fsS "http://127.0.0.1:$PORT/api/health"
# Other apps' sites are the nginx default server, so assert this app's own content, not just a 200.
check "IPv4 $HOST/"              bash -c "curl -fsS -4 --resolve $HOST:80:127.0.0.1 'http://$HOST/' | grep -q '<title>PM</title>'"
check "IPv6 $HOST/"              bash -c "curl -fsS -6 -H 'Host: $HOST' 'http://[::1]/' | grep -q '<title>PM</title>'"
check "API via nginx"            bash -c "curl -fsS -4 --resolve $HOST:80:127.0.0.1 'http://$HOST/api/health' | grep -q '10 Projects/PM'"
check "SPA deep link"            bash -c "curl -fsS -4 --resolve $HOST:80:127.0.0.1 'http://$HOST/projects/test' | grep -q '<title>PM</title>'"
check "seed state via API"       bash -c "curl -fsS http://127.0.0.1:$PORT/api/state | grep -q '\"tasks\"'"
check "seed files via API"       bash -c "curl -fsS http://127.0.0.1:$PORT/api/files | grep -q 'tasks.csv'"
check "pm2 online"               bash -c "pm2 describe $APP-api | grep -qE 'status.*online'"
check "plain name resolves"      bash -c "curl -fsS 'http://$HOST/' | grep -q '<title>PM</title>'"
echo
if [[ $fail -ne 0 ]]; then
  echo "Some checks failed (see above)." >&2
  echo "If the API reports a timeout/permission error reading the vault, macOS is blocking the pm2 node from Dropbox:" >&2
  echo "add the node binary from deploy/ecosystem.config.cjs under System Settings > Privacy & Security > Full Disk Access," >&2
  echo "then run: pm2 restart $APP-api" >&2
  curl -s -m 8 "http://127.0.0.1:$PORT/api/health" >&2 || true
  exit 1
fi
echo "PM is up: http://$HOST"
