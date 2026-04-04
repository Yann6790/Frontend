Welizy - Plateforme de suivi des SAE (Frontend)
Application web centralisée pour la gestion, le suivi et la présentation des projets (SAE) du département MMI de l'IUT de Vélizy.

**Stack Technique**

Framework : React 19
Build Tool : Vite 6
Styling : Tailwind CSS
Navigation : React Router 7
Validation : Zod & React Hook Form
Icônes : Lucide React

**Pré-requis**
Node.js >= 20.0
npm >= 10.0

**Installation & Développement**
1. Cloner le projet
Bash
git clone https://github.com/Yann6790/Frontend.git
cd Frontend
2. Installer les dépendances
Bash
npm install
3. Lancer en local
Bash
npm run dev
L'application sera accessible sur http://localhost:5173.

**Déploiement Vercel & Gestion de l'API**
Pour éviter les erreurs de session en production (cookies bloqués en cross-site) et les erreurs CORS, ce projet utilise un Rewrite Vercel défini dans le fichier vercel.json.

Configuration des Rewrites
Le dossier /api/* du frontend est redirigé de manière transparente vers l'URL du backend (ex: Render).
Points importants pour la mise en ligne :
URL Relative : Dans le code frontend, utilisez uniquement des chemins relatifs (ex: /api/auth/me) sans préfixe de domaine.
Variables d'environnement : Ne définissez pas VITE_API_URL dans les paramètres Vercel. Le fichier vercel.json s'occupe de faire le pont.
CORS : Vérifiez que l'URL de votre déploiement Vercel est bien autorisée dans la "Whitelist" de votre Backend.

**Build & Production**
Pour générer manuellement la version optimisée :
Bash
npm run build
Le résultat se trouve dans le dossier /dist. Sur Vercel, ce build est automatique à chaque "Push" sur la branche main.

**Qualité du Code**
Bash
# Vérifier le linting (ESLint)
npm run lint

# Prévisualiser le build localement
npm run preview

**Contexte du Projet (SAE 403)**
Ce projet répond aux objectifs pédagogiques de la SAE :

Analyse du besoin : Centralisation des ressources SAE (consignes, livrables, annonces, visualisation).
UX/UI : Interface spécifique pour 4 profils (Étudiant, Enseignant, Public, Admin).
Architecture Pro : Séparation entre Frontend (Vercel) et Backend (API RESTful).
