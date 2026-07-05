#!/usr/bin/env bash
# Postgres local SIN Docker ni sudo (binarios portables vía npm).
# Uso: ./scripts/pg-local.sh {start|stop|status|install}
# La app espera: postgresql://companero:companero@localhost:5432/companero
set -euo pipefail

RUNTIME="$HOME/.local/share/companero-pg-runtime"
PGBIN="$RUNTIME/node_modules/@embedded-postgres/linux-x64/native/bin"
PGDATA="$HOME/.local/share/companero-pg/data"
SOCKETS="$HOME/.local/share/companero-pg/sockets"
LOG="$HOME/.local/share/companero-pg/postgres.log"

install() {
  mkdir -p "$RUNTIME" "$SOCKETS"
  [ -x "$PGBIN/postgres" ] || (cd "$RUNTIME" && npm init -y >/dev/null && npm install @embedded-postgres/linux-x64)
  if [ ! -f "$PGDATA/PG_VERSION" ]; then
    PWFILE=$(mktemp)
    echo "companero" > "$PWFILE"
    "$PGBIN/initdb" -D "$PGDATA" -U companero --pwfile="$PWFILE" -E UTF8 -A md5
    rm -f "$PWFILE"
  fi
  start
  PGPASSWORD=companero psql -h 127.0.0.1 -p 5432 -U companero -d postgres \
    -tc "SELECT 1 FROM pg_database WHERE datname='companero'" | grep -q 1 ||
    PGPASSWORD=companero psql -h 127.0.0.1 -p 5432 -U companero -d postgres -c "CREATE DATABASE companero OWNER companero;"
  echo "Listo. Ahora: pnpm prisma migrate deploy --schema prisma/schema.prisma && pnpm db:seed"
}

start() {
  mkdir -p "$SOCKETS"
  "$PGBIN/pg_ctl" -D "$PGDATA" status >/dev/null 2>&1 && { echo "ya corriendo"; return; }
  "$PGBIN/pg_ctl" -D "$PGDATA" -l "$LOG" \
    -o "-p 5432 -k $SOCKETS -c listen_addresses=127.0.0.1" start
}

case "${1:-start}" in
  install) install ;;
  start)   start ;;
  stop)    "$PGBIN/pg_ctl" -D "$PGDATA" stop ;;
  status)  "$PGBIN/pg_ctl" -D "$PGDATA" status ;;
  *) echo "uso: $0 {start|stop|status|install}"; exit 1 ;;
esac
