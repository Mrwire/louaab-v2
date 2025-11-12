import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PageShell } from '@/components/page-shell';
import ToyCardWithReservation from '@/components/toy-card-with-reservation';
import ToyDetailClient from '@/components/toy-detail-client';
import { getToyBySlug, getAllToys, getToysByCategory } from '@/lib/toys-data';

export async function generateStaticParams() {
  const toys = await getAllToys();
  return toys.map((toy) => ({
    slug: toy.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const toy = await getToyBySlug(slug);
  
  if (!toy) {
    return {
      title: 'Jouet introuvable - LOUAAB',
    };
  }

  return {
    title: `${toy.name} - LOUAAB`,
    description: toy.description || `Louez ${toy.name} avec LOUAAB. ${toy.age} - ${toy.price}`,
    openGraph: {
      title: toy.name,
      description: toy.description || `Louez ${toy.name} avec LOUAAB`,
      images: [toy.image],
    },
  };
}

export default async function ToyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const toy = await getToyBySlug(slug);

  if (!toy) {
    notFound();
  }

  // Get related toys (same category)
  const relatedToys = toy.category 
    ? (await getToysByCategory(toy.category.split(',')[0].trim())).filter(t => t.id !== toy.id).slice(0, 3)
    : [];

  // Parse rating
  const getRatingStars = (rating: string) => {
    const match = rating?.match(/(\d+)/);
    const stars = match ? parseInt(match[1]) : 0;
    return { count: stars, display: '⭐'.repeat(stars) };
  };

  const rating = getRatingStars(toy.rating);

  return (
    <PageShell>
      {/* Breadcrumb */}
      <section className="border-b border-mist/60 bg-white py-4">
        <div className="mx-auto w-full max-w-6xl px-4">
          <nav className="flex items-center gap-2 text-sm text-slate">
            <Link href="/" className="hover:text-mint">Accueil</Link>
            <span>/</span>
            <Link href="/jouets" className="hover:text-mint">Jouets</Link>
            <span>/</span>
            <span className="text-charcoal">{toy.name}</span>
          </nav>
        </div>
      </section>

      {/* Main Product Section */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-gray-50">
              <Image
                src={toy.image}
                alt={toy.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              
              {!toy.hasImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/90">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-gray-600 font-semibold">Image à venir</p>
                  </div>
                </div>
              )}

              {/* Badges */}
              {toy.stock && parseInt(toy.stock.toString()) > 0 && (
                <div className="absolute top-4 left-4 rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                  ✓ Disponible
                </div>
              )}
            </div>

            {/* Video Link */}
            {toy.videoUrl && (
              <a
                href={toy.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 rounded-2xl border-2 border-red-500 bg-red-50 px-6 py-4 font-semibold text-red-600 transition hover:bg-red-100"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Voir la vidéo de démonstration
              </a>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-charcoal">
                {toy.name}
              </h1>
              
              {/* Rating */}
              {toy.rating && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-2xl">{rating.display}</span>
                  <span className="text-sm text-slate">
                    ({rating.count}/5)
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {toy.description && (
              <p className="text-lg text-gray-700 leading-relaxed">
                {toy.description}
              </p>
            )}

            {/* Price */}
            <div className="rounded-2xl bg-gradient-to-br from-mint/10 to-blue-50 p-6">
              <div className="text-sm font-semibold uppercase tracking-wide text-slate">
                Prix de location
              </div>
              <div className="mt-2 text-4xl font-bold text-mint">
                {toy.price || 'Sur demande'}
              </div>
              <p className="mt-2 text-sm text-slate">
                Par période de location
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Age */}
              <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate">
                  Âge recommandé
                </div>
                <div className="mt-2 font-bold text-charcoal">
                  {toy.age || 'Non spécifié'}
                </div>
              </div>

              {/* Stock */}
              <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate">
                  Disponibilité
                </div>
                <div className={`mt-2 font-bold ${
                  toy.stock && parseInt(toy.stock.toString()) > 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {toy.stock && parseInt(toy.stock.toString()) > 0 
                    ? 'En stock' 
                    : 'Rupture de stock'}
                </div>
              </div>

              {/* Category */}
              {toy.category && (
                <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:col-span-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate">
                    Catégories
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {toy.category.split(',').map((cat, idx) => (
                      <Link
                        key={idx}
                        href={`/categories/${encodeURIComponent(cat.trim().toLowerCase())}`}
                        className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 hover:bg-blue-200"
                      >
                        {cat.trim()}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Configuration et CTA */}
            <ToyDetailClient toy={toy} />
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedToys.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-charcoal">
              Jouets similaires
            </h2>
            <p className="mt-2 text-slate">
              D'autres jouets qui pourraient vous plaire
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedToys.map((relatedToy) => (
              <ToyCardWithReservation key={relatedToy.id} toy={relatedToy} />
            ))}
          </div>
        </section>
      )}

      {/* Back to catalog */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20">
        <Link
          href="/jouets"
          className="inline-flex items-center gap-2 text-mint hover:text-mint/80"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour au catalogue
        </Link>
      </section>
    </PageShell>
  );
}

