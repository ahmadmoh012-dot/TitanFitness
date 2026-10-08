import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, shareReplay } from 'rxjs';
import { API_URL } from '../config/api-endpoint.config';
import { BranchOption } from '../models/branches/branch-option.model';

interface BranchResponse {
  id: number;
  name: string;
  address: string | null;
  openingTime: string;
  closingTime: string;
}

@Injectable({ providedIn: 'root' })
export class BranchApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_URL}/branches`;

  private readonly branches$ = this.http.get<BranchResponse[]>(this.endpoint).pipe(
    map(items => items.map(item => ({
      branchId: item.id,
      name: item.name,
      address: item.address,
      openingTime: item.openingTime,
      closingTime: item.closingTime
    } satisfies BranchOption))),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  getBranches(): Observable<BranchOption[]> {
    return this.branches$;
  }
}
