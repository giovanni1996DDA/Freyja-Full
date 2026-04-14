using Altura20.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Altura20.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);

        builder.Property(u => u.Username)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(u => u.Username)
            .IsUnique();

        builder.Property(u => u.PasswordHash)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(u => u.Name)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(u => u.LastName)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(u => u.Email)
            .IsUnique();

        // User → DirectPermissions (UserPermissionRelation)
        builder.HasMany(u => u.DirectPermissions)
            .WithMany()
            .UsingEntity("UserPermissionRelation",
                l => l.HasOne(typeof(Permission)).WithMany().HasForeignKey("IDPermission"),
                r => r.HasOne(typeof(User)).WithMany().HasForeignKey("IDUser"),
                j => { j.HasKey("IDUser", "IDPermission"); });

        // User → Roles (UserRoleRelation)
        builder.HasMany(u => u.Roles)
            .WithMany()
            .UsingEntity("UserRoleRelation",
                l => l.HasOne(typeof(Role)).WithMany().HasForeignKey("IDRole"),
                r => r.HasOne(typeof(User)).WithMany().HasForeignKey("IDUser"),
                j => { j.HasKey("IDUser", "IDRole"); });
    }
}
