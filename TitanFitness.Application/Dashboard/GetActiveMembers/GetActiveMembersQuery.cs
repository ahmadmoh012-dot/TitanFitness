using MediatR;

namespace TitanFitness.Application.Dashboard.GetActiveMembers;

public sealed record GetActiveMembersQuery
    : IRequest<GetActiveMembersResponse>;