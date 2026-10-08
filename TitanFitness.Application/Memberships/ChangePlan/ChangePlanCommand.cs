using MediatR;


namespace TitanFitness.Application.Memberships.ChangePlan;

public sealed record ChangePlanCommand(
    int MembershipId,
    int NewPlanId,
    bool ApplyImmediately) : IRequest<int>;