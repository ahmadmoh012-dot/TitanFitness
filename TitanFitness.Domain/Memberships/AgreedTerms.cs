using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TitanFitness.Domain.Plans;

namespace TitanFitness.Domain.Memberships
{
    public sealed record AgreedTerms(
     decimal PricePaid,
     int DurationInMonths,
     int MaximumFreezeDays,
     int MaximumNumberOfFreezes,
     int GuestPassQuota,
     AccessScope AccessScope);
}
