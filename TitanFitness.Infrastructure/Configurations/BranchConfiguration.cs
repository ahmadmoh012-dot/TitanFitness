using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TitanFitness.Domain.Branches;

namespace TitanFitness.Infrastructure.Configurations;

public sealed class BranchConfiguration : IEntityTypeConfiguration<Branch>
{
    public void Configure(EntityTypeBuilder<Branch> builder)
    {
        builder.ToTable("Branches");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Address)
            .HasMaxLength(200);

        builder.Property(x => x.OpeningTime)
            .IsRequired();

        builder.Property(x => x.ClosingTime)
            .IsRequired();

        builder.HasMany(x => x.Studios)
            .WithOne()
            .HasForeignKey(x => x.BranchId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}