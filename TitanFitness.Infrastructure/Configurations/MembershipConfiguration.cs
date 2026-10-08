using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TitanFitness.Domain.Members;
using TitanFitness.Domain.Memberships;
using TitanFitness.Domain.Plans;

namespace TitanFitness.Infrastructure.Configurations;

public sealed class MembershipConfiguration
    : IEntityTypeConfiguration<Membership>
{
    public void Configure(EntityTypeBuilder<Membership> builder)
    {
        builder.ToTable("Memberships");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.MemberId)
            .IsRequired();

        builder.Property(x => x.PlanId)
            .IsRequired();

        builder.Property(x => x.PurchaseDate)
            .IsRequired();

        builder.Property(x => x.StartDate)
            .IsRequired();

        builder.Property(x => x.EndDate)
            .IsRequired();

        builder.Property(x => x.Status)
            .IsRequired();

        builder.HasOne<Member>()
            .WithMany()
            .HasForeignKey(x => x.MemberId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Plan>()
            .WithMany()
            .HasForeignKey(x => x.PlanId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.OwnsOne(x => x.AgreedTerms, terms =>
        {
            terms.Property(x => x.PricePaid)
                .HasPrecision(18, 2)
                .IsRequired();

            terms.Property(x => x.DurationInMonths)
                .IsRequired();

            terms.Property(x => x.MaximumFreezeDays)
                .IsRequired();

            terms.Property(x => x.MaximumNumberOfFreezes)
                .IsRequired();

            terms.Property(x => x.GuestPassQuota)
                .IsRequired();

            terms.Property(x => x.AccessScope)
                .IsRequired();
        });

        builder.HasMany(x => x.Freezes)
            .WithOne()
            .HasForeignKey(x => x.MembershipId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.GuestPasses)
            .WithOne()
            .HasForeignKey(x => x.MembershipId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(x => x.Freezes)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.Navigation(x => x.GuestPasses)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasIndex(x => x.MemberId);

        builder.HasIndex(x => x.PlanId);
    }
}