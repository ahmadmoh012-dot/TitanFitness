using MediatR;
using TitanFitness.Application.Common.Exceptions;
using TitanFitness.Domain.CheckIns;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Members;
using TitanFitness.Domain.Memberships;

namespace TitanFitness.Application.Members.GetEntryEligibility;

public sealed class GetEntryEligibilityQueryHandler
    : IRequestHandler<GetEntryEligibilityQuery, EntryEligibilityResponse>
{
    private readonly IReadRepository<Member> _memberReadRepository;
    private readonly IReadRepository<Membership> _membershipReadRepository;
    private readonly EntryEligibilityChecker _entryEligibilityChecker;

    public GetEntryEligibilityQueryHandler(
        IReadRepository<Member> memberReadRepository,
        IReadRepository<Membership> membershipReadRepository,
        EntryEligibilityChecker entryEligibilityChecker)
    {
        _memberReadRepository = memberReadRepository;
        _membershipReadRepository = membershipReadRepository;
        _entryEligibilityChecker = entryEligibilityChecker;
    }

    public async Task<EntryEligibilityResponse> Handle(
        GetEntryEligibilityQuery request,
        CancellationToken cancellationToken)
    {
        var member = await _memberReadRepository.GetByIdAsync(
            request.MemberId,
            cancellationToken
        );

        if (member is null)
        {
            throw new NotFoundException(
                "Member was not found."
            );
        }

        var memberships = await _membershipReadRepository.GetAsync(
            x => x.MemberId == request.MemberId,
            x => x.StartDate,
            true,
            null,
            null,
            cancellationToken
        );

        var today = DateOnly.FromDateTime(
            DateTime.UtcNow
        );

        var membership =
            memberships
                .FirstOrDefault(x =>
                    x.StartDate <= today &&
                    x.EndDate >= today
                )
            ??
            memberships
                .OrderByDescending(x => x.StartDate)
                .FirstOrDefault();

        if (membership is null)
        {
            return new EntryEligibilityResponse(
                CheckInResult.Refused,
                EntryRefusalReason.NoMembership
            );
        }

        var eligibility = _entryEligibilityChecker.Check(
            membership,
            member.HomeBranchId,
            request.BranchId,
            today
        );

        return new EntryEligibilityResponse(
            eligibility.Result,
            eligibility.RefusalReason
        );
    }
}