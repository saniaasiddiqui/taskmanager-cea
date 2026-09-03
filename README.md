# Full-stack Task Manager

A small learning project connecting React, FastAPI, JWT authentication, and
PostgreSQL with Docker Compose. It intentionally uses automatic table creation
instead of migrations to keep the first version approachable.

## Architecture

```text
Browser
  -> React/Vite at localhost:5173
  -> FastAPI at localhost:8000
  -> PostgreSQL service `db` at db:5432
```

The browser downloads the React app from Vite. React sends HTTP requests to
FastAPI. FastAPI validates input and authentication, then uses SQLAlchemy and
the database settings to query PostgreSQL. Docker's network resolves the
hostname `db` to the database container. The backend also accepts a complete
`DATABASE_URL` when it is run manually.

## Authentication flow

```text
Login form
  -> FastAPI validates the username and password hash
  -> FastAPI signs and returns a JWT access token
  -> React stores the token in localStorage (demo choice)
  -> React sends Authorization: Bearer <token>
  -> OAuth2PasswordBearer extracts the token
  -> FastAPI validates the JWT and loads the current user
  -> the protected, owner-filtered task operation runs
```

`localStorage` keeps this example easy to inspect, but production applications
should carefully evaluate token storage and XSS defenses. Passwords are hashed
with pwdlib's recommended Argon2 configuration and are never stored directly.

## Start the project

Docker Desktop (or Docker Engine with Compose) is required. From this directory:

```bash
docker compose up --build
```

Open:

- React app: http://localhost:5173
- FastAPI interactive docs: http://localhost:8000/docs
- Health endpoint: http://localhost:8000/health
- PostgreSQL: localhost:5432

The Compose defaults are suitable only for learning. To configure them, copy
`.env.example` to `.env`, replace the password and secret, then start Compose.
Generate a secret with a password manager or a cryptographically secure tool.

## Docker commands

Start and rebuild images:

```bash
docker compose up --build
```

Stop and remove containers and the network (database volume is retained):

```bash
docker compose down
```

Follow logs from all services:

```bash
docker compose logs -f
```

Show service status:

```bash
docker compose ps
```

To also erase all PostgreSQL data, intentionally run `docker compose down -v`.

## API endpoints

| Method | Path | Authentication | Purpose |
|---|---|---|---|
| GET | `/health` | No | Service health |
| POST | `/auth/register` | No | Create a user |
| POST | `/auth/token` | No | OAuth2 password login |
| GET | `/tasks` | Bearer JWT | List your tasks |
| GET | `/tasks/{id}` | Bearer JWT | Read your task |
| POST | `/tasks` | Bearer JWT | Create your task |
| PUT | `/tasks/{id}` | Bearer JWT | Replace your task fields |
| DELETE | `/tasks/{id}` | Bearer JWT | Delete your task |

Every task lookup includes `owner_id == current_user.id`. A task belonging to
another account therefore cannot be read, changed, or deleted.

## Project notes

- SQLAlchemy uses the current 2.x typed declarative and `select()` style.
- Pydantic uses v2 configuration and validation.
- PyJWT signs short-lived HS256 access tokens.
- The frontend uses native `fetch`, React Router, and plain CSS.
- Tables are created at backend startup. A later learning step would be Alembic
  migrations rather than `create_all()`.
- Docker Compose interpolates `.env` values and supplies them to containers.
  PostgreSQL data lives in the named `postgres_data` volume.
