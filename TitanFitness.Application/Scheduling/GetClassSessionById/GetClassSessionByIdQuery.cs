using MediatR;

namespace TitanFitness.Application.Scheduling.GetClassSessionById;

public sealed record GetClassSessionByIdQuery(int Id)
    : IRequest<ClassSessionDetailsResponse>;