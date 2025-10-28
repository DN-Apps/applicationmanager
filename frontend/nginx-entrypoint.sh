#!/bin/sh
set -e
TPL="/usr/share/nginx/html/config.template.js"
OUT="/usr/share/nginx/html/config.js"
API="${API_PUBLIC_URL:-http://localhost:5000}"
if [ -f "$TPL" ]; then
  sed "s#__API_PUBLIC_URL__#${API}#g" "$TPL" > "$OUT"
fi
