# 🚀 Commandes à connaître pour la soutenance

## Git
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/VOTRE_USERNAME/gestion-stocks.git
git push -u origin main
```

## Docker
```bash
# Lancer tout le projet
docker compose up --build

# Lancer en arrière-plan
docker compose up -d --build

# Voir les containers
docker ps

# Voir les logs
docker compose logs -f backend
docker compose logs -f frontend

# Arrêter
docker compose down

# Arrêter et supprimer les volumes
docker compose down -v
```

## Kubernetes (avec minikube)
```bash
# Démarrer minikube
minikube start

# Appliquer les manifests
kubectl apply -f kubernetes/

# Voir les pods
kubectl get pods -n gestion-stocks

# Voir les services
kubectl get services -n gestion-stocks

# Voir les logs d'un pod
kubectl logs -f deployment/backend -n gestion-stocks

# Accéder au frontend
minikube service frontend -n gestion-stocks
```

## URLs après démarrage Docker
- Frontend  : http://localhost
- Backend   : http://localhost:8081
- Base de données : localhost:3307
