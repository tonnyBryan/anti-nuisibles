# Anti-Nuisibles Paris — Module de devis en ligne

Prototype fullstack développé avec Next.js 16 et Supabase dans le cadre d'un exercice technique.

## Stack technique

- **Framework** : Next.js 16 (App Router, Turbopack)
- **Base de données** : Supabase (PostgreSQL)
- **Styling** : Tailwind CSS
- **Validation** : Zod
- **Auth** : JWT (jsonwebtoken)
- **Langage** : TypeScript

## Lancement en local

### 1. Cloner le projet

```bash
git clone https://github.com/TON_USERNAME/anti-nuisibles.git
cd anti-nuisibles
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Remplir les valeurs dans `.env.local`.

### 4. Initialiser la base de données

Exécuter le script `scripts/init-db.sql` dans le SQL Editor de Supabase.

### 5. Lancer le serveur

```bash
npm run dev
```

L'application est accessible sur http://localhost:3000

## Identifiants de test

| Accès | Valeur |
|---|---|
| URL back-office | /admin |
| Mot de passe | admin123 |

## Structure du projet

```
src/
├── app/
│   ├── page.tsx              → Page d'accueil
│   ├── devis/page.tsx        → Formulaire public multi-étapes
│   ├── admin/page.tsx        → Back-office
│   ├── admin/login/page.tsx  → Connexion admin
│   └── api/
│       ├── devis/            → POST (soumission devis)
│       └── admin/devis/      → GET + PATCH (gestion admin)
├── lib/
│   ├── supabase.ts           → Clients Supabase
│   ├── auth.ts               → JWT helpers
│   └── services/
│       └── devis.service.ts  → Logique métier
└── types/index.ts            → Types TypeScript
```

## Fonctionnalités

### Formulaire public /devis

- Formulaire multi-étapes (3 étapes)
- Validation côté client et côté serveur (Zod)
- Protection anti-spam : rate limiting par IP (max 3/heure)
- Sanitisation des inputs (prévention XSS)
- Feedback visuel : loader, message de succès avec UUID

### API sécurisée

- POST /api/devis — soumission publique avec rate limiting
- GET /api/admin/devis — liste protégée par Bearer token JWT
- PATCH /api/admin/devis — mise à jour statut protégée

### Back-office /admin

- Authentification par mot de passe + JWT (session 8h)
- Tableau paginé (10 résultats/page)
- Filtre par statut (nouveau / traité / archivé)
- Recherche par nom ou email (debounce 300ms)
- Changement de statut en un clic
- Export CSV des demandes filtrées

## Choix techniques

- **Service layer** : la logique métier est isolée dans devis.service.ts pour séparer les responsabilités
- **ApiResponse uniforme** : toutes les routes retournent { success, data?, error? }
- **Deux clients Supabase** : client public (anon key) pour le formulaire, client admin (secret key) pour les routes protégées
- **JWT sans librairie edge** : jsonwebtoken étant incompatible avec le runtime proxy de Next.js 16, la vérification du cookie dans le proxy se limite à son existence — la vérification JWT complète se fait dans les API routes côté serveur

## Variables d'environnement

Voir .env.example pour la liste complète des variables requises.