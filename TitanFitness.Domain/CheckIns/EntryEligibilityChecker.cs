using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TitanFitness.Domain.Memberships;
using TitanFitness.Domain.Plans;

namespace TitanFitness.Domain.CheckIns
{
    public sealed class EntryEligibilityChecker
    {
        public EntryEligibility Check(
            Membership membership,
            int memberHomeBranchId,
            int branchId,
            DateOnly today)
        {
            if (membership.Status == MembershipStatus.Cancelled)
                return EntryEligibility.Refused(EntryRefusalReason.Cancelled);

            if (today < membership.StartDate)
                return EntryEligibility.Refused(EntryRefusalReason.NotYetStarted);

            if (today > membership.EndDate)
                return EntryEligibility.Refused(EntryRefusalReason.Expired);

            if (membership.Status == MembershipStatus.Frozen)
                return EntryEligibility.Refused(EntryRefusalReason.Frozen);

            if (membership.AgreedTerms.AccessScope == AccessScope.HomeBranchOnly &&
                branchId != memberHomeBranchId)
                return EntryEligibility.Refused(EntryRefusalReason.WrongBranch);

            return EntryEligibility.Admitted();
        }
    }
}
