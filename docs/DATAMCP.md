# DataMCP

> DataMCP es el gateway MCP para que Codex, Cursor, Claude y otras herramientas puedan ver/queryar PostgreSQL con permisos. No es la base de datos; la base real sigue siendo PostgreSQL y la app usa `DATABASE_URL` vía Prisma.

## Qué poner al crear la API key

En la ventana **Generate New API Key**, usar:

```text
wuju-companion-codex
```

Guardá la key en un lugar seguro. No la pegues en GitHub, chats ni commits.

## Flujo correcto

1. Crear o elegir la DB PostgreSQL.
2. Poner esa URL en `.env`:
   ```env
   DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<db>?schema=public"
   ```
3. Correr:
   ```bash
   pnpm prisma migrate deploy --schema prisma/schema.prisma
   pnpm db:seed
   ```
4. En DataMCP, conectar esa misma DB PostgreSQL.
5. Crear un MCP link con permisos.
   - Demo: read-write sobre las tablas del MVP.
   - Más seguro: read-only para inspección y permisos por tabla para escritura.
6. Copiar el MCP URL y API key de DataMCP.

## Supabase como PostgreSQL del equipo

La DB del equipo está en Supabase. Para Prisma y DataMCP usar la misma base PostgreSQL, pero con roles/permisos apropiados para cada caso.

- En `.env`, `DATABASE_URL` debe apuntar al **Session Pooler IPv4** de Supabase.
- No usar la conexión directa `db.<ref>.supabase.co` si el entorno no soporta IPv6.
- No volver a SQLite ni crear `prisma/dev.db`.
- Formato:
  ```env
  DATABASE_URL="postgresql://postgres.<ref>:<password-url-encoded>@aws-1-<region>.pooler.supabase.com:5432/postgres?schema=public"
  ```
- Correr migraciones con:
  ```bash
  pnpm prisma migrate deploy --schema prisma/schema.prisma
  ```
- El seed solo se corre al inicializar/resetear el demo; no en cada deploy porque pisa monedas/inventario.

## Variables locales

```env
DATAMCP_MCP_URL=https://api.datamcp.app/api/mcp/conn_xxx
DATAMCP_API_KEY=sk_live_...
```

Estas variables son para herramientas/agentes. La app no las necesita para atender usuarios.

## Codex MCP

Cuando DataMCP muestre el setup guide, agregar algo equivalente a `~/.codex/config.toml`:

```toml
[mcp_servers.datamcp]
url = "https://api.datamcp.app/api/mcp/conn_xxx"

[mcp_servers.datamcp.headers]
Authorization = "Bearer sk_live_..."
```

Después reiniciar Codex. Si Codex pide OAuth o confirmación en navegador, completarlo antes de esperar que aparezcan las herramientas.

## Claude MCP

Para Claude Desktop/Claude Code, agregar un server remoto equivalente al archivo de configuración MCP del cliente:

```json
{
  "mcpServers": {
    "datamcp": {
      "url": "https://api.datamcp.app/api/mcp/conn_xxx",
      "headers": {
        "Authorization": "Bearer sk_live_..."
      }
    }
  }
}
```

Notas:

- En Claude Desktop, el setup guide de DataMCP muestra la ruta exacta del archivo para tu sistema.
- En Claude Code, usar la configuración MCP soportada por el cliente o el comando equivalente para agregar un server HTTP remoto con header `Authorization`.
- Reiniciar Claude después de guardar la config.
- Probar primero una consulta read-only, por ejemplo listar tablas, antes de ejecutar escrituras.

## Seguridad mínima

- Nunca commitear `DATAMCP_API_KEY`.
- Usar una conexión PostgreSQL con permisos limitados si el dashboard lo permite.
- No habilitar DDL para demo salvo que sea imprescindible.
- Revisar el audit log de DataMCP después de pruebas importantes.
