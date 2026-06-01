import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { StockService } from '../../../core/services/stock.service';
import { ReferenceService } from '../../../core/services/reference.service';
import { AuthService } from '../../../core/services/auth.service';
import { MouvementStock, Magasin } from '../../../shared/models';

@Component({
  selector: 'app-mouvements',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatCardModule, MatIconModule,
    MatFormFieldModule, MatSelectModule, MatInputModule,
    MatProgressSpinnerModule, MatChipsModule, MatPaginatorModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2 class="page-title">
          <mat-icon>swap_horiz</mat-icon>
          Historique des Mouvements
        </h2>
        <mat-form-field appearance="outline" class="magasin-select">
          <mat-label>Magasin</mat-label>
          <mat-select [(ngModel)]="selectedMagasinId" (ngModelChange)="loadMouvements()">
            @for (m of magasins(); track m.id) {
              <mat-option [value]="m.id">{{ m.nom }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <mat-card class="table-card">
        @if (loading()) {
          <div class="loading-overlay"><mat-spinner diameter="40"></mat-spinner></div>
        }

        <table mat-table [dataSource]="mouvements()" class="full-width">

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let m">{{ m.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
          </ng-container>

          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let m">
              <mat-chip [color]="getTypeColor(m.typeMvt)" highlighted>
                <mat-icon>{{ getTypeIcon(m.typeMvt) }}</mat-icon>
                {{ m.typeMvt }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="produit">
            <th mat-header-cell *matHeaderCellDef>Produit</th>
            <td mat-cell *matCellDef="let m">
              <span class="code-chip">{{ m.produitCode }}</span>
              {{ m.produitNom }}
            </td>
          </ng-container>

          <ng-container matColumnDef="quantite">
            <th mat-header-cell *matHeaderCellDef>Quantité</th>
            <td mat-cell *matCellDef="let m">
              <strong [class.entree]="m.typeMvt === 'ENTREE'" [class.sortie]="m.typeMvt === 'SORTIE'">
                {{ m.typeMvt === 'SORTIE' ? '-' : '+' }}{{ m.quantite | number:'1.0-3' }}
              </strong>
            </td>
          </ng-container>

          <ng-container matColumnDef="reference">
            <th mat-header-cell *matHeaderCellDef>Référence</th>
            <td mat-cell *matCellDef="let m">{{ m.reference ?? '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="utilisateur">
            <th mat-header-cell *matHeaderCellDef>Utilisateur</th>
            <td mat-cell *matCellDef="let m">{{ m.utilisateurNom ?? '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="commentaire">
            <th mat-header-cell *matHeaderCellDef>Commentaire</th>
            <td mat-cell *matCellDef="let m">{{ m.commentaire ?? '—' }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
              Aucun mouvement enregistré
            </td>
          </tr>
        </table>

        <mat-paginator [pageSize]="25" [pageSizeOptions]="[25, 50, 100]"></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1400px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-title { display: flex; align-items: center; gap: 10px; font-size: 24px; font-weight: 600; color: #1F4E79; margin: 0; }
    .magasin-select { width: 220px; }
    .table-card { position: relative; border-radius: 12px !important; overflow: hidden; }
    .loading-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; z-index: 10; }
    .full-width { width: 100%; }
    th { font-weight: 600 !important; background: #f5f7fa !important; }
    .table-row:hover { background: #f9f9f9; }
    .code-chip { background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; margin-right: 6px; }
    .entree { color: #2e7d32; font-size: 15px; }
    .sortie { color: #c62828; font-size: 15px; }
    .no-data { text-align: center; padding: 40px; color: #999; }
  `]
})
export class MouvementsComponent implements OnInit {
  private stockService = inject(StockService);
  private referenceService = inject(ReferenceService);
  private authService = inject(AuthService);

  mouvements = signal<MouvementStock[]>([]);
  magasins = signal<Magasin[]>([]);
  loading = signal(false);
  selectedMagasinId: number | null = null;
  displayedColumns = ['date', 'type', 'produit', 'quantite', 'reference', 'utilisateur', 'commentaire'];

  ngOnInit(): void {
    this.referenceService.getMagasins().subscribe(m => {
      this.magasins.set(m);
      if (m.length > 0) {
        this.selectedMagasinId = this.authService.magasinId() ?? m[0].id;
        this.loadMouvements();
      }
    });
  }

  loadMouvements(): void {
    if (!this.selectedMagasinId) return;
    this.loading.set(true);
    this.stockService.getMouvements(this.selectedMagasinId).subscribe({
      next: m => { this.mouvements.set(m); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getTypeColor(type: string): string {
    return { ENTREE: 'primary', SORTIE: 'warn', TRANSFERT: 'accent', AJUSTEMENT: 'accent' }[type] ?? '';
  }

  getTypeIcon(type: string): string {
    return { ENTREE: 'add', SORTIE: 'remove', TRANSFERT: 'swap_horiz', AJUSTEMENT: 'tune' }[type] ?? 'help';
  }
}
