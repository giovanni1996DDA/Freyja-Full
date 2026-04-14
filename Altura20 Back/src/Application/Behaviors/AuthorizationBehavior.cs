using Altura20.Application.Interfaces;
using Altura20.Domain.Common;
using MediatR;

namespace Altura20.Application.Behaviors;

public class AuthorizationBehavior<TRequest, TResponse>(ICurrentUserService currentUser)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (request is not IAuthorizedRequest authorizedRequest)
            return await next(cancellationToken);

        var required = authorizedRequest.RequiredPermissions.ToList();

        if (required.Count == 0)
            return await next(cancellationToken);

        if (!currentUser.IsAuthenticated)
            return Forbidden("Authentication required.");
        //revisar la logica de validacion de permisos
        var missing = required.Except(currentUser.PermissionCodes).ToList();

        if (missing.Count > 0)
            return Forbidden($"Missing permissions: {string.Join(", ", missing)}");

        return await next(cancellationToken);
    }

    private static TResponse Forbidden(string error)
    {
        var type = typeof(TResponse);

        if (type == typeof(Result))
            return (TResponse)(object)Result.Failure(error);

        if (type.IsGenericType && type.GetGenericTypeDefinition() == typeof(Result<>))
        {
            var innerType = type.GetGenericArguments()[0];
            var method = typeof(Result)
                .GetMethod(nameof(Result.Failure), [typeof(string)])!
                .MakeGenericMethod(innerType);
            return (TResponse)method.Invoke(null, [error])!;
        }

        throw new InvalidOperationException(
            $"AuthorizationBehavior: TResponse '{type.Name}' must be Result or Result<T>.");
    }
}
