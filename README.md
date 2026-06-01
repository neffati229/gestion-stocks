# 🏭 Application de Gestion des Stocks — v1.0 Enhanced

> **Technologies :** Java 17 + JavaFX 21 + MySQL 8 + Maven  
> **Architecture :** MVC | Design Pattern Repository | Gestion Multi-Magasins

---

## ✨ Nouvelles fonctionnalités (version améliorée)

### 🎨 Dashboard enrichi
- **4 KPI Cards** colorées avec dégradés (bleu, vert, orange, rouge/teal)
- **Courbe des mouvements** (entrées/sorties sur 6 mois) — canvas natif avec courbes Bézier
- **Graphique barres** de la valeur par catégorie — barres gradient avec arrondis
- **Graphique donut** de répartition du stock
- **Panneau Notifications** coloré en temps réel (danger 🔴, warning 🟠, info 🔵, success 🟢)
- **Bannière d'alerte** rouge animée si stocks sous seuil

### 🔔 Système de Notifications colorées
- Cloche de notification dans la toolbar avec badge rouge
- Menu déroulant avec 4 types : danger / warning / info / success
- Chaque notification a une couleur de bordure distincte

### 🗂️ Sidebar redesignée
- Fond dégradé sombre (bleu nuit)
- Icônes colorées par section
- Badge de rôle coloré (ADMIN rouge, GESTIONNAIRE orange, VENDEUR bleu)
- Initiales de l'utilisateur dans un avatar circulaire

### 📊 Améliorations des composants
- Tous les statuts affichent des chips colorés (vert/orange/rouge)
- Snackbars colorées (success vert, error rouge, warning orange, info bleu)
- Tables avec hover coloré

---

## 🚀 Installation rapide

### Prérequis
- JDK 17+, Node.js 18+, MySQL 8+, Maven 3.9+

### Base de données
```sql
mysql -u root -p < database.sql
```

### Backend (Spring Boot)
```bash
cd backend
# Modifier src/main/resources/application.properties (DB password)
mvn spring-boot:run
# API disponible sur http://localhost:8080
```

### Frontend (Angular 17)
```bash
cd frontend
npm install
ng serve
# Application sur http://localhost:4200
```

---

## 👤 Utilisateurs par défaut

| Username | Mot de passe | Rôle |
|----------|-------------|------|
| admin | Admin123! | ADMIN |
| gestionnaire | Gest123! | GESTIONNAIRE |
| vendeur | Vend123! | VENDEUR |

---

## 📁 Structure du projet

```
gestion-stocks/
├── backend/          → Spring Boot REST API
│   └── src/main/java/com/gestionstocks/
│       ├── controller/   → REST endpoints
│       ├── service/      → Logique métier
│       ├── entity/       → Entités JPA
│       ├── repository/   → Spring Data JPA
│       ├── security/     → JWT + BCrypt
│       └── config/       → Configuration
├── frontend/         → Angular 17 SPA
│   └── src/app/
│       ├── features/
│       │   ├── dashboard/    → 🆕 Charts + KPI + Notifications
│       │   ├── produits/     → CRUD Produits
│       │   ├── stocks/       → État + Mouvements
│       │   ├── rapports/     → Analyses + Top produits
│       │   └── utilisateurs/ → Gestion utilisateurs (ADMIN)
│       ├── core/
│       │   ├── services/     → API calls
│       │   ├── guards/       → Route guards
│       │   └── interceptors/ → JWT, error handling
│       └── shared/
│           ├── models/       → TypeScript interfaces
│           └── components/
│               └── layout/   → 🆕 Sidebar colorée + Toolbar
└── database.sql      → Script SQL complet
```

---

## 🔒 Sécurité
- Authentification JWT
- Hachage BCrypt des mots de passe
- Guards de routes par rôle
- Audit log toutes les actions

