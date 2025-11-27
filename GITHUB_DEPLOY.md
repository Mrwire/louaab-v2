# 🚀 Guide de Déploiement avec GitHub

⚠️ **IMPORTANT** : Votre compte GitHub (Mrwire) est actuellement suspendu. Contactez https://support.github.com pour le réactiver.

## Configuration Initiale (à faire une seule fois)

### 1. Créer un repository GitHub

```bash
# Sur GitHub.com, créez un nouveau repository nommé "louaab"
# Puis dans votre terminal local :

cd "c:\Users\oussa\OneDrive\Bureau\louab v2\louaab-project"

# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - Louaab v2 avec gestion du stock"

# Lier au repository GitHub
git remote add origin https://github.com/VOTRE_USERNAME/louaab.git

# Pousser le code
git push -u origin main
```

### 2. Configurer les Secrets GitHub

Sur GitHub, allez dans : **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Ajoutez ces 3 secrets :

1. **SERVER_HOST** : `164.90.190.154`
2. **SERVER_USER** : `root`
3. **SSH_PRIVATE_KEY** : Votre clé SSH privée

Pour obtenir votre clé SSH privée :
```powershell
# Sur Windows
cat ~\.ssh\id_rsa

# Copiez tout le contenu (y compris les lignes BEGIN et END)
```

Si vous n'avez pas de clé SSH, créez-en une :
```powershell
ssh-keygen -t rsa -b 4096 -C "deploy@louaab.ma"
# Appuyez sur Entrée pour accepter l'emplacement par défaut
# Appuyez sur Entrée deux fois pour ne pas mettre de passphrase

# Ajoutez la clé publique au serveur
cat ~\.ssh\id_rsa.pub | ssh root@164.90.190.154 "cat >> ~/.ssh/authorized_keys"
```

---

## 🔄 Workflow Automatique

Une fois configuré, **chaque push vers GitHub** déclenchera automatiquement :

1. ✅ Installation des dépendances
2. ✅ Build de l'application
3. ✅ Compression des fichiers
4. ✅ Transfert vers le serveur
5. ✅ Extraction et redémarrage PM2

**Temps total : ~2-3 minutes**

---

## 📝 Utilisation Quotidienne

### Faire une modification et déployer :

```powershell
# 1. Modifier vos fichiers dans VS Code

# 2. Commiter et pousser
git add .
git commit -m "Description de votre modification"
git push

# 3. C'est tout ! GitHub Actions s'occupe du déploiement automatiquement
```

### Voir le statut du déploiement :

Allez sur GitHub → Votre repo → **Actions**

Vous verrez :
- ✅ Les déploiements réussis en vert
- ❌ Les échecs en rouge avec les logs d'erreur

---

## 🔍 Commandes Utiles

```powershell
# Voir l'état de Git
git status

# Voir l'historique
git log --oneline

# Annuler les modifications locales
git checkout -- .

# Créer une branche pour tester
git checkout -b test-nouvelle-fonctionnalite

# Revenir à main
git checkout main

# Voir les branches distantes
git branch -a
```

---

## 🆘 En cas de problème

### Le déploiement échoue sur GitHub Actions

1. Allez dans **Actions** → Cliquez sur le workflow échoué
2. Lisez les logs d'erreur
3. Les problèmes courants :
   - **SSH_PRIVATE_KEY incorrect** : Revérifiez le secret
   - **Erreur de build** : Testez `npm run build` localement
   - **Permission denied** : Vérifiez les permissions sur le serveur

### Forcer un redéploiement

```powershell
git commit --allow-empty -m "Force redeploy"
git push
```

### Déploiement manuel (si GitHub Actions ne fonctionne pas)

```powershell
# Build
npm run build

# Compresser
tar -czf .next.tar.gz .next

# Transférer
scp .next.tar.gz package.json package-lock.json root@164.90.190.154:/var/www/louaab/

# Décompresser et redémarrer
ssh root@164.90.190.154 "cd /var/www/louaab && rm -rf .next && tar -xzf .next.tar.gz && rm .next.tar.gz && pm2 restart all"

# Nettoyer
Remove-Item .next.tar.gz
```

---

## 📊 Avantages du déploiement GitHub

✅ **Automatique** : Push = Déploiement  
✅ **Traçable** : Historique complet des déploiements  
✅ **Rollback facile** : Revenir à une version antérieure en 1 clic  
✅ **CI/CD intégré** : Tests automatiques avant déploiement  
✅ **Collaboration** : Plusieurs développeurs peuvent contribuer  
✅ **Backup** : Votre code est sauvegardé sur GitHub  

---

## 🎯 Prochaines étapes (optionnel)

1. **Ajouter des tests** : Exécuter des tests avant le déploiement
2. **Environnements multiples** : Staging + Production
3. **Notifications** : Slack/Discord quand le déploiement est terminé
4. **Rollback automatique** : Si le déploiement échoue
