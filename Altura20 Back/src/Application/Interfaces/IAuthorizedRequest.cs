namespace Altura20.Application.Interfaces;

/// <summary>
/// Marca un command/query como que requiere verificacion de permisos.
/// Implementar esta interfaz y declarar los codigos de permiso requeridos.
/// El AuthorizationBehavior intercepta el request antes de que llegue al handler.
/// </summary>
public interface IAuthorizedRequest
{
    IEnumerable<string> RequiredPermissions { get; }
}
