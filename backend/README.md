# Backend deployment

## Deploy to Railway

1. Create a Railway project from this GitHub repository and add a MySQL service.
2. Configure the backend service's **Root Directory** as `/backend`. Railway will build it from `backend/Dockerfile`.
3. In the backend service's Variables, add the MySQL connection references and application settings listed below. Replace `MySQL` in the references if the database service has a different name.
4. Deploy. Railway supplies `PORT`; Spring Boot listens on it. The application creates/updates its tables on startup and creates the initial admin account if that email does not exist.
5. The Vercel origin `https://student-management-system-using-java-topaz.vercel.app` is allowed by default. For a different frontend domain, set `CORS_ALLOWED_ORIGINS` to its exact HTTPS origin. Multiple comma-separated origins are supported.

The backend's public root URL (`/`) and `/health` return a small JSON health response. The API endpoints remain protected as before.

## Deploy the frontend to Vercel

Set the Vercel project's **Root Directory** to `frontend`, **Build Command** to `npm run build`, and **Output Directory** to `dist`. Production builds use the Railway API URL by default. If using a different backend domain, set `VITE_API_BASE` in Vercel to its full API base URL, including `/api` (for example, `https://your-backend.up.railway.app/api`). Redeploy after changing environment variables.

For a different Vercel domain, set the backend's `CORS_ALLOWED_ORIGINS` to the site's exact origin (no path or trailing slash).

### Backend service variables

Add these in the Railway **backend service**, not the MySQL service:

| Variable | Value |
| --- | --- |
| `MYSQLHOST` | `${{MySQL.MYSQLHOST}}` |
| `MYSQLPORT` | `${{MySQL.MYSQLPORT}}` |
| `MYSQLDATABASE` | `${{MySQL.MYSQLDATABASE}}` |
| `MYSQLUSER` | `${{MySQL.MYSQLUSER}}` |
| `MYSQLPASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |
| `JWT_SECRET` | A private, random secret of at least 32 bytes |
| `ADMIN_EMAIL` | The email for the initial administrator |
| `ADMIN_PASSWORD` | A strong, unique initial administrator password |
| `CORS_ALLOWED_ORIGINS` | Your frontend origin; use `http://localhost:5173` until Vercel is configured |
| `JWT_EXPIRATION_MS` | Optional; defaults to `86400000` (24 hours) |

Railway automatically provides the `MYSQL*` variables on the MySQL service. The entries above create references to them in the backend service; do not copy database credentials into source files. `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` can be set instead when using a different MySQL provider.

To generate a suitable JWT secret locally with PowerShell:

```powershell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

The login form does not fetch administrator credentials from the backend. Enter the `ADMIN_EMAIL` and `ADMIN_PASSWORD` values configured in Railway's backend service. Those credentials are never exposed to the browser. The initial admin account is created only when its email is absent from the database. Changing `ADMIN_PASSWORD` later does not reset an existing account's password.
