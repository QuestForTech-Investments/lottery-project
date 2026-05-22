using Microsoft.AspNetCore.Mvc;

namespace LotteryApi.Helpers;

/// <summary>
/// Helpers for returning structured error responses that carry a stable
/// <c>errorCode</c> the frontend can map to a translated message.
///
/// Both call shapes are supported:
///   - <see cref="Error(string, string, int)"/> — explicit status code
///   - <see cref="BadRequest(string, string)"/>, <see cref="NotFound(string, string)"/>,
///     <see cref="Conflict(string, string)"/> — common shortcuts
///
/// The response body shape matches what <c>ErrorHandlingMiddleware</c> emits for
/// thrown <c>BusinessException</c>s, so the frontend sees one consistent format
/// regardless of whether the controller returned or threw.
/// </summary>
public static class ApiErrorResult
{
    public static ObjectResult Error(string errorCode, string detail, int statusCode = 400)
    {
        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = TitleForStatus(statusCode),
            Detail = detail
        };
        problem.Extensions["errorCode"] = errorCode;
        return new ObjectResult(problem) { StatusCode = statusCode };
    }

    public static ObjectResult BadRequest(string errorCode, string detail) =>
        Error(errorCode, detail, 400);

    public static ObjectResult NotFound(string errorCode, string detail) =>
        Error(errorCode, detail, 404);

    public static ObjectResult Conflict(string errorCode, string detail) =>
        Error(errorCode, detail, 409);

    public static ObjectResult Unauthorized(string errorCode, string detail) =>
        Error(errorCode, detail, 401);

    public static ObjectResult Forbidden(string errorCode, string detail) =>
        Error(errorCode, detail, 403);

    private static string TitleForStatus(int status) => status switch
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
