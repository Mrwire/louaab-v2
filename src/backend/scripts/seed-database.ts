import { DataSource } from 'typeorm';
import { AgeRange } from '../entities/age-range.entity';
import { ToyCategory } from '../entities/toy-category.entity';
import { Pack } from '../entities/pack.entity';
import { FAQ } from '../entities/faq.entity';

const defaultData = {
  ageRanges: [
    {
      label: "0-12 mois",
      slug: "0-12-mois",
      iconType: "emoji",
      icon: "👶",
      ageMin: 0,
      ageMax: 12,
      displayOrder: 0,
      isActive: true
    },
    {
      label: "12-24 mois",
      slug: "12-24-mois",
      iconType: "emoji",
      icon: "🍼",
      ageMin: 12,
      ageMax: 24,
      displayOrder: 1,
      isActive: true
    },
    {
      label: "2-3 ans",
      slug: "2-3-ans",
      iconType: "emoji",
      icon: "🧸",
      ageMin: 24,
      ageMax: 36,
      displayOrder: 2,
      isActive: true
    },
    {
      label: "3-5 ans",
      slug: "3-5-ans",
      iconType: "emoji",
      icon: "🎈",
      ageMin: 36,
      ageMax: 60,
      displayOrder: 3,
      isActive: true
    },
    {
      label: "5-8 ans",
      slug: "5-8-ans",
      iconType: "emoji",
      icon: "🎮",
      ageMin: 60,
      ageMax: 96,
      displayOrder: 4,
      isActive: true
    },
    {
      label: "8+ ans",
      slug: "8-ans",
      iconType: "emoji",
      icon: "🎯",
      ageMin: 96,
      ageMax: null,
      displayOrder: 5,
      isActive: true
    }
  ],
  categories: [
    {
      name: "Jeux éducatifs",
      slug: "jeux-educatifs",
      iconType: "emoji",
      icon: "🧠",
      description: "Jouets éducatifs et Montessori",
      displayOrder: 0,
      isActive: true
    },
    {
      name: "Jeux de société",
      slug: "jeux-de-societe",
      iconType: "emoji",
      icon: "🎲",
      description: "Jeux de société pour petits et grands",
      displayOrder: 1,
      isActive: true
    },
    {
      name: "Jeux d'adresse",
      slug: "jeux-adresse",
      iconType: "emoji",
      icon: "🎯",
      description: "Jeux nécessitant adresse et précision",
      displayOrder: 2,
      isActive: true
    },
    {
      name: "Véhicules",
      slug: "vehicules",
      iconType: "emoji",
      icon: "🚗",
      description: "Voitures, motos, avions et autres véhicules",
      displayOrder: 3,
      isActive: true
    },
    {
      name: "Jeux créatifs",
      slug: "jeux-creatifs",
      iconType: "emoji",
      icon: "🎨",
      description: "Activités créatives et artistiques",
      displayOrder: 4,
      isActive: true
    },
    {
      name: "Arcade",
      slug: "arcade",
      iconType: "emoji",
      icon: "🕹️",
      description: "Jeux d'arcade électroniques",
      displayOrder: 5,
      isActive: true
    },
    {
      name: "Jeux de tirs",
      slug: "jeux-tirs",
      iconType: "emoji",
      icon: "🔫",
      description: "Jeux de tir et de combat",
      displayOrder: 6,
      isActive: true
    },
    {
      name: "Compétition",
      slug: "competition",
      iconType: "emoji",
      icon: "🏆",
      description: "Jeux de compétition et de défi",
      displayOrder: 7,
      isActive: true
    }
  ],
  packs: [
    {
      name: "Pack Mini",
      slug: "pack-mini",
      type: "mini",
      description: "Parfait pour commencer",
      price: 199.0,
      toyCount: 2,
      durationDays: 30,
      features: JSON.stringify(["2 jouets", "Échanges illimités", "Livraison gratuite"]),
      icon: "📦",
      displayOrder: 0,
      isActive: true
    },
    {
      name: "Pack Maxi",
      slug: "pack-maxi",
      type: "maxi",
      description: "Le plus populaire",
      price: 299.0,
      toyCount: 4,
      durationDays: 30,
      features: JSON.stringify(["4 jouets", "Échanges illimités", "Livraison gratuite", "Support prioritaire"]),
      icon: "🎁",
      displayOrder: 1,
      isActive: true
    },
    {
      name: "Pack Mega",
      slug: "pack-mega",
      type: "mega",
      description: "Maximum de choix",
      price: 399.0,
      toyCount: 6,
      durationDays: 30,
      features: JSON.stringify(["6 jouets", "Échanges illimités", "Livraison gratuite", "Support prioritaire", "Jouets premium"]),
      icon: "🌟",
      displayOrder: 2,
      isActive: true
    }
  ],
  faqs: [
    {
      category: "À propos de LOUAAB",
      icon: "🎈",
      question: "Qu'est-ce qu'une entreprise de location de jouets ?",
      answer: "LOUAAB est le premier service marocain de location de jouets et jeux de société. Nous proposons des centaines de jouets adaptés aux enfants, adolescents et adultes. Vous choisissez, on livre, vous jouez, et quand vous en avez assez, on vient échanger ! C'est simple, économique et écologique.",
      displayOrder: 0,
      isActive: true
    },
    {
      category: "À propos de LOUAAB",
      icon: "🎈",
      question: "Pourquoi louer plutôt qu'acheter ?",
      answer: "Louer coûte beaucoup moins cher que d'acheter constamment de nouveaux jouets. De plus, les enfants se lassent vite : avec LOUAAB, ils découvrent toujours de nouveaux jeux sans encombrer la maison. C'est aussi un geste pour la planète en participant à l'économie circulaire.",
      displayOrder: 1,
      isActive: true
    },
    {
      category: "Fonctionnement",
      icon: "⚙️",
      question: "Comment fonctionne la location ?",
      answer: "C'est très simple ! Vous choisissez un pack mensuel (Mini, Maxi ou Mega) adapté à vos besoins. Nous livrons les jouets chez vous gratuitement (à Casa et Rabat à partir de 300 MAD). Vous gardez les jouets aussi longtemps que vous voulez, puis demandez un échange quand vos enfants veulent de la nouveauté.",
      displayOrder: 0,
      isActive: true
    },
    {
      category: "Fonctionnement",
      icon: "⚙️",
      question: "Y a-t-il un engagement minimum ?",
      answer: "Non ! LOUAAB fonctionne sans engagement. Vous pouvez mettre en pause ou annuler votre abonnement à tout moment. Notre objectif est votre satisfaction, pas de vous enfermer dans un contrat.",
      displayOrder: 1,
      isActive: true
    },
    {
      category: "Fonctionnement",
      icon: "⚙️",
      question: "À quelle fréquence puis-je échanger mes jouets ?",
      answer: "Vous pouvez échanger vos jouets autant de fois que vous le souhaitez ! Il n'y a pas de limite mensuelle. Dès que vos enfants s'en lassent, demandez un échange via le site ou WhatsApp.",
      displayOrder: 2,
      isActive: true
    }
  ]
};

