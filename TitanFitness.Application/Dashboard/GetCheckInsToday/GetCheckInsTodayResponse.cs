namespace TitanFitness.Application.Dashboard.GetCheckInsToday;

public sealed record GetCheckInsTodayResponse(
    int Count,
    decimal PercentageVsLastWeek);