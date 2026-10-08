using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TitanFitness.Domain.Branches;
using TitanFitness.Domain.Scheduling;
using TitanFitness.Domain.Trainers;

namespace TitanFitness.Infrastructure.Configurations;

public sealed class ClassSessionConfiguration
    : IEntityTypeConfiguration<ClassSession>
{
    public void Configure(EntityTypeBuilder<ClassSession> builder)
    {
        builder.ToTable("ClassSessions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ClassName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.BranchId)
            .IsRequired();

        builder.Property(x => x.StudioId)
            .IsRequired();

        builder.Property(x => x.TrainerId)
            .IsRequired();

        builder.Property(x => x.SessionDate)
            .IsRequired();

        builder.Property(x => x.StartTime)
            .IsRequired();

        builder.Property(x => x.DurationInMinutes)
            .IsRequired();

        builder.Property(x => x.CapacityLimit)
            .IsRequired();

        builder.Property(x => x.Status)
            .IsRequired();

        builder.Property(x => x.Description)
            .HasMaxLength(500);

        builder.HasOne<Branch>()
            .WithMany()
            .HasForeignKey(x => x.BranchId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Studio>()
            .WithMany()
            .HasForeignKey(x => x.StudioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Trainer>()
            .WithMany()
            .HasForeignKey(x => x.TrainerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Bookings)
            .WithOne()
            .HasForeignKey(x => x.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(x => x.Bookings)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}