namespace TitanFitness.Application.Dashboard.GetUpcomingClasses;

public sealed record UpcomingClassResponse(
    int Id,
    string ClassName,
    string StudioName,
    string TrainerName,
    DateOnly SessionDate,
    TimeOnly StartTime,
    int DurationInMinutes,
    int CapacityLimit,
    int ConfirmedBookings,
    string Status);