# Bible louaab.ma (prod)  
Document de référence pour reprendre/déployer/debugger la plateforme louaab.ma.  
Sources vérifiées en SSH le 2025-11-27 sur le serveur prod `164.90.190.154`.  

## 1) Contexte serveur (vérifié)
- Hôte : `ubuntu-s-2vcpu-4gb-fra1-01` (prod).
- OS : Ubuntu 25.04 (kernel 6.14.0-34-generic).
- IP publique : `164.90.190.154`.
- Espace disque : `/` 77G (15G utilisés, 63G libres) – même pour `/root` et `/var` (même partition).
- Node.js : 20.19.5 (pm2 utilise /usr/bin/node).
- PM2 home : `/root/.pm2`.

## 2) Architecture globale (vérifiée)
- Reverse proxy Nginx (TLS) → Next.js (port 3000) et NestJS (port 3001, prefix /api).
- Domaine : `louaab.ma` (`www` redirigé). Certificats Let’s Encrypt.
- `client_max_body_size` Nginx actuel : **5m** (risque 413 sur gros POST).
- PM2 :
  - `louaab-frontend` → `npm run start` dans `/root/louaab-project` (Next prod, port 3000).
  - `louaab-backend` → `node dist/backend/main.js` dans `/root/louaab-project` (Nest API, port 3001).
  - `louaab-old` → ancien front dans `/var/www/louaab` (encore online mais non lié au vhost actuel).
- Repo prod : `/root/louaab-project` (≈1.6 G). Backups multiples dans `/root/*backup*`.

## 3) Arborescence projet (vérifiée)
```
/root/louaab-project
  package.json            # scripts front/back
  next.config.ts          # images unoptimized, remotePatterns any
  ecosystem.config.js     # pm2 (frontend/backend)
  .env (non lu)
  public/
    toys/import/          # ~423 MB d’images d’import
    toys/toys-mapping.json
  src/
    app/…                 # Next.js (app router)
    backend/…             # NestJS (API)
    lib/…                 # helpers front (API calls, orders)
    components/, contexts/
```
Import jouets : JSON `toys_import_ready.json` et images `/public/toys/import/`.

## 4) Scripts npm (vérifié)
- Front build : `npm run build` (Next).
- Front start : `npm run start`.
- Dev : `npm run dev -- --turbopack`.
- Backend build : `npm run build:api` (tsc sur tsconfig.backend.json + tsc-alias).
- Backend start prod : `npm run start:prod:api` → `node dist/backend/main.js`.
- Dev API : `npm run dev:api` (scripts/dev-api.js).

## 5) Nginx (vérifié)
- Fichier : `/etc/nginx/sites-available/louaab.ma` (lien dans sites-enabled).
- HTTPS 443 : proxy `/api` → `http://localhost:3001/api`, reste → `http://localhost:3000`.
- HTTP 80 : redirection 301 vers HTTPS.
- Paramètre notable : `client_max_body_size 5m` (augmenter si uploads volumineux).
- Ancien vhost `/etc/nginx/sites-available/louaab` (port 80 only, non lié).
- Logs : `/var/log/nginx/error.log`, `/var/log/nginx/access.log`, `/var/log/nginx/louaab-error.log` (si activé).

