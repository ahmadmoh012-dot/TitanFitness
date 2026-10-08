using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TitanFitness.Domain.Plans;

namespace TitanFitness.Infrastructure.Configurations;

public sealed class PlanConfiguration : IEntityTypeConfiguration<Plan>
{
    public void Configure(EntityTypeBuilder<Plan> builder)
    {
        builder.ToTable("Plans");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Price)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.DurationInMonths)
            .IsRequired();

        builder.Property(x => x.MaximumFreezeDays)
            .IsRequired();

        builder.Property(x => x.MaximumNumberOfFreezes)
            .IsRequired();

        builder.Property(x => x.GuestPassQuota)
            .IsRequired();

        builder.Property(x => x.AccessScope)
            .IsRequired();

        builder.Property(x => x.IsPublished)
            .IsRequired();
    }
}