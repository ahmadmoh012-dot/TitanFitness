using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TitanFitness.Domain.Common;

namespace TitanFitness.Domain.Memberships
{
    public sealed class GuestPass : IEntity
    {
        public int Id { get; private set; }
        public int MembershipId { get; private set; }
        public DateOnly IssuedOn { get; private set; }
        public DateOnly? UsedOn { get; private set; }
        public string? GuestName { get; private set; }

        private GuestPass()
        {
        }

        internal GuestPass(DateOnly issuedOn)
        {
            IssuedOn = issuedOn;
        }
        public void Use(DateOnly usedOn, string? guestName)
        {
            if (UsedOn is not null)
            {
                throw new DomainException("Guest pass has already been used.");
            }

                UsedOn = usedOn;
            GuestName = guestName;
        }
    }
}
