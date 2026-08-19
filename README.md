# Product Management Application

A full-stack product management system built with **ASP.NET Core** (Clean Architecture) and **React 18 + TypeScript + Vite + Tailwind CSS**. Supports full CRUD with soft-delete, pagination, unique-name enforcement, and validation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core Web API, EF Core 10, SQLite, FluentValidation |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4, Axios |
| Architecture | Clean Architecture (Domain / Application / Infrastructure / API) |

---

## Repository Structure

```
ProductManagement/
├── backend/
│   ├── ProductManagement.Api/            # Controllers, middleware, Program.cs
│   ├── ProductManagement.Application/    # Services, DTOs, validators, DI
│   ├── ProductManagement.Domain/         # Entities, repository interfaces, Result/PagedResult
│   ├── ProductManagement.Infrastructure/ # EF Core DbContext, repositories, migrations
│   └── ProductManagement.sln
└── frontend/
    └── product-management-ui/            # Vite + React + TypeScript + Tailwind
        └── src/
            ├── api/           # Axios client + typed API calls
            ├── components/    # ProductForm, ProductTable, Pagination
            ├── hooks/         # useProducts — centralised state + API orchestration
            ├── pages/         # ProductsPage
            └── types/         # Shared TypeScript interfaces
```

### Design Decisions

- **Clean Architecture** — the Domain layer has zero dependencies; business rules are portable and independently testable.
- **Result pattern** (`Result<T>`) — expected business errors (validation, duplicates, not-found) are returned as values, not thrown as exceptions.
- **EF Core Global Query Filter** on `IsDeleted` — soft-deleted rows are transparently excluded from every query.
- **Filtered Unique Index** on `Name` (active rows only) — enforces the unique-name rule at the database level as a safety net behind the application-level check.
- **FluentValidation** — validation rules live beside the DTOs, not inside the entities or controllers.
- **Custom hook (`useProducts`)** — encapsulates all product state, loading, and error handling so components stay focused on rendering.
- **Environment-driven API URL** — the frontend reads `VITE_API_BASE_URL`, allowing the same build to target dev, staging, or production backends.

---

## Prerequisites

| Tool | Version |
|---|---|
| .NET SDK | 10.0+ (or 8.0 LTS) |
| Node.js | 18+ |
| npm | 9+ |

---

## Running Locally

### 1. Backend

```bash
cd backend/ProductManagement.Api

# Restore packages (first time only)
dotnet restore

# Run the API (auto-applies EF migrations on startup)
dotnet run
```

- The API listens on the URL printed to the console (e.g. `http://localhost:5113`).
- Swagger UI is available at `<base-url>/swagger` in Development mode.
- SQLite database `ProductManagement.db` is created automatically on first run.

### 2. Frontend

```bash
cd frontend/product-management-ui

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Open **http://localhost:3000** in your browser.

> The Vite dev server proxies requests to `/api` → the backend, so no CORS setup is needed during local development.

### 3. Configuration

#### Backend

The connection string lives in `backend/ProductManagement.Api/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Data Source=ProductManagement.db"
}
```

To switch to SQL Server in production, update the connection string and swap `UseSqlite` for `UseSqlServer` in `ProductManagement.Infrastructure/DependencyInjection.cs` (add the `Microsoft.EntityFrameworkCore.SqlServer` package).

#### Frontend

The frontend uses Vite env variables. Files:

| File | Purpose |
|---|---|
| `.env` | Committed defaults |
| `.env.development` | Overrides for `npm run dev` |
| `.env.production` | Overrides for `npm run build` |
| `.env.local` | Personal overrides (gitignored) |

Example:
```
VITE_API_BASE_URL=/api                            # Development (via Vite proxy)
VITE_API_BASE_URL=https://api.mycompany.com/api   # Production
```

Restart the dev server after editing env files.

---

## API Reference

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/products?pageNumber=1&pageSize=10` | Paginated list of active products | `200` |
| `GET` | `/api/products/{id}` | Get a single product | `200`, `404` |
| `POST` | `/api/products` | Create a product | `201`, `400`, `409` |
| `PUT` | `/api/products/{id}` | Update a product | `200`, `400`, `404`, `409` |
| `DELETE` | `/api/products/{id}` | Soft-delete (sets `IsDeleted = true`) | `204`, `404` |

**Sample request body:**
```json
{
  "name": "Running Shoes",
  "description": "Lightweight trail runners",
  "price": 89.99
}
```

**Business rules enforced:**
- `Name` — required, max 100 characters, unique across active products
- `Price` — must be greater than zero
- `DELETE` — sets `IsDeleted = true`; row remains in the database

---

## IIS Deployment (Backend)

### One-Time Server Prerequisites

1. **Enable IIS** — from *Server Manager* or *Windows Features*:
   - Web Server (IIS)
   - Web Server → Application Development → WebSocket Protocol *(optional)*
   - Management Tools → IIS Management Console

2. **Install the ASP.NET Core Hosting Bundle**
   Download from https://dotnet.microsoft.com/download/dotnet — choose the version matching your app (e.g. .NET 10 Hosting Bundle) and the **"Hosting Bundle"** variant.
   This installs:
   - The .NET runtime
   - The **ASP.NET Core Module (ANCM)** for IIS
   - The `dotnet` process handler
   
   After installation, restart IIS:
   ```powershell
   net stop was /y
   net start w3svc
   ```

---

### Deployment Steps

#### 1. Publish the application

From your development machine, run:

```bash
cd backend/ProductManagement.Api
dotnet publish -c Release -o ./publish
```

This produces a framework-dependent output in `./publish/`.

For a self-contained deployment (no .NET runtime needed on the server):
```bash
dotnet publish -c Release -r win-x64 --self-contained true -o ./publish
```

