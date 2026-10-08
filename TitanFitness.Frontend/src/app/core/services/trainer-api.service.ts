import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { combineLatest, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { API_URL } from '../config/api-endpoint.config';
import { CreatedResource } from '../models/common/created-resource.model';
import { PagedResult } from '../models/common/paged-result.model';
import { TrainerCreateRequest } from '../models/trainers/trainer-create-request.model';
import { TrainerDetailsRecord } from '../models/trainers/trainer-details.model';
import { TrainerDirectoryRecord } from '../models/trainers/trainer-directory-record.model';
import { TrainerOption } from '../models/trainers/trainer-option.model';
import { TrainerUpdateRequest } from '../models/trainers/trainer-update-request.model';
import { BranchApiService } from './branch-api.service';

interface TrainerResponse {
  id: number; trainerNumber: string; name: string; specialty: string | null; branchId: number;
  email: string | null; phone: string | null; isActive: boolean;
}
interface TrainerListResponse { items: TrainerResponse[]; page: number; totalCount: number; }
const TRAINER_PAGE_SIZE = 4;

@Injectable({ providedIn: 'root' })
export class TrainerApiService {
  private readonly http = inject(HttpClient);
  private readonly branches = inject(BranchApiService);
  private readonly endpoint = `${API_URL}/trainers`;

  getTrainers(branchId: number | null, search: string, page: number): Observable<PagedResult<TrainerDirectoryRecord>> {
    let params = new HttpParams().set('page', page);
    if (branchId !== null) params = params.set('branchId', branchId);
    if (search.trim()) params = params.set('query', search.trim());

    return combineLatest([
      this.http.get<TrainerListResponse>(this.endpoint, { params }),
      this.branches.getBranches()
    ]).pipe(map(([response, branches]) => {
      const names = new Map(branches.map(branch => [branch.branchId, branch.name]));
      return {
        items: response.items.map(item => ({
          trainerId: item.id,
          trainerNumber: item.trainerNumber,
          name: item.name,
          specialty: item.specialty,
          branchName: names.get(item.branchId) ?? 'Unknown Branch',
          isActive: item.isActive
        })),
        pageNumber: response.page,
        pageSize: TRAINER_PAGE_SIZE,
        totalCount: response.totalCount,
        totalPages: Math.ceil(response.totalCount / TRAINER_PAGE_SIZE)
      };
    }));
  }

  getAvailableTrainers(branchId: number): Observable<TrainerOption[]> {
    const firstPageParams = new HttpParams()
      .set('branchId', branchId)
      .set('isActive', true)
      .set('page', 1);

    return this.http.get<TrainerListResponse>(this.endpoint, { params: firstPageParams }).pipe(
      switchMap(firstPage => {
        const pageCount = Math.ceil(firstPage.totalCount / TRAINER_PAGE_SIZE);
        const mapOptions = (items: TrainerResponse[]): TrainerOption[] =>
          items.map(item => ({
            trainerId: item.id,
            trainerNumber: item.trainerNumber,
            name: item.name,
            specialty: item.specialty
          }));

        if (pageCount <= 1)
          return of(mapOptions(firstPage.items));

        const remainingPages = Array.from(
          { length: pageCount - 1 },
          (_, index) => index + 2
        ).map(page => {
          const params = new HttpParams()
            .set('branchId', branchId)
            .set('isActive', true)
            .set('page', page);

          return this.http.get<TrainerListResponse>(this.endpoint, { params });
        });

        return forkJoin(remainingPages).pipe(
          map(responses => mapOptions([...firstPage.items, ...responses.flatMap(response => response.items)]))
        );
      })
    );
  }

  getTrainerById(trainerId: number): Observable<TrainerDetailsRecord> {
    return combineLatest([
      this.http.get<TrainerResponse>(`${this.endpoint}/${trainerId}`),
      this.branches.getBranches()
    ]).pipe(map(([trainer, branches]) => ({
      trainerId: trainer.id,
      trainerNumber: trainer.trainerNumber,
      name: trainer.name,
      specialty: trainer.specialty,
      branchId: trainer.branchId,
      branchName: branches.find(branch => branch.branchId === trainer.branchId)?.name ?? 'Unknown Branch',
      email: trainer.email,
      phone: trainer.phone,
      isActive: trainer.isActive
    })));
  }

  createTrainer(trainer: TrainerCreateRequest): Observable<number> {
    const trainerNumber = trainer.trainerNumber?.trim() || this.generateTrainerNumber();
    return this.http.post<CreatedResource>(this.endpoint, { ...trainer, trainerNumber }).pipe(map(result => result.id));
  }

  updateTrainer(trainerId: number, trainer: TrainerUpdateRequest): Observable<void> {
    return this.http.put<void>(`${this.endpoint}/${trainerId}`, trainer);
  }

  private generateTrainerNumber(): string {
    return `TR-${Date.now().toString().slice(-8)}`;
  }
}
