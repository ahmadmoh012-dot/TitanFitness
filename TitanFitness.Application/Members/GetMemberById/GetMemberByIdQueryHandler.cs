using MediatR;
using TitanFitness.Domain.Common;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Members;
using TitanFitness.Application.Common.Exceptions;

namespace TitanFitness.Application.Members.GetMemberById;

public sealed class GetMemberByIdQueryHandler
    : IRequestHandler<GetMemberByIdQuery, MemberDetailsResponse>
{
    private readonly IReadRepository<Member> _memberReadRepository;

    public GetMemberByIdQueryHandler(
        IReadRepository<Member> memberReadRepository)
    {
        _memberReadRepository = memberReadRepository;
    }

    public async Task<MemberDetailsResponse> Handle(
        GetMemberByIdQuery request,
        CancellationToken cancellationToken)
    {
        var member = await _memberReadRepository.GetByIdAsync(
       request.Id,
       cancellationToken);

        if (member is null)
            throw new NotFoundException("Member was not found.");

        return new MemberDetailsResponse(
            member.Id,
            member.MembershipNumber,
            member.FullName,
            member.Email,
            member.Phone,
            member.Address,
            member.JoinedDate,
            member.Photo,
            member.HomeBranchId);
    }
}