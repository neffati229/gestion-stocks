import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { RapportService } from '../../core/services/reference.service';
import { ReferenceService } from '../../core/services/reference.service';
import { AuthService } from '../../core/services/auth.service';
import { CommandeProposee, Magasin } from '../../shared/models';

@Component({
  selector: 'app-rapports',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatIconModule, MatButtonModule, MatTableModule,
    MatFormFieldModule, MatSelectModule, MatInputModule,
    MatProgressSpinnerModule, MatTabsModule, MatChipsModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2 class="page-title">
          <mat-icon>bar_chart</mat-icon>
          Rapports & Analyses
        </h2>
        <mat-form-field appearance="outline" class="magasin-select">
          <mat-label>Magasin</mat-label>
          <mat-select [(ngModel)]="selectedMagasinId" (ngModelChange)="loadAll()">
            @for (m of magasins(); track m.id) {
              <mat-option [value]="m.id">{{ m.nom }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <mat-tab-group animationDuration="200ms">

        <!-- TAB 1: Commandes proposées -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>shopping_cart</mat-icon>&nbsp;
            Commandes à passer
            @if (commandes().length > 0) {
              <span class="tab-badge">{{ commandes().length }}</span>
            }
          </ng-template>

          <div class="tab-content">
            @if (loadingCommandes()) {
              <div class="loading-center"><mat-spinner></mat-spinner></div>
            } @else if (commandes().length === 0) {
              <div class="empty-state">
                <mat-icon>check_circle</mat-icon>
                <p>Tous les stocks sont au-dessus des seuils minimum.</p>
              </div>
            } @else {
              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ commandes().length }} produit(s) à réapprovisionner</mat-card-title>
                  <mat-card-subtitle>
                    Total estimé : <strong>{{ totalCommandes() | number:'1.2-2' }} DT</strong>
                  </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <table mat-table [dataSource]="commandes()" class="full-width">
                    <ng-container matColumnDef="code">
                      <th mat-header-cell *matHeaderCellDef>Code</th>
                      <td mat-cell *matCellDef="let c"><span class="code-chip">{{ c.code }}</span></td>
                    </ng-container>
                    <ng-container matColumnDef="nom">
                      <th mat-header-cell *matHeaderCellDef>Produit</th>
                      <td mat-cell *matCellDef="let c">{{ c.nom }}</td>
                    </ng-container>
                    <ng-container matColumnDef="stockActuel">
                      <th mat-header-cell *matHeaderCellDef>Stock actuel</th>
                      <td mat-cell *matCellDef="let c">
                        <mat-chip color="warn" highlighted>{{ c.quantiteActuelle }}</mat-chip>
                        / {{ c.seuilMin }} min
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="aCommander">
                      <th mat-header-cell *matHeaderCellDef>À commander</th>
                      <td mat-cell *matCellDef="let c"><strong>{{ c.quantiteACommander }}</strong></td>
                    </ng-container>
                    <ng-container matColumnDef="prixUnitaire">
                      <th mat-header-cell *matHeaderCellDef>Prix unitaire</th>
                      <td mat-cell *matCellDef="let c">{{ c.prixUnitaire | number:'1.2-2' }} DT</td>
                    </ng-container>
                    <ng-container matColumnDef="total">
                      <th mat-header-cell *matHeaderCellDef>Total</th>
                      <td mat-cell *matCellDef="let c"><strong>{{ c.totalCommande | number:'1.2-2' }} DT</strong></td>
                    </ng-container>
                    <ng-container matColumnDef="fournisseur">
                      <th mat-header-cell *matHeaderCellDef>Fournisseur</th>
                      <td mat-cell *matCellDef="let c">{{ c.fournisseurNom ?? '—' }}</td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="commandesCols"></tr>
                    <tr mat-row *matRowDef="let row; columns: commandesCols;" class="table-row"></tr>
                  </table>
                </mat-card-content>
              </mat-card>
            }
          </div>
        </mat-tab>

        <!-- TAB 2: Top produits -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>trending_up</mat-icon>&nbsp;Top Produits
          </ng-template>
          <div class="tab-content">
            <div class="date-filters">
              <mat-form-field appearance="outline">
                <mat-label>Date début</mat-label>
                <input matInput type="date" [(ngModel)]="dateDebut">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Date fin</mat-label>
                <input matInput type="date" [(ngModel)]="dateFin">
              </mat-form-field>
              <button mat-raised-button color="primary" (click)="loadTopProduits()">
                <mat-icon>search</mat-icon> Analyser
              </button>
            </div>

            @if (topProduits().length > 0) {
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Top {{ topProduits().length }} produits les plus vendus</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="bar-chart">
                    @for (p of topProduits(); track p.nom; let i = $index) {
                      <div class="bar-item">
                        <span class="bar-rank">#{{ i + 1 }}</span>
                        <span class="bar-label">{{ p.nom }}</span>
                        <div class="bar-track">
                          <div class="bar-fill"
                               [style.width.%]="(p.totalSorties / topProduits()[0].totalSorties) * 100">
                          </div>
                        </div>
                        <span class="bar-value">{{ p.totalSorties | number:'1.0-0' }}</span>
                      </div>
                    }
                  </div>
                </mat-card-content>
              </mat-card>
            }
          </div>
        </mat-tab>

      </mat-tab-group>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1400px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-title { display: flex; align-items: center; gap: 10px; font-size: 24px; font-weight: 600; color: #1F4E79; margin: 0; }
    .magasin-select { width: 220px; }
    .tab-content { padding: 20px 0; }
    .tab-badge { background: #c62828; color: #fff; border-radius: 50%; padding: 2px 6px; font-size: 11px; font-weight: 700; margin-left: 6px; }
    .loading-center { display: flex; justify-content: center; padding: 60px; }
    .empty-state { text-align: center; padding: 60px; color: #888; }
    .empty-state mat-icon { font-size: 56px; width: 56px; height: 56px; color: #4caf50; }
    .full-width { width: 100%; }
    th { font-weight: 600 !important; background: #f5f7fa !important; }
    .table-row:hover { background: #f0f4ff; }
    .code-chip { background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
    .date-filters { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .bar-chart { display: flex; flex-direction: column; gap: 10px; padding: 8px 0; }
    .bar-item { display: flex; align-items: center; gap: 10px; }
    .bar-rank { font-weight: 700; color: #666; width: 28px; text-align: right; }
    .bar-label { width: 200px; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .bar-track { flex: 1; background: #e0e0e0; border-radius: 8px; height: 18px; overflow: hidden; }
    .bar-fill { height: 100%; background: linear-gradient(90deg, #2E75B6, #64b5f6); border-radius: 8px; transition: width 0.4s ease; min-width: 4px; }
    .bar-value { width: 60px; font-weight: 600; font-size: 13px; color: #333; }
  `]
})
export class RapportsComponent implements OnInit {
  private rapportService = inject(RapportService);
  private referenceService = inject(ReferenceService);
  private authService = inject(AuthService);

  commandes = signal<CommandeProposee[]>([]);
  topProduits = signal<any[]>([]);
  magasins = signal<Magasin[]>([]);
  loadingCommandes = signal(false);
  selectedMagasinId: number | null = null;
  commandesCols = ['code', 'nom', 'stockActuel', 'aCommander', 'prixUnitaire', 'total', 'fournisseur'];

  dateDebut = new Date(new Date().setDate(1)).toISOString().split('T')[0];
  dateFin = new Date().toISOString().split('T')[0];

  totalCommandes = () => this.commandes().reduce((sum, c) => sum + c.totalCommande, 0);

  ngOnInit(): void {
    this.referenceService.getMagasins().subscribe(m => {
      this.magasins.set(m);
      if (m.length > 0) {
        this.selectedMagasinId = this.authService.magasinId() ?? m[0].id;
        this.loadAll();
      }
    });
  }

  loadAll(): void {
    this.loadCommandes();
  }

  loadCommandes(): void {
    if (!this.selectedMagasinId) return;
    this.loadingCommandes.set(true);
    this.rapportService.getCommandesProposees(this.selectedMagasinId).subscribe({
      next: c => { this.commandes.set(c); this.loadingCommandes.set(false); },
      error: () => this.loadingCommandes.set(false)
    });
  }

  loadTopProduits(): void {
    if (!this.selectedMagasinId) return;
    const debut = this.dateDebut + 'T00:00:00';
    const fin = this.dateFin + 'T23:59:59';
    this.rapportService.getTopProduits(this.selectedMagasinId, 10, debut, fin).subscribe(
      d => this.topProduits.set(d)
    );
  }
}
