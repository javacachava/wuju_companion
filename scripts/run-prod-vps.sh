#!/usr/bin/env bash
# Script de arranque de pm2 en el VPS. Copia viva: /srv/wuju/proyectos/companion/run-prod.sh
# Si cambia, actualizar ambos. El deploy usa `rsync --delete`, que borra archivos no versionados.
cd /srv/wuju/proyectos/companion
set -a; . ./.env; set +a
export PORT=3001
exec pnpm --filter web start
