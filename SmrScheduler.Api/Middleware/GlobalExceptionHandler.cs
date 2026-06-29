using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace SmrScheduler.Api.Middleware;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext context,
        Exception exception,
        CancellationToken cancellationToken)
    {
        logger.LogError(exception, "Unhandled exception for {Method} {Path}",
            context.Request.Method, context.Request.Path);

        var (statusCode, title) = exception switch
        {
            KeyNotFoundException  => (StatusCodes.Status404NotFound,  "Resource not found"),
            InvalidOperationException e when e.Message.StartsWith("CONFLICT")
                                 => (StatusCodes.Status409Conflict,   "Conflict"),
            InvalidOperationException => (StatusCodes.Status400BadRequest, "Invalid operation"),
            _                    => (StatusCodes.Status500InternalServerError, "An unexpected error occurred")
        };

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title  = title,
            Detail = exception.Message,
        };

        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsJsonAsync(problem, cancellationToken);
        return true;
    }
}
