# LOUAAB - Location de Jouets au Maroc 🎈

![LOUAAB Logo](./public/logo.png)

**LOUAAB** est le premier service marocain de location de jouets et jeux de société pour enfants, adolescents et adultes. Découvrez, jouez, échangez… sans jamais vous encombrer !

## 🌟 Fonctionnalités

### Client
- ✅ **Catalogue interactif** avec filtres dynamiques (âge, catégorie, prix)
- ✅ **Pages de détail produit** complètes avec galeries d'images, spécifications et avis
- ✅ **Système d'abonnement** (Mini, Maxi, Mega packs)
- ✅ **Dashboard client** avec suivi des commandes et livraisons
- ✅ **Authentification** (email/password + Google + Facebook)
- ✅ **Gestion de profil** et des enfants
- ✅ **Liste de favoris**
- ✅ **Historique des commandes**
- ✅ **Pages informatives** (Comment ça marche, FAQ)

### Admin
- ✅ **Dashboard complet** avec KPIs et statistiques
- ✅ **Gestion des jouets** (inventaire, statuts, nettoyage)
- ✅ **Gestion des commandes** avec suivi logistique
- ✅ **Gestion des clients** et abonnements
- ✅ **Système d'authentification** sécurisé
- ✅ **Interface de filtrage** avancée
- 🚧 **Gestion des prix** et durées des packs (à venir)

### Backend (NestJS)
- ✅ **API REST complète** (toys, orders, subscriptions, customers)
- ✅ **Architecture modulaire** avec TypeORM
- ✅ **Authentification JWT** (admin et client)
- ✅ **Guards et middleware** pour la sécurité
- ✅ **Services métier** complets avec logique de gestion
- ✅ **Entités relationnelles** avec PostgreSQL
- 🚧 **Intégration paiement** (Stripe/PayPal - à venir)
- 🚧 **Notifications** (Email, WhatsApp - à venir)

## 🛠️ Stack Technique

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Image Optimization**: next/image

### Backend
- **Framework**: NestJS
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Authentication**: JWT + Passport
- **Validation**: class-validator, class-transformer

### DevOps
- **Node.js**: 18+
- **Package Manager**: npm
- **Environment**: .env

## 📦 Installation

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Étapes

1. **Cloner le repository**
```bash
git clone https://github.com/votre-repo/louaab.git
cd louaab/louaab-web
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer l'environnement**
Créer un fichier `.env` à la racine du projet :

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=louaab

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Node Environment
NODE_ENV=development

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

4. **Initialiser la base de données**
```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE louaab;

# Exécuter le script SQL (optionnel, TypeORM peut le faire automatiquement)
\i database-schema.sql
```

5. **Lancer les serveurs**

**Frontend (Next.js) - Port 3000**
```bash
npm run dev
```

**Backend (NestJS) - Port 3001**
```bash
npm run dev:api
```

6. **Accéder à l'application**
- Frontend client: http://localhost:3000
- Admin: http://localhost:3000/admin
- API Backend: http://localhost:3001/api

## 🏗️ Structure du Projet

```
louaab-web/
├── public/
│   ├── logo.png
│   └── video/
│       └── child_playing_toy.mp4
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── admin/                    # Pages admin
│   │   │   ├── dashboard/
│   │   │   ├── orders/
│   │   │   └── toys/
│   │   ├── auth/                     # Authentification
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── jouets/                   # Catalogue jouets
│   │   │   └── [id]/                # Détail produit
│   │   ├── mon-compte/               # Dashboard client
│   │   ├── nos-packs/                # Abonnements
│   │   ├── comment-ca-marche/        # Page explicative
│   │   ├── faq/                      # Questions fréquentes
│   │   ├── page.tsx                  # Homepage
│   │   ├── layout.tsx                # Layout racine
│   │   └── globals.css               # Styles globaux
│   ├── backend/                      # NestJS Backend
│   │   ├── controllers/              # Contrôleurs REST
│   │   ├── services/                 # Logique métier
│   │   ├── entities/                 # Entités TypeORM
│   │   ├── dto/                      # Data Transfer Objects
│   │   ├── guards/                   # Guards JWT
│   │   ├── modules/                  # Modules NestJS
│   │   └── main.ts                   # Point d'entrée backend
│   └── components/                   # Composants React
│       ├── site-header.tsx
│       ├── site-footer.tsx
│       ├── product-card.tsx
│       └── ...
├── toy-uiux-design.md               # Spécifications UI/UX complètes
├── database-schema.sql              # Schéma PostgreSQL
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

