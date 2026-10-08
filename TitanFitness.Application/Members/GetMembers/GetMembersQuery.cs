using MediatR;

namespace TitanFitness.Application.Members.GetMembers;

public sealed record GetMembersQuery(
    int? BranchId,
    string? Search,
    int Page = 1) : IRequest<GetMembersResponse>;