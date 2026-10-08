namespace TitanFitness.Application.Trainers.GetTrainers;

public sealed record GetTrainersResponse(
    IReadOnlyCollection<TrainerListItemResponse> Items,
    int Page,
    int TotalCount);