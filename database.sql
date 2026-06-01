-- ============================================
-- SCRIPT SQL - Gestion des Stocks
-- MySQL 8.0 / MariaDB 10.6+
-- ============================================

CREATE DATABASE IF NOT EXISTS gestion_stocks
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gestion_stocks;

-- Table des magasins
CREATE TABLE magasins (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nom         VARCHAR(100) NOT NULL,
  adresse     VARCHAR(255),
  ville       VARCHAR(100),
  telephone   VARCHAR(20),
  actif       BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des catégories
CREATE TABLE categories (
  id  INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL UNIQUE
);

-- Table des fournisseurs
CREATE TABLE fournisseurs (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  nom              VARCHAR(100) NOT NULL,
  contact          VARCHAR(100),
  email            VARCHAR(100),
  telephone        VARCHAR(20),
  adresse          VARCHAR(255),
  delai_livraison  INT DEFAULT 7,
  actif            BOOLEAN DEFAULT TRUE
);

-- Table des utilisateurs
CREATE TABLE utilisateurs (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  username       VARCHAR(50) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  nom            VARCHAR(100),
  prenom         VARCHAR(100),
  email          VARCHAR(100) UNIQUE,
  role           ENUM('ADMIN','GESTIONNAIRE','VENDEUR') NOT NULL DEFAULT 'VENDEUR',
  magasin_id     INT REFERENCES magasins(id),
  actif          BOOLEAN DEFAULT TRUE,
  last_login     TIMESTAMP NULL
);

-- Table des produits
CREATE TABLE produits (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  code             VARCHAR(50) NOT NULL UNIQUE,
  nom              VARCHAR(150) NOT NULL,
  description      TEXT,
  categorie_id     INT REFERENCES categories(id),
  fournisseur_id   INT REFERENCES fournisseurs(id),
  unite_mesure     ENUM('UNITE','KG','LITRE','METRE') DEFAULT 'UNITE',
  prix_achat       DECIMAL(10,2) NOT NULL DEFAULT 0,
  prix_vente       DECIMAL(10,2) NOT NULL DEFAULT 0,
  seuil_min        INT DEFAULT 10,
  seuil_max        INT DEFAULT 1000,
  date_expiration  DATE,
  actif            BOOLEAN DEFAULT TRUE
);

-- Table des stocks (quantité par produit par magasin)
CREATE TABLE stocks (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  produit_id  INT NOT NULL REFERENCES produits(id),
  magasin_id  INT NOT NULL REFERENCES magasins(id),
  quantite    DECIMAL(10,3) NOT NULL DEFAULT 0,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_produit_magasin (produit_id, magasin_id)
);

-- Table des mouvements de stock
CREATE TABLE mouvements_stock (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  produit_id      INT NOT NULL REFERENCES produits(id),
  magasin_id      INT NOT NULL REFERENCES magasins(id),
  type_mvt        ENUM('ENTREE','SORTIE','TRANSFERT','AJUSTEMENT') NOT NULL,
  quantite        DECIMAL(10,3) NOT NULL,
  prix_unitaire   DECIMAL(10,2),
  reference       VARCHAR(100),
  commentaire     TEXT,
  utilisateur_id  INT REFERENCES utilisateurs(id),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des logs d'audit
CREATE TABLE audit_logs (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id  INT REFERENCES utilisateurs(id),
  action          VARCHAR(100) NOT NULL,
  entite          VARCHAR(50),
  entite_id       INT,
  details         TEXT,
  ip_address      VARCHAR(45),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DONNÉES INITIALES
-- ============================================

INSERT INTO magasins (nom, ville) VALUES
  ('Entrepôt Principal', 'Tunis'),
  ('Dépôt Sud', 'Sfax');

INSERT INTO categories (nom) VALUES
  ('Alimentaire'), ('Électronique'), ('Textile'), ('Hygiène'), ('Autre');

INSERT INTO fournisseurs (nom, contact, email, telephone) VALUES
  ('Fournisseur Alpha', 'Ali Ben Salah', 'alpha@example.com', '+216 71 000 001'),
  ('Fournisseur Beta',  'Sonia Trabelsi', 'beta@example.com',  '+216 72 000 002');

-- Utilisateur admin initial (mot de passe: Admin@123)
-- Hash BCrypt généré avec strength=12
INSERT INTO utilisateurs (username, password_hash, nom, prenom, email, role, magasin_id) VALUES
  ('admin', '$2a$12$Y6V6Y5HJkZ7ZnlQ1RJ0NkOcZKX2nWYBp2qiDd4w0c3Hn4rN1MKkSa',
   'Admin', 'Super', 'admin@stocks.local', 'ADMIN', 1);

-- Produits exemples
INSERT INTO produits (code, nom, categorie_id, fournisseur_id, prix_achat, prix_vente, seuil_min, seuil_max, unite_mesure) VALUES
  ('PROD001', 'Huile d''olive 1L',     1, 1, 4.50,  7.90,  20, 500,  'UNITE'),
  ('PROD002', 'Sucre 1Kg',             1, 1, 0.80,  1.40,  50, 1000, 'KG'),
  ('PROD003', 'Téléphone Android',     2, 2, 120.00,189.00, 5,  50,   'UNITE'),
  ('PROD004', 'T-Shirt Coton L',       3, 2, 8.00,  19.90,  10, 200,  'UNITE'),
  ('PROD005', 'Savon Liquide 500ml',   4, 1, 1.20,  2.80,  30, 300,  'UNITE');

-- Stocks initiaux (magasin 1)
INSERT INTO stocks (produit_id, magasin_id, quantite) VALUES
  (1, 1, 150), (2, 1, 500), (3, 1, 12), (4, 1, 8), (5, 1, 25);

-- Stocks magasin 2
INSERT INTO stocks (produit_id, magasin_id, quantite) VALUES
  (1, 2, 80), (2, 2, 200), (5, 2, 40);
