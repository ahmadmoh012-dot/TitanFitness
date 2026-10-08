using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TitanFitness.Domain.Common;

namespace TitanFitness.Domain.Memberships
{   public sealed class Freeze : IEntity

        {
            public int Id { get; private set; }
            public int MembershipId { get; private set; }
            public DateOnly StartDate { get; private set; }
            public DateOnly EndDate { get; private set; }
            public int DurationInMonths { get; private set; }
            public FreezeReason Reason { get; private set; }
            public string? AdditionalNotes { get; private set; }
            public DateTime RequestedOn { get; private set; }

            private Freeze()
            {
            }

            internal Freeze(
                DateOnly startDate,
                DateOnly endDate,
                int durationInMonths,
                FreezeReason reason,
                string? additionalNotes,
                DateTime requestedOn)
            {
                StartDate = startDate;
                EndDate = endDate;
                DurationInMonths = durationInMonths;
                Reason = reason;
                AdditionalNotes = additionalNotes;
                RequestedOn = requestedOn;
            }
        }
    }

