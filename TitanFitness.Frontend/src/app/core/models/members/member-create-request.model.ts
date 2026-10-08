export interface MemberCreateRequest {
  fullName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  joinedDate: string;
  photo: string | null;
  homeBranchId: number;
  membershipNumber: string | null;
}
