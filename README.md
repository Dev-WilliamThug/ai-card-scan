# AI Card Scan

L'application est séparée en deux modules Next.js indépendants :

- `Frontend` : l'interface utilisateur, disponible sur `http://localhost:3000`.
- `Backend` : l'API, Prisma, Better Auth et l'analyse OCR, disponible sur `http://localhost:3001`.

Le frontend appelle toujours `/api/...`. Sa configuration Next.js relaie ces requêtes vers le backend, ce qui préserve les cookies de session et évite tout changement visuel ou fonctionnel dans l'interface.

## Installation

Depuis la racine du projet :

```bash
npm install
```

Copiez `Backend/.env.example` dans `Backend/.env` puis renseignez les variables de base de données, d'authentification et d'OCR. Le fichier existant a déjà été déplacé dans ce dossier pendant la séparation.

## Démarrage

Dans deux terminaux :

```bash
npm run dev:backend
```

```bash
npm run dev:frontend
```

Le proxy du frontend cible `http://localhost:3001` par défaut. Pour une autre adresse de backend, définissez `BACKEND_URL` dans `Frontend/.env.local`.

## API

Le backend fournit notamment :

- `GET, POST /api/contact`
- `PATCH, DELETE /api/contact/:id`
- `GET, POST /api/tag`
- `POST /api/scan-card`
- `/api/auth/*`

Les en-têtes CORS autorisent le frontend configuré par `FRONTEND_URL` (par défaut `http://localhost:3000`).
