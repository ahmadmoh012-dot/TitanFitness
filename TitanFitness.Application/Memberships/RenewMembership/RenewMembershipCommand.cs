using MediatR;

namespace TitanFitness.Application.Memberships.RenewMembership;

public sealed record RenewMembershipCommand(
    int MembershipId) : IRequest<int>;
