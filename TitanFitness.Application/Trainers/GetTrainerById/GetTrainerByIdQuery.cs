using MediatR;

namespace TitanFitness.Application.Trainers.GetTrainerById;

public sealed record GetTrainerByIdQuery(int Id)
    : IRequest<TrainerDetailsResponse>;