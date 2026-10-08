using MediatR;
using TitanFitness.Domain.CheckIns;
using TitanFitness.Domain.Common.Repositories;

namespace TitanFitness.Application.Dashboard.GetCheckInsToday;

public sealed class GetCheckInsTodayQueryHandler
    : IRequestHandler<GetCheckInsTodayQuery, GetCheckInsTodayResponse>
{
    private readonly IReadRepository<CheckIn> _checkInReadRepository;

    public GetCheckInsTodayQueryHandler(
        IReadRepository<CheckIn> checkInReadRepository)
    {
        _checkInReadRepository = checkInReadRepository;
    }

    public async Task<GetCheckInsTodayResponse> Handle(
        GetCheckInsTodayQuery request,
        CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var lastWeek = today.AddDays(-7);
        var lastWeekTomorrow = lastWeek.AddDays(1);

        var todayCount =
            await _checkInReadRepository.CountAsync(
                x =>
                    x.CheckedInAt >= today &&
                    x.CheckedInAt < tomorrow &&
                    x.Result == CheckInResult.Admitted,
                cancellationToken);

        var lastWeekCount =
            await _checkInReadRepository.CountAsync(
                x =>
                    x.CheckedInAt >= lastWeek &&
                    x.CheckedInAt < lastWeekTomorrow &&
                    x.Result == CheckInResult.Admitted,
                cancellationToken);

        decimal percentageVsLastWeek = 0;

        if (lastWeekCount > 0)
        {
            percentageVsLastWeek =
                Math.Round(
                    ((decimal)(todayCount - lastWeekCount)
                    / lastWeekCount) * 100,
                    1);
        }

        return new GetCheckInsTodayResponse(
            todayCount,
            percentageVsLastWeek);
    }
}