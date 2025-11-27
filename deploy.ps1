# Script de déploiement optimisé pour Louaab
# Ce script compresse .next avant le transfert pour accélérer le déploiement

Write-Host "🚀 Démarrage du déploiement..." -ForegroundColor Cyan

# Vérifier que le build est à jour
Write-Host "📦 Vérification du build..." -ForegroundColor Yellow
if (-not (Test-Path ".next")) {
    Write-Host "❌ Le dossier .next n'existe pas. Veuillez lancer 'npm run build' d'abord." -ForegroundColor Red
    exit 1
}

# Créer une archive tar.gz de .next pour accélérer le transfert
Write-Host "📦 Compression de .next..." -ForegroundColor Yellow
tar -czf .next.tar.gz .next

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de la compression." -ForegroundColor Red
    exit 1
}

$compressedSize = (Get-Item .next.tar.gz).Length / 1MB
Write-Host "✅ Archive créée: $([math]::Round($compressedSize, 2)) MB" -ForegroundColor Green

# Transférer les fichiers
Write-Host "📤 Transfert des fichiers vers le serveur..." -ForegroundColor Yellow
scp .next.tar.gz package.json package-lock.json root@164.90.190.154:/var/www/louaab/

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du transfert." -ForegroundColor Red
    Remove-Item .next.tar.gz -ErrorAction SilentlyContinue
    exit 1
}

# Décompresser sur le serveur et redémarrer
Write-Host "📦 Décompression et redémarrage sur le serveur..." -ForegroundColor Yellow
$commands = @(
    "cd /var/www/louaab",
    "rm -rf .next",
    "tar -xzf .next.tar.gz",
    "rm .next.tar.gz",
    "pm2 restart all"
) -join ' && '

ssh root@164.90.190.154 $commands

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du déploiement sur le serveur." -ForegroundColor Red
    Remove-Item .next.tar.gz -ErrorAction SilentlyContinue
    exit 1
}

# Nettoyer l'archive locale
Remove-Item .next.tar.gz -ErrorAction SilentlyContinue

Write-Host "✅ Déploiement terminé avec succès!" -ForegroundColor Green
Write-Host "🌐 Le site est maintenant à jour sur https://louaab.ma" -ForegroundColor Cyan
