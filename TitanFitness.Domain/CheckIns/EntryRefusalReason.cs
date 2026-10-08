using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TitanFitness.Domain.CheckIns
{
    public enum EntryRefusalReason
    {
        Expired = 1,
        Frozen = 2,
        Cancelled = 3,
        NotYetStarted = 4,
        WrongBranch = 5,
        NoMembership = 6
    }
}