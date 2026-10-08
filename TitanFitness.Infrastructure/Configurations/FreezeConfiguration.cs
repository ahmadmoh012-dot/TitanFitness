using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TitanFitness.Domain.Memberships;

namespace TitanFitness.Infrastructure.Configurations;

public sealed class FreezeConfiguration : IEntityTypeConfiguration<Freeze>
{
    public void Configure(EntityTypeBuilder<Freeze> builder)
    {
        builder.ToTable("Freezes");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.MembershipId)
            .IsRequired();

        builder.Property(x => x.StartDate)
            .IsRequired();

        builder.Property(x => x.EndDate)
            .IsRequired();

        builder.Property(x => x.DurationInMonths)
            .IsRequired();

        builder.Property(x => x.Reason)
            .IsRequired();

        builder.Property(x => x.AdditionalNotes)
            .HasMaxLength(200);

        builder.Property(x => x.RequestedOn)
            .IsRequired();
    }
}