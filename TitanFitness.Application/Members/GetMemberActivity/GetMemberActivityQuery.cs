using MediatR;

namespace TitanFitness.Application.Members.GetMemberActivity;

public sealed record GetMemberActivityQuery(
    int MemberId,
    int Take = 7)
    : IRequest<IReadOnlyCollection<MemberActivityResponse>>;