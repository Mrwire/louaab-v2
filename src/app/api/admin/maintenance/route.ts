import { NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const MAINTENANCE_FILE = join(process.cwd(), '.maintenance');

export async function POST() {
  try {
    // Toggle: si le fichier existe, on le supprime, sinon on le crée
    const isCurrentlyInMaintenance = existsSync(MAINTENANCE_FILE);
    const newMode = !isCurrentlyInMaintenance;
    
    if (newMode) {
      // Activer la maintenance
      await writeFile(MAINTENANCE_FILE, 'true', 'utf-8');
    } else {
      // Désactiver la maintenance
      await unlink(MAINTENANCE_FILE);
    }

    return NextResponse.json({ 
      success: true, 
      message: newMode ? 'Mode maintenance activé' : 'Mode maintenance désactivé',
      maintenanceMode: newMode 
    });
  } catch (error) {
    console.error('Erreur lors du changement du mode maintenance:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const maintenanceMode = existsSync(MAINTENANCE_FILE);
    
    return NextResponse.json({ 
      success: true, 
      maintenanceMode 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du mode maintenance:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