#### 2. Copy the publish output to the server

Copy the entire `./publish/` folder contents to a chosen path on the server, e.g.:
```
C:\inetpub\wwwroot\ProductManagement\
```

#### 3. Configure production settings

Edit `appsettings.Production.json` (or set environment variables) on the server:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=ProductManagementDb;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

Sensitive values should ideally come from environment variables, Azure Key Vault, or IIS-level configuration — not committed files.

#### 4. Create a dedicated Application Pool

In **IIS Manager**:

1. Right-click **Application Pools → Add Application Pool**
2. Configure:
   - **Name:** `ProductManagementPool`
   - **.NET CLR version:** `No Managed Code`
     > ASP.NET Core runs its own out-of-process runtime — it does not use the IIS managed pipeline.
   - **Managed pipeline mode:** `Integrated`
3. Right-click the pool → **Advanced Settings**:
   - **Identity:** `ApplicationPoolIdentity` (default — least privilege)
   - **Start Mode:** `AlwaysRunning` *(optional, keeps the app warm)*

#### 5. Create the Website (or Application)

1. Right-click **Sites → Add Website**
2. Configure:
   - **Site name:** `ProductManagement`
   - **Application pool:** `ProductManagementPool`
   - **Physical path:** `C:\inetpub\wwwroot\ProductManagement\`
   - **Binding:** HTTP/HTTPS on your chosen port + hostname
3. For HTTPS, add an SSL binding and select an installed certificate.

#### 6. Verify `web.config`

The publish output includes a `web.config` generated by the SDK. Confirm it contains the ANCM handler and points to your DLL:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <location path="." inheritInChildApplications="false">
    <system.webServer>
      <handlers>
        <add name="aspNetCore"
             path="*"
             verb="*"
             modules="AspNetCoreModuleV2"
             resourceType="Unspecified" />
      </handlers>
      <aspNetCore processPath="dotnet"
                  arguments=".\ProductManagement.Api.dll"
                  stdoutLogEnabled="false"
                  stdoutLogFile=".\logs\stdout"
                  hostingModel="inprocess" />
    </system.webServer>
  </location>
</configuration>
```

Notes:
- `hostingModel="inprocess"` — best performance; app runs inside the IIS worker process (`w3wp.exe`).
- `stdoutLogEnabled="true"` — enable temporarily to debug startup failures.

#### 7. Grant folder permissions

The application pool identity needs read/execute on the app folder and write access anywhere the app persists data (SQLite database, logs):

```powershell
icacls "C:\inetpub\wwwroot\ProductManagement" `
  /grant "IIS AppPool\ProductManagementPool:(OI)(CI)RX"

# If using SQLite in production, also grant Modify on the DB directory:
icacls "C:\inetpub\wwwroot\ProductManagement" `
  /grant "IIS AppPool\ProductManagementPool:(OI)(CI)M"
```

#### 8. Apply database migrations

**Option A (default in this project)** — the app auto-migrates on startup via `db.Database.MigrateAsync()` in `Program.cs`.

**Option B (recommended for production)** — generate an idempotent SQL script and run it via SSMS or `sqlcmd`, then disable auto-migration:

```bash
dotnet ef migrations script --idempotent -o migrate.sql \
  -p ProductManagement.Infrastructure -s ProductManagement.Api
```

#### 9. Set the environment variable

In **IIS Manager → your site → Configuration Editor**, navigate to `system.webServer/aspNetCore` → `environmentVariables` and add:

| Name | Value |
|---|---|
| `ASPNETCORE_ENVIRONMENT` | `Production` |

This disables Swagger, detailed error pages, and other Development-only middleware.

#### 10. Test

Browse to your site's URL — e.g. `https://products.mycompany.com/api/products`. You should receive a JSON response.

---

### Deployment Checklist

- [ ] ASP.NET Core Hosting Bundle installed
- [ ] IIS restarted after Hosting Bundle install
- [ ] Publish output copied to server
- [ ] Dedicated App Pool with **No Managed Code**
- [ ] `web.config` present with correct DLL name
- [ ] Production connection string configured
- [ ] Folder permissions granted to app pool identity
- [ ] Database migrations applied
- [ ] `ASPNETCORE_ENVIRONMENT` = `Production`
- [ ] HTTPS binding with valid SSL certificate
- [ ] `stdoutLogEnabled="false"` (unless debugging)

---

### Troubleshooting

| Symptom | Cause / Fix |
|---|---|
| **HTTP 500.19** on browse | `web.config` malformed, or ANCM not installed → reinstall Hosting Bundle |
| **HTTP 500.30** on browse | App failed to start → enable `stdoutLogEnabled`, check `logs/` folder, review Windows Event Viewer → *Application* log |
| **HTTP 502.5** | Process failure → usually a bad connection string or missing dependency |
| **HTTP 403.14** | Directory browsing denied — normal if you hit the root without a route; try `/api/products` |
| **Permission denied** writing DB / logs | App pool identity lacks Modify — re-run the `icacls` command |
| **Site loads but API returns HTML** | You browsed to the SPA route; hit `/api/products` explicitly |

---

## Frontend Deployment (Brief)

For completeness — the frontend can be deployed to any static host:

```bash
cd frontend/product-management-ui
npm run build
```

Deploy the contents of `dist/` to:
- **IIS** as a static site (install the *URL Rewrite* module for SPA fallback)
- Azure Static Web Apps / Netlify / Vercel / S3+CloudFront
- A separate IIS site behind the same reverse proxy as the backend

Ensure the frontend's `VITE_API_BASE_URL` points to the deployed backend URL, and that the backend's CORS policy in `Program.cs` includes the frontend's origin.

---

## License

MIT