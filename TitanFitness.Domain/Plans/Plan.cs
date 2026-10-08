using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TitanFitness.Domain.Common;

namespace TitanFitness.Domain.Plans
{
    public  class Plan :IAggregateRoot

    {
        public int Id { get; private set; }
        public string Name { get; private set; } = null!;
        public decimal Price { get; private set; }
        public int DurationInMonths { get; private set; }
        public int MaximumFreezeDays { get; private set; }
        public int MaximumNumberOfFreezes { get; private set; }
        public int GuestPassQuota { get; private set; }
        public AccessScope AccessScope { get; private set; }
        public bool IsPublished { get; private set; }

        private Plan()
        {
        }

        public Plan(//create 
            string name,
            decimal price,
            int durationInMonths,
            int maximumFreezeDays,
            int maximumNumberOfFreezes,
            int guestPassQuota,
            AccessScope accessScope,
            bool isPublished)
        {
            Name = name;
            Price = price;
            DurationInMonths = durationInMonths;
            MaximumFreezeDays = maximumFreezeDays;
            MaximumNumberOfFreezes = maximumNumberOfFreezes;
            GuestPassQuota = guestPassQuota;
            AccessScope = accessScope;
            IsPublished = isPublished;
        }
        public void Update(//Edit Plan

              string name,
                decimal price,
                int durationInMonths,
                  int maximumFreezeDays,
                int maximumNumberOfFreezes,
              int guestPassQuota,
                 AccessScope accessScope,
                   bool isPublished)
        {
            Name = name;
            Price = price;
            DurationInMonths = durationInMonths;
            MaximumFreezeDays = maximumFreezeDays;
            MaximumNumberOfFreezes = maximumNumberOfFreezes;
            GuestPassQuota = guestPassQuota;
            AccessScope = accessScope;
            IsPublished = isPublished;
        }
    }
}
