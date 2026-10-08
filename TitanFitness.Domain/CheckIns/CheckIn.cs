using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TitanFitness.Domain.Common;

namespace TitanFitness.Domain.CheckIns
{
    public sealed class CheckIn : IAggregateRoot
    {
        public int Id { get; private set; }
        public int MemberId { get; private set; }
        public int BranchId { get; private set; }
        public DateTime CheckedInAt { get; private set; }
        public CheckInResult Result { get; private set; }
        public string? RefusalReason { get; private set; }

        private CheckIn()
        {
        }

        public CheckIn(
            int memberId,
            int branchId,
            DateTime checkedInAt,
            CheckInResult result,
            string? refusalReason)
        {
            MemberId = memberId;
            BranchId = branchId;
            CheckedInAt = checkedInAt;
            Result = result;
            RefusalReason = refusalReason;
        }
    }
}
