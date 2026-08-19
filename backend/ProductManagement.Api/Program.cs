using Microsoft.EntityFrameworkCore;
using ProductManagement.Application;
using ProductManagement.Infrastructure;
using ProductManagement.Infrastructure.Persistence;
using ProductManagement.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

// ── Service Registration ──────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title = "Product Management API",
        Version = "v1",
        Description = "A RESTful API for managing products with soft-delete support."
    });
});

// Register Application and Infrastructure layers via extension methods
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Register the global exception handler middleware
builder.Services.AddTransient<GlobalExceptionHandler>();

// CORS — allows the React dev server to communicate with the API
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactDevClient", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",  // CRA
                "http://localhost:5173")  // Vite
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// ── Middleware Pipeline ───────────────────────────────────────────────────────
app.UseMiddleware<GlobalExceptionHandler>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Product API v1"));
}

app.UseHttpsRedirection();
app.UseCors("ReactDevClient");
app.MapControllers();

// ── Auto-apply Migrations on Startup ─────────────────────────────────────────
// Convenient for development/SQLite; for production prefer explicit migration scripts
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

app.Run();