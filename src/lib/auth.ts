// Système d'authentification sécurisé pour l'admin
import bcrypt from 'bcryptjs';

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

// Mot de passe temporaire par défaut (à changer immédiatement)
const DEFAULT_ADMIN_PASSWORD = 'LouaabAdmin2024!';

export class AuthManager {
  private static STORAGE_KEY = 'admin-auth';
  private static SESSION_KEY = 'admin-session';

  // Initialiser l'admin par défaut si nécessaire
  static async initializeDefaultAdmin(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const existingAuth = localStorage.getItem(this.STORAGE_KEY);
      if (!existingAuth) {
        // Créer l'admin par défaut
        const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);
        const defaultAdmin: AdminUser = {
          id: 'admin-001',
          username: 'admin',
          passwordHash,
          createdAt: new Date().toISOString(),
          isActive: true
        };

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultAdmin));
        console.log('Admin par défaut créé. Mot de passe temporaire:', DEFAULT_ADMIN_PASSWORD);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'admin:', error);
    }
  }

  // Vérifier les identifiants
  static async authenticate(username: string, password: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      const adminData = localStorage.getItem(this.STORAGE_KEY);
      if (!adminData) return false;

      const admin: AdminUser = JSON.parse(adminData);
      
      if (!admin.isActive || admin.username !== username) {
        return false;
      }

      const isValid = await bcrypt.compare(password, admin.passwordHash);
      
      if (isValid) {
        // Mettre à jour la dernière connexion
        admin.lastLogin = new Date().toISOString();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(admin));
        
        // Créer une session
        const session = {
          adminId: admin.id,
          username: admin.username,
          loginTime: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
        };
        
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      }

      return isValid;
    } catch (error) {
      console.error('Erreur lors de l\'authentification:', error);
      return false;
    }
  }

  // Vérifier si l'utilisateur est connecté
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const session = localStorage.getItem(this.SESSION_KEY);
      if (!session) return false;

      const sessionData = JSON.parse(session);
      const now = new Date();
      const expiresAt = new Date(sessionData.expiresAt);

      if (now > expiresAt) {
        // Session expirée
        localStorage.removeItem(this.SESSION_KEY);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification de session:', error);
      return false;
    }
  }

  // Déconnexion
  static logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.SESSION_KEY);
  }

  // Changer le mot de passe
  static async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      const adminData = localStorage.getItem(this.STORAGE_KEY);
      if (!adminData) return false;

      const admin: AdminUser = JSON.parse(adminData);
      
      // Vérifier l'ancien mot de passe
      const isCurrentValid = await bcrypt.compare(currentPassword, admin.passwordHash);
      if (!isCurrentValid) return false;

      // Hacher le nouveau mot de passe
      const newPasswordHash = await bcrypt.hash(newPassword, 12);
      admin.passwordHash = newPasswordHash;

      // Sauvegarder
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(admin));
      return true;
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      return false;
    }
  }

  // Obtenir les informations de l'admin
  static getAdminInfo(): AdminUser | null {
    if (typeof window === 'undefined') return null;

    try {
      const adminData = localStorage.getItem(this.STORAGE_KEY);
      if (!adminData) return null;

      return JSON.parse(adminData);
    } catch (error) {
      console.error('Erreur lors de la récupération des infos admin:', error);
      return null;
    }
  }

  // Vérifier la force du mot de passe
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
