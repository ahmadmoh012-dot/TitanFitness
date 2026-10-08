using MediatR;
using System.Linq.Expressions;
using TitanFitness.Domain.Branches;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Scheduling;
using TitanFitness.Domain.Trainers;

namespace TitanFitness.Application.Scheduling.GetClassSessions;

public sealed class GetClassSessionsQueryHandler
    : IRequestHandler<
        GetClassSessionsQuery,
        GetClassSessionsResponse>
{
    private const int PageSize = 10;

    private readonly IReadRepository<ClassSession>
        _classSessionReadRepository;

    private readonly IReadRepository<Booking>
        _bookingReadRepository;

    private readonly IReadRepository<Studio>
        _studioReadRepository;

    private readonly IReadRepository<Trainer>
        _trainerReadRepository;

    private readonly IReadRepository<Branch>
        _branchReadRepository;

    public GetClassSessionsQueryHandler(
        IReadRepository<ClassSession>
            classSessionReadRepository,
        IReadRepository<Booking>
            bookingReadRepository,
        IReadRepository<Studio>
            studioReadRepository,
        IReadRepository<Trainer>
            trainerReadRepository,
        IReadRepository<Branch>
            branchReadRepository)
    {
        _classSessionReadRepository =
            classSessionReadRepository;

        _bookingReadRepository =
            bookingReadRepository;

        _studioReadRepository =
            studioReadRepository;

        _trainerReadRepository =
            trainerReadRepository;

        _branchReadRepository =
            branchReadRepository;
    }

    public async Task<GetClassSessionsResponse> Handle(
        GetClassSessionsQuery request,
        CancellationToken cancellationToken)
    {
        Expression<Func<ClassSession, bool>>
            predicate = session =>
                session.SessionDate ==
                    request.SessionDate &&
                (
                    !request.BranchId.HasValue ||
                    session.BranchId ==
                        request.BranchId.Value
                );

        var skip =
            (request.Page - 1) *
            PageSize;

        var sessions =
            await _classSessionReadRepository
                .GetAsync(
                    predicate,
                    x => x.StartTime,
                    false,
                    skip,
                    PageSize,
                    cancellationToken);

        var totalCount =
            await _classSessionReadRepository
                .CountAsync(
                    predicate,
                    cancellationToken);

        if (sessions.Count == 0)
        {
            return new GetClassSessionsResponse(
                [],
                request.Page,
                totalCount);
        }

        var sessionIds =
            sessions
                .Select(x => x.Id)
                .ToList();

        var studioIds =
            sessions
                .Select(x => x.StudioId)
                .Distinct()
                .ToList();

        var trainerIds =
            sessions
                .Select(x => x.TrainerId)
                .Distinct()
                .ToList();

        var branchIds =
            sessions
                .Select(x => x.BranchId)
                .Distinct()
                .ToList();

        var bookings =
            await _bookingReadRepository
                .GetAsync(
                    x =>
                        sessionIds.Contains(
                            x.SessionId),
                    null,
                    false,
                    null,
                    null,
                    cancellationToken);

        var studios =
            await _studioReadRepository
                .GetAsync(
                    x =>
                        studioIds.Contains(
                            x.Id),
                    null,
                    false,
                    null,
                    null,
                    cancellationToken);

        var trainers =
            await _trainerReadRepository
                .GetAsync(
                    x =>
                        trainerIds.Contains(
                            x.Id),
                    null,
                    false,
                    null,
                    null,
                    cancellationToken);

        var branches =
            await _branchReadRepository
                .GetAsync(
                    x =>
                        branchIds.Contains(
                            x.Id),
                    null,
                    false,
                    null,
                    null,
                    cancellationToken);

        var studioNames =
            studios.ToDictionary(
                x => x.Id,
                x => x.Name);

        var trainerNames =
            trainers.ToDictionary(
                x => x.Id,
                x => x.Name);

        var branchNames =
            branches.ToDictionary(
                x => x.Id,
                x => x.Name);

        var today =
            DateOnly.FromDateTime(
                DateTime.Now);

        var currentTime =
            TimeOnly.FromDateTime(
                DateTime.Now);

        var items =
            sessions
                .Select(session =>
                {
                    var sessionBookings =
                        bookings
                            .Where(
                                x =>
                                    x.SessionId ==
                                    session.Id)
                            .ToList();

                    var confirmedBookings =
                        sessionBookings
                            .Count(
                                x =>
                                    x.Status !=
                                        BookingStatus.Cancelled &&
                                    x.Status !=
                                        BookingStatus.Waitlisted);

                    var waitlistCount =
                        sessionBookings
                            .Count(
                                x =>
                                    x.Status ==
                                    BookingStatus.Waitlisted);

                    studioNames.TryGetValue(
                        session.StudioId,
                        out var studioName);

                    trainerNames.TryGetValue(
                        session.TrainerId,
                        out var trainerName);

                    branchNames.TryGetValue(
                        session.BranchId,
                        out var branchName);

                    var status =
                        GetDisplayStatus(
                            session,
                            today,
                            currentTime);

                    return new
                        ClassSessionListItemResponse(
                            session.Id,
                            session.ClassName,

                            session.BranchId,
                            branchName ??
                                "Unknown Branch",

                            session.StudioId,
                            studioName ??
                                "Unknown Studio",

                            session.TrainerId,
                            trainerName ??
                                "Unknown Trainer",

                            session.SessionDate,
                            session.StartTime,

                            session.DurationInMinutes,
                            session.CapacityLimit,

                            confirmedBookings,
                            waitlistCount,

                            status);
                })
                .ToList();

        return new GetClassSessionsResponse(
            items,
            request.Page,
            totalCount);
    }

    private static string GetDisplayStatus(
        ClassSession session,
        DateOnly today,
        TimeOnly currentTime)
    {
        if (
            session.Status ==
            ClassSessionStatus.Cancelled)
        {
            return "Cancelled";
        }

        if (
            session.SessionDate <
            today)
        {
            return "Completed";
        }

        if (
            session.SessionDate >
            today)
        {
            return "Upcoming";
        }

        var endTime =
            session.StartTime
                .AddMinutes(
                    session.DurationInMinutes);

        if (
            currentTime >=
                session.StartTime &&
            currentTime <
                endTime)
        {
            return "In Progress";
        }

        if (
            currentTime >=
            endTime)
        {
            return "Completed";
        }

        return "Upcoming";
    }
}