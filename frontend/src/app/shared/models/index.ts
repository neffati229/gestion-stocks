// ========================
// AUTH
// ========================
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  username: string;
  nom: string;
  prenom: string;
  role: 'ADMIN' | 'GESTIONNAIRE' | 'VENDEUR';
  magasinId: number | null;
}

// ========================
// PRODUIT
// ========================
export interface Produit {
  id: number;
  code: string;
  nom: string;
  description?: string;
  categorieId?: number;
  categorieNom?: string;
  fournisseurId?: number;
  fournisseurNom?: string;
  uniteMesure: string;
  prixAchat: number;
  prixVente: number;
  margeBeneficiaire?: number;
  seuilMin: number;
  seuilMax: number;
  dateExpiration?: string;
  actif: boolean;
}

export interface ProduitRequest {
  code: string;
  nom: string;
  description?: string;
  categorieId?: number;
  fournisseurId?: number;
  uniteMesure: string;
  prixAchat: number;
  prixVente: number;
  seuilMin: number;
  seuilMax: number;
  dateExpiration?: string;
}

// ========================
// STOCK
// ========================
export interface Stock {
  id: number;
  produitId: number;
  produitCode: string;
  produitNom: string;
  magasinId: number;
  magasinNom: string;
  quantite: number;
  seuilMin: number;
  seuilMax: number;
  sousSeuilMin: boolean;
  updatedAt: string;
}

export interface MouvementRequest {
  produitId: number;
  magasinId: number;
  type: 'ENTREE' | 'SORTIE' | 'TRANSFERT' | 'AJUSTEMENT';
  quantite: number;
  prixUnitaire?: number;
  reference?: string;
  commentaire?: string;
  magasinDestId?: number;
}

export interface MouvementStock {
  id: number;
  produitId: number;
  produitNom: string;
  produitCode: string;
  magasinId: number;
  magasinNom: string;
  typeMvt: string;
  quantite: number;
  prixUnitaire?: number;
  reference?: string;
  commentaire?: string;
  utilisateurNom?: string;
  createdAt: string;
}

// ========================
// REFERENCES
// ========================
export interface Magasin {
  id: number;
  nom: string;
  adresse?: string;
  ville?: string;
  telephone?: string;
  actif: boolean;
}

export interface Categorie {
  id: number;
  nom: string;
}

export interface Fournisseur {
  id: number;
  nom: string;
  contact?: string;
  email?: string;
  telephone?: string;
  actif: boolean;
}

// ========================
// UTILISATEUR
// ========================
export interface Utilisateur {
  id: number;
  username: string;
  nom: string;
  prenom: string;
  email?: string;
  role: string;
  magasinId?: number;
  magasinNom?: string;
  actif: boolean;
}

// ========================
// RAPPORT
// ========================
export interface DashboardStats {
  valeurAchat: number;
  valeurVente: number;
  nbReferences: number;
  nbSousSeuilMin: number;
}

export interface CommandeProposee {
  produitId: number;
  code: string;
  nom: string;
  quantiteActuelle: number;
  seuilMin: number;
  quantiteACommander: number;
  prixUnitaire: number;
  totalCommande: number;
  fournisseurNom?: string;
}
