import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
  color?: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, RouterModule, RouterOutlet,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule, MatMenuModule,
    MatBadgeModule, MatDividerModule, MatTooltipModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">

      <!-- SIDEBAR -->
      <mat-sidenav #sidenav [mode]="sidenavMode()" [opened]="sidenavOpened()"
                   class="sidenav">

        <!-- LOGO HEADER -->
        <div class="sidenav-header">
          <div class="logo-icon-wrap">
            <mat-icon class="logo-icon">inventory_2</mat-icon>
          </div>
          <div class="header-text">
            <span class="app-title">GestionStocks</span>
            <span class="app-subtitle">v1.0 — Entreprise</span>
          </div>
        </div>

        <mat-divider class="sidebar-divider"></mat-divider>

        <!-- USER PROFILE MINI -->
        <div class="sidebar-user-mini">
          <div class="user-avatar-circle">
            {{ userInitials() }}
          </div>
          <div class="user-info-mini">
            <span class="user-name-mini">{{ currentUser()?.nom }} {{ currentUser()?.prenom }}</span>
            <span class="role-badge-mini" [class]="'role-' + (currentUser()?.role ?? 'VENDEUR')">
              {{ currentUser()?.role }}
            </span>
          </div>
        </div>

        <mat-divider class="sidebar-divider"></mat-divider>

        <!-- NAV LABEL -->
        <div class="nav-section-label">NAVIGATION</div>

        <!-- NAV LIST -->
        <mat-nav-list class="nav-list">
          @for (item of visibleNavItems(); track item.route) {
            <a mat-list-item [routerLink]="item.route" routerLinkActive="active-link"
               (click)="onNavClick()" class="nav-item">
              <span class="nav-icon-wrap" matListItemIcon>
                <mat-icon [style.color]="item.color">{{ item.icon }}</mat-icon>
              </span>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>

        <!-- SIDEBAR FOOTER -->
        <div class="sidenav-footer">
          <mat-divider></mat-divider>
          <button mat-button class="logout-btn" (click)="logout()">
            <mat-icon>logout</mat-icon>
            Se déconnecter
          </button>
        </div>
      </mat-sidenav>

      <!-- MAIN CONTENT -->
      <mat-sidenav-content class="main-content">

        <!-- TOOLBAR -->
        <mat-toolbar class="toolbar">
          <button mat-icon-button (click)="toggleSidenav()" class="menu-toggle">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-title">{{ pageTitle() }}</span>
          <span class="toolbar-spacer"></span>

          <!-- Notification Bell -->
          <button mat-icon-button class="toolbar-icon-btn"
                  [matMenuTriggerFor]="notifMenu"
                  matTooltip="Notifications">
            <mat-icon [matBadge]="notifCount" matBadgeColor="warn"
                      [matBadgeHidden]="notifCount === 0">
              notifications
            </mat-icon>
          </button>

          <!-- Notification Menu -->
          <mat-menu #notifMenu="matMenu" class="notif-menu-panel">
            <div class="notif-panel-header" (click)="$event.stopPropagation()">
              <span>Notifications</span>
              <span class="notif-badge-count">{{ notifCount }}</span>
            </div>
            @for (n of sampleNotifs; track n.id) {
              <div class="notif-menu-item" [class]="'notif-type-' + n.type"
                   (click)="$event.stopPropagation()">
                <mat-icon class="notif-type-icon">{{ n.icon }}</mat-icon>
                <div class="notif-text">
                  <span class="notif-t">{{ n.title }}</span>
                  <span class="notif-m">{{ n.msg }}</span>
                </div>
              </div>
            }
          </mat-menu>

          <!-- User Menu -->
          <button mat-icon-button [matMenuTriggerFor]="userMenu"
                  matTooltip="{{ currentUser()?.username }}" class="toolbar-icon-btn">
            <div class="toolbar-avatar">{{ userInitials() }}</div>
          </button>

          <mat-menu #userMenu="matMenu">
            <div class="menu-user-header" (click)="$event.stopPropagation()">
              <div class="menu-avatar">{{ userInitials() }}</div>
              <div>
                <strong>{{ currentUser()?.nom }} {{ currentUser()?.prenom }}</strong>
                <small>{{ currentUser()?.username }}</small>
                <span class="role-badge-mini" [class]="'role-' + (currentUser()?.role ?? 'VENDEUR')">
                  {{ currentUser()?.role }}
                </span>
              </div>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item routerLink="/dashboard">
              <mat-icon>dashboard</mat-icon>
              <span>Tableau de bord</span>
            </button>
            <button mat-menu-item (click)="logout()">
              <mat-icon color="warn">logout</mat-icon>
              <span>Se déconnecter</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <!-- PAGE CONTENT -->
        <div class="page-content">
          <router-outlet />
        </div>

      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container { height: 100vh; }

    /* ---- SIDEBAR ---- */
    .sidenav {
      width: 268px;
      background: linear-gradient(180deg, #0f1f35 0%, #1a2f4a 100%);
      color: #fff;
      display: flex;
      flex-direction: column;
    }

    .sidenav-header {
      display: flex; align-items: center; gap: 12px;
      padding: 20px 18px;
      background: rgba(0,0,0,0.25);
    }
    .logo-icon-wrap {
      width: 44px; height: 44px; border-radius: 12px;
      background: linear-gradient(135deg, #2E75B6, #1a4f8a);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 12px rgba(46,117,182,0.5);
    }
    .logo-icon { font-size: 24px; width: 24px; height: 24px; color: #fff; }
    .header-text { display: flex; flex-direction: column; gap: 2px; }
    .app-title { font-size: 15px; font-weight: 700; color: #fff; letter-spacing: 0.3px; }
    .app-subtitle { font-size: 10px; color: #7fa8cc; }

    .sidebar-divider { border-color: rgba(255,255,255,0.08) !important; }

    .sidebar-user-mini {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 18px;
    }
    .user-avatar-circle {
      width: 38px; height: 38px; border-radius: 50%;
      background: linear-gradient(135deg, #2E75B6, #00acc1);
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; color: #fff;
      flex-shrink: 0;
    }
    .user-info-mini { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .user-name-mini { font-size: 13px; color: #ecf0f1; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .role-badge-mini {
      font-size: 10px; font-weight: 700; border-radius: 10px;
      padding: 2px 8px; display: inline-block; align-self: flex-start;
    }
    .role-ADMIN { background: rgba(198,40,40,0.3); color: #ef9a9a; border: 1px solid rgba(198,40,40,0.4); }
    .role-GESTIONNAIRE { background: rgba(230,81,0,0.3); color: #ffcc80; border: 1px solid rgba(230,81,0,0.4); }
    .role-VENDEUR { background: rgba(46,117,182,0.3); color: #90caf9; border: 1px solid rgba(46,117,182,0.4); }

    .nav-section-label {
      font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
      color: #4a6b8a; padding: 10px 18px 4px;
    }

    .nav-list { padding: 4px 10px; flex: 1; }
    .nav-item {
      color: #a0b8cc !important;
      border-radius: 10px !important;
      margin-bottom: 3px !important;
      transition: all 0.2s !important;
    }
    .nav-item:hover {
      background: rgba(46,117,182,0.2) !important;
      color: #fff !important;
    }
    .nav-item.active-link {
      background: linear-gradient(135deg, rgba(46,117,182,0.4), rgba(0,172,193,0.2)) !important;
      color: #64b5f6 !important;
      border-left: 3px solid #2E75B6;
    }
    .nav-icon-wrap mat-icon { font-size: 20px; }

    .sidenav-footer {
      margin-top: auto;
      background: rgba(0,0,0,0.2);
    }
    .logout-btn {
      width: 100%; color: #ef9a9a !important;
      justify-content: flex-start;
      padding: 12px 18px !important;
      border-radius: 0 !important;
      gap: 10px;
    }
    .logout-btn:hover { background: rgba(198,40,40,0.15) !important; }

    /* ---- TOOLBAR ---- */
    .toolbar {
      background: linear-gradient(90deg, #1F4E79, #2E75B6) !important;
      color: #fff !important;
      position: sticky; top: 0; z-index: 100;
      box-shadow: 0 2px 12px rgba(0,0,0,0.2) !important;
    }
    .menu-toggle { color: #fff !important; }
    .toolbar-title { font-size: 17px; font-weight: 600; margin-left: 8px; color: #fff; }
    .toolbar-spacer { flex: 1; }
    .toolbar-icon-btn { color: rgba(255,255,255,0.85) !important; }
    .toolbar-icon-btn:hover { color: #fff !important; }
    .toolbar-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: linear-gradient(135deg, #e65100, #ffa726);
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; color: #fff;
    }

    /* ---- NOTIFICATION PANEL ---- */
    .notif-panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; font-size: 14px; font-weight: 600;
      background: #f5f7fa; border-bottom: 1px solid #e0e0e0;
      cursor: default;
    }
    .notif-badge-count {
      background: #c62828; color: #fff;
      border-radius: 20px; padding: 2px 8px; font-size: 12px;
    }
    .notif-menu-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 16px; cursor: default;
      border-bottom: 1px solid #f5f5f5;
      min-width: 320px;
    }
    .notif-menu-item:hover { background: #f9f9f9; }
    .notif-type-icon { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }
    .notif-text { display: flex; flex-direction: column; gap: 2px; }
    .notif-t { font-size: 13px; font-weight: 600; color: #333; }
    .notif-m { font-size: 12px; color: #666; }

    .notif-type-danger .notif-type-icon { color: #c62828; }
    .notif-type-warning .notif-type-icon { color: #e65100; }
    .notif-type-info .notif-type-icon { color: #1565c0; }
    .notif-type-success .notif-type-icon { color: #2e7d32; }
    .notif-type-danger { border-left: 3px solid #c62828; }
    .notif-type-warning { border-left: 3px solid #e65100; }
    .notif-type-info { border-left: 3px solid #1565c0; }
    .notif-type-success { border-left: 3px solid #2e7d32; }

    /* ---- USER MENU ---- */
    .menu-user-header {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px; cursor: default;
    }
    .menu-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, #2E75B6, #00acc1);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 700; color: #fff; flex-shrink: 0;
    }
    .menu-user-header div { display: flex; flex-direction: column; gap: 2px; }
    .menu-user-header strong { font-size: 14px; }
    .menu-user-header small { font-size: 12px; color: #666; }

    /* ---- MAIN CONTENT ---- */
    .main-content { background: #f4f6f9; }
    .page-content { padding: 24px; min-height: calc(100vh - 64px); }
  `]
})
export class LayoutComponent {
  private navItems: NavItem[] = [
    { label: 'Tableau de bord', icon: 'dashboard',      route: '/dashboard',    color: '#64b5f6' },
    { label: 'Produits',        icon: 'category',        route: '/produits',     color: '#81c784' },
    { label: 'Stocks',          icon: 'warehouse',       route: '/stocks',       color: '#ffb74d' },
    { label: 'Mouvements',      icon: 'swap_horiz',      route: '/mouvements',   color: '#4dd0e1' },
    { label: 'Rapports',        icon: 'bar_chart',       route: '/rapports',     color: '#ce93d8' },
    { label: 'Utilisateurs',    icon: 'manage_accounts', route: '/utilisateurs', color: '#f48fb1', roles: ['ADMIN'] },
  ];

  sidenavOpened = signal(true);
  sidenavMode = signal<'side' | 'over'>('side');
  currentUser = this.authService.currentUser;
  notifCount = 2;

  sampleNotifs = [
    { id: 1, type: 'danger',  icon: 'warning',       title: 'Stock critique',      msg: '3 produits sous seuil minimum' },
    { id: 2, type: 'warning', icon: 'hourglass_empty', title: 'Commandes en attente', msg: '5 commandes à confirmer' },
    { id: 3, type: 'success', icon: 'check_circle',  title: 'Rapport disponible',  msg: 'Rapport mensuel prêt' },
    { id: 4, type: 'info',    icon: 'sync',          title: 'Synchronisation',     msg: 'Données synchronisées' },
  ];

  visibleNavItems = computed(() => {
    const role = this.authService.userRole();
    return this.navItems.filter(item =>
      !item.roles || item.roles.includes(role ?? '')
    );
  });

  pageTitle = computed(() => {
    const route = window.location.pathname;
    const found = this.navItems.find(i => route.startsWith(i.route));
    return found?.label ?? 'Gestion des Stocks';
  });

  userInitials = computed(() => {
    const u = this.currentUser();
    if (!u) return 'U';
    return ((u.nom?.[0] ?? '') + (u.prenom?.[0] ?? '')).toUpperCase() || 'U';
  });

  constructor(private authService: AuthService, private router: Router) {
    if (window.innerWidth < 768) {
      this.sidenavMode.set('over');
      this.sidenavOpened.set(false);
    }
  }

  toggleSidenav(): void { this.sidenavOpened.update(v => !v); }
  onNavClick(): void {
    if (this.sidenavMode() === 'over') this.sidenavOpened.set(false);
  }
  logout(): void { this.authService.logout(); }
}
