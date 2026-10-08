using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TitanFitness.Domain.Common;

namespace TitanFitness.Domain.Members
{
    public sealed class Member : IAggregateRoot
    {
        public int Id { get; private set; }
        public string MembershipNumber { get; private set; } = null!;
        public string FullName { get; private set; } = null!;
        public string? Email { get; private set; }
        public string? Phone { get; private set; }
        public string? Address { get; private set; }
        public DateOnly JoinedDate { get; private set; }
        public string? Photo { get; private set; }
        public int HomeBranchId { get; private set; }

        private Member()
        {
        }

        public Member(//this constr to create a member 
            string membershipNumber,
            string fullName,
            string? email,
            string? phone,
            string? address,
            DateOnly joinedDate,
            string? photo,
            int homeBranchId)
        {
            MembershipNumber = membershipNumber;
            FullName = fullName;
            Email = email;
            Phone = phone;
            Address = address;
            JoinedDate = joinedDate;
            Photo = photo;
            HomeBranchId = homeBranchId;
        }
        public void UpdateProfile(// to edit member and we ignored membershipNumber 
            //becaues i cant change it 
                  string fullName,
                  string? email,
                  string? phone,
                  string? address,
                  DateOnly joinedDate,
                   string? photo,
                    int homeBranchId)
        {
            FullName = fullName;
            Email = email;
            Phone = phone;
            Address = address;
            JoinedDate = joinedDate;
            Photo = photo;
            HomeBranchId = homeBranchId;
        }
    }
}
