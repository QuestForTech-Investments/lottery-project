using System.Text;
using System.IO.Compression;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using AspNetCoreRateLimit;
using FluentValidation;
using FluentValidation.AspNetCore;
using LotteryApi.Data;
using LotteryApi.Hubs;
using LotteryApi.Middleware;
using LotteryApi.Repositories;
using LotteryApi.Services;
using LotteryApi.Services.ExternalResults;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/lottery-api-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Configure JSON serialization to use camelCase (JavaScript standard)
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// Configure FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// Configure Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<LotteryDbContext>(options =>
    options.UseSqlServer(connectionString));

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is not configured");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "LotteryApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "LotteryApi";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };

    // Configure JWT authentication for SignalR
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // Read token from query string for SignalR connections
            var accessToken = context.Request.Query["access_token"];

            // If the request is for our hub...
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// Register Unit of Work (coordinates repositories and transactions)
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Register Repositories (still available for direct injection if needed)
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<ILotteryRepository, LotteryRepository>();
builder.Services.AddScoped<IDrawRepository, DrawRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPermissionRepository, PermissionRepository>();

// Register Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ILoginSessionService, LoginSessionService>();
builder.Services.AddSingleton<ICacheService, MemoryCacheService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// Register External Results Services (lottery results fetching and ticket processing)
builder.Services.AddExternalResultsServices(builder.Configuration);

// Register Memory Cache for performance
builder.Services.AddMemoryCache();

// Configure SignalR
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
    options.MaximumReceiveMessageSize = 32 * 1024; // 32 KB
});

// Configure Response Compression
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[]
    {
        "application/json",
        "application/xml",
        "text/plain",
        "text/json",
        "text/xml"
    });
});

builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Optimal;
});

builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Optimal;
});

// Configure Rate Limiting
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

// ✅ IMPROVED: Configure CORS específico por ambiente (Security Enhancement)
builder.Services.AddCors(options =>
{
    if (builder.Environment.IsDevelopment())
    {
        // Development: Permisivo para facilitar desarrollo local
        options.AddPolicy("DevPolicy", policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });

        // SignalR requires credentials, so we need specific origins
        options.AddPolicy("SignalRPolicy", policy =>
        {
            policy.WithOrigins("http://localhost:4001", "http://localhost:3000", "http://127.0.0.1:4001")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
    }
    else
    {
        // Production: Restrictivo para seguridad
        var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
            ?? new[] { "https://lotto-app.azurewebsites.net" };

        options.AddPolicy("ProdPolicy", policy =>
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();  // Permite cookies y auth headers
        });

        // SignalR policy for production (same as ProdPolicy but explicit)
        options.AddPolicy("SignalRPolicy", policy =>
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
    }

    // Política de fallback compatible con código legacy
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configure API Versioning
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new Microsoft.AspNetCore.Mvc.ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    // Support multiple versioning methods
    options.ApiVersionReader = Microsoft.AspNetCore.Mvc.Versioning.ApiVersionReader.Combine(
        new Microsoft.AspNetCore.Mvc.Versioning.UrlSegmentApiVersionReader(),
        new Microsoft.AspNetCore.Mvc.Versioning.QueryStringApiVersionReader("api-version"),
        new Microsoft.AspNetCore.Mvc.Versioning.HeaderApiVersionReader("X-Api-Version")
    );
});

// Configure Swagger - Multiple Versions (OpenAPI 3.0 + Swagger 2.0)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // OpenAPI 3.0 Document
    c.SwaggerDoc("v1-openapi3", new OpenApiInfo
    {
        Title = "Lottery API",
        Version = "v1",
        Description = "ASP.NET Core 8.0 Web API for Lottery Management System (OpenAPI 3.0)",
        Contact = new OpenApiContact
        {
            Name = "Lottery API Team",
            Email = "support@lotteryapi.com"
        },
        License = new OpenApiLicense
        {
            Name = "MIT",
            Url = new Uri("https://opensource.org/licenses/MIT")
        }
    });

    // Swagger 2.0 Document
    c.SwaggerDoc("v1-swagger2", new OpenApiInfo
    {
        Title = "Lottery API",
        Version = "v1",
        Description = "ASP.NET Core 8.0 Web API for Lottery Management System (Swagger 2.0)",
        Contact = new OpenApiContact
        {
            Name = "Lottery API Team",
            Email = "support@lotteryapi.com"
        },
        License = new OpenApiLicense
        {
            Name = "MIT",
            Url = new Uri("https://opensource.org/licenses/MIT")
        }
    });

    // Add JWT Bearer authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    // Include XML comments if available
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

var app = builder.Build();

// Configure the HTTP request pipeline.
// Use Response Compression (must be early in pipeline)
app.UseResponseCompression();

// Enable Swagger in all environments (configure production separately if needed)
app.UseSwagger(c =>
{
    c.RouteTemplate = "swagger/{documentName}/swagger.{json|yaml}";

    // Custom serialization for Swagger 2.0
    c.PreSerializeFilters.Add((swaggerDoc, httpReq) =>
    {
        swaggerDoc.Servers = new List<Microsoft.OpenApi.Models.OpenApiServer>
        {
            new Microsoft.OpenApi.Models.OpenApiServer
            {
                Url = $"{httpReq.Scheme}://{httpReq.Host.Value}",
                Description = app.Environment.EnvironmentName
            }
        };
    });

    // Serialize as OpenAPI 3.0 by default
    c.SerializeAsV2 = false;
});

// Custom middleware to handle Swagger 2.0 requests
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/swagger/v1-swagger2"))
    {
        // Force Swagger 2.0 serialization for this document
        context.Request.Headers["Accept"] = "application/json";
    }
    await next();
});

