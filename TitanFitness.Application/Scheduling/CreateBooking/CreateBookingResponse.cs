using TitanFitness.Domain.Scheduling;

namespace TitanFitness.Application.Scheduling.CreateBooking;

public sealed record CreateBookingResponse(
    int BookingId,
    BookingStatus Status,
    int? WaitlistPosition);