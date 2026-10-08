using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TitanFitness.Domain.Scheduling
{
    public enum BookingStatus
    {
        Booked = 1,
        Waitlisted = 2,
        Attended = 3,
        NoShow = 4,
        Cancelled = 5
    }
}
