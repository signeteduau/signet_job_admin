#!/usr/bin/env bash
# Fix React Router 404 on refresh for admin.signetemploymenthub.com
# Run on VPS as root:
#   bash /home/user/apps/signet-admin/scripts/vps-fix-spa.sh

set -euo pipefail

HESTIA_USER="${HESTIA_USER:-user}"
ADMIN_DOMAIN="${ADMIN_DOMAIN:-admin.signetemploymenthub.com}"
CONF="/home/${HESTIA_USER}/conf/web/${ADMIN_DOMAIN}"

if [ ! -d "$CONF" ]; then
  echo "ERROR: ${CONF} not found"
  exit 1
fi

SPA_BLOCK='location ~ ^/(login|admin)(/.*)?$ {
    try_files /index.html =404;
}

error_page 404 = @signet_spa;
location @signet_spa {
    try_files /index.html =404;
}'

printf '%s\n' "$SPA_BLOCK" > "${CONF}/nginx.conf_custom"
cp "${CONF}/nginx.conf_custom" "${CONF}/nginx.ssl.conf_custom"
chown "${HESTIA_USER}:${HESTIA_USER}" "${CONF}/nginx.conf_custom" "${CONF}/nginx.ssl.conf_custom"

echo "==> Testing nginx..."
nginx -t

echo "==> Reloading nginx..."
systemctl reload nginx

echo ""
echo "Done. Test:"
echo "  curl -I https://${ADMIN_DOMAIN}/login"
echo "  (should be HTTP/2 200, not 404)"
