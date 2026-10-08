using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TitanFitness.Domain.Branches;
using TitanFitness.Domain.Trainers;

namespace TitanFitness.Infrastructure.Configurations;

public sealed class TrainerConfiguration : IEntityTypeConfiguration<Trainer>
{
    public void Configure(EntityTypeBuilder<Trainer> builder)
    {
        builder.ToTable("Trainers");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.TrainerNumber)
            .IsRequired();

        builder.HasIndex(x => x.TrainerNumber)
            .IsUnique();

        builder.Property(x => x.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Specialty);

        builder.Property(x => x.BranchId)
            .IsRequired();

        builder.Property(x => x.Email)
            .HasMaxLength(100);

        builder.Property(x => x.Phone)
            .HasMaxLength(20);

        builder.Property(x => x.IsActive)
            .IsRequired();

        builder.HasOne<Branch>()
            .WithMany()
            .HasForeignKey(x => x.BranchId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}