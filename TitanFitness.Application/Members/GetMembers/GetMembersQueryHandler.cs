using MediatR;
using TitanFitness.Domain.Branches;
using TitanFitness.Domain.CheckIns;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Members;
using TitanFitness.Domain.Memberships;

namespace TitanFitness.Application.Members.GetMembers;

public sealed class GetMembersQueryHandler
    : IRequestHandler<GetMembersQuery, GetMembersResponse>
{
    private const int PageSize = 4;

    private readonly IReadRepository<Member> _memberReadRepository;
    private readonly IReadRepository<Branch> _branchReadRepository;
    private readonly IReadRepository<Membership> _membershipReadRepository;
    private readonly IReadRepository<CheckIn> _checkInReadRepository;

    public GetMembersQueryHandler(
        IReadRepository<Member> memberReadRepository,
        IReadRepository<Branch> branchReadRepository,
        IReadRepository<Membership> membershipReadRepository,
        IReadRepository<CheckIn> checkInReadRepository)
    {
        _memberReadRepository = memberReadRepository;
        _branchReadRepository = branchReadRepository;
        _membershipReadRepository = membershipReadRepository;
        _checkInReadRepository = checkInReadRepository;
    }

    public async Task<GetMembersResponse> Handle(
        GetMembersQuery request,
        CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var search = request.Search?.Trim();

        var members = await _memberReadRepository.GetAsync(
            x =>
                !request.BranchId.HasValue ||
                x.HomeBranchId == request.BranchId.Value,
            x => x.FullName,
            false,
            null,
            null,
            cancellationToken
        );

        if (members.Count == 0)
        {
            return new GetMembersResponse(
                [],
                request.Page,
                0
            );
        }

        var memberIds = members
            .Select(x => x.Id)
            .ToList();

        var branchIds = members
            .Select(x => x.HomeBranchId)
            .Distinct()
            .ToList();

        var branches = await _branchReadRepository.GetAsync(
            x => branchIds.Contains(x.Id),
            x => x.Name,
            false,
            null,
            null,
            cancellationToken
        );

        var memberships = await _membershipReadRepository.GetAsync(
            x => memberIds.Contains(x.MemberId),
            x => x.StartDate,
            true,
            null,
            null,
            cancellationToken
        );

        var checkIns = await _checkInReadRepository.GetAsync(
            x =>
                memberIds.Contains(x.MemberId) &&
                x.Result == CheckInResult.Admitted,
            x => x.CheckedInAt,
            true,
            null,
            null,
            cancellationToken
        );

        var branchNames = branches.ToDictionary(
            x => x.Id,
            x => x.Name
        );

        var items = members
            .Select(member =>
            {
                var memberMemberships = memberships
                    .Where(x => x.MemberId == member.Id)
                    .OrderByDescending(x => x.StartDate)
                    .ToList();

                var membership =
                    memberMemberships
                        .FirstOrDefault(x =>
                            x.StartDate <= today &&
                            x.EndDate >= today
                        )
                    ??
                    memberMemberships.FirstOrDefault();

                var status =
                    membership == null
                        ? "No Membership"
                        : membership.Status switch
                        {
                            MembershipStatus.Pending => "Pending",
                            MembershipStatus.Active => "Active",
                            MembershipStatus.Frozen => "Frozen",
                            MembershipStatus.Expired => "Expired",
                            MembershipStatus.Cancelled => "Cancelled",
                            _ => "No Membership"
                        };

                var lastVisit = checkIns
                    .Where(x => x.MemberId == member.Id)
                    .OrderByDescending(x => x.CheckedInAt)
                    .Select(x => (DateTime?)x.CheckedInAt)
                    .FirstOrDefault();

                var branchName =
                    branchNames.TryGetValue(
                        member.HomeBranchId,
                        out var name
                    )
                        ? name
                        : "Unknown Branch";

                return new MemberListItemResponse(
                    member.Id,
                    member.MembershipNumber,
                    member.FullName,
                    member.Email,
                    member.Phone,
                    member.HomeBranchId,
                    branchName,
                    status,
                    lastVisit
                );
            })
            .ToList();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerms = search
                .Split(
                    ' ',
                    StringSplitOptions.RemoveEmptyEntries |
                    StringSplitOptions.TrimEntries
                );

            items = items
                .Where(item =>
                {
                    var normalizedName = string.Join(
                        ' ',
                        item.FullName.Split(
                            ' ',
                            StringSplitOptions.RemoveEmptyEntries |
                            StringSplitOptions.TrimEntries
                        )
                    );

                    var nameMatches = searchTerms.All(term =>
                        normalizedName.Contains(
                            term,
                            StringComparison.OrdinalIgnoreCase
                        )
                    );

                    var membershipNumberMatches =
                        item.MembershipNumber.Contains(
                            search,
                            StringComparison.OrdinalIgnoreCase
                        );

                    return nameMatches || membershipNumberMatches;
                })
                .ToList();
        }

        var totalCount = items.Count;

        var safePage =
            request.Page < 1
                ? 1
                : request.Page;

        var pagedItems = items
            .OrderBy(x => x.FullName)
            .Skip((safePage - 1) * PageSize)
            .Take(PageSize)
            .ToList();

        return new GetMembersResponse(
            pagedItems,
            safePage,
            totalCount
        );
    }
}