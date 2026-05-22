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

            // i18n: the frontend translates `errorCode` to the active language and
            // falls back to `detail` (Spanish) when no translation is registered.
            if (!string.IsNullOrEmpty(businessEx.ErrorCode))
            {
                problemDetails.Extensions["errorCode"] = businessEx.ErrorCode;
            }

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
            var (statusCode, errorCode, message) = HandleSqlException(sqlEx);
            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/problem+json";

            var problemDetails = new ProblemDetails
            {
                Status = statusCode,
                Title = GetTitleFromStatusCode(statusCode),
                Detail = message,
                Instance = context.Request.Path
            };
            problemDetails.Extensions["errorCode"] = errorCode;

            await WriteResponseAsync(context, problemDetails);
            return;
        }

        // ✅ IMPROVED: Handle standard .NET exceptions
        var (defaultStatusCode, defaultTitle, defaultErrorCode) = exception switch
        {
            ArgumentException => ((int)HttpStatusCode.BadRequest, "Bad Request", "BAD_REQUEST"),
            UnauthorizedAccessException => ((int)HttpStatusCode.Unauthorized, "Unauthorized", "UNAUTHORIZED"),
            KeyNotFoundException => ((int)HttpStatusCode.NotFound, "Not Found", "NOT_FOUND"),
            InvalidOperationException => ((int)HttpStatusCode.Conflict, "Conflict", "CONFLICT"),
            _ => ((int)HttpStatusCode.InternalServerError, "Internal Server Error", "INTERNAL_ERROR")
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
        defaultProblemDetails.Extensions["errorCode"] = defaultErrorCode;

        await WriteResponseAsync(context, defaultProblemDetails);
    }

    private static (int statusCode, string errorCode, string message) HandleSqlException(SqlException sqlEx)
    {
        return sqlEx.Number switch
        {
            // Unique constraint violation
            2601 or 2627 => (409, "DB_UNIQUE_CONSTRAINT", "Ya existe un registro con estos datos"),
            // Foreign key violation
            547 => (409, "DB_FK_IN_USE", "No se puede eliminar el registro porque está siendo utilizado"),
            // Cannot insert NULL
            515 => (400, "DB_MISSING_REQUIRED", "Faltan datos requeridos"),
            // Timeout
            -2 => (408, "DB_TIMEOUT", "La operación tardó demasiado tiempo"),
            _ => (500, "DB_GENERIC", "Error en la base de datos")
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
