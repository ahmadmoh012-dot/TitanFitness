using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TitanFitness.Domain.Branches;
using TitanFitness.Domain.CheckIns;
using TitanFitness.Domain.Members;

namespace TitanFitness.Infrastructure.Configurations;

public sealed class CheckInConfiguration
    : IEntityTypeConfiguration<CheckIn>
{
    public void Configure(EntityTypeBuilder<CheckIn> builder)
    {
        builder.ToTable("CheckIns");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.MemberId)
            .IsRequired();

        builder.Property(x => x.BranchId)
            .IsRequired();

        builder.Property(x => x.CheckedInAt)
            .IsRequired();

        builder.Property(x => x.Result)
            .IsRequired();

        builder.Property(x => x.RefusalReason)
            .HasMaxLength(100);

        builder.HasOne<Member>()
            .WithMany()
            .HasForeignKey(x => x.MemberId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Branch>()
            .WithMany()
            .HasForeignKey(x => x.BranchId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.MemberId);

        builder.HasIndex(x => x.BranchId);

        builder.HasIndex(x => x.CheckedInAt);
    }
}