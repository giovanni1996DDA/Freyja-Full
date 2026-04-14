using Altura20.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Altura20.Infrastructure.Persistence.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.Name)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(r => r.Name)
            .IsUnique();

        builder.Property(r => r.Description)
            .HasMaxLength(200);

        // Role → Permissions (RolePermissionRelation)
        builder.HasMany(r => r.Permissions)
            .WithMany()
            .UsingEntity("RolePermissionRelation",
                l => l.HasOne(typeof(Permission)).WithMany().HasForeignKey("IDPermission"),
                r => r.HasOne(typeof(Role)).WithMany().HasForeignKey("IDRole"),
                j => { j.HasKey("IDRole", "IDPermission"); });

        // Role → ChildRoles self-referencing (RoleRoleRelation)
        builder.HasMany(r => r.ChildRoles)
            .WithMany()
            .UsingEntity("RoleRoleRelation",
                l => l.HasOne(typeof(Role)).WithMany().HasForeignKey("IDChildRole"),
                r => r.HasOne(typeof(Role)).WithMany().HasForeignKey("IDParentRole"),
                j => { j.HasKey("IDParentRole", "IDChildRole"); });
    }
}
