import { Component, OnInit, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatTableModule } from "@angular/material/table";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatChipsModule } from "@angular/material/chips";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import {
  UtilisateurService,
  ReferenceService,
} from "../../core/services/reference.service";
import { Utilisateur, Magasin } from "../../shared/models";

@Component({
  selector: "app-utilisateurs",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatSlideToggleModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2 class="page-title">
          <mat-icon>manage_accounts</mat-icon>
          Gestion des Utilisateurs
        </h2>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>person_add</mat-icon>
          Nouvel utilisateur
        </button>
      </div>

      <mat-card class="table-card">
        @if (loading()) {
          <div class="loading-overlay">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        }

        <table mat-table [dataSource]="utilisateurs()" class="full-width">
          <ng-container matColumnDef="username">
            <th mat-header-cell *matHeaderCellDef>Login</th>
            <td mat-cell *matCellDef="let u">
              <strong>{{ u.username }}</strong>
            </td>
          </ng-container>

          <ng-container matColumnDef="nom">
            <th mat-header-cell *matHeaderCellDef>Nom complet</th>
            <td mat-cell *matCellDef="let u">{{ u.prenom }} {{ u.nom }}</td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let u">{{ u.email ?? "—" }}</td>
          </ng-container>

          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Rôle</th>
            <td mat-cell *matCellDef="let u">
              <mat-chip [color]="getRoleColor(u.role)" highlighted>{{
                u.role
              }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="magasin">
            <th mat-header-cell *matHeaderCellDef>Magasin</th>
            <td mat-cell *matCellDef="let u">{{ u.magasinNom ?? "—" }}</td>
          </ng-container>

          <ng-container matColumnDef="actif">
            <th mat-header-cell *matHeaderCellDef>Actif</th>
            <td mat-cell *matCellDef="let u">
              <mat-slide-toggle
                [checked]="u.actif"
                (change)="toggleActif(u)"
                color="primary"
              ></mat-slide-toggle>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns"
            class="table-row"
          ></tr>
          <tr class="mat-row" *matNoDataRow>
            <td
              class="mat-cell no-data"
              [attr.colspan]="displayedColumns.length"
            >
              Aucun utilisateur
            </td>
          </tr>
        </table>
      </mat-card>
    </div>

    <!-- CREATE DIALOG -->
    @if (showDialog()) {
      <div class="dialog-overlay" (click)="closeDialog()">
        <mat-card class="dialog-card" (click)="$event.stopPropagation()">
          <mat-card-header>
            <mat-icon mat-card-avatar color="primary">person_add</mat-icon>
            <mat-card-title>Créer un utilisateur</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="userForm" class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Login *</mat-label>
                <input matInput formControlName="username" />
                @if (userForm.get("username")?.hasError("required")) {
                  <mat-error>Requis</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Mot de passe *</mat-label>
                <input matInput type="password" formControlName="password" />
                @if (userForm.get("password")?.hasError("minlength")) {
                  <mat-error>6 caractères minimum</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Prénom</mat-label>
                <input matInput formControlName="prenom" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Nom</mat-label>
                <input matInput formControlName="nom" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="span-2">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Rôle *</mat-label>
                <mat-select formControlName="role">
                  <mat-option value="ADMIN">ADMIN</mat-option>
                  <mat-option value="GESTIONNAIRE">GESTIONNAIRE</mat-option>
                  <mat-option value="VENDEUR">VENDEUR</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Magasin</mat-label>
                <mat-select formControlName="magasinId">
                  @for (m of magasins(); track m.id) {
                    <mat-option [value]="m.id">{{ m.nom }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </form>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-button (click)="closeDialog()">Annuler</button>
            <button
              mat-raised-button
              color="primary"
              (click)="saveUser()"
              [disabled]="saving()"
            >
              @if (saving()) {
                <mat-spinner diameter="18"></mat-spinner>
              } @else {
                Créer
              }
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    }
  `,
  styles: [
    `
      .page-container {
        max-width: 1200px;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .page-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 24px;
        font-weight: 600;
        color: #1f4e79;
        margin: 0;
      }
      .table-card {
        position: relative;
        border-radius: 12px !important;
        overflow: hidden;
      }
      .loading-overlay {
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
      }
      .full-width {
        width: 100%;
      }
      th {
        font-weight: 600 !important;
        background: #f5f7fa !important;
      }
      .table-row:hover {
        background: #f0f4ff;
      }
      .no-data {
        text-align: center;
        padding: 40px;
        color: #999;
      }
      .dialog-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .dialog-card {
        width: 560px;
        max-width: 95vw;
        border-radius: 16px !important;
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        padding-top: 8px;
      }
      .span-2 {
        grid-column: span 2;
      }
      mat-card-actions {
        padding: 16px !important;
      }
    `,
  ],
})
export class UtilisateursComponent implements OnInit {
  private utilisateurService = inject(UtilisateurService);
  private referenceService = inject(ReferenceService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  utilisateurs = signal<Utilisateur[]>([]);
  magasins = signal<Magasin[]>([]);
  loading = signal(false);
  showDialog = signal(false);
  saving = signal(false);
  displayedColumns = ["username", "nom", "email", "role", "magasin", "actif"];

  userForm: FormGroup = this.fb.group({
    username: ["", [Validators.required, Validators.minLength(3)]],
    password: ["", [Validators.required, Validators.minLength(6)]],
    prenom: [""],
    nom: [""],
    email: ["", Validators.email],
    role: ["VENDEUR", Validators.required],
    magasinId: [null],
  });

  ngOnInit(): void {
    this.loadUsers();
    this.referenceService.getMagasins().subscribe((m) => this.magasins.set(m));
  }

  loadUsers(): void {
    this.loading.set(true);
    this.utilisateurService.getAll().subscribe({
      next: (u) => {
        this.utilisateurs.set(u);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openDialog(): void {
    this.userForm.reset({ role: "VENDEUR" });
    this.showDialog.set(true);
  }
  closeDialog(): void {
    this.showDialog.set(false);
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.utilisateurService.create(this.userForm.value).subscribe({
      next: () => {
        this.snackBar.open("Utilisateur créé", "✓", {
          duration: 3000,
          panelClass: ["snack-success"],
        });
        this.closeDialog();
        this.loadUsers();
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  toggleActif(user: Utilisateur): void {
    this.utilisateurService.toggleActif(user.id).subscribe({
      next: () => {
        this.snackBar.open(
          `Utilisateur ${user.actif ? "désactivé" : "activé"}`,
          "✓",
          { duration: 2000 },
        );
        this.loadUsers();
      },
    });
  }

  getRoleColor(role: string): string {
    return (
      { ADMIN: "warn", GESTIONNAIRE: "primary", VENDEUR: "accent" }[role] ?? ""
    );
  }
}
