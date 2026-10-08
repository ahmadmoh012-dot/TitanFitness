using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TitanFitness.Domain.Common;

namespace TitanFitness.Domain.Trainers
{
    public class Trainer:IAggregateRoot
    {
        public int Id { get; private set; }
        public string TrainerNumber { get; private set; } = null!;
        public string Name { get; private set; } = null!;
        public string? Specialty { get; private set; }
        public int BranchId { get; private set; }
        public string? Email { get; private set; }
        public string? Phone { get; private set; }
        public bool IsActive { get; private set; }

        private Trainer()
        {
        }

        public Trainer(
            string trainerNumber,
            string name,
            string? specialty,
            int branchId,
            string? email,
            string? phone,
            bool isActive)
        {
            TrainerNumber = trainerNumber;
            Name = name;
            Specialty = specialty;
            BranchId = branchId;
            Email = email;
            Phone = phone;
            IsActive = isActive;
        }
        public void Update(
                string name,
                     string? specialty,
                       int branchId,
                        string? email,
                          string? phone,
                                 bool isActive)
        {
            Name = name;
            Specialty = specialty;
            BranchId = branchId;
            Email = email;
            Phone = phone;
            IsActive = isActive;
        }

        
    }
}
