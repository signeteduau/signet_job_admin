#!/usr/bin/env bash
# Deploy Signet Admin Panel to Hestia VPS (same stack as signet_job_site).
#
# Prerequisites on VPS:
#   1. Hestia user exists (default: user)
#   2. Subdomain created in Hestia, e.g. admin.signemploymenthub.com
#   3. DNS A record points subdomain to this VPS
#   4. Firebase Console → Authentication → Authorized domains → add the admin subdomain
#
# Run on VPS as root:
#   bash vps-deploy.sh
#
# Optional overrides:
#   HESTIA_USER=user ADMIN_DOMAIN=admin.signemploymenthub.com bash vps-deploy.sh

set -euo pipefail

HESTIA_USER="${HESTIA_USER:-user}"
ADMIN_DOMAIN="${ADMIN_DOMAIN:-admin.signemploymenthub.com}"
APP_DIR="/home/${HESTIA_USER}/apps/signet-admin"
PUBLIC_HTML="/home/${HESTIA_USER}/web/${ADMIN_DOMAIN}/public_html"
REPO="${REPO:-https://github.com/signeteduau/signet_job_admin.git}"
BRANCH="${BRANCH:-main}"

echo "==> Signet Admin Panel deploy"
echo "    Domain:     ${ADMIN_DOMAIN}"
echo "    App dir:    ${APP_DIR}"
echo "    Web root:   ${PUBLIC_HTML}"
echo ""

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
NGINX_SSL_CUSTOM="/home/${HESTIA_USER}/conf/web/${ADMIN_DOMAIN}/nginx.ssl.conf_custom"
NGINX_CUSTOM="/home/${HESTIA_USER}/conf/web/${ADMIN_DOMAIN}/nginx.conf_custom"
mkdir -p "/home/${HESTIA_USER}/conf/web/${ADMIN_DOMAIN}"

SPA_BLOCK='location / {
    try_files $uri $uri/ /index.html;
}

location ~* \.(?:js|css|png|jpg|jpeg|gif|webp|svg|ico|woff2?)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;
}'

echo "$SPA_BLOCK" > "$NGINX_SSL_CUSTOM"
echo "$SPA_BLOCK" > "$NGINX_CUSTOM"
chown "${HESTIA_USER}:${HESTIA_USER}" "$NGINX_SSL_CUSTOM" "$NGINX_CUSTOM"

if command -v v-rebuild-web-domain &>/dev/null; then
  v-rebuild-web-domain "$HESTIA_USER" "$ADMIN_DOMAIN"
else
  systemctl reload nginx
fi

echo ""
echo "============================================"
echo " Deploy complete"
echo "============================================"
echo " Admin URL:  https://${ADMIN_DOMAIN}"
echo " Login:      https://${ADMIN_DOMAIN}/login"
echo ""
echo " Firebase: add '${ADMIN_DOMAIN}' to Auth → Authorized domains"
echo " Re-deploy:  bash ${APP_DIR}/scripts/vps-deploy.sh"
echo "============================================"
