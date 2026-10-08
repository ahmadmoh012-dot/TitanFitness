using TitanFitness.Domain.Scheduling;

namespace TitanFitness.Application.Scheduling.GetClassSessionById;

public sealed record ClassSessionDetailsResponse(
    int Id,
    string ClassName,
    int BranchId,
    int StudioId,
    int TrainerId,
    DateOnly SessionDate,
    TimeOnly StartTime,
    int DurationInMinutes,
    int CapacityLimit,
    ClassSessionStatus Status,
    string? Description);