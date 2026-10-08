using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TitanFitness.Domain.Common;

namespace TitanFitness.Domain.Scheduling
{
    public sealed class ClassSession : IAggregateRoot
    {
        private readonly List<Booking> _bookings = [];

        public int Id { get; private set; }
        public string ClassName { get; private set; } = null!;
        public int BranchId { get; private set; }
        public int StudioId { get; private set; }
        public int TrainerId { get; private set; }
        public DateOnly SessionDate { get; private set; }
        public TimeOnly StartTime { get; private set; }
        public int DurationInMinutes { get; private set; }
        public int CapacityLimit { get; private set; }
        public ClassSessionStatus Status { get; private set; }
        public string? Description { get; private set; }
        public IReadOnlyCollection<Booking> Bookings => _bookings.AsReadOnly();

        private ClassSession()
        {
        }

        public ClassSession(
            string className,
            int branchId,
            int studioId,
            int trainerId,
            DateOnly sessionDate,
            TimeOnly startTime,
            int durationInMinutes,
            int capacityLimit,
            int studioCapacity,
            string? description)
        {
            if (durationInMinutes is not (30 or 45 or 60))
                throw new DomainException("Duration must be 30, 45, or 60 minutes.");

            if (capacityLimit > studioCapacity)
                throw new DomainException("Session capacity cannot exceed studio capacity.");

            ClassName = className;
            BranchId = branchId;
            StudioId = studioId;
            TrainerId = trainerId;
            SessionDate = sessionDate;
            StartTime = startTime;
            DurationInMinutes = durationInMinutes;
            CapacityLimit = capacityLimit;
            Status = ClassSessionStatus.Open;
            Description = description;
        }
        public void BookMember(
    int memberId,
    DateTime bookedOn,
    string? notesForTrainer)
        {
            if (Status != ClassSessionStatus.Open)
                throw new DomainException("Session is not open for booking.");

            if (_bookings.Any(x =>
                x.MemberId == memberId &&
                x.Status != BookingStatus.Cancelled))
                throw new DomainException("Member already has a booking for this session.");

            var bookedCount = _bookings.Count(x => x.Status == BookingStatus.Booked);

            if (bookedCount < CapacityLimit)
            {
                _bookings.Add(new Booking(
                    memberId,
                    bookedOn,
                    BookingStatus.Booked,
                    null,
                    notesForTrainer));

                return;
            }

            var waitlistPosition =
                _bookings.Count(x => x.Status == BookingStatus.Waitlisted) + 1;

            _bookings.Add(new Booking(
                memberId,
                bookedOn,
                BookingStatus.Waitlisted,
                waitlistPosition,
                notesForTrainer));
        }
        private void ReorderWaitlist()
        {
            var waitlistedBookings = _bookings
                .Where(x => x.Status == BookingStatus.Waitlisted)
                .OrderBy(x => x.WaitlistPosition)
                .ToList();

            for (var i = 0; i < waitlistedBookings.Count; i++)
                waitlistedBookings[i].SetWaitlistPosition(i + 1);
        }
        public void CancelBooking(int bookingId)
        {
            var booking = _bookings.FirstOrDefault(x => x.Id == bookingId);

            if (booking is null)
                throw new DomainException("Booking was not found.");

            if (booking.Status == BookingStatus.Cancelled)
                throw new DomainException("Booking is already cancelled.");

            var wasBooked = booking.Status == BookingStatus.Booked;

            booking.Cancel();

            if (!wasBooked)
            {
                ReorderWaitlist();
                return;
            }

            var nextWaitlisted = _bookings
                .Where(x => x.Status == BookingStatus.Waitlisted)
                .OrderBy(x => x.WaitlistPosition)
                .FirstOrDefault();

            if (nextWaitlisted is null)
                return;

            nextWaitlisted.Promote();
            ReorderWaitlist();
        }
    }
    }
