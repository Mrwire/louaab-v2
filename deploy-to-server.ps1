# Script PowerShell pour déployer Louaab sur le serveur
# Usage: .\deploy-to-server.ps1

Write-Host "🚀 Déploiement de Louaab sur le serveur" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration - MODIFIEZ CES VALEURS
$SERVER_USER = "root"  # Votre utilisateur SSH
$SERVER_HOST = "164.90.190.154"  # IP de votre serveur DigitalOcean
$SERVER_PATH = "/var/www/louaab"

# Fonction pour afficher des messages colorés
function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Blue
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

# Vérifier qu'on est dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Error-Custom "Erreur: package.json non trouvé"
    Write-Error-Custom "Exécutez ce script depuis le répertoire louaab"
    exit 1
}

Write-Success "Répertoire correct détecté"

# 1. Vérifier l'état Git local
Write-Info "Vérification de l'état Git local..."
$gitStatus = git status --porcelain

if ($gitStatus) {
    Write-Warning-Custom "Vous avez des modifications non committées:"
    git status --short
    Write-Host ""
    $response = Read-Host "Voulez-vous committer ces changements ? (o/n)"
    
    if ($response -eq "o" -or $response -eq "O") {
        $commitMessage = Read-Host "Message du commit"
        git add -A
        git commit -m $commitMessage
        Write-Success "Changements committés"
    } else {
        Write-Warning-Custom "Déploiement annulé - committez d'abord vos changements"
        exit 1
    }
}

# 2. Push vers GitHub
Write-Info "Push vers GitHub..."
git push origin master

if ($LASTEXITCODE -eq 0) {
    Write-Success "Code pushé sur GitHub"
} else {
    Write-Error-Custom "Erreur lors du push"
    exit 1
}

# 3. Afficher le dernier commit
$lastCommit = git log -1 --oneline
Write-Info "Dernier commit: $lastCommit"
Write-Host ""

# 4. Demander confirmation pour le déploiement
Write-Warning-Custom "⚠️  ATTENTION: Le déploiement va redémarrer l'application sur le serveur"
$confirm = Read-Host "Continuer le déploiement sur le serveur ? (o/n)"

if ($confirm -ne "o" -and $confirm -ne "O") {
    Write-Warning-Custom "Déploiement annulé"
    exit 0
}

Write-Host ""
Write-Info "Connexion au serveur et déploiement..."
Write-Host ""

# 5. Exécuter le script de déploiement sur le serveur via SSH
$sshCommand = @"
cd $SERVER_PATH && ./deploy.sh
"@

Write-Info "Exécution de: ssh $SERVER_USER@$SERVER_HOST"
Write-Host ""

# Note: Vous devrez peut-être configurer SSH avec une clé ou entrer le mot de passe
ssh "$SERVER_USER@$SERVER_HOST" $sshCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Success "========================================" 
    Write-Success "Déploiement terminé avec succès ! 🎉"
    Write-Host ""
    Write-Info "Prochaines étapes:"
    Write-Host "  • Visitez: https://louaab.ma"
    Write-Host "  • Videz le cache du navigateur (Ctrl+Shift+R)"
    Write-Host ""
} else {
    Write-Host ""
    Write-Error-Custom "Erreur lors du déploiement sur le serveur"
    Write-Error-Custom "Connectez-vous manuellement pour diagnostiquer:"
    Write-Host "  ssh $SERVER_USER@$SERVER_HOST"
    Write-Host "  cd $SERVER_PATH"
    Write-Host "  ./deploy.sh"
}
