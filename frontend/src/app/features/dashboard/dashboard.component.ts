import { Component, OnInit, signal, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RapportService } from '../../core/services/reference.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardStats, CommandeProposee } from '../../shared/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, MatTableModule, MatChipsModule,
    MatBadgeModule, MatDividerModule, MatTooltipModule
  ],
  template: `
    <div class="dashboard">

      <!-- PAGE HEADER -->
      <div class="page-header">
        <div class="header-left">
          <h2 class="page-title">
            <mat-icon>dashboard</mat-icon>
            Tableau de bord
          </h2>
          <span class="header-subtitle">Vue d'ensemble de votre gestion des stocks</span>
        </div>
        <div class="header-right">
          <div class="date-badge">
            <mat-icon>calendar_today</mat-icon>
            {{ today | date:'EEEE d MMMM yyyy' : '' : 'fr' }}
          </div>
        </div>
      </div>

      <!-- NOTIFICATION BANNER (alertes stock) -->
      @if (stats()?.nbSousSeuilMin && (stats()?.nbSousSeuilMin ?? 0) > 0) {
        <div class="alert-banner alert-danger">
          <mat-icon>notification_important</mat-icon>
          <span>
            <strong>{{ stats()?.nbSousSeuilMin }} produit(s)</strong> sont en dessous du seuil minimum !
            Réapprovisionnement urgent nécessaire.
          </span>
          <button mat-button class="alert-btn" routerLink="/rapports">Voir les commandes</button>
        </div>
      }

      @if (loading()) {
        <div class="loading-center">
          <mat-spinner diameter="60"></mat-spinner>
          <p class="loading-text">Chargement des données...</p>
        </div>
      } @else {

        <!-- KPI CARDS -->
        <div class="kpi-grid">

          <div class="kpi-card kpi-blue">
            <div class="kpi-bg-shape"></div>
            <div class="kpi-icon-wrap">
              <mat-icon>inventory_2</mat-icon>
            </div>
            <div class="kpi-data">
              <span class="kpi-value">{{ stats()?.nbReferences ?? 0 }}</span>
              <span class="kpi-label">Références en stock</span>
            </div>
            <div class="kpi-trend kpi-trend-up">
              <mat-icon>trending_up</mat-icon> Actif
            </div>
          </div>

          <div class="kpi-card kpi-green">
            <div class="kpi-bg-shape"></div>
            <div class="kpi-icon-wrap">
              <mat-icon>trending_up</mat-icon>
            </div>
            <div class="kpi-data">
              <span class="kpi-value">{{ (stats()?.valeurVente ?? 0) | number:'1.0-0' }} DT</span>
              <span class="kpi-label">Valeur stock (vente)</span>
            </div>
            <div class="kpi-trend kpi-trend-up">
              <mat-icon>arrow_upward</mat-icon> +8% ce mois
            </div>
          </div>

          <div class="kpi-card kpi-orange">
            <div class="kpi-bg-shape"></div>
            <div class="kpi-icon-wrap">
              <mat-icon>shopping_cart</mat-icon>
            </div>
            <div class="kpi-data">
              <span class="kpi-value">{{ (stats()?.valeurAchat ?? 0) | number:'1.0-0' }} DT</span>
              <span class="kpi-label">Valeur stock (achat)</span>
            </div>
            <div class="kpi-trend kpi-trend-neutral">
              <mat-icon>remove</mat-icon> Stable
            </div>
          </div>

          <div class="kpi-card" [class]="(stats()?.nbSousSeuilMin ?? 0) > 0 ? 'kpi-red' : 'kpi-teal'">
            <div class="kpi-bg-shape"></div>
            <div class="kpi-icon-wrap">
              <mat-icon>{{ (stats()?.nbSousSeuilMin ?? 0) > 0 ? 'warning' : 'check_circle' }}</mat-icon>
            </div>
            <div class="kpi-data">
              <span class="kpi-value">{{ stats()?.nbSousSeuilMin ?? 0 }}</span>
              <span class="kpi-label">Alertes stock faible</span>
            </div>
            <div class="kpi-trend" [class]="(stats()?.nbSousSeuilMin ?? 0) > 0 ? 'kpi-trend-down' : 'kpi-trend-up'">
              <mat-icon>{{ (stats()?.nbSousSeuilMin ?? 0) > 0 ? 'error_outline' : 'check' }}</mat-icon>
              {{ (stats()?.nbSousSeuilMin ?? 0) > 0 ? 'Urgent' : 'Tout OK' }}
            </div>
          </div>

        </div>

        <!-- CHARTS ROW -->
        <div class="charts-row">

          <!-- CHART: Courbe mouvements mensuels -->
          <div class="chart-card chart-card-large">
            <div class="chart-header">
              <div class="chart-title-wrap">
                <mat-icon>show_chart</mat-icon>
                <span>Évolution des mouvements de stock (6 mois)</span>
              </div>
              <div class="chart-legend">
                <span class="legend-dot" style="background:#2E75B6"></span> Entrées
                <span class="legend-dot" style="background:#e65100"></span> Sorties
              </div>
            </div>
            <div class="chart-body">
              <canvas #lineCanvas height="200"></canvas>
            </div>
          </div>

          <!-- CHART: Barres valeur par catégorie -->
          <div class="chart-card chart-card-small">
            <div class="chart-header">
              <div class="chart-title-wrap">
                <mat-icon>bar_chart</mat-icon>
                <span>Valeur par catégorie</span>
              </div>
            </div>
            <div class="chart-body">
              <canvas #barCanvas height="200"></canvas>
            </div>
          </div>

        </div>

        <!-- CHARTS ROW 2 -->
        <div class="charts-row">

          <!-- CHART: Donut répartition stock -->
          <div class="chart-card chart-card-small">
            <div class="chart-header">
              <div class="chart-title-wrap">
                <mat-icon>donut_large</mat-icon>
                <span>Répartition du stock</span>
              </div>
            </div>
            <div class="chart-body chart-donut-body">
              <canvas #doughnutCanvas height="220"></canvas>
            </div>
          </div>

          <!-- ALERTES NOTIFICATIONS -->
          <div class="chart-card chart-card-large">
            <div class="chart-header">
              <div class="chart-title-wrap">
                <mat-icon>notifications_active</mat-icon>
                <span>Notifications &amp; Alertes</span>
              </div>
              <span class="badge-count" *ngIf="notifications.length > 0">{{ notifications.length }}</span>
            </div>
            <div class="notifications-list">
              @for (notif of notifications; track notif.id) {
                <div class="notif-item" [class]="'notif-' + notif.type">
                  <div class="notif-icon-wrap">
                    <mat-icon>{{ notif.icon }}</mat-icon>
                  </div>
                  <div class="notif-content">
                    <span class="notif-title">{{ notif.title }}</span>
                    <span class="notif-msg">{{ notif.message }}</span>
                  </div>
                  <span class="notif-time">{{ notif.time }}</span>
                </div>
              }
              @if (notifications.length === 0) {
                <div class="notif-empty">
                  <mat-icon>check_circle</mat-icon>
                  <span>Aucune alerte active</span>
                </div>
              }
            </div>
          </div>

        </div>

        <!-- COMMANDES PROPOSÉES TABLE -->
        @if (commandes().length > 0) {
          <div class="table-card">
            <div class="table-card-header">
              <div class="table-title-wrap">
                <mat-icon>notification_important</mat-icon>
                <span>Commandes à passer — {{ commandes().length }} produit(s)</span>
              </div>
              <span class="total-badge">Total : {{ totalCmd() | number:'1.2-2' }} DT</span>
            </div>
            <div class="table-responsive">
              <table mat-table [dataSource]="commandes()" class="full-width">
                <ng-container matColumnDef="code">
                  <th mat-header-cell *matHeaderCellDef>Code</th>
                  <td mat-cell *matCellDef="let row">
                    <span class="code-pill">{{ row.code }}</span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="nom">
                  <th mat-header-cell *matHeaderCellDef>Produit</th>
                  <td mat-cell *matCellDef="let row"><strong>{{ row.nom }}</strong></td>
                </ng-container>
                <ng-container matColumnDef="quantiteActuelle">
                  <th mat-header-cell *matHeaderCellDef>Stock actuel</th>
                  <td mat-cell *matCellDef="let row">
                    <span class="qty-chip qty-danger">{{ row.quantiteActuelle }}</span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="quantiteACommander">
                  <th mat-header-cell *matHeaderCellDef>À commander</th>
                  <td mat-cell *matCellDef="let row">
                    <span class="qty-chip qty-info">{{ row.quantiteACommander }}</span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="totalCommande">
                  <th mat-header-cell *matHeaderCellDef>Total estimé</th>
                  <td mat-cell *matCellDef="let row">
                    <strong class="text-primary">{{ row.totalCommande | number:'1.2-2' }} DT</strong>
                  </td>
                </ng-container>
                <ng-container matColumnDef="fournisseurNom">
                  <th mat-header-cell *matHeaderCellDef>Fournisseur</th>
                  <td mat-cell *matCellDef="let row">{{ row.fournisseurNom ?? '—' }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="commandesCols"></tr>
                <tr mat-row *matRowDef="let row; columns: commandesCols;"></tr>
              </table>
            </div>
          </div>
        }

      }
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1400px; padding-bottom: 40px; }

    /* ---- PAGE HEADER ---- */
    .page-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 24px;
    }
    .header-left { display: flex; flex-direction: column; gap: 4px; }
    .page-title {
      display: flex; align-items: center; gap: 10px;
      font-size: 26px; font-weight: 700; color: #1F4E79; margin: 0;
    }
    .page-title mat-icon { font-size: 30px; width: 30px; height: 30px; }
    .header-subtitle { font-size: 13px; color: #8896ab; margin-left: 40px; }
    .date-badge {
      display: flex; align-items: center; gap: 6px;
      background: #fff; border: 1px solid #e0e0e0;
      border-radius: 20px; padding: 6px 14px;
      font-size: 13px; color: #455a64;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .date-badge mat-icon { font-size: 16px; width: 16px; height: 16px; color: #2E75B6; }

    /* ---- ALERT BANNER ---- */
    .alert-banner {
      display: flex; align-items: center; gap: 12px;
      border-radius: 10px; padding: 14px 20px;
      margin-bottom: 24px; font-size: 14px;
      animation: slideIn 0.4s ease;
    }
    .alert-danger {
      background: linear-gradient(135deg, #ffeaea, #fff0f0);
      border: 1px solid #ffcdd2;
      color: #b71c1c;
    }
    .alert-banner mat-icon { font-size: 22px; width: 22px; height: 22px; flex-shrink: 0; }
    .alert-banner span { flex: 1; }
    .alert-btn {
      color: #b71c1c !important;
      border: 1px solid #b71c1c !important;
      border-radius: 20px !important;
    }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

    /* ---- LOADING ---- */
    .loading-center { display: flex; flex-direction: column; align-items: center; padding: 80px; gap: 16px; }
    .loading-text { color: #8896ab; font-size: 14px; }

    /* ---- KPI CARDS ---- */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px; margin-bottom: 24px;
    }
    .kpi-card {
      position: relative; overflow: hidden;
      border-radius: 16px; padding: 22px 20px;
      display: flex; flex-direction: column; gap: 6px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: default;
    }
    .kpi-card:hover { transform: translateY(-4px); box-shadow: 0 8px 28px rgba(0,0,0,0.14); }
    .kpi-bg-shape {
      position: absolute; top: -20px; right: -20px;
      width: 100px; height: 100px; border-radius: 50%;
      opacity: 0.15;
    }
    .kpi-icon-wrap {
      width: 52px; height: 52px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.3);
    }
    .kpi-icon-wrap mat-icon { font-size: 26px; width: 26px; height: 26px; color: #fff; }
    .kpi-data { display: flex; flex-direction: column; gap: 2px; margin-top: 8px; }
    .kpi-value { font-size: 28px; font-weight: 800; color: #fff; line-height: 1; }
    .kpi-label { font-size: 12px; color: rgba(255,255,255,0.8); font-weight: 500; }
    .kpi-trend {
      display: flex; align-items: center; gap: 4px;
      font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.9);
      margin-top: 4px;
    }
    .kpi-trend mat-icon { font-size: 14px; width: 14px; height: 14px; }

    .kpi-blue { background: linear-gradient(135deg, #2E75B6, #1a4f8a); }
    .kpi-blue .kpi-bg-shape { background: #fff; }
    .kpi-green { background: linear-gradient(135deg, #2e7d32, #1b5e20); }
    .kpi-green .kpi-bg-shape { background: #fff; }
    .kpi-orange { background: linear-gradient(135deg, #e65100, #bf360c); }
    .kpi-orange .kpi-bg-shape { background: #fff; }
    .kpi-red { background: linear-gradient(135deg, #c62828, #8e0000); }
    .kpi-red .kpi-bg-shape { background: #fff; }
    .kpi-teal { background: linear-gradient(135deg, #00695c, #004d40); }
    .kpi-teal .kpi-bg-shape { background: #fff; }

    /* ---- CHARTS ROW ---- */
    .charts-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px; margin-bottom: 24px;
    }
    .chart-card {
      background: #fff; border-radius: 16px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.07);
      overflow: hidden;
    }
    .chart-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px 12px;
      border-bottom: 1px solid #f0f0f0;
    }
    .chart-title-wrap {
      display: flex; align-items: center; gap: 8px;
      font-size: 14px; font-weight: 600; color: #1F4E79;
    }
    .chart-title-wrap mat-icon { font-size: 20px; width: 20px; height: 20px; color: #2E75B6; }
    .chart-legend {
      display: flex; align-items: center; gap: 12px;
      font-size: 12px; color: #666;
    }
    .legend-dot {
      display: inline-block; width: 10px; height: 10px; border-radius: 50%;
      margin-right: 4px;
    }
    .chart-body { padding: 16px 20px; }
    .chart-donut-body { display: flex; justify-content: center; }
    .badge-count {
      background: #c62828; color: #fff;
      border-radius: 20px; padding: 2px 10px;
      font-size: 12px; font-weight: 700;
    }

    /* ---- NOTIFICATIONS ---- */
    .notifications-list { padding: 8px 0; max-height: 320px; overflow-y: auto; }
    .notif-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 20px; border-bottom: 1px solid #f5f5f5;
      transition: background 0.15s;
    }
    .notif-item:hover { background: #f9f9f9; }
    .notif-icon-wrap {
      width: 38px; height: 38px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .notif-icon-wrap mat-icon { font-size: 20px; width: 20px; height: 20px; color: #fff; }
    .notif-content { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    .notif-title { font-size: 13px; font-weight: 600; color: #333; }
    .notif-msg { font-size: 12px; color: #666; }
    .notif-time { font-size: 11px; color: #9e9e9e; white-space: nowrap; }

    .notif-danger .notif-icon-wrap { background: #c62828; }
    .notif-danger { border-left: 4px solid #c62828; }
    .notif-warning .notif-icon-wrap { background: #e65100; }
    .notif-warning { border-left: 4px solid #f57c00; }
    .notif-info .notif-icon-wrap { background: #1565c0; }
    .notif-info { border-left: 4px solid #1565c0; }
    .notif-success .notif-icon-wrap { background: #2e7d32; }
    .notif-success { border-left: 4px solid #2e7d32; }

    .notif-empty {
      display: flex; flex-direction: column; align-items: center;
      gap: 8px; padding: 40px;
      color: #9e9e9e; font-size: 14px;
    }
    .notif-empty mat-icon { font-size: 40px; width: 40px; height: 40px; color: #2e7d32; }

    /* ---- COMMANDES TABLE ---- */
    .table-card {
      background: #fff; border-radius: 16px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.07);
      overflow: hidden; margin-bottom: 24px;
    }
    .table-card-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px; border-bottom: 1px solid #f0f0f0;
    }
    .table-title-wrap {
      display: flex; align-items: center; gap: 8px;
      font-size: 15px; font-weight: 600; color: #c62828;
    }
    .table-title-wrap mat-icon { color: #c62828; }
    .total-badge {
      background: #e8f5e9; color: #2e7d32;
      border-radius: 20px; padding: 4px 14px;
      font-size: 13px; font-weight: 600;
    }
    .table-responsive { overflow-x: auto; }
    .full-width { width: 100%; }
    .code-pill {
      background: #e3f2fd; color: #1565c0;
      border-radius: 8px; padding: 3px 10px;
      font-size: 12px; font-weight: 700; font-family: monospace;
    }
    .qty-chip {
      border-radius: 20px; padding: 3px 12px;
      font-size: 13px; font-weight: 600;
      display: inline-block;
    }
    .qty-danger { background: #ffebee; color: #c62828; }
    .qty-info { background: #e3f2fd; color: #1565c0; }
    .text-primary { color: #1F4E79; }

    /* ---- RESPONSIVE ---- */
    @media (max-width: 1100px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-row { grid-template-columns: 1fr; }
    }
    @media (max-width: 600px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('lineCanvas') lineCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barCanvas') barCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutCanvas') doughnutCanvasRef!: ElementRef<HTMLCanvasElement>;

  stats = signal<DashboardStats | null>(null);
  commandes = signal<CommandeProposee[]>([]);
  loading = signal(true);
  today = new Date();
  commandesCols = ['code', 'nom', 'quantiteActuelle', 'quantiteACommander', 'totalCommande', 'fournisseurNom'];

  notifications: Array<{id:number; type:string; icon:string; title:string; message:string; time:string}> = [];

  totalCmd() {
    return this.commandes().reduce((s, c) => s + (c.totalCommande ?? 0), 0);
  }

  constructor(
    private rapportService: RapportService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const magasinId = this.authService.magasinId() ?? 1;
    this.rapportService.getDashboard(magasinId).subscribe({
      next: s => {
        this.stats.set(s);
        this.loading.set(false);
        this.buildNotifications(s);
        setTimeout(() => this.drawCharts(), 100);
      },
      error: () => {
        this.loading.set(false);
        this.buildNotifications(null);
        setTimeout(() => this.drawCharts(), 100);
      }
    });
    this.rapportService.getCommandesProposees(magasinId).subscribe({
      next: c => this.commandes.set(c)
    });
  }

  ngAfterViewInit(): void {}

  buildNotifications(s: DashboardStats | null): void {
    this.notifications = [];
    const now = new Date();
    const fmt = (d: Date) => d.toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'});

    if (s && (s.nbSousSeuilMin ?? 0) > 0) {
      this.notifications.push({
        id: 1, type: 'danger', icon: 'warning',
        title: 'Alerte Stock Critique',
        message: `${s.nbSousSeuilMin} produit(s) sont en dessous du seuil minimum.`,
        time: fmt(now)
      });
    }
    this.notifications.push({
      id: 2, type: 'info', icon: 'info',
      title: 'Synchronisation complète',
      message: 'Les données du stock ont été synchronisées avec succès.',
      time: fmt(new Date(now.getTime() - 5 * 60000))
    });
    this.notifications.push({
      id: 3, type: 'success', icon: 'check_circle',
      title: 'Rapport mensuel disponible',
      message: 'Le rapport de ce mois est prêt à être exporté.',
      time: fmt(new Date(now.getTime() - 30 * 60000))
    });
    this.notifications.push({
      id: 4, type: 'warning', icon: 'hourglass_empty',
      title: 'Commandes en attente',
      message: 'Plusieurs commandes fournisseurs attendent confirmation.',
      time: fmt(new Date(now.getTime() - 60 * 60000))
    });
  }

  drawCharts(): void {
    this.drawLineChart();
    this.drawBarChart();
    this.drawDoughnutChart();
  }

  drawLineChart(): void {
    const canvas = this.lineCanvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const months = ['Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai'];
    const entrees = [120, 190, 150, 220, 180, 260];
    const sorties = [90, 140, 110, 170, 130, 200];

    canvas.width = canvas.offsetWidth || 600;
    canvas.height = 200;
    const w = canvas.width, h = canvas.height;
    const padL = 50, padR = 20, padT = 20, padB = 40;
    const chartW = w - padL - padR, chartH = h - padT - padB;
    const maxVal = Math.max(...entrees, ...sorties);
    const xStep = chartW / (months.length - 1);

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (chartH / 4) * i;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.fillStyle = '#9e9e9e';
      ctx.font = '11px Roboto, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(String(Math.round(maxVal * (1 - i / 4))), padL - 6, y + 4);
    }

    // Draw a dataset as line + fill
    const drawLine = (data: number[], color: string, fillColor: string) => {
      const points = data.map((v, i) => ({
        x: padL + i * xStep,
        y: padT + chartH - (v / maxVal) * chartH
      }));

      // Fill area
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const cx = (points[i-1].x + points[i].x) / 2;
        ctx.bezierCurveTo(cx, points[i-1].y, cx, points[i].y, points[i].x, points[i].y);
      }
      ctx.lineTo(points[points.length-1].x, padT + chartH);
      ctx.lineTo(points[0].x, padT + chartH);
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();

      // Line
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const cx = (points[i-1].x + points[i].x) / 2;
        ctx.bezierCurveTo(cx, points[i-1].y, cx, points[i].y, points[i].x, points[i].y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Dots
      for (const p of points) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    drawLine(sorties, '#e65100', 'rgba(230,81,0,0.08)');
    drawLine(entrees, '#2E75B6', 'rgba(46,117,182,0.1)');

    // X labels
    ctx.fillStyle = '#555';
    ctx.font = '12px Roboto, sans-serif';
    ctx.textAlign = 'center';
    months.forEach((m, i) => {
      ctx.fillText(m, padL + i * xStep, h - padB + 20);
    });
  }

  drawBarChart(): void {
    const canvas = this.barCanvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const categories = ['Alim.', 'Élec.', 'Text.', 'Autre'];
    const values = [48000, 72000, 31000, 15000];
    const colors = ['#2E75B6', '#2e7d32', '#e65100', '#7b1fa2'];

    canvas.width = canvas.offsetWidth || 300;
    canvas.height = 200;
    const w = canvas.width, h = canvas.height;
    const padL = 55, padR = 15, padT = 15, padB = 35;
    const chartW = w - padL - padR, chartH = h - padT - padB;
    const maxVal = Math.max(...values) * 1.1;
    const barW = (chartW / categories.length) * 0.55;
    const gap = chartW / categories.length;

    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = '#f0f0f0'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (chartH / 4) * i;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.fillStyle = '#9e9e9e';
      ctx.font = '10px Roboto, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText((Math.round(maxVal * (1 - i / 4) / 1000)) + 'k', padL - 5, y + 4);
    }

    values.forEach((v, i) => {
      const bh = (v / maxVal) * chartH;
      const x = padL + gap * i + (gap - barW) / 2;
      const y = padT + chartH - bh;

      // Gradient bar
      const grad = ctx.createLinearGradient(x, y, x, padT + chartH);
      grad.addColorStop(0, colors[i]);
      grad.addColorStop(1, colors[i] + '88');
      ctx.fillStyle = grad;
      ctx.beginPath();
      const r = 4;
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + barW - r, y);
      ctx.arcTo(x + barW, y, x + barW, y + r, r);
      ctx.lineTo(x + barW, padT + chartH);
      ctx.lineTo(x, padT + chartH);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
      ctx.fill();

      // Label
      ctx.fillStyle = '#555';
      ctx.font = '11px Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(categories[i], x + barW / 2, h - padB + 18);
    });
  }

  drawDoughnutChart(): void {
    const canvas = this.doughnutCanvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = [35, 28, 22, 15];
    const labels = ['Alimentaire', 'Électronique', 'Textile', 'Autre'];
    const colors = ['#2E75B6', '#2e7d32', '#e65100', '#7b1fa2'];
    const total = data.reduce((a, b) => a + b, 0);

    canvas.width = canvas.offsetWidth || 260;
    canvas.height = 220;
    const w = canvas.width, h = canvas.height;
    const cx = w / 2 - 30, cy = h / 2 + 5;
    const R = Math.min(cx, cy) * 0.75, r = R * 0.55;

    ctx.clearRect(0, 0, w, h);

    let startAngle = -Math.PI / 2;
    data.forEach((v, i) => {
      const angle = (v / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, startAngle, startAngle + angle);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      startAngle += angle;
    });

    // Inner circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.fillStyle = '#1F4E79';
    ctx.font = 'bold 16px Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('100%', cx, cy + 6);

    // Legend
    const lx = w - 90, ly = 30;
    labels.forEach((l, i) => {
      ctx.fillStyle = colors[i];
      ctx.fillRect(lx, ly + i * 22, 12, 12);
      ctx.fillStyle = '#555';
      ctx.font = '11px Roboto, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${l} ${data[i]}%`, lx + 16, ly + i * 22 + 10);
    });
  }
}
