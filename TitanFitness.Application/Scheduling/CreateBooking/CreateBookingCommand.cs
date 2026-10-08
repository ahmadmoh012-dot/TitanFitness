using MediatR;
using TitanFitness.Application.Scheduling.CreateBooking;

public sealed record CreateBookingCommand(
    int SessionId,
    int MemberId,
    string? NotesForTrainer) : IRequest<CreateBookingResponse>;