## 🎨 Design System

### Palette de Couleurs
```css
--color-mint: #97E3C0          /* Primaire */
--color-peach: #FFCDB2         /* Secondaire */
--color-lilac: #D8C8FF         /* Accent */
--color-sky-blue: #B8E4FF      /* Accent */
--color-sunshine-yellow: #FFEAA7
--color-charcoal: #2F3A45      /* Texte principal */
--color-slate: #5B6871         /* Texte secondaire */
--color-mist: #E9EEF2          /* Arrière-plans */
--color-soft-white: #FAFBFC    /* Fond */
--color-fresh-green: #74CDA4   /* Success */
--color-coral: #FF8A80         /* Error */
```

### Typographie
- **Headings**: Poppins (Bold, 600, 700)
- **Body**: Nunito (Regular, Medium, 600, 700)

## 📊 Base de Données

### Tables Principales
- **toys**: Catalogue des jouets
- **customers**: Clients
- **children**: Enfants des clients
- **subscriptions**: Abonnements
- **subscription_plans**: Plans d'abonnement
- **orders**: Commandes
- **order_items**: Articles des commandes
- **deliveries**: Livraisons/collectes
- **toy_images**: Images des jouets
- **reviews**: Avis clients
- **admin_users**: Utilisateurs admin

Voir `database-schema.sql` pour le schéma complet.

## 🔐 Authentification

### Client
- Login/Register classique (email + password)
- OAuth (Google, Facebook)
- JWT avec expiration 7 jours

### Admin
- Login sécurisé (email + password)
- JWT avec rôle admin
- Guards protégeant les routes `/admin/*`

## 🚀 Déploiement

### Frontend (Vercel recommandé)
```bash
npm run build
vercel --prod
```

### Backend (Railway, Render, ou VPS)
```bash
npm run build:api
npm run start:prod
```

### Base de Données
- PostgreSQL sur Railway, Supabase, ou VPS
- Configurer les variables d'environnement de production

## 📝 API Endpoints

### Toys
- `GET /api/toys` - Liste des jouets (avec filtres)
- `GET /api/toys/:id` - Détail d'un jouet
- `POST /api/toys` - Créer un jouet (admin)
- `PATCH /api/toys/:id` - Modifier un jouet (admin)

### Orders
- `GET /api/orders` - Liste des commandes
- `GET /api/orders/:id` - Détail d'une commande
- `POST /api/orders` - Créer une commande
- `PATCH /api/orders/:id/status` - Changer le statut (admin)

### Subscriptions
- `GET /api/subscriptions` - Liste des abonnements
- `POST /api/subscriptions` - Créer un abonnement
- `PATCH /api/subscriptions/:id` - Modifier un abonnement
- `POST /api/subscriptions/:id/pause` - Mettre en pause
- `POST /api/subscriptions/:id/resume` - Réactiver

### Customers
- `GET /api/customers` - Liste des clients (admin)
- `GET /api/customers/:id` - Détail client
- `POST /api/customers` - Créer un client
- `PATCH /api/customers/:id` - Modifier un client

### Auth
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `POST /api/auth/admin/login` - Connexion admin

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add: Amazing Feature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence privée. Tous droits réservés © 2024 LOUAAB

## 📧 Contact

- **Email**: sara@louaab.ma
- **Téléphone**: +212 6 65701513
- **WhatsApp**: [Cliquez ici](https://wa.me/212665701513)
- **Website**: [louaab.ma](https://louaab.ma)

---

**Made with ❤️ in Morocco 🇲🇦**