export async function seedDatabase(dataSource: DataSource) {
  const ageRangeRepository = dataSource.getRepository(AgeRange);
  const categoryRepository = dataSource.getRepository(ToyCategory);
  const packRepository = dataSource.getRepository(Pack);
  const faqRepository = dataSource.getRepository(FAQ);

  // Seed Age Ranges
  console.log('Seeding age ranges...');
  for (const ageRangeData of defaultData.ageRanges) {
    const existing = await ageRangeRepository.findOne({ where: { slug: ageRangeData.slug } });
    if (!existing) {
      const ageRange = ageRangeRepository.create(ageRangeData);
      await ageRangeRepository.save(ageRange);
      console.log(`Created age range: ${ageRangeData.label}`);
    } else {
      console.log(`Age range already exists: ${ageRangeData.label}`);
    }
  }

  // Seed Categories
  console.log('Seeding categories...');
  for (const categoryData of defaultData.categories) {
    const existing = await categoryRepository.findOne({ where: { slug: categoryData.slug } });
    if (!existing) {
      const category = categoryRepository.create(categoryData);
      await categoryRepository.save(category);
      console.log(`Created category: ${categoryData.name}`);
    } else {
      console.log(`Category already exists: ${categoryData.name}`);
    }
  }

  // Seed Packs
  console.log('Seeding packs...');
  for (const packData of defaultData.packs) {
    const existing = await packRepository.findOne({ where: { slug: packData.slug } });
    if (!existing) {
      const pack = packRepository.create(packData);
      await packRepository.save(pack);
      console.log(`Created pack: ${packData.name}`);
    } else {
      console.log(`Pack already exists: ${packData.name}`);
    }
  }

  // Seed FAQs
  console.log('Seeding FAQs...');
  for (const faqData of defaultData.faqs) {
    const existing = await faqRepository.findOne({ where: { question: faqData.question } });
    if (!existing) {
      const faq = faqRepository.create(faqData);
      await faqRepository.save(faq);
      console.log(`Created FAQ: ${faqData.question}`);
    } else {
      console.log(`FAQ already exists: ${faqData.question}`);
    }
  }

  console.log('Database seeding completed!');
}
