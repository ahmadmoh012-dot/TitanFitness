using MediatR;

namespace TitanFitness.Application.Scheduling.CreateClassSession;

public sealed record CreateClassSessionCommand(
    string ClassName,
    int BranchId,
    int StudioId,
    int TrainerId,
    DateOnly SessionDate,
    TimeOnly StartTime,
    int DurationInMinutes,
    int CapacityLimit,
    string? Description) : IRequest<int>;