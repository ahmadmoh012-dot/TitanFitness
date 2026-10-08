using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TitanFitness.Domain.Common;

namespace TitanFitness.Domain.Scheduling
{
    public sealed class Booking : IEntity
    {
        public int Id { get; private set; }
        public int SessionId { get; private set; }
        public int MemberId { get; private set; }
        public DateTime BookedOn { get; private set; }
        public BookingStatus Status { get; private set; }
        public int? WaitlistPosition { get; private set; }
        public string? NotesForTrainer { get; private set; }

        private Booking()
        {
        }

        internal Booking(
            int memberId,
            DateTime bookedOn,
            BookingStatus status,
            int? waitlistPosition,
            string? notesForTrainer)
        {
            MemberId = memberId;
            BookedOn = bookedOn;
            Status = status;
            WaitlistPosition = waitlistPosition;
            NotesForTrainer = notesForTrainer;
        }
        internal void Cancel()
        {
            Status = BookingStatus.Cancelled;
            WaitlistPosition = null;
        }

        internal void Promote()
        {
            Status = BookingStatus.Booked;
            WaitlistPosition = null;
        }
        internal void SetWaitlistPosition(int position)
        {
            WaitlistPosition = position;
        }
    }
}
