using MediatR;

namespace TitanFitness.Application.Plans.GetPlanById;

public sealed record GetPlanByIdQuery(int Id)
    : IRequest<PlanDetailsResponse>;