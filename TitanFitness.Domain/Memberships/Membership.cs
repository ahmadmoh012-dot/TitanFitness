using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TitanFitness.Domain.Common;

namespace TitanFitness.Domain.Memberships
{
    public class Membership:IAggregateRoot
    {

        private readonly List<Freeze> _freezes = [];
        private readonly List<GuestPass> _guestPasses = [];
        public IReadOnlyCollection<Freeze> Freezes => _freezes.AsReadOnly();
        public IReadOnlyCollection<GuestPass> GuestPasses => _guestPasses.AsReadOnly();
        public int Id { get; private set; }
        public int MemberId { get; private set; }
        public int PlanId { get; private set; }
        public DateTime PurchaseDate { get; private set; }
        public DateOnly StartDate { get; private set; }
        public DateOnly EndDate { get; private set; }
        public MembershipStatus Status { get; private set; }
        public AgreedTerms AgreedTerms { get; private set; } = null!;

        private Membership()
        {
        }

        public Membership(
            int memberId,
            int planId,
            DateTime purchaseDate,
            DateOnly startDate,
            DateOnly endDate,
            MembershipStatus status,
            AgreedTerms agreedTerms)
        {
            MemberId = memberId;
            PlanId = planId;
            PurchaseDate = purchaseDate;
            StartDate = startDate;
            EndDate = endDate;
            Status = status;
            AgreedTerms = agreedTerms;
        }
        public void AddFreeze(
    DateOnly startDate,
    int durationInMonths,
    FreezeReason reason,
    string? additionalNotes,
    DateTime requestedOn,
    DateOnly today)
        {
            if (startDate < today)
            {
                throw new DomainException("Freeze cannot begin in the past.");
            }

                if (_freezes.Count >= AgreedTerms.MaximumNumberOfFreezes)
            {
                throw new DomainException("Maximum number of freezes has been reached.");
            }
            var freezeEndDate = startDate.AddMonths(durationInMonths);

            if (freezeEndDate > EndDate)
            {
                throw new DomainException("Freeze cannot run past the membership end date.");
            }

                var freezeDays = freezeEndDate.DayNumber - startDate.DayNumber;
            var usedFreezeDays = _freezes.Sum(x => x.EndDate.DayNumber - x.StartDate.DayNumber);

            if (usedFreezeDays + freezeDays > AgreedTerms.MaximumFreezeDays)
            {
                throw new DomainException("Maximum freeze days would be exceeded.");
            }

                _freezes.Add(new Freeze(
                startDate,
                freezeEndDate,
                durationInMonths,
                reason,
                additionalNotes,
                requestedOn));

            EndDate = EndDate.AddDays(freezeDays);
        }
        public void IssueGuestPass(DateOnly issuedOn)
        {
            if (_guestPasses.Count >= AgreedTerms.GuestPassQuota)
                throw new DomainException("Guest pass quota has been reached.");

            _guestPasses.Add(new GuestPass(issuedOn));
        }
        public void Cancel()
        {
            if (Status == MembershipStatus.Cancelled)
            {
                throw new DomainException("Membership is already cancelled.");
            }

                Status = MembershipStatus.Cancelled;
        }
        public void EnsureCanBeRenewed()
        {
            if (Status == MembershipStatus.Cancelled)
            {
                throw new DomainException("Cancelled membership cannot be renewed.");
            }
            }
        }
}
