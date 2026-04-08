using Altura20.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Altura20.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Product> Products { get; }
    DbSet<User> Users { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
