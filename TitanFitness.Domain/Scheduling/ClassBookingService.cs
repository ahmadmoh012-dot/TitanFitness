using TitanFitness.Domain.Common;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Memberships;

namespace TitanFitness.Domain.Scheduling;

public sealed class ClassBookingService
{
    private readonly IReadRepository<ClassSession> _classSessionReadRepository;

    public ClassBookingService(
        IReadRepository<ClassSession> classSessionReadRepository)
    {
        _classSessionReadRepository = classSessionReadRepository;
    }

    public async Task BookAsync(
        ClassSession session,
        Membership membership,
        int memberId,
        DateTime bookedOn,
        string? notesForTrainer,
        CancellationToken cancellationToken)
    {
        if (membership.MemberId != memberId)
            throw new DomainException("Membership does not belong to this member.");

        if (membership.Status != MembershipStatus.Active)
            throw new DomainException("Member does not have an active membership.");

        var memberSessions = await _classSessionReadRepository.GetAsync(
            x => x.SessionDate == session.SessionDate &&
                 x.Id != session.Id &&
                 x.Bookings.Any(b =>
                     b.MemberId == memberId &&
                     b.Status != BookingStatus.Cancelled),
            null,
            false,
            null,
            null,
            cancellationToken);

        var hasOverlap = memberSessions.Any(x =>
            HasOverlap(x, session));

        if (hasOverlap)
            throw new DomainException("Member has an overlapping class booking.");

        session.BookMember(
            memberId,
            bookedOn,
            notesForTrainer);
    }

    private static bool HasOverlap(
        ClassSession existingSession,
        ClassSession newSession)
    {
        var existingEndTime = existingSession.StartTime
            .AddMinutes(existingSession.DurationInMinutes);

        var newEndTime = newSession.StartTime
            .AddMinutes(newSession.DurationInMinutes);

        return newSession.StartTime < existingEndTime &&
               existingSession.StartTime < newEndTime;
    }
}