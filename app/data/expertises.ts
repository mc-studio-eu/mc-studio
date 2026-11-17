export const expertises = [
  {
    slug: 'applications-metier',
    number: '01',
    title: 'Applications métier',
    headline: 'Un logiciel qui suit votre métier. Et le fait avancer.',
    intro:
      'Quand les tableurs, les doubles saisies et les outils déconnectés ralentissent votre équipe, nous concevons une application autour de vos opérations.',
    audience:
      'Pour les entreprises qui veulent structurer leurs opérations sans imposer un outil inadapté à leurs équipes.',
    uses: [
      [
        'CRM et suivi commercial',
        'Réunir dossiers, rendez-vous et historique dans un espace commun, avec les accès utiles à chaque rôle.',
      ],
      [
        'Portails clients et partenaires',
        'Donner à chacun un point d’entrée pour ses documents, demandes et prochaines étapes.',
      ],
      [
        'Gestion et tableaux de bord',
        'Relier vos données, suivre vos opérations et remplacer les consolidations manuelles.',
      ],
    ],
    approach:
      'Nous partons du travail réel : qui fait quoi, quelles informations circulent et où les erreurs apparaissent. Le premier périmètre se concentre sur les opérations qui comptent, puis évolue avec les retours de vos équipes.',
    delivery: [
      'Cartographie des flux et des droits',
      'Prototype des parcours prioritaires',
      'Application et intégrations à vos outils',
      'Tests, documentation et prise en main',
    ],
    proof: 'CRM R&A Energy',
    proofSlug: 'crm-ra-energy',
    image: '/img/studio/crm-ra-1280.webp',
    proofText:
      'Un CRM qui relie les dossiers commerciaux au planning et vérifie la disponibilité des commerciaux ainsi que les temps de trajet.',
  },
  {
    slug: 'saas',
    number: '02',
    title: 'SaaS & produits digitaux',
    headline: 'De la première hypothèse au produit que l’on utilise.',
    intro:
      'Transformer une idée en produit demande de choisir. Nous vous aidons à définir le bon périmètre, à dessiner les parcours et à construire une première version exploitable.',
    audience:
      'Pour les fondateurs qui lancent un MVP et les entreprises qui développent une nouvelle plateforme.',
    uses: [
      [
        'MVP et premières versions',
        'Tester votre proposition avec un produit centré sur un usage précis, plutôt qu’une liste de fonctionnalités.',
      ],
      [
        'Plateformes et marketplaces',
        'Organiser les comptes, les échanges et les transactions entre plusieurs types d’utilisateurs.',
      ],
      [
        'Évolution d’un SaaS',
        'Faire progresser les parcours, les intégrations et l’architecture à partir des besoins observés.',
      ],
    ],
    approach:
      'Nous cadrons l’usage principal avant le développement. Les parcours sont prototypés, les arbitrages explicités et les fonctionnalités livrées par étapes pour vous permettre de tester tôt.',
    delivery: [
      'Cadrage produit et périmètre du MVP',
      'Design des parcours et de l’interface',
      'Développement, comptes et intégrations',
      'Mise en ligne et plan d’itération',
    ],
    proof: 'Maison AWL',
    proofSlug: 'maison-awl',
    image: '/img/studio/maison-awl-1280.webp',
    proofText:
      'Une marketplace qui réunit recherche de prestataires, messagerie, propositions, paiement et suivi des missions.',
  },
  {
    slug: 'intelligence-artificielle',
    number: '03',
    title: 'Applications & automatisations IA',
    headline: 'De l’IA utile, à l’endroit où votre équipe en a besoin.',
    intro:
      'Nous intégrons l’IA à un processus concret : exploiter des documents, préparer un brouillon, retrouver une information ou assister une décision. Avec des limites et une validation humaine explicites.',
    audience:
      'Pour les entreprises qui veulent expérimenter un usage de l’IA et les fondateurs qui l’intègrent à leur produit.',
    uses: [
      [
        'Assistants et intégrations LLM',
        'Construire une interaction adaptée à votre contexte, à vos sources et aux actions autorisées.',
      ],
      [
        'Documents et connaissances',
        'Extraire, classer ou retrouver l’information, avec un contrôle adapté aux erreurs possibles.',
      ],
      [
        'Automatisation des flux',
        'Connecter vos outils, préparer les tâches répétitives et conserver une validation sur les actions sensibles.',
      ],
    ],
    approach:
      'Nous commençons par un cas d’usage limité et des exemples représentatifs. Nous évaluons la qualité des réponses, les coûts et les erreurs avant d’étendre l’intégration. Les données partagées et le rôle de l’humain sont définis dès le cadrage.',
    delivery: [
      'Choix du cas d’usage et des critères d’évaluation',
      'Prototype et essais sur des exemples représentatifs',
      'Intégration à votre application ou vos outils',
      'Gestion des erreurs, suivi des coûts et documentation',
    ],
    proof: 'Personal — produit du studio',
    proofSlug: 'personal',
    image: '/img/studio/personal-1280.webp',
    proofText:
      'Notre propre produit IA accompagne les créateurs dans la préparation de contenus qui respectent leur voix. Les brouillons restent sous leur contrôle.',
  },
] as const
