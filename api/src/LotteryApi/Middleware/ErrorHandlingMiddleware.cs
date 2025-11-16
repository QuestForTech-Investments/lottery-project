using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Exceptions;

namespace LotteryApi.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        // ✅ IMPROVED: Handle custom business exceptions
        if (exception is BusinessException businessEx)
        {
            context.Response.StatusCode = businessEx.StatusCode;
            context.Response.ContentType = "application/problem+json";

            var problemDetails = new ProblemDetails
            {
                Status = businessEx.StatusCode,
                Title = GetTitleFromStatusCode(businessEx.StatusCode),
                Detail = businessEx.Message,
                Instance = context.Request.Path
            };

            // Add validation errors if present
            if (businessEx.Errors != null)
            {
                problemDetails.Extensions["errors"] = businessEx.Errors;
            }

            await WriteResponseAsync(context, problemDetails);
            return;
        }

        // ✅ IMPROVED: Handle database-specific exceptions
        if (exception is DbUpdateException dbEx && dbEx.InnerException is SqlException sqlEx)
        {
            var (statusCode, message) = HandleSqlException(sqlEx);
            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/problem+json";

            var problemDetails = new ProblemDetails
            {
                Status = statusCode,
                Title = GetTitleFromStatusCode(statusCode),
                Detail = message,
                Instance = context.Request.Path
            };

            await WriteResponseAsync(context, problemDetails);
            return;
        }

        // ✅ IMPROVED: Handle standard .NET exceptions
        var (defaultStatusCode, defaultTitle) = exception switch
        {
            ArgumentException => ((int)HttpStatusCode.BadRequest, "Bad Request"),
            UnauthorizedAccessException => ((int)HttpStatusCode.Unauthorized, "Unauthorized"),
            KeyNotFoundException => ((int)HttpStatusCode.NotFound, "Not Found"),
            InvalidOperationException => ((int)HttpStatusCode.Conflict, "Conflict"),
            _ => ((int)HttpStatusCode.InternalServerError, "Internal Server Error")
        };

        context.Response.StatusCode = defaultStatusCode;
        context.Response.ContentType = "application/problem+json";

        var defaultProblemDetails = new ProblemDetails
        {
            Status = defaultStatusCode,
            Title = defaultTitle,
            Detail = exception.Message,
            Instance = context.Request.Path
        };

        await WriteResponseAsync(context, defaultProblemDetails);
    }

    private static (int statusCode, string message) HandleSqlException(SqlException sqlEx)
    {
        return sqlEx.Number switch
        {
            // Unique constraint violation
            2601 or 2627 => (409, "Ya existe un registro con estos datos"),
            // Foreign key violation
            547 => (409, "No se puede eliminar el registro porque está siendo utilizado"),
            // Cannot insert NULL
            515 => (400, "Faltan datos requeridos"),
            // Timeout
            -2 => (408, "La operación tardó demasiado tiempo"),
            _ => (500, "Error en la base de datos")
        };
    }

    private static string GetTitleFromStatusCode(int statusCode)
    {
        return statusCode switch
        {
            400 => "Bad Request",
            401 => "Unauthorized",
            403 => "Forbidden",
            404 => "Not Found",
            409 => "Conflict",
            422 => "Unprocessable Entity",
            500 => "Internal Server Error",
            _ => "Error"
        };
    }

    private static async Task WriteResponseAsync(HttpContext context, ProblemDetails problemDetails)
    {
        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var json = JsonSerializer.Serialize(problemDetails, options);
        await context.Response.WriteAsync(json);
    }
}
