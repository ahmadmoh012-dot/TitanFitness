using MediatR;
using TitanFitness.Domain.Memberships;

namespace TitanFitness.Application.Memberships.AddFreeze;

public sealed record AddFreezeCommand(
    int MembershipId,
    DateOnly StartDate,
    int DurationInMonths,
    FreezeReason Reason,
    string? AdditionalNotes) : IRequest;