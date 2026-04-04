Welizy - Plateforme de suivi des SAE (Frontend)
Application web centralisée pour la gestion, le suivi et la présentation des projets (SAE) du département MMI de l'IUT de Vélizy.

⚠️ Accès à l'application et Serveur Backend (Important)
L'application Frontend est connectée à une API RESTful hébergée sur Render.
Pour éviter toute erreur de connexion lors de votre première visite :
Il est nécessaire de "réveiller" le serveur Backend (qui peut se mettre en veille en cas d'inactivité). Pour lancer la connexion entre le front et le back, veuillez consulter l'URL suivante avant d'utiliser l'application :
👉 https://ecampus-mmi.onrender.com

(Patientez quelques secondes le temps que le serveur s'initialise, puis retournez sur le Frontend).

🚀 Stack Technique
Framework : React 19

Build Tool : Vite 6

Styling : Tailwind CSS

Navigation : React Router 7

Validation : Zod & React Hook Form

Icônes : Lucide React

💻 Installation & Développement Local
Pré-requis
Node.js >= 20.0

npm >= 10.0

1. Cloner le projet
Bash
git clone https://github.com/Yann6790/Frontend.git
cd Frontend
2. Installer les dépendances
Bash
npm install
3. Lancer le serveur de développement
Bash
npm run dev
L'application sera accessible localement sur http://localhost:5173.

☁️ Déploiement Vercel & Gestion de l'API
Pour éviter les erreurs de session en production (cookies bloqués en cross-site) et les restrictions CORS, ce projet utilise un Rewrite Vercel défini dans le fichier vercel.json.

Configuration des Rewrites
Le dossier /api/* du frontend est redirigé de manière transparente vers l'URL du backend Render.

Points importants pour la mise en ligne :

URL Relative : Dans le code frontend, utilisez uniquement des chemins relatifs (ex: /api/auth/me) sans préfixe de domaine.

Variables d'environnement : Ne définissez pas VITE_API_URL dans les paramètres Vercel. Le fichier vercel.json s'occupe de faire le pont automatiquement.

CORS : Vérifiez que l'URL de votre déploiement Vercel est bien autorisée dans la "Whitelist" de votre Backend.

⚙️ Commandes Utiles (Build & Qualité)
Générer manuellement la version optimisée (Production) :

Bash
npm run build
Le résultat se trouve dans le dossier /dist. Sur Vercel, ce build est automatique à chaque "Push" sur la branche main.

Vérifier la qualité du code (ESLint) :

Bash
npm run lint
Prévisualiser le build localement :

Bash
npm run preview
🎓 Contexte du Projet (SAE 403)
Ce projet a été réalisé dans le cadre de la SAE 403 (BUT MMI) et répond aux objectifs pédagogiques suivants :

Analyse du besoin : Centralisation des ressources SAE (consignes, livrables, annonces, visualisation).

UX/UI : Conception d'une interface spécifique et ergonomique pour 4 profils distincts (Étudiant, Enseignant, Admin, Public).

Architecture Pro : Séparation stricte entre le Frontend (déployé sur Vercel) et le Backend (API RESTful sur Render).