app.UseSwaggerUI(c =>
{
    // OpenAPI 3.0 Endpoints (JSON + YAML)
    c.SwaggerEndpoint("/swagger/v1-openapi3/swagger.json", "Lottery API v1 - OpenAPI 3.0 (JSON)");
    c.SwaggerEndpoint("/swagger/v1-openapi3/swagger.yaml", "Lottery API v1 - OpenAPI 3.0 (YAML)");

    // Swagger 2.0 Endpoints (JSON + YAML)
    c.SwaggerEndpoint("/swagger/v1-swagger2/swagger.json", "Lottery API v1 - Swagger 2.0 (JSON)");
    c.SwaggerEndpoint("/swagger/v1-swagger2/swagger.yaml", "Lottery API v1 - Swagger 2.0 (YAML)");

    c.RoutePrefix = string.Empty; // Serve Swagger UI at root
    c.DocumentTitle = "Lottery API - Documentation";
    c.DefaultModelsExpandDepth(2);
    c.DefaultModelExpandDepth(2);
    c.DisplayRequestDuration();
    c.EnableDeepLinking();
    c.EnableFilter();
    c.ShowExtensions();
});

// CORS must be first to handle preflight OPTIONS requests
app.UseCors("AllowAll");

// Use custom error handling middleware
app.UseMiddleware<ErrorHandlingMiddleware>();

// Use IP Rate Limiting
app.UseIpRateLimiting();

// app.UseHttpsRedirection(); // Commented out - API runs on HTTP only

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Map SignalR hubs
app.MapHub<LotteryHub>("/hubs/lottery")
    .RequireCors("SignalRPolicy");

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
    environment = app.Environment.EnvironmentName
}))
.AllowAnonymous();

// API info endpoint
app.MapGet("/api/info", () => Results.Ok(new
{
    name = "Lottery API",
    version = "1.0.0",
    description = "ASP.NET Core 8.0 Web API for Lottery Management System",
    environment = app.Environment.EnvironmentName,
    documentation = new
    {
        swaggerUI = "/swagger",
        openapi3Json = "/swagger/v1-openapi3/swagger.json",
        openapi3Yaml = "/swagger/v1-openapi3/swagger.yaml",
        swagger2Json = "/swagger/v1-swagger2/swagger.json",
        swagger2Yaml = "/swagger/v1-swagger2/swagger.yaml"
    }
}))
.AllowAnonymous();

try
{
    Log.Information("Starting Lottery API");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
