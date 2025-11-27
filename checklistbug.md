# Checklist bug / evolutions (admin & front)

## Inventaire (admin)
- [x] Barre de recherche robuste (nom, categorie, slug/ID, SKU, minuscules/majuscules, trimming, tokens).
- [x] Suppression d'un jouet (single) avec confirmation et usage du backendId.
- [x] Selection multiple + suppression groupee (backend).
- [x] Affichage 3 prix sur les cartes (1j/1sem/1mois).
- [x] Sync age: l'age saisi dans l'inventory doit refleter immediatement les pages `/ages`.
- [ ] Recherche inventaire : refonte complète (match exact sur nom, sans faux positifs).
  - [x] Définir l'algorithme cible (normalisation, tokens, match exact/startswith, tri).
  - [x] Implémenter et tester en local (cas “sennor”, “electronique”, accents).
  - [ ] Déployer et valider en prod.

## Commandes (admin)
- [ ] Archive/Reset clair pour les commandes (UX plus lisible que "revenir a restitue").
- [ ] Liste des articles d'une commande avec UI modernisee (cartes simples).
- [ ] Poll/son/notification nouvelle commande (deja en place cote layout, a valider).

## Dashboard admin
- [ ] Resoudre le chargement infini (audit appels API / fallback cache).

## Divers
- [ ] Verifier decrementations stock/dispo apres commande.
- [ ] Verifier que le bloc 3 prix est aussi visible en creation de jouet (note OK, revalider en prod).
