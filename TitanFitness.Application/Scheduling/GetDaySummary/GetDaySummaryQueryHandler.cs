using MediatR;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Scheduling;

namespace TitanFitness.Application.Scheduling.GetDaySummary;

public sealed class GetDaySummaryQueryHandler
    : IRequestHandler<GetDaySummaryQuery, DaySummaryResponse>
{
    private readonly IReadRepository<ClassSession> _classSessionReadRepository;
    private readonly IReadRepository<Booking> _bookingReadRepository;

    public GetDaySummaryQueryHandler(
        IReadRepository<ClassSession> classSessionReadRepository,
        IReadRepository<Booking> bookingReadRepository)
    {
        _classSessionReadRepository = classSessionReadRepository;
        _bookingReadRepository = bookingReadRepository;
    }

    public async Task<DaySummaryResponse> Handle(
        GetDaySummaryQuery request,
        CancellationToken cancellationToken)
    {
        var sessions = await _classSessionReadRepository.GetAsync(
            x => x.SessionDate == request.SessionDate &&
                 (!request.BranchId.HasValue ||
                  x.BranchId == request.BranchId.Value),
            x => x.StartTime,
            false,
            null,
            null,
            cancellationToken);

        if (sessions.Count == 0)
            return new DaySummaryResponse(0, 0);

        var sessionIds = sessions
            .Select(x => x.Id)
            .ToList();

        var bookings = await _bookingReadRepository.GetAsync(
            x => sessionIds.Contains(x.SessionId) &&
                 x.Status != BookingStatus.Cancelled &&
                 x.Status != BookingStatus.Waitlisted,
            null,
            false,
            null,
            null,
            cancellationToken);

        var totalBookings = bookings.Count;

        var averageCapacityFilledPercentage = sessions
            .Average(session =>
            {
                var bookedCount = bookings.Count(
                    x => x.SessionId == session.Id);

                return session.CapacityLimit == 0
                    ? 0
                    : (decimal)bookedCount / session.CapacityLimit * 100;
            });

        return new DaySummaryResponse(
            totalBookings,
            Math.Round(averageCapacityFilledPercentage, 2));
    }
}