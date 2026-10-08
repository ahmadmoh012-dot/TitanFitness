export interface MemberProfileRecord {
  memberId: number;
  membershipNumber: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  joinedDate: string;
  photo: string | null;
  homeBranchId: number;
}
