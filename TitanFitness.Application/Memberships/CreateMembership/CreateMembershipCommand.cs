using MediatR;

namespace TitanFitness.Application.Memberships.CreateMembership;

public sealed record CreateMembershipCommand(
    int MemberId,
    int PlanId,
    DateOnly StartDate
) : IRequest<int>;