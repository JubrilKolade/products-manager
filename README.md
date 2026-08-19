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

### Prerequisites (one-time setup on the server)

1. **Enable IIS** — *Control Panel → Turn Windows features on or off → Internet Information Services*
2. **Install the ASP.NET Core Hosting Bundle** matching your app's target framework (e.g this project uses .NET 10) from https://dotnet.microsoft.com/download/dotnet — this installs the .NET runtime and the ASP.NET Core Module (ANCM) required by IIS
3. Restart IIS: `iisreset`

### Deployment steps

1. **Publish the app**
   ```bash
   cd backend/ProductManagement.Api
   dotnet publish -c Release -o ./publish
   ```

2. **Copy** the contents of `./publish/` to the server, e.g. `C:\inetpub\wwwroot\ProductManagement\`

3. **Create an Application Pool** in IIS Manager:
   - Name: `ProductManagementPool`
   - **.NET CLR version: `No Managed Code`** — ASP.NET Core runs its own Kestrel server; IIS acts only as a reverse proxy via ANCM, so the managed CLR isn't needed
   - Identity: `ApplicationPoolIdentity` (default — least privilege)

4. **Create the site** in IIS Manager pointing to the publish folder and assigning the pool above. Add HTTP/HTTPS bindings as needed.

5. **Set production settings** — in *Configuration Editor → `system.webServer/aspNetCore` → environmentVariables*, add `ASPNETCORE_ENVIRONMENT=Production`. Update `appsettings.Production.json` with the production connection string.

6. **Grant permissions** for the app pool identity to read the folder (and write anywhere the app persists data):
   ```powershell
   icacls "C:\inetpub\wwwroot\ProductManagement" `
     /grant "IIS AppPool\ProductManagementPool:(OI)(CI)RX"
   ```

7. **Browse** to your site — the API is live at `/api/products`.

### Notes

- The publish output includes a `web.config` with `hostingModel="inprocess"` for best performance (app runs inside `w3wp.exe`).
- Swagger is intentionally disabled outside Development to avoid leaking API surface details in production.
- Database migrations auto-apply on startup. For production, prefer generating an idempotent SQL script (`dotnet ef migrations script --idempotent`) and running it manually.

### Troubleshooting

| Error | Likely cause |
|---|---|
| `500.19` | Malformed `web.config` or ANCM missing — reinstall Hosting Bundle |
| `500.30` | App failed to start — set `stdoutLogEnabled="true"` in `web.config` and check `logs/stdout*.log` |
| `502.5` | Process failure — usually a bad connection string or missing dependency |
| Permission denied writing DB / logs | Re-run the `icacls` command above with `M` (Modify) instead of `RX` |
---

## Frontend Deployment


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