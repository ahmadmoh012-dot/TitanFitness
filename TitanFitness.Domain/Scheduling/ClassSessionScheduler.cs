using TitanFitness.Domain.Common;
using TitanFitness.Domain.Common.Repositories;

namespace TitanFitness.Domain.Scheduling;

public sealed class ClassSessionScheduler
{
    private readonly IReadRepository<ClassSession> _classSessionReadRepository;

    public ClassSessionScheduler(
        IReadRepository<ClassSession> classSessionReadRepository)
    {
        _classSessionReadRepository = classSessionReadRepository;
    }

    public async Task<ClassSession> ScheduleAsync(
        string className,
        int branchId,
        int studioId,
        int trainerId,
        DateOnly sessionDate,
        TimeOnly startTime,
        int durationInMinutes,
        int capacityLimit,
        int studioCapacity,
        string? description,
        CancellationToken cancellationToken)
    {
        var trainerSessions = await _classSessionReadRepository.GetAsync(
            x => x.TrainerId == trainerId &&
                 x.SessionDate == sessionDate &&
                 x.Status != ClassSessionStatus.Cancelled,
            null,
            false,
            null,
            null,
            cancellationToken);

        if (HasOverlap(trainerSessions, startTime, durationInMinutes))
            throw new DomainException("Trainer has an overlapping session.");

        var studioSessions = await _classSessionReadRepository.GetAsync(
            x => x.StudioId == studioId &&
                 x.SessionDate == sessionDate &&
                 x.Status != ClassSessionStatus.Cancelled,
            null,
            false,
            null,
            null,
            cancellationToken);

        if (HasOverlap(studioSessions, startTime, durationInMinutes))
            throw new DomainException("Studio has an overlapping session.");

        return new ClassSession(
            className,
            branchId,
            studioId,
            trainerId,
            sessionDate,
            startTime,
            durationInMinutes,
            capacityLimit,
            studioCapacity,
            description);
    }

    private static bool HasOverlap(
        IReadOnlyCollection<ClassSession> sessions,
        TimeOnly startTime,
        int durationInMinutes)
    {
        var endTime = startTime.AddMinutes(durationInMinutes);

        return sessions.Any(x =>
            startTime < x.StartTime.AddMinutes(x.DurationInMinutes) &&
            x.StartTime < endTime);
    }
}