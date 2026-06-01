import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock, MouvementRequest, MouvementStock } from '../../shared/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StockService {
  private url = `${environment.apiUrl}/stocks`;
  constructor(private http: HttpClient) {}

  getStock(magasinId: number): Observable<Stock[]> {
    return this.http.get<Stock[]>(this.url, { params: { magasinId } });
  }

  getMouvements(magasinId: number): Observable<MouvementStock[]> {
    return this.http.get<MouvementStock[]>(`${this.url}/mouvements`, { params: { magasinId } });
  }

  entree(request: MouvementRequest): Observable<void> {
    return this.http.post<void>(`${this.url}/entree`, request);
  }

  sortie(request: MouvementRequest): Observable<void> {
    return this.http.post<void>(`${this.url}/sortie`, request);
  }

  transfert(request: MouvementRequest): Observable<void> {
    return this.http.post<void>(`${this.url}/transfert`, request);
  }

  ajustement(request: MouvementRequest): Observable<void> {
    return this.http.post<void>(`${this.url}/ajustement`, request);
  }
}
