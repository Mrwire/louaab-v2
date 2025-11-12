import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Maintenance - LOUAAB',
  description: 'Site en maintenance',
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mint/10 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="LOUAAB Logo"
              width={200}
              height={80}
              className="h-20 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Animation de maintenance */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Cercle animé */}
            <div className="w-24 h-24 rounded-full border-4 border-mint/20 border-t-mint animate-spin"></div>
            
            {/* Icône au centre */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg 
                className="w-12 h-12 text-mint animate-pulse" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Titre et message */}
        <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">
          🔧 Site en maintenance
        </h1>
        
        <p className="text-lg md:text-xl text-slate mb-6">
          Nous effectuons actuellement des améliorations sur notre site pour vous offrir une meilleure expérience.
        </p>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
          <p className="text-base text-slate mb-4">
            ⏰ <span className="font-semibold">Maintenance en cours...</span>
          </p>
          
          <p className="text-sm text-slate mb-6">
            Notre équipe travaille pour revenir très bientôt avec de nouvelles fonctionnalités et améliorations.
          </p>

          {/* Points animés */}
          <div className="flex justify-center gap-2 mb-6">
            <div className="w-3 h-3 bg-mint rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-mint rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-mint rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>

          <p className="text-sm text-slate/70">
            📧 Pour toute urgence : <a href="mailto:contact@louaab.ma" className="text-mint hover:underline font-medium">contact@louaab.ma</a>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-sm text-slate/60">
          <p>Merci de votre patience ❤️</p>
        </div>
      </div>
    </div>
  );
}
