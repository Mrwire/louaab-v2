# Guide de Déploiement Optimisé - Louaab

## 🚀 Méthode Rapide (Recommandée)

### Option 1 : Déploiement avec compression (le plus rapide)

```powershell
# 1. Build le projet
npm run build

# 2. Créer une archive compressée
tar -czf .next.tar.gz .next

# 3. Transférer seulement l'archive (beaucoup plus rapide que le dossier complet)
scp .next.tar.gz root@164.90.190.154:/var/www/louaab/

# 4. Décompresser et redémarrer sur le serveur
ssh root@164.90.190.154 "cd /var/www/louaab && rm -rf .next && tar -xzf .next.tar.gz && rm .next.tar.gz && pm2 restart all"

# 5. Nettoyer localement
Remove-Item .next.tar.gz
```

**Gain de temps** : ~80% plus rapide (7-8 MB compressé vs 200+ fichiers non compressés)

---

### Option 2 : Déploiement sélectif (pour petites modifications)

Si vous avez modifié seulement quelques pages, transférez uniquement les fichiers modifiés :

```powershell
# Exemple : modifier seulement la page d'accueil
scp -r .next/server/app/page.html .next/server/app/page.rsc root@164.90.190.154:/var/www/louaab/.next/server/app/
ssh root@164.90.190.154 "pm2 restart all"
```

---

### Option 3 : Déploiement avec rsync (si disponible)

```powershell
# Synchronise uniquement les fichiers modifiés
rsync -avz --delete .next/ root@164.90.190.154:/var/www/louaab/.next/
ssh root@164.90.190.154 "pm2 restart all"
```

---

## 📊 Comparaison des temps

| Méthode | Temps estimé | Bande passante |
|---------|--------------|----------------|
| SCP du dossier .next complet | ~3-5 min | ~50 MB |
| Archive tar.gz | ~30-60 sec | ~8 MB |
| Rsync (fichiers modifiés) | ~15-30 sec | Variable |

---

## 🔧 Automatisation Future

Pour automatiser complètement le déploiement, vous pouvez :

1. **Utiliser GitHub Actions** : Déploiement automatique à chaque push
2. **Configurer un webhook** : Build et déploiement automatique
3. **Utiliser Vercel** : Déploiement zero-config pour Next.js

---

## ✅ Checklist avant déploiement

- [ ] `npm run build` sans erreurs
- [ ] Tester localement avec `npm run dev`
- [ ] Vérifier les nouvelles fonctionnalités
- [ ] Backup de la base de données (si modifications)
- [ ] Notifier l'équipe du déploiement

---

## 🆘 En cas de problème

```powershell
# Vérifier l'état du serveur
ssh root@164.90.190.154 "pm2 status"

# Voir les logs en temps réel
ssh root@164.90.190.154 "pm2 logs louaab --lines 50"

# Redémarrer complètement
ssh root@164.90.190.154 "pm2 restart all"

# Rollback rapide (si backup disponible)
ssh root@164.90.190.154 "cd /var/www/louaab && cp -r .next.backup .next && pm2 restart all"
```
