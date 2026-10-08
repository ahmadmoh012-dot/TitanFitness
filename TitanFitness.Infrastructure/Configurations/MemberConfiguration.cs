using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TitanFitness.Domain.Branches;
using TitanFitness.Domain.Members;

namespace TitanFitness.Infrastructure.Configurations;

public sealed class MemberConfiguration : IEntityTypeConfiguration<Member>
{
    public void Configure(EntityTypeBuilder<Member> builder)
    {
        builder.ToTable("Members");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.MembershipNumber)
            .HasMaxLength(10)
            .IsRequired();

        builder.HasIndex(x => x.MembershipNumber)
            .IsUnique();

        builder.Property(x => x.FullName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Email)
            .HasMaxLength(100);

        builder.Property(x => x.Phone)
            .HasMaxLength(20);

        builder.Property(x => x.Address)
            .HasMaxLength(200);

        builder.Property(x => x.JoinedDate)
            .IsRequired();

        builder.Property(x => x.Photo);

        builder.Property(x => x.HomeBranchId)
            .IsRequired();

        builder.HasOne<Branch>()
            .WithMany()
            .HasForeignKey(x => x.HomeBranchId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}