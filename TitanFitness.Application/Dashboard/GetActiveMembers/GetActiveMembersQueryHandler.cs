using MediatR;
using TitanFitness.Domain.CheckIns;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Memberships;

namespace TitanFitness.Application.Dashboard.GetActiveMembers;

public sealed class GetActiveMembersQueryHandler
    : IRequestHandler<GetActiveMembersQuery, GetActiveMembersResponse>
{
    private readonly IReadRepository<Membership> _membershipReadRepository;
    private readonly IReadRepository<CheckIn> _checkInReadRepository;

    public GetActiveMembersQueryHandler(
        IReadRepository<Membership> membershipReadRepository,
        IReadRepository<CheckIn> checkInReadRepository)
    {
        _membershipReadRepository = membershipReadRepository;
        _checkInReadRepository = checkInReadRepository;
    }

    public async Task<GetActiveMembersResponse> Handle(
        GetActiveMembersQuery request,
        CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var activeMembersCount =
            await _membershipReadRepository.CountAsync(
                x =>
                    x.Status == MembershipStatus.Active &&
                    x.StartDate <= today &&
                    x.EndDate >= today,
                cancellationToken);

        var todayStart = DateTime.UtcNow.Date;
        var tomorrow = todayStart.AddDays(1);

        var admittedCheckIns =
            await _checkInReadRepository.GetAsync(
                x =>
                    x.CheckedInAt >= todayStart &&
                    x.CheckedInAt < tomorrow &&
                    x.Result == CheckInResult.Admitted,
                x => x.CheckedInAt,
                true,
                null,
                null,
                cancellationToken);

        var currentlyInside =
            admittedCheckIns
                .Select(x => x.MemberId)
                .Distinct()
                .Count();

        return new GetActiveMembersResponse(
            activeMembersCount,
            currentlyInside);
    }
}