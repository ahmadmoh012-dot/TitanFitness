using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TitanFitness.Domain.Common;

namespace TitanFitness.Domain.Branches
{
    public class Studio:IEntity
    {
        public int Id { get; private set; }
        public string Name { get; private set; } = null!;
        public int BranchId { get; private set; }
        public int Capacity { get; private set; }

        private Studio()
        {
        }

        internal Studio(string name, int capacity)
        {
            Name = name;
            Capacity = capacity;
        }
    }
}
