# Welizy Frontend

Application web pour la gestion et la présentation des projets étudiants MMI à l'IUT de Vélizy.

## Pré-requis

- Node.js >= 16
- npm >= 8

## Installation

### Cloner le projet

```bash
git clone https://github.com/Yann6790/Frontend.git
cd Frontend
```

### Installer les dépendances

```bash
npm install
```

## Développement

Lancer le serveur de développement avec hot reload :

```bash
npm run dev
```

L'application sera accessible à `http://localhost:5173`

## Build

Générer la version optimisée pour la production :

```bash
npm run build
```

## Deploiement Vercel (Auth)

Pour eviter les erreurs de session en production (cookie bloque en cross-site),
ce projet utilise un rewrite Vercel de `/api/*` vers le backend Render via `vercel.json`.

Points importants :

- Ne pas definir `VITE_API_URL` en production Vercel (laisser vide/inexistante)
- Garder les appels frontend en URL relative (`/api/...`)
- Verifier que l'origine Vercel est autorisee cote backend

## Linting

Vérifier la qualité du code :

```bash
npm run lint
```

## Stack technique

- **React** - Librairie UI
- **Vite** - Build tool rapide
- **Tailwind CSS** - Styles
- **React Router** - Navigation
- **Lucide React** - Icônes
- **Zod** - Validation de formulaires
