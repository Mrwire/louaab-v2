"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function MaintenanceCheck() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Ne pas vérifier si on est déjà sur la page maintenance ou admin
    if (pathname.startsWith('/admin') || pathname === '/maintenance') {
      return;
    }

    const checkMaintenance = async () => {
      try {
        const response = await fetch('/api/admin/maintenance');
        const data = await response.json();
        
        if (data.success && data.maintenanceMode) {
          // Rediriger vers la page de maintenance
          router.push('/maintenance');
        }
      } catch (error) {
        // En cas d'erreur, ne rien faire
        console.error('Erreur lors de la vérification de maintenance:', error);
      }
    };

    checkMaintenance();
    
    // Vérifier toutes les 30 secondes
    const interval = setInterval(checkMaintenance, 30000);
    
    return () => clearInterval(interval);
  }, [pathname, router]);

  return null;
}
