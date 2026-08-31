#!/usr/bin/env bash
# Deploy Signet Admin Panel to Hestia VPS (same stack as signet_job_site).
#
# Run on VPS as root:
#   bash /home/user/apps/signet-admin/scripts/vps-deploy.sh
#
# Optional overrides:
#   HESTIA_USER=user ADMIN_DOMAIN=admin.signetemploymenthub.com bash vps-deploy.sh

set -euo pipefail

HESTIA_BIN="${HESTIA_BIN:-/usr/local/hestia/bin}"
ADMIN_DOMAIN="${ADMIN_DOMAIN:-admin.signetemploymenthub.com}"
APP_DIR="${APP_DIR:-/home/user/apps/signet-admin}"
REPO="${REPO:-https://github.com/signeteduau/signet_job_admin.git}"
BRANCH="${BRANCH:-main}"

detect_hestia_user() {
  if [ -n "${HESTIA_USER:-}" ]; then
    echo "$HESTIA_USER"
    return
  fi
  local conf
  for conf in /home/*/conf/web/"${ADMIN_DOMAIN}"/nginx.conf; do
    if [ -f "$conf" ]; then
      echo "$conf" | cut -d/ -f3
      return
    fi
  done
  echo "user"
}

HESTIA_USER="$(detect_hestia_user)"
PUBLIC_HTML="/home/${HESTIA_USER}/web/${ADMIN_DOMAIN}/public_html"

echo "==> Signet Admin Panel deploy"
echo "    Domain:     ${ADMIN_DOMAIN}"
echo "    Hestia user:${HESTIA_USER}"
echo "    App dir:    ${APP_DIR}"
echo "    Web root:   ${PUBLIC_HTML}"
echo ""

if [ ! -f "/home/${HESTIA_USER}/conf/web/${ADMIN_DOMAIN}/nginx.conf" ]; then
  echo "ERROR: ${ADMIN_DOMAIN} is not configured in Hestia for user '${HESTIA_USER}'."
  echo "Create it in Hestia → Web → Add Web Domain, then re-run."
  exit 1
fi

echo "==> Installing git (if needed)..."
if ! command -v git &>/dev/null; then
  apt-get update -qq
  apt-get install -y git
fi

echo "==> Installing Node.js 20 (if needed)..."
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
node -v
npm -v

echo "==> Cloning/updating app..."
mkdir -p "/home/${HESTIA_USER}/apps"
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git fetch origin
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
else
  git clone --branch "$BRANCH" "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

echo "==> Installing dependencies and building..."
npm ci || npm install
npm run build

if [ ! -d "$APP_DIR/dist" ]; then
  echo "ERROR: build did not produce dist/ — check npm run build output"
  exit 1
fi

echo "==> Publishing static files to ${PUBLIC_HTML}..."
mkdir -p "$PUBLIC_HTML"
rsync -av --delete "$APP_DIR/dist/" "$PUBLIC_HTML/"
chown -R "${HESTIA_USER}:${HESTIA_USER}" "$PUBLIC_HTML"

echo "==> Configuring Nginx SPA routing for ${ADMIN_DOMAIN}..."
NGINX_DIR="/home/${HESTIA_USER}/conf/web/${ADMIN_DOMAIN}"
NGINX_SSL_CUSTOM="${NGINX_DIR}/nginx.ssl.conf_custom"
NGINX_CUSTOM="${NGINX_DIR}/nginx.conf_custom"
mkdir -p "$NGINX_DIR"

# Hestia already defines location / in the domain template.
# A second location / here causes: duplicate location "/" nginx error.
SPA_BLOCK='location ~ ^/(login|admin)(/.*)?$ {
    try_files /index.html =404;
}

error_page 404 = @signet_spa;
location @signet_spa {
    try_files /index.html =404;
}'

echo "$SPA_BLOCK" > "$NGINX_SSL_CUSTOM"
echo "$SPA_BLOCK" > "$NGINX_CUSTOM"
chown "${HESTIA_USER}:${HESTIA_USER}" "$NGINX_SSL_CUSTOM" "$NGINX_CUSTOM"

rebuild_nginx() {
  echo "==> Rebuilding Nginx via Hestia..."

  if [ -x "${HESTIA_BIN}/v-list-web-domains" ]; then
    echo "    Registered domains for ${HESTIA_USER}:"
    "${HESTIA_BIN}/v-list-web-domains" "$HESTIA_USER" plain | sed 's/^/      - /' || true
  fi

  if [ -x "${HESTIA_BIN}/v-rebuild-web-domain" ]; then
    if "${HESTIA_BIN}/v-rebuild-web-domain" "$HESTIA_USER" "$ADMIN_DOMAIN" yes; then
      echo "    Rebuilt ${ADMIN_DOMAIN} OK"
      return 0
    fi
    echo "    v-rebuild-web-domain failed — trying v-rebuild-web-domains..."
  fi

  if [ -x "${HESTIA_BIN}/v-rebuild-web-domains" ]; then
    if "${HESTIA_BIN}/v-rebuild-web-domains" "$HESTIA_USER" yes; then
      echo "    Rebuilt all web domains for ${HESTIA_USER} OK"
      return 0
    fi
  fi

  echo "    Hestia rebuild failed — reloading nginx directly..."
  nginx -t
  systemctl reload nginx
}

set +e
rebuild_nginx
REBUILD_EXIT=$?
set -e

echo ""
echo "============================================"
if [ "$REBUILD_EXIT" -eq 0 ]; then
  echo " Deploy complete"
else
  echo " Deploy finished (files published; check nginx if site 404s)"
fi
echo "============================================"
echo " Admin URL:  https://${ADMIN_DOMAIN}"
echo " Login:      https://${ADMIN_DOMAIN}/login"
echo ""
echo " Firebase: add '${ADMIN_DOMAIN}' to Auth → Authorized domains"
echo " Re-deploy:  bash ${APP_DIR}/scripts/vps-deploy.sh"
echo "============================================"
