using MediatR;
using TitanFitness.Domain.CheckIns;
using TitanFitness.Domain.Common;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Members;
using TitanFitness.Domain.Scheduling;
using TitanFitness.Application.Common.Exceptions;

namespace TitanFitness.Application.Members.GetMemberActivity;

public sealed class GetMemberActivityQueryHandler
    : IRequestHandler<GetMemberActivityQuery, IReadOnlyCollection<MemberActivityResponse>>
{
    private readonly IReadRepository<Member> _memberReadRepository;
    private readonly IReadRepository<CheckIn> _checkInReadRepository;
    private readonly IReadRepository<ClassSession> _classSessionReadRepository;

    public GetMemberActivityQueryHandler(
        IReadRepository<Member> memberReadRepository,
        IReadRepository<CheckIn> checkInReadRepository,
        IReadRepository<ClassSession> classSessionReadRepository)
    {
        _memberReadRepository = memberReadRepository;
        _checkInReadRepository = checkInReadRepository;
        _classSessionReadRepository = classSessionReadRepository;
    }

    public async Task<IReadOnlyCollection<MemberActivityResponse>> Handle(
        GetMemberActivityQuery request,
        CancellationToken cancellationToken)
    {
        var memberExists = await _memberReadRepository.AnyAsync(
            x => x.Id == request.MemberId,
            cancellationToken);
        if (!memberExists)
            throw new NotFoundException("Member was not found.");
        var checkIns = await _checkInReadRepository.GetAsync(
            x => x.MemberId == request.MemberId,
            x => x.CheckedInAt,
            true,
            null,
            request.Take,
            cancellationToken);

        var sessions = await _classSessionReadRepository.GetAsync(
            x => x.Bookings.Any(b =>
                b.MemberId == request.MemberId &&
                b.Status == BookingStatus.Attended),
            null,
            false,
            null,
            null,
            cancellationToken);

        var activities = checkIns
            .Select(x => new MemberActivityResponse(
                "CheckIn",
                x.CheckedInAt,
                x.Result == CheckInResult.Admitted
                    ? "Admitted"
                    : x.RefusalReason is null
                        ? "Refused"
                        : $"Refused - {x.RefusalReason}"))
            .Concat(
                sessions.Select(x => new MemberActivityResponse(
                    "ClassAttendance",
                    x.SessionDate.ToDateTime(x.StartTime),
                    x.ClassName)))
            .OrderByDescending(x => x.OccurredAt)
            .Take(request.Take)
            .ToList();

        return activities;
    }
}