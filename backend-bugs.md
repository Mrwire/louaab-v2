## Checklist bugs backend (21/11)

- [ ] Cas 413 “request entity too large” : vérifier après augment de limite body (5 MB) et retester import/POST volumineux.
- [ ] Conflits slug/sku jouet : vérifier le handling 409 ajouté (ConflictException) sur création.
- [ ] Statuts commandes : valider update status admin après fix ID (plus d’erreur “commande locale…”).
- [ ] Nettoyage encodage/UTF des fichiers `handoff.md` etc. si nécessaire.
- [ ] Date de début commande (spécifique) : clarifier besoin et implémenter côté API/DTO si requis.