## 6) Backend NestJS (vérifié)
- Entrée : `main.ts` → prefix global `/api`, body limit 5 MB, CORS autorisé (env FRONTEND_URL ou http://localhost:3000), port 3001 par défaut.
- Modules principaux (src/backend/modules) : `app`, `order`, `admin-ui`, `toy`, `category`, `age-range`, `pack`, `faq`, `contact`, `subscription`, `auth`, `sync`, `pricing`.
- Controllers clés :
  - `admin-orders.controller.ts` (`/api/admin/ui/orders`): GET list+stats, PATCH status, PATCH reset, PATCH return.
  - `order.controller.ts` (`/api/orders`), `public-orders.controller.ts` (`/api/public/orders`).
  - `toy.controller.ts` (`/api/toys` CRUD, status, stats), `sync.controller.ts` (bulk sync toys/packs).
  - `age-range.controller.ts`, `category.controller.ts`, `pack.controller.ts`, `faq.controller.ts`, `contact.controller.ts`, `subscription.controller.ts`, `auth.controller.ts`.
- Logique stock/commande (order.service.ts) :
  - Création : statut initial `DRAFT`, vérifie stock dispo (availableQuantity sinon stockQuantity).
  - Confirmation (pending/draft → confirmed) :
    - Vérifie stock suffisant.
    - Décrémente `availableQuantity` (borne par stock physique) et set `ToyStatus.RESERVED`.
    - Incrémente `timesRented`.
  - Delivered : statut jouet → RENTED.
  - Returned : statut jouet → CLEANING, ré-crédite available (min with stock).
  - Completed : statut jouet → AVAILABLE, ré-crédite si pas déjà fait au RETURN.
  - Reset (PATCH /admin/ui/orders/:id/reset) : remet statut `DRAFT`, restitue stock (si confirmed/delivered) et décrémente `timesRented`.
  - Cancel : autorisé si DRAFT ou CONFIRMED, restitue stock, status CANCELLED.
- Import/doublons : erreur 23505 sur slug `toys` (log PM2) → contrainte unique UQ_128b63b3466cc814658aaef2fa4 (slug). Conflits slug/sku → 409 à prévoir.
- Body size API déjà 5 MB mais Nginx limite à 5 MB : pour 413, augmenter côté Nginx (proxy TLS) >5 MB.

## 7) Front Next.js (vérifié)
- App router sous `src/app`.
- Pages clés :
  - `src/app/admin/inventory/page.tsx` : PATCH stock/status avec `backendId` (UUID), conversion âge en années (cap 18), spinner CTA, mapping backendId au chargement.
  - `src/app/admin/orders/page.tsx` : nouvelle UI liste + modal, statuts homogènes, affichage articles (image, qty, stock dispo), bouton reset. Recherche multi-champs (nom/tél/ID/numéro). Images attendues via `imageUrl` normalisé.
  - `src/app/ages/[...slug]` : route dynamique, `getAllToys({ noCache: true })` pour compter en temps réel.
  - DatePicker simplifié (text-gray-900, pas de bug “veille”).
  - Modal pack : champs nom/téléphone/email requis.
- Config images : `next.config.ts` autorise tous les hostnames, `unoptimized: true` (pas de loader). Les images d’API doivent fournir une URL absolue ou chemin public `/toys/images/...`.

## 8) Data d’import / médias (vérifié)
- JSON import jouets : `/root/louaab-project/toys_import_ready.json` (copie aussi dans /root).
- Images import : `/root/louaab-project/public/toys/import/` (~423 MB).
- Mapping : `/root/louaab-project/public/toys/toys-mapping.json`.

## 9) Déploiement (procédure actuelle)
1. Copier les fichiers modifiés : `scp ./louaab-project/path/file root@164.90.190.154:/root/louaab-project/path/file`
2. SSH : `ssh root@164.90.190.154`
3. Build front (et potentiellement back) : `cd /root/louaab-project && npm run build`
4. Redémarrer PM2 front : `pm2 restart louaab-frontend`
5. (Si backend modifié) : `pm2 restart louaab-backend`

## 10) Commandes de diagnostic rapides
- PM2 : `pm2 ls`, `pm2 logs louaab-backend --lines 200`, `pm2 logs louaab-frontend --lines 200`.
- Nginx : `tail -n 200 /var/log/nginx/error.log` (et access).
- Santé API : `curl -I http://127.0.0.1:3001/api/health`.
- Ports locaux : frontend 3000, backend 3001 (avec prefix /api).
- Vérifier body size 413 : `grep client_max_body_size /etc/nginx/sites-available/louaab.ma`.

## 11) Workflows fonctionnels (confirmés par code)
- **Commandes (admin/orders)** :
  - Statut par défaut `pending` côté front → mappé en `DRAFT` backend.
  - `confirmed` déclenche décrément stock (protégé pour éviter double confirmation).
  - `delivered` → apparait à exposer dans /admin/returns (TODO).
  - `returned` → restitue partiellement le stock (CLEANING).
  - `completed` → dispo finale.
  - Reset : remet à DRAFT et ré-crédite stock/timesRented.
- **Inventory admin** :
  - PATCH stock/status en minuscules, envoie `stockQuantity`, `availableQuantity`, `status` selon qty.
  - Utilise `backendId` (UUID) résolu au chargement pour éviter 400.
- **/ages** :
  - Comptage live des jouets par tranche (noCache).
- **Import** :
  - Contrainte slug unique (voir log 23505). Sur conflit, nettoyer slug/sku avant sync.

## 12) Backlog / points à surveiller
- Augmenter `client_max_body_size` Nginx (>5m) pour éviter 413 sur gros POST/imports.
- /admin/returns : filtrer les commandes delivered/returned (à implémenter côté front).
- Vérifier images admin/orders : besoin d’URL absolue ou chemin public (normalisation ajoutée côté front API).
- Spinner infini dashboard admin en cas d’erreur 4xx/5xx sur `/api/admin/ui/orders` : afficher message d’erreur (à faire côté front).
- Validations Inventory : s’assurer que payloads n’envoient ni chaînes vides ni NaN.
- Import jouets : finaliser POST `/api/toys` avec token admin, vérifier correspondance images import.

## 13) Règles de sécurité
- Ne jamais exposer contenu `.env`, mots de passe, clés privées.
- Ne pas supprimer/modifier `/var/www/louaab` (instance “old”) sans décision explicite.
- Avant toute opération destructive (drop table, delete massif), faire un backup (`backup-louaab-project-*.tar.gz` déjà présents).

## TL;DR
- Front Next (port 3000), API Nest (port 3001 prefix /api), proxifiés via Nginx TLS (`client_max_body_size 5m` à augmenter).
- PM2 : `louaab-frontend` (npm run start), `louaab-backend` (node dist/backend/main.js), `louaab-old` legacy.
- Repo prod : `/root/louaab-project`, scripts : `npm run build`, `npm run start`, `npm run build:api`, `npm run start:prod:api`.
- Stock commandes : décrément à la confirmation, reset ré-crédite. Statuts : pending/draft → confirmed → delivered → returned → completed.
- Déploiement : scp → `npm run build` → `pm2 restart louaab-frontend` (et backend si modifié).
