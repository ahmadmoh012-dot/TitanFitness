using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TitanFitness.Domain.Memberships;

namespace TitanFitness.Infrastructure.Configurations;

public sealed class GuestPassConfiguration
    : IEntityTypeConfiguration<GuestPass>
{
    public void Configure(EntityTypeBuilder<GuestPass> builder)
    {
        builder.ToTable("GuestPasses");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.MembershipId)
            .IsRequired();

        builder.Property(x => x.IssuedOn)
            .IsRequired();

        builder.Property(x => x.UsedOn);

    }
}