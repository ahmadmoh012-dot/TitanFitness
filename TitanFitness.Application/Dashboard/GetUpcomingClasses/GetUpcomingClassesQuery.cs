using MediatR;

namespace TitanFitness.Application.Dashboard.GetUpcomingClasses;

public sealed record GetUpcomingClassesQuery(int Take = 2)
    : IRequest<IReadOnlyCollection<UpcomingClassResponse>>;