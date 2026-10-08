export interface TrainerCreateRequest {
  name: string;
  branchId: number;
  specialty: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  trainerNumber?: string;
}
