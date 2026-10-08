import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_URL } from '../config/api-endpoint.config';
import { StudioOption } from '../models/scheduling/studio-option.model';

interface StudioResponse { id: number; name: string; branchId: number; capacity: number; }

@Injectable({ providedIn: 'root' })
export class StudioApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_URL}/studios`;

  getStudios(branchId: number): Observable<StudioOption[]> {
    const params = new HttpParams().set('branchId', branchId);
    return this.http.get<StudioResponse[]>(this.endpoint, { params }).pipe(
      map(items => items.map(item => ({ studioId: item.id, name: item.name, capacity: item.capacity })))
    );
  }
}
