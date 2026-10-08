using MediatR;
using TitanFitness.Application.Common.Exceptions;
using TitanFitness.Domain.Common;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Common.Repositories;
using TitanFitness.Domain.Memberships;
using TitanFitness.Domain.Scheduling;

namespace TitanFitness.Application.Scheduling.CreateBooking;

public sealed class CreateBookingCommandHandler
    : IRequestHandler<CreateBookingCommand, CreateBookingResponse>
{
    private readonly IWriteRepository<ClassSession> _classSessionWriteRepository;
    private readonly IReadRepository<Membership> _membershipReadRepository;
    private readonly ClassBookingService _classBookingService;
    private readonly IUnitOfWork _unitOfWork;

    public CreateBookingCommandHandler(
        IWriteRepository<ClassSession> classSessionWriteRepository,
        IReadRepository<Membership> membershipReadRepository,
        ClassBookingService classBookingService,
        IUnitOfWork unitOfWork)
    {
        _classSessionWriteRepository = classSessionWriteRepository;
        _membershipReadRepository = membershipReadRepository;
        _classBookingService = classBookingService;
        _unitOfWork = unitOfWork;
    }

    public async Task<CreateBookingResponse> Handle(
        CreateBookingCommand request,
        CancellationToken cancellationToken)
    {
        var session = await _classSessionWriteRepository.GetByIdAsync(
            request.SessionId,
            cancellationToken);

        if (session is null)
            throw new NotFoundException("Class session was not found.");

        var sessionStart = session.SessionDate.ToDateTime(session.StartTime);

        if (sessionStart <= DateTime.Now)
            throw new BadRequestException( "Booking is no longer allowed for this session.");

        var memberships = await _membershipReadRepository.GetAsync(
            x => x.MemberId == request.MemberId &&
                 x.Status == MembershipStatus.Active &&
                 x.StartDate <= session.SessionDate &&
                 x.EndDate >= session.SessionDate,
            x => x.StartDate,
            true,
            null,
            1,
            cancellationToken);

        var membership = memberships.FirstOrDefault();

        if (membership is null)
            throw new BadRequestException("Member does not have an active membership.");
        await _classBookingService.BookAsync(
            session,
            membership,
            request.MemberId,
            DateTime.UtcNow,
            request.NotesForTrainer,
            cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var booking = session.Bookings
            .Where(x => x.MemberId == request.MemberId)
            .OrderByDescending(x => x.BookedOn)
            .First();

        int? waitlistPosition = null;

        if (booking.Status == BookingStatus.Waitlisted)
        {
            var waitlistedBookings = session.Bookings
                .Where(x => x.Status == BookingStatus.Waitlisted)
                .OrderBy(x => x.BookedOn)
                .ThenBy(x => x.Id)
                .ToList();

            waitlistPosition =
                waitlistedBookings.FindIndex(x => x.Id == booking.Id) + 1;
        }

        return new CreateBookingResponse(
            booking.Id,
            booking.Status,
            waitlistPosition);
    }
}