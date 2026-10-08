using MediatR;

namespace TitanFitness.Application.Members.GetMemberProfile;

public sealed record GetMemberProfileQuery(
    int MemberId)
    : IRequest<MemberProfileResponse>;