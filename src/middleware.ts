import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// On ne peut pas utiliser fs dans le middleware Edge Runtime
// On va utiliser un simple système de vérification via les headers de la requête
export function middleware(request: NextRequest) {
  // Vérifier si l'en-tête de maintenance est présent
  // Cet en-tête sera ajouté par Nginx ou par un rewrite Next.js
  // Pour le moment, on désactive le middleware de maintenance
  // car il ne peut pas accéder au système de fichiers dans Edge Runtime
  // La solution sera d'utiliser une base de données ou un service externe
  
  // Vérifier si c'est une route admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Si c'est la page de login, laisser passer
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Pour les autres routes admin, vérifier l'authentification côté client
    // (la vérification réelle se fait dans les composants)
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.svg|.*\\..*$).*)',
  ]
};
