using MediatR;
using TitanFitness.Application.Common.Exceptions;
using TitanFitness.Domain.Branches;
using TitanFitness.Domain.CheckIns;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Members;
using TitanFitness.Domain.Memberships;
using TitanFitness.Domain.Plans;
using TitanFitness.Domain.Scheduling;

namespace TitanFitness.Application.Members.GetMemberProfile;

public sealed class GetMemberProfileQueryHandler
    : IRequestHandler<
        GetMemberProfileQuery,
        MemberProfileResponse>
{
    private readonly IReadRepository<Member>
        _memberReadRepository;

    private readonly IReadRepository<Branch>
        _branchReadRepository;

    private readonly IReadRepository<Membership>
        _membershipReadRepository;

    private readonly IReadRepository<Plan>
        _planReadRepository;

    private readonly IReadRepository<Freeze>
        _freezeReadRepository;

    private readonly IReadRepository<GuestPass>
        _guestPassReadRepository;

    private readonly IReadRepository<CheckIn>
        _checkInReadRepository;

    private readonly IReadRepository<ClassSession>
        _classSessionReadRepository;

    public GetMemberProfileQueryHandler(
        IReadRepository<Member> memberReadRepository,
        IReadRepository<Branch> branchReadRepository,
        IReadRepository<Membership> membershipReadRepository,
        IReadRepository<Plan> planReadRepository,
        IReadRepository<Freeze> freezeReadRepository,
        IReadRepository<GuestPass> guestPassReadRepository,
        IReadRepository<CheckIn> checkInReadRepository,
        IReadRepository<ClassSession> classSessionReadRepository)
    {
        _memberReadRepository =
            memberReadRepository;

        _branchReadRepository =
            branchReadRepository;

        _membershipReadRepository =
            membershipReadRepository;

        _planReadRepository =
            planReadRepository;

        _freezeReadRepository =
            freezeReadRepository;

        _guestPassReadRepository =
            guestPassReadRepository;

        _checkInReadRepository =
            checkInReadRepository;

        _classSessionReadRepository =
            classSessionReadRepository;
    }

    public async Task<MemberProfileResponse> Handle(
        GetMemberProfileQuery request,
        CancellationToken cancellationToken)
    {
        var member =
            await _memberReadRepository.GetByIdAsync(
                request.MemberId,
                cancellationToken);

        if (member is null)
        {
            throw new NotFoundException(
                "Member was not found.");
        }

        var branch =
            await _branchReadRepository.GetByIdAsync(
                member.HomeBranchId,
                cancellationToken);

        var today =
            DateOnly.FromDateTime(
                DateTime.UtcNow);

        var memberships =
            await _membershipReadRepository.GetAsync(
                x =>
                    x.MemberId ==
                    request.MemberId,
                x => x.StartDate,
                true,
                null,
                null,
                cancellationToken);

        var currentMembership =
            memberships.FirstOrDefault(
                x =>
                    x.StartDate <= today &&
                    x.EndDate >= today &&
                    (
                        x.Status ==
                        MembershipStatus.Active ||
                        x.Status ==
                        MembershipStatus.Frozen
                    ))
            ?? memberships.FirstOrDefault();

        MemberProfileMembershipResponse?
            membershipResponse = null;

        var freezesUsed = 0;
        var maximumFreezes = 0;

        var guestPassesUsed = 0;
        var guestPassQuota = 0;

        if (currentMembership is not null)
        {
            var plan =
                await _planReadRepository
                    .GetByIdAsync(
                        currentMembership.PlanId,
                        cancellationToken);

            freezesUsed =
                await _freezeReadRepository
                    .CountAsync(
                        x =>
                            x.MembershipId ==
                            currentMembership.Id,
                        cancellationToken);

            guestPassesUsed =
                await _guestPassReadRepository
                    .CountAsync(
                        x =>
                            x.MembershipId ==
                            currentMembership.Id,
                        cancellationToken);

            maximumFreezes =
                currentMembership
                    .AgreedTerms
                    .MaximumNumberOfFreezes;

            guestPassQuota =
                currentMembership
                    .AgreedTerms
                    .GuestPassQuota;

            membershipResponse =
                new MemberProfileMembershipResponse(
                    currentMembership.Id,
                    currentMembership.PlanId,
                    plan?.Name ?? "Unknown Plan",
                    currentMembership
                        .AgreedTerms
                        .PricePaid,
                    currentMembership.StartDate,
                    currentMembership.EndDate,
                    GetMembershipStatus(
                        currentMembership,
                        today));
        }

        var branches =
            await _branchReadRepository.GetAsync(
                null,
                x => x.Name,
                false,
                null,
                null,
                cancellationToken);

        var branchNames =
            branches.ToDictionary(
                x => x.Id,
                x => x.Name);

        var checkIns =
            await _checkInReadRepository.GetAsync(
                x =>
                    x.MemberId ==
                    request.MemberId,
                x => x.CheckedInAt,
                true,
                null,
                7,
                cancellationToken);

        var sessions =
            await _classSessionReadRepository
                .GetAsync(
                    x =>
                        x.Bookings.Any(
                            booking =>
                                booking.MemberId ==
                                request.MemberId &&
                                booking.Status ==
                                BookingStatus.Attended),
                    x => x.SessionDate,
                    true,
                    null,
                    7,
                    cancellationToken);

        var activityItems =
            new List<ActivityItem>();

        foreach (var checkIn in checkIns)
        {
            branchNames.TryGetValue(
                checkIn.BranchId,
                out var checkInBranch);

            activityItems.Add(
                new ActivityItem(
                    "CheckIn",
                    "Facility Check-In",
                    checkInBranch ??
                    "Unknown Branch",
                    checkIn.CheckedInAt,
                    checkIn.Result ==
                    CheckInResult.Admitted
                        ? "Admitted"
                        : checkIn.RefusalReason ??
                          "Refused"));
        }

        foreach (var session in sessions)
        {
            activityItems.Add(
                new ActivityItem(
                    "ClassAttendance",
                    "Class Attendance",
                    session.ClassName,
                    session.SessionDate
                        .ToDateTime(
                            session.StartTime),
                    "Attended"));
        }

        var recentActivity =
            activityItems
                .OrderByDescending(
                    x => x.DateTime)
                .Take(7)
                .Select(
                    (activity, index) =>
                        new MemberProfileActivityResponse(
                            index + 1,
                            activity.Type,
                            activity.Title,
                            activity.Subtitle,
                            activity.DateTime,
                            activity.Result))
                .ToList();

        return new MemberProfileResponse(
            member.Id,
            member.MembershipNumber,
            member.FullName,
            member.Email,
            member.Phone,
            member.Address,
            member.JoinedDate,
            BuildPhotoUrl(member.Photo),
            member.HomeBranchId,
            branch?.Name ??
                "Unknown Branch",
            GetMemberStatus(
                currentMembership,
                today),
            membershipResponse,
            freezesUsed,
            maximumFreezes,
            guestPassesUsed,
            guestPassQuota,
            recentActivity);
    }

    private static string GetMemberStatus(
        Membership? membership,
        DateOnly today)
    {
        if (membership is null)
        {
            return "Expired";
        }

        if (
            membership.StartDate <= today &&
            membership.EndDate >= today)
        {
            if (
                membership.Status ==
                MembershipStatus.Active)
            {
                return "Active";
            }

            if (
                membership.Status ==
                MembershipStatus.Frozen)
            {
                return "Frozen";
            }
        }

        return "Expired";
    }

    private static string GetMembershipStatus(
        Membership membership,
        DateOnly today)
    {
        if (membership.EndDate < today)
        {
            return "Expired";
        }

        return membership.Status.ToString();
    }

    private static string? BuildPhotoUrl(
        string? photo)
    {
        if (string.IsNullOrWhiteSpace(photo))
        {
            return null;
        }

        if (
            photo.StartsWith(
                "data:",
                StringComparison.OrdinalIgnoreCase) ||
            photo.StartsWith(
                "http://",
                StringComparison.OrdinalIgnoreCase) ||
            photo.StartsWith(
                "https://",
                StringComparison.OrdinalIgnoreCase))
        {
            return photo;
        }

        var mimeType =
            photo.StartsWith(
                "iVBOR",
                StringComparison.Ordinal)
                ? "image/png"
                : photo.StartsWith(
                    "UklGR",
                    StringComparison.Ordinal)
                    ? "image/webp"
                    : photo.StartsWith(
                        "R0lGOD",
                        StringComparison.Ordinal)
                        ? "image/gif"
                        : "image/jpeg";

        return
            $"data:{mimeType};base64,{photo}";
    }

    private sealed record ActivityItem(
        string Type,
        string Title,
        string? Subtitle,
        DateTime DateTime,
        string? Result);
}