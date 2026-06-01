import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { StockService } from '../../core/services/stock.service';
import { ReferenceService } from '../../core/services/reference.service';
import { ProduitService } from '../../core/services/produit.service';
import { AuthService } from '../../core/services/auth.service';
import { Stock, Magasin, Produit, MouvementRequest } from '../../shared/models';

type MvtType = 'ENTREE' | 'SORTIE' | 'TRANSFERT' | 'AJUSTEMENT';

@Component({
  selector: 'app-stocks',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatTableModule, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressSpinnerModule, MatChipsModule, MatTooltipModule,
    MatSnackBarModule, MatBadgeModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2 class="page-title">
          <mat-icon>warehouse</mat-icon>
          État des Stocks
        </h2>

        <div class="header-actions">
          <mat-form-field appearance="outline" class="magasin-select">
            <mat-label>Magasin</mat-label>
            <mat-select [(ngModel)]="selectedMagasinId" (ngModelChange)="loadStock()">
              @for (m of magasins(); track m.id) {
                <mat-option [value]="m.id">{{ m.nom }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          @if (canEdit()) {
            <button mat-raised-button color="primary" (click)="openMvtDialog('ENTREE')">
              <mat-icon>add_circle</mat-icon> Entrée
            </button>
            <button mat-raised-button color="accent" (click)="openMvtDialog('SORTIE')">
              <mat-icon>remove_circle</mat-icon> Sortie
            </button>
            <button mat-raised-button (click)="openMvtDialog('TRANSFERT')">
              <mat-icon>swap_horiz</mat-icon> Transfert
            </button>
          }
        </div>
      </div>

      <!-- Alertes -->
      @if (alertesCount() > 0) {
        <div class="alert-banner">
          <mat-icon>warning</mat-icon>
          <span>{{ alertesCount() }} produit(s) sous le seuil minimum — réapprovisionnement requis</span>
        </div>
      }

      <!-- Stock Table -->
      <mat-card class="table-card">
        @if (loading()) {
          <div class="loading-overlay"><mat-spinner diameter="40"></mat-spinner></div>
        }

        <table mat-table [dataSource]="stocks()" class="full-width">
          <ng-container matColumnDef="code">
            <th mat-header-cell *matHeaderCellDef>Code</th>
            <td mat-cell *matCellDef="let s">
              <span class="code-chip">{{ s.produitCode }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="nom">
            <th mat-header-cell *matHeaderCellDef>Produit</th>
            <td mat-cell *matCellDef="let s">{{ s.produitNom }}</td>
          </ng-container>

          <ng-container matColumnDef="quantite">
            <th mat-header-cell *matHeaderCellDef>Quantité</th>
            <td mat-cell *matCellDef="let s">
              <strong [class.quantite-faible]="s.sousSeuilMin" [class.quantite-ok]="!s.sousSeuilMin">
                {{ s.quantite | number:'1.0-3' }}
              </strong>
            </td>
          </ng-container>

          <ng-container matColumnDef="seuils">
            <th mat-header-cell *matHeaderCellDef>Seuil min / max</th>
            <td mat-cell *matCellDef="let s">{{ s.seuilMin }} / {{ s.seuilMax }}</td>
          </ng-container>

          <ng-container matColumnDef="statut">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let s">
              @if (s.sousSeuilMin) {
                <mat-chip color="warn" highlighted>
                  <mat-icon>warning</mat-icon> Alerte
                </mat-chip>
              } @else {
                <mat-chip color="primary" highlighted>OK</mat-chip>
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="updatedAt">
            <th mat-header-cell *matHeaderCellDef>Dernière MAJ</th>
            <td mat-cell *matCellDef="let s">{{ s.updatedAt | date:'dd/MM/yyyy HH:mm' }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
              Aucun stock disponible pour ce magasin
            </td>
          </tr>
        </table>
      </mat-card>
    </div>

    <!-- MOUVEMENT DIALOG -->
    @if (showDialog()) {
      <div class="dialog-overlay" (click)="closeDialog()">
        <mat-card class="dialog-card" (click)="$event.stopPropagation()">
          <mat-card-header>
            <mat-icon mat-card-avatar [color]="mvtTypeColor()">
              {{ mvtTypeIcon() }}
            </mat-icon>
            <mat-card-title>{{ mvtTypeLabel() }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="mvtForm" class="form-col">

              <mat-form-field appearance="outline">
                <mat-label>Produit *</mat-label>
                <mat-select formControlName="produitId">
                  @for (p of produits(); track p.id) {
                    <mat-option [value]="p.id">{{ p.code }} – {{ p.nom }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Magasin source *</mat-label>
                <mat-select formControlName="magasinId">
                  @for (m of magasins(); track m.id) {
                    <mat-option [value]="m.id">{{ m.nom }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              @if (dialogType() === 'TRANSFERT') {
                <mat-form-field appearance="outline">
                  <mat-label>Magasin destination *</mat-label>
                  <mat-select formControlName="magasinDestId">
                    @for (m of magasins(); track m.id) {
                      <mat-option [value]="m.id">{{ m.nom }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              }

              <mat-form-field appearance="outline">
                <mat-label>Quantité *</mat-label>
                <input matInput type="number" formControlName="quantite" step="0.001">
              </mat-form-field>

              @if (dialogType() === 'ENTREE') {
                <mat-form-field appearance="outline">
                  <mat-label>Prix unitaire (DT)</mat-label>
                  <input matInput type="number" formControlName="prixUnitaire" step="0.01">
                </mat-form-field>
              }

              <mat-form-field appearance="outline">
                <mat-label>Référence / Bon</mat-label>
                <input matInput formControlName="reference">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Commentaire</mat-label>
                <textarea matInput formControlName="commentaire" rows="2"></textarea>
              </mat-form-field>
            </form>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-button (click)="closeDialog()">Annuler</button>
            <button mat-raised-button [color]="mvtTypeColor()" (click)="saveMouvement()"
                    [disabled]="saving()">
              @if (saving()) { <mat-spinner diameter="18"></mat-spinner> }
              @else { Valider }
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .page-container { max-width: 1400px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
    .page-title { display: flex; align-items: center; gap: 10px; font-size: 24px; font-weight: 600; color: #1F4E79; margin: 0; }
    .header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .magasin-select { width: 220px; }
    .alert-banner {
      display: flex; align-items: center; gap: 10px;
      background: #fff3e0; color: #e65100;
      border-left: 4px solid #ff9800; border-radius: 8px;
      padding: 12px 16px; margin-bottom: 16px; font-weight: 500;
    }
    .table-card { position: relative; border-radius: 12px !important; overflow: hidden; }
    .loading-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; z-index: 10; }
    .full-width { width: 100%; }
    th { font-weight: 600 !important; background: #f5f7fa !important; }
    .table-row:hover { background: #f0f4ff; }
    .code-chip { background: #e3f2fd; color: #1565c0; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .quantite-faible { color: #c62828; font-size: 16px; }
    .quantite-ok { color: #2e7d32; font-size: 16px; }
    .no-data { text-align: center; padding: 40px; color: #999; }
    .dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .dialog-card { width: 500px; max-width: 95vw; max-height: 90vh; overflow-y: auto; border-radius: 16px !important; }
    .form-col { display: flex; flex-direction: column; gap: 8px; padding-top: 8px; }
    mat-card-actions { padding: 16px !important; }
  `]
})
export class StocksComponent implements OnInit {
  private stockService = inject(StockService);
  private referenceService = inject(ReferenceService);
  private produitService = inject(ProduitService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  stocks = signal<Stock[]>([]);
  magasins = signal<Magasin[]>([]);
  produits = signal<Produit[]>([]);
  loading = signal(false);
  showDialog = signal(false);
  dialogType = signal<MvtType>('ENTREE');
  saving = signal(false);
  selectedMagasinId: number | null = null;

  displayedColumns = ['code', 'nom', 'quantite', 'seuils', 'statut', 'updatedAt'];
  canEdit = () => this.authService.hasRole('GESTIONNAIRE');
  alertesCount = () => this.stocks().filter(s => s.sousSeuilMin).length;

  mvtForm: FormGroup = this.fb.group({
    produitId: [null, Validators.required],
    magasinId: [null, Validators.required],
    magasinDestId: [null],
    quantite: [null, [Validators.required, Validators.min(0.001)]],
    prixUnitaire: [null],
    reference: [''],
    commentaire: ['']
  });

  mvtTypeLabel = () => ({ ENTREE: 'Entrée de stock', SORTIE: 'Sortie de stock', TRANSFERT: 'Transfert entre magasins', AJUSTEMENT: 'Ajustement de stock' }[this.dialogType()]);
  mvtTypeIcon = () => ({ ENTREE: 'add_circle', SORTIE: 'remove_circle', TRANSFERT: 'swap_horiz', AJUSTEMENT: 'tune' }[this.dialogType()]);
  mvtTypeColor = () => ({ ENTREE: 'primary', SORTIE: 'warn', TRANSFERT: 'accent', AJUSTEMENT: 'accent' }[this.dialogType()] as any);

  ngOnInit(): void {
    this.referenceService.getMagasins().subscribe(m => {
      this.magasins.set(m);
      if (m.length > 0) {
        this.selectedMagasinId = this.authService.magasinId() ?? m[0].id;
        this.loadStock();
      }
    });
    this.produitService.getAll().subscribe(p => this.produits.set(p));
  }

  loadStock(): void {
    if (!this.selectedMagasinId) return;
    this.loading.set(true);
    this.stockService.getStock(this.selectedMagasinId).subscribe({
      next: s => { this.stocks.set(s); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openMvtDialog(type: MvtType): void {
    this.dialogType.set(type);
    this.mvtForm.reset({ magasinId: this.selectedMagasinId });
    this.showDialog.set(true);
  }

  closeDialog(): void { this.showDialog.set(false); }

  saveMouvement(): void {
    if (this.mvtForm.invalid) { this.mvtForm.markAllAsTouched(); return; }
    this.saving.set(true);
    const data: MouvementRequest = { ...this.mvtForm.value, type: this.dialogType() };

    const obs = {
      ENTREE: () => this.stockService.entree(data),
      SORTIE: () => this.stockService.sortie(data),
      TRANSFERT: () => this.stockService.transfert(data),
      AJUSTEMENT: () => this.stockService.ajustement(data),
    }[this.dialogType()]();

    obs.subscribe({
      next: () => {
        this.snackBar.open('Mouvement enregistré', '✓', { duration: 3000, panelClass: ['snack-success'] });
        this.closeDialog();
        this.loadStock();
        this.saving.set(false);
      },
      error: () => this.saving.set(false)
    });
  }
}
