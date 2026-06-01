import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { ProduitService } from '../../core/services/produit.service';
import { ReferenceService } from '../../core/services/reference.service';
import { AuthService } from '../../core/services/auth.service';
import { Produit, Categorie, Fournisseur } from '../../shared/models';

@Component({
  selector: 'app-produits',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatTableModule, MatCardModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatSelectModule, MatDialogModule,
    MatProgressSpinnerModule, MatChipsModule, MatTooltipModule,
    MatSnackBarModule, MatPaginatorModule, MatSortModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2 class="page-title">
          <mat-icon>category</mat-icon>
          Gestion des Produits
        </h2>
        @if (canEdit()) {
          <button mat-raised-button color="primary" (click)="openDialog()">
            <mat-icon>add</mat-icon>
            Nouveau produit
          </button>
        }
      </div>

      <!-- Search bar -->
      <mat-card class="search-card">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Rechercher par nom ou code</mat-label>
          <input matInput [(ngModel)]="searchQuery" (input)="onSearch()" placeholder="Ex: PROD001, Lait...">
          <mat-icon matPrefix>search</mat-icon>
          @if (searchQuery) {
            <button mat-icon-button matSuffix (click)="searchQuery=''; loadProduits()">
              <mat-icon>clear</mat-icon>
            </button>
          }
        </mat-form-field>
      </mat-card>

      <!-- Table -->
      <mat-card class="table-card">
        @if (loading()) {
          <div class="loading-overlay"><mat-spinner diameter="40"></mat-spinner></div>
        }

        <table mat-table [dataSource]="produits()" class="full-width">

          <ng-container matColumnDef="code">
            <th mat-header-cell *matHeaderCellDef>Code</th>
            <td mat-cell *matCellDef="let p">
              <strong class="code-chip">{{ p.code }}</strong>
            </td>
          </ng-container>

          <ng-container matColumnDef="nom">
            <th mat-header-cell *matHeaderCellDef>Nom</th>
            <td mat-cell *matCellDef="let p">{{ p.nom }}</td>
          </ng-container>

          <ng-container matColumnDef="categorie">
            <th mat-header-cell *matHeaderCellDef>Catégorie</th>
            <td mat-cell *matCellDef="let p">{{ p.categorieNom ?? '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="prixAchat">
            <th mat-header-cell *matHeaderCellDef>Prix achat</th>
            <td mat-cell *matCellDef="let p">{{ p.prixAchat | number:'1.2-2' }} DT</td>
          </ng-container>

          <ng-container matColumnDef="prixVente">
            <th mat-header-cell *matHeaderCellDef>Prix vente</th>
            <td mat-cell *matCellDef="let p">{{ p.prixVente | number:'1.2-2' }} DT</td>
          </ng-container>

          <ng-container matColumnDef="marge">
            <th mat-header-cell *matHeaderCellDef>Marge</th>
            <td mat-cell *matCellDef="let p">
              <span [class.marge-positive]="p.margeBeneficiaire > 0"
                    [class.marge-negative]="p.margeBeneficiaire <= 0">
                {{ p.margeBeneficiaire | number:'1.1-1' }}%
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="seuils">
            <th mat-header-cell *matHeaderCellDef>Seuils (min/max)</th>
            <td mat-cell *matCellDef="let p">{{ p.seuilMin }} / {{ p.seuilMax }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let p">
              @if (canEdit()) {
                <button mat-icon-button color="primary" matTooltip="Modifier"
                        (click)="openDialog(p)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" matTooltip="Supprimer"
                        (click)="deleteProduit(p)">
                  <mat-icon>delete</mat-icon>
                </button>
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              class="table-row"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
              Aucun produit trouvé
            </td>
          </tr>
        </table>

        <mat-paginator [length]="totalProduits()" [pageSize]="10"
                       [pageSizeOptions]="[10, 25, 50]"
                       (page)="onPage($event)">
        </mat-paginator>
      </mat-card>
    </div>

    <!-- DIALOG FORM -->
    @if (showDialog()) {
      <div class="dialog-overlay" (click)="closeDialog()">
        <mat-card class="dialog-card" (click)="$event.stopPropagation()">
          <mat-card-header>
            <mat-icon mat-card-avatar color="primary">{{ editingProduit() ? 'edit' : 'add_circle' }}</mat-icon>
            <mat-card-title>{{ editingProduit() ? 'Modifier le produit' : 'Nouveau produit' }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="produitForm" class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Code *</mat-label>
                <input matInput formControlName="code" [readonly]="!!editingProduit()">
                @if (produitForm.get('code')?.hasError('required')) {
                  <mat-error>Requis</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Nom *</mat-label>
                <input matInput formControlName="nom">
                @if (produitForm.get('nom')?.hasError('required')) {
                  <mat-error>Requis</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="span-2">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="2"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Catégorie</mat-label>
                <mat-select formControlName="categorieId">
                  @for (c of categories(); track c.id) {
                    <mat-option [value]="c.id">{{ c.nom }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Fournisseur</mat-label>
                <mat-select formControlName="fournisseurId">
                  @for (f of fournisseurs(); track f.id) {
                    <mat-option [value]="f.id">{{ f.nom }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Prix achat (DT) *</mat-label>
                <input matInput type="number" formControlName="prixAchat" step="0.01">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Prix vente (DT) *</mat-label>
                <input matInput type="number" formControlName="prixVente" step="0.01">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Seuil minimum</mat-label>
                <input matInput type="number" formControlName="seuilMin">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Seuil maximum</mat-label>
                <input matInput type="number" formControlName="seuilMax">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Unité de mesure</mat-label>
                <mat-select formControlName="uniteMesure">
                  <mat-option value="UNITE">Unité</mat-option>
                  <mat-option value="KG">Kilogramme</mat-option>
                  <mat-option value="LITRE">Litre</mat-option>
                  <mat-option value="METRE">Mètre</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Date d'expiration</mat-label>
                <input matInput type="date" formControlName="dateExpiration">
              </mat-form-field>
            </form>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-button (click)="closeDialog()">Annuler</button>
            <button mat-raised-button color="primary" (click)="saveProduit()"
                    [disabled]="savingProduit()">
              @if (savingProduit()) { <mat-spinner diameter="18"></mat-spinner> }
              @else { {{ editingProduit() ? 'Enregistrer' : 'Créer' }} }
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .page-container { max-width: 1400px; }
    .page-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 20px;
    }
    .page-title {
      display: flex; align-items: center; gap: 10px;
      font-size: 24px; font-weight: 600; color: #1F4E79; margin: 0;
    }
    .search-card { margin-bottom: 16px; padding: 16px; }
    .search-field { width: 100%; max-width: 500px; }
    .table-card { position: relative; border-radius: 12px !important; overflow: hidden; }
    .loading-overlay {
      position: absolute; inset: 0; background: rgba(255,255,255,0.8);
      display: flex; align-items: center; justify-content: center; z-index: 10;
    }
    .full-width { width: 100%; }
    th { font-weight: 600 !important; background: #f5f7fa !important; }
    .table-row:hover { background: #f0f4ff; cursor: pointer; }
    .code-chip {
      background: #e3f2fd; color: #1565c0;
      padding: 3px 10px; border-radius: 12px;
      font-size: 12px; font-weight: 600;
    }
    .marge-positive { color: #2e7d32; font-weight: 600; }
    .marge-negative { color: #c62828; font-weight: 600; }
    .no-data { text-align: center; padding: 40px; color: #999; }

    /* Dialog */
    .dialog-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .dialog-card {
      width: 700px; max-width: 95vw; max-height: 90vh;
      overflow-y: auto; border-radius: 16px !important;
    }
    .form-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 12px; padding-top: 8px;
    }
    .span-2 { grid-column: span 2; }
    mat-card-actions { padding: 16px !important; }
  `]
})
export class ProduitsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private produitService = inject(ProduitService);
  private referenceService = inject(ReferenceService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  produits = signal<Produit[]>([]);
  categories = signal<Categorie[]>([]);
  fournisseurs = signal<Fournisseur[]>([]);
  loading = signal(false);
  totalProduits = signal(0);
  showDialog = signal(false);
  editingProduit = signal<Produit | null>(null);
  savingProduit = signal(false);
  searchQuery = '';

  displayedColumns = ['code', 'nom', 'categorie', 'prixAchat', 'prixVente', 'marge', 'seuils', 'actions'];

  canEdit = () => this.authService.hasRole('GESTIONNAIRE');

  produitForm: FormGroup = this.fb.group({
    code: ['', Validators.required],
    nom: ['', Validators.required],
    description: [''],
    categorieId: [null],
    fournisseurId: [null],
    prixAchat: [0, [Validators.required, Validators.min(0)]],
    prixVente: [0, [Validators.required, Validators.min(0)]],
    seuilMin: [10],
    seuilMax: [1000],
    uniteMesure: ['UNITE'],
    dateExpiration: ['']
  });

  ngOnInit(): void {
    this.loadProduits();
    this.referenceService.getCategories().subscribe(c => this.categories.set(c));
    this.referenceService.getFournisseurs().subscribe(f => this.fournisseurs.set(f));
  }

  loadProduits(): void {
    this.loading.set(true);
    this.produitService.getAll().subscribe({
      next: p => {
        this.produits.set(p);
        this.totalProduits.set(p.length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch(): void {
    if (this.searchQuery.length >= 2) {
      this.produitService.search(this.searchQuery).subscribe(p => this.produits.set(p));
    } else if (!this.searchQuery) {
      this.loadProduits();
    }
  }

  openDialog(produit?: Produit): void {
    this.editingProduit.set(produit ?? null);
    if (produit) {
      this.produitForm.patchValue({ ...produit });
    } else {
      this.produitForm.reset({ seuilMin: 10, seuilMax: 1000, uniteMesure: 'UNITE', prixAchat: 0, prixVente: 0 });
    }
    this.showDialog.set(true);
  }

  closeDialog(): void {
    this.showDialog.set(false);
    this.editingProduit.set(null);
  }

  saveProduit(): void {
    if (this.produitForm.invalid) { this.produitForm.markAllAsTouched(); return; }
    this.savingProduit.set(true);
    const data = this.produitForm.value;

    const obs = this.editingProduit()
      ? this.produitService.update(this.editingProduit()!.id, data)
      : this.produitService.create(data);

    obs.subscribe({
      next: () => {
        this.snackBar.open('Produit enregistré avec succès', '✓', { duration: 3000, panelClass: ['snack-success'] });
        this.closeDialog();
        this.loadProduits();
        this.savingProduit.set(false);
      },
      error: () => this.savingProduit.set(false)
    });
  }

  deleteProduit(produit: Produit): void {
    if (!confirm(`Supprimer le produit "${produit.nom}" ?`)) return;
    this.produitService.delete(produit.id).subscribe({
      next: () => {
        this.snackBar.open('Produit supprimé', '✓', { duration: 3000 });
        this.loadProduits();
      }
    });
  }

  onPage(event: PageEvent): void {
    // Pagination côté serveur possible ici
  }
}
