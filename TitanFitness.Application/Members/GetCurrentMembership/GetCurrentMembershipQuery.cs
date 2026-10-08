using MediatR;

namespace TitanFitness.Application.Members.GetCurrentMembership;

public sealed record GetCurrentMembershipQuery(int MemberId)
    : IRequest<CurrentMembershipResponse?>;