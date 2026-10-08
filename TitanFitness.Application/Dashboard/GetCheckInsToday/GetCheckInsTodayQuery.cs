using MediatR;

namespace TitanFitness.Application.Dashboard.GetCheckInsToday;

public sealed record GetCheckInsTodayQuery
    : IRequest<GetCheckInsTodayResponse>;