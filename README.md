# 🚀 Strapi Template Docker

A **Strapi 5** (TypeScript) base template, Docker-ready, designed to be reused as a starting point for any new project that needs a headless CMS / backend.

## ✨ What's included

- **Strapi 5.61** with TypeScript and Node 22.
- **PostgreSQL** as the default database (MySQL and SQLite are also supported via `DATABASE_CLIENT`).
- **Production Docker setup**: multi-stage `Dockerfile` (build + slim final image, runs as the `node` user).
- **Development Docker setup**: `Dockerfile.dev` with hot reload through bind mounts.
- Separate **Docker Compose** files for production and development.
- `.env.example` with all required variables and a preconfigured `.dockerignore`.

## 📁 Structure

```text
├── config/                    # Strapi configuration (db, server, admin, plugins...)
├── database/migrations/       # Migrations
├── public/uploads/            # Uploaded files (mounted as a volume)
├── src/                       # App code (api, extensions, admin)
├── Dockerfile                 # Production image (multi-stage)
├── Dockerfile.dev             # Development image
├── docker-compose.yaml        # Production stack
├── docker-compose.dev.yaml    # Development stack
└── .env.example               # Environment variables template
```

## 🧩 Using this template for a new project

1. Create your repo from this template (**Use this template** on GitHub) or clone it:

   ```bash
   git clone <this-repo-url> my-project
   cd my-project
   rm -rf .git && git init
   ```

2. Rename the project:
   - `name` in [package.json](package.json).
   - `container_name` and `image` in the `docker-compose*.yaml` files.
3. Generate your own secrets (**do not reuse the ones in `.env.example`**):

   ```bash
   node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
   ```

   You need fresh values for `APP_KEYS` (4, comma-separated), `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`, `TRANSFER_TOKEN_SALT` and `ENCRYPTION_KEY`.
4. Create the environment files from the example (see next section).
5. (Optional) Remove the `strapi.uuid` / `installId` block from `package.json` so your project gets its own identity.

## ⚙️ Configuration

Copy the example for each environment:

```bash
cp .env.example .env       # production
cp .env.example .env.dev   # development
```

Main variables:

| Variable | Description |
| --- | --- |
| `HOST` / `PORT` | Strapi interface and port (`0.0.0.0` / `1337`) |
| `APP_KEYS`, `*_SALT`, `*_SECRET`, `ENCRYPTION_KEY` | Strapi secrets |
| `DATABASE_CLIENT` | `postgres` (default), `mysql` or `sqlite` |
| `DATABASE_HOST/PORT/NAME/USERNAME/PASSWORD` | Database connection |
| `DATABASE_SSL` | Enables SSL on the connection |

> `.env*` files are excluded from the image (`.dockerignore`) and injected at runtime via `env_file`.

## 🐳 Docker

Both compose files use `host.docker.internal` as `DATABASE_HOST`, so they expect a **PostgreSQL instance installed on the host**. Create the database named in `DATABASE_NAME` beforehand. If you prefer PostgreSQL in a container, add a `postgres` service to the compose file and point `DATABASE_HOST` to it.

### Development

Hot reload, with `config`, `src`, `database`, `types` and `public` mounted as volumes.

```bash
docker compose -f docker-compose.dev.yaml up --build
```

### Production

Multi-stage image with the admin panel already built. Only `public/uploads` is mounted as a volume.

```bash
docker compose up -d --build
```

Strapi is available at `http://localhost:1337` and the admin panel at `http://localhost:1337/admin`. On first launch you'll be asked to create the admin user.

## 💻 Without Docker

Requires Node `>=22` and a database configured in `.env`.

```bash
npm install
npm run develop   # development with autoReload
npm run build     # builds the admin panel
npm run start     # production, no autoReload
```

## 📚 Resources

- [Strapi documentation](https://docs.strapi.io)
- [Strapi CLI](https://docs.strapi.io/dev-docs/cli)
- [Deployment](https://docs.strapi.io/dev-docs/deployment)
- [Discord community](https://discord.strapi.io)
