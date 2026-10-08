using MediatR;
using TitanFitness.Domain.Branches;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Scheduling;
using TitanFitness.Domain.Trainers;

namespace TitanFitness.Application.Dashboard.GetUpcomingClasses;

public sealed class GetUpcomingClassesQueryHandler
    : IRequestHandler<
        GetUpcomingClassesQuery,
        IReadOnlyCollection<UpcomingClassResponse>>
{
    private readonly IReadRepository<ClassSession>
        _classSessionReadRepository;

    private readonly IReadRepository<Studio>
        _studioReadRepository;

    private readonly IReadRepository<Trainer>
        _trainerReadRepository;

    private readonly IReadRepository<Booking>
        _bookingReadRepository;

    public GetUpcomingClassesQueryHandler(
        IReadRepository<ClassSession> classSessionReadRepository,
        IReadRepository<Studio> studioReadRepository,
        IReadRepository<Trainer> trainerReadRepository,
        IReadRepository<Booking> bookingReadRepository)
    {
        _classSessionReadRepository =
            classSessionReadRepository;

        _studioReadRepository =
            studioReadRepository;

        _trainerReadRepository =
            trainerReadRepository;

        _bookingReadRepository =
            bookingReadRepository;
    }

    public async Task<
        IReadOnlyCollection<UpcomingClassResponse>>
        Handle(
            GetUpcomingClassesQuery request,
            CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(now);

        var sessions =
            await _classSessionReadRepository.GetAsync(
                x =>
                    x.Status != ClassSessionStatus.Cancelled &&
                    x.SessionDate >= today,
                x => x.SessionDate,
                false,
                null,
                null,
                cancellationToken);

        var upcomingSessions = sessions
            .Select(session =>
            {
                var startDateTime =
                    session.SessionDate
                        .ToDateTime(session.StartTime);

                var endDateTime =
                    startDateTime.AddMinutes(
                        session.DurationInMinutes);

                return new
                {
                    Session = session,
                    StartDateTime = startDateTime,
                    EndDateTime = endDateTime
                };
            })
            .Where(x => x.EndDateTime >= now)
            .OrderBy(x => x.StartDateTime)
            .Take(request.Take)
            .ToList();

        if (upcomingSessions.Count == 0)
        {
            return [];
        }

        var studioIds = upcomingSessions
            .Select(x => x.Session.StudioId)
            .Distinct()
            .ToList();

        var trainerIds = upcomingSessions
            .Select(x => x.Session.TrainerId)
            .Distinct()
            .ToList();

        var sessionIds = upcomingSessions
            .Select(x => x.Session.Id)
            .ToList();

        var studios =
            await _studioReadRepository.GetAsync(
                x => studioIds.Contains(x.Id),
                null,
                false,
                null,
                null,
                cancellationToken);

        var trainers =
            await _trainerReadRepository.GetAsync(
                x => trainerIds.Contains(x.Id),
                null,
                false,
                null,
                null,
                cancellationToken);

        var bookings =
            await _bookingReadRepository.GetAsync(
                x =>
                    sessionIds.Contains(x.SessionId) &&
                    x.Status != BookingStatus.Cancelled &&
                    x.Status != BookingStatus.Waitlisted,
                null,
                false,
                null,
                null,
                cancellationToken);

        return upcomingSessions
            .Select(x =>
            {
                var session = x.Session;

                var studioName =
                    studios
                        .FirstOrDefault(
                            s => s.Id == session.StudioId)
                        ?.Name
                    ?? "Unknown Studio";

                var trainerName =
                    trainers
                        .FirstOrDefault(
                            t => t.Id == session.TrainerId)
                        ?.Name
                    ?? "Unknown Trainer";

                var confirmedBookings =
                    bookings.Count(
                        b => b.SessionId == session.Id);

                var status =
                    now >= x.StartDateTime &&
                    now < x.EndDateTime
                        ? "Running"
                        : "Upcoming";

                return new UpcomingClassResponse(
                    session.Id,
                    session.ClassName,
                    studioName,
                    trainerName,
                    session.SessionDate,
                    session.StartTime,
                    session.DurationInMinutes,
                    session.CapacityLimit,
                    confirmedBookings,
                    status);
            })
            .ToList();
    }
}