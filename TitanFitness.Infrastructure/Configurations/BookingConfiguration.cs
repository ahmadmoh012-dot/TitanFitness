using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TitanFitness.Domain.Members;
using TitanFitness.Domain.Scheduling;

namespace TitanFitness.Infrastructure.Configurations;

public sealed class BookingConfiguration
    : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.ToTable("Bookings");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.SessionId)
            .IsRequired();

        builder.Property(x => x.MemberId)
            .IsRequired();

        builder.Property(x => x.BookedOn)
            .IsRequired();

        builder.Property(x => x.Status)
            .IsRequired();

        builder.Property(x => x.WaitlistPosition);

        builder.Property(x => x.NotesForTrainer)
               .HasMaxLength(500);
        builder.HasOne<Member>()
            .WithMany()
            .HasForeignKey(x => x.MemberId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.SessionId);

        builder.HasIndex(x => x.MemberId);
    }
}