import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produit, ProduitRequest } from '../../shared/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProduitService {
  private url = `${environment.apiUrl}/produits`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Produit[]> {
    return this.http.get<Produit[]>(this.url);
  }

  getById(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.url}/${id}`);
  }

  search(q: string): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.url}/search`, { params: { q } });
  }

  getAlertes(magasinId: number): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.url}/alertes`, { params: { magasinId } });
  }

  create(request: ProduitRequest): Observable<Produit> {
    return this.http.post<Produit>(this.url, request);
  }

  update(id: number, request: ProduitRequest): Observable<Produit> {
    return this.http.put<Produit>(`${this.url}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
