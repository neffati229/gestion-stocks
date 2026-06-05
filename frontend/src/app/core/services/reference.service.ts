import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Magasin, Categorie, Fournisseur, Utilisateur, DashboardStats, CommandeProposee } from '../../shared/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReferenceService {
  constructor(private http: HttpClient) {}

  getMagasins(): Observable<Magasin[]> {
    return this.http.get<Magasin[]>(`${environment.apiUrl}/magasins`);
  }

  getCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${environment.apiUrl}/categories`);
  }

  getFournisseurs(): Observable<Fournisseur[]> {
    return this.http.get<Fournisseur[]>(`${environment.apiUrl}/fournisseurs`);
  }
}

@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  private url = `${environment.apiUrl}/utilisateurs`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.url);
  }

  create(data: any): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(this.url, data);
  }

  toggleActif(id: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/toggle-actif`, {});
  }
}

@Injectable({ providedIn: 'root' })
export class RapportService {
  private url = `${environment.apiUrl}/rapports`;
  constructor(private http: HttpClient) {}

  getDashboard(magasinId: number): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.url}/dashboard`, { params: { magasinId } });
  }

  getTopProduits(magasinId: number, limit = 10, debut: string, fin: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/top-produits`, { params: { magasinId, limit, debut, fin } });
  }

  getCommandesProposees(magasinId: number): Observable<CommandeProposee[]> {
    return this.http.get<CommandeProposee[]>(`${this.url}/commandes-proposees`, { params: { magasinId } });
  }

  getMouvements(magasinId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/stocks/mouvements`, { params: { magasinId, page: 0, size: 200 } });
  }

  getStocks(magasinId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/stocks`, { params: { magasinId } });
  }

  getProduits(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/produits`);
  }
}
