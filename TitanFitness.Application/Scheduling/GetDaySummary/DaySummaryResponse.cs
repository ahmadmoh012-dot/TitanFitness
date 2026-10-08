namespace TitanFitness.Application.Scheduling.GetDaySummary;

public sealed record DaySummaryResponse(
    int TotalBookings,
    decimal AverageCapacityFilledPercentage);