using MediatR;
using TitanFitness.Domain.Common;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Scheduling;
using TitanFitness.Application.Common.Exceptions;

namespace TitanFitness.Application.Scheduling.GetClassSessionById;

public sealed class GetClassSessionByIdQueryHandler
    : IRequestHandler<GetClassSessionByIdQuery, ClassSessionDetailsResponse>
{
    private readonly IReadRepository<ClassSession> _classSessionReadRepository;

    public GetClassSessionByIdQueryHandler(
        IReadRepository<ClassSession> classSessionReadRepository)
    {
        _classSessionReadRepository = classSessionReadRepository;
    }

    public async Task<ClassSessionDetailsResponse> Handle(
        GetClassSessionByIdQuery request,
        CancellationToken cancellationToken)
    {
        var session = await _classSessionReadRepository.GetByIdAsync(
            request.Id,
            cancellationToken);

        if (session is null)
            throw new NotFoundException("Class session was not found.");

        return new ClassSessionDetailsResponse(
            session.Id,
            session.ClassName,
            session.BranchId,
            session.StudioId,
            session.TrainerId,
            session.SessionDate,
            session.StartTime,
            session.DurationInMinutes,
            session.CapacityLimit,
            session.Status,
            session.Description);
    }
}