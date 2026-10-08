using MediatR;

namespace TitanFitness.Application.Memberships.GetMembershipById;

public sealed record GetMembershipByIdQuery(int Id)
    : IRequest<MembershipDetailsResponse>;
