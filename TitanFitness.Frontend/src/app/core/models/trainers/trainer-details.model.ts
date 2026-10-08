export interface TrainerDetailsRecord {
  trainerId: number;
  trainerNumber: string;
  branchName: string;
  name: string;
  branchId: number;
  specialty: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
}
