namespace TitanFitness.Application.Scheduling.GetClassSessions;

public sealed record ClassSessionListItemResponse(
    int Id,
    string ClassName,

    int BranchId,
    string BranchName,

    int StudioId,
    string StudioName,

    int TrainerId,
    string TrainerName,

    DateOnly SessionDate,
    TimeOnly StartTime,

    int DurationInMinutes,
    int CapacityLimit,

    int ConfirmedBookings,
    int WaitlistCount,

    string Status);