using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TitanFitness.Domain.CheckIns
{
    public sealed record EntryEligibility
    {
        public CheckInResult Result { get; }
        public EntryRefusalReason? RefusalReason { get; }

        private EntryEligibility(
            CheckInResult result,
            EntryRefusalReason? refusalReason)
        {
            Result = result;
            RefusalReason = refusalReason;
        }

        public static EntryEligibility Admitted()
        {
            return new EntryEligibility(
                CheckInResult.Admitted,
                null);
        }

        public static EntryEligibility Refused(EntryRefusalReason reason)
        {
            return new EntryEligibility(
                CheckInResult.Refused,
                reason);
        }
    }
}
