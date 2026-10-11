import type {
  SkincareAnswers,
  MealAnswers,
  HaircareAnswers,
  RoutineContent,
  RoutineEvaluation,
  MealPlanItem,
  StyleAdvice,
  OverthinkingResult,
  CheckInAnalysis,
  CBTExercise,
} from '@/lib/types';

// ============================================================
// SKINCARE ROUTINE GENERATOR
// ============================================================
export function generateSkincareRoutine(answers: SkincareAnswers): RoutineContent {
  const steps: RoutineContent['steps'] = [];
  const tips: string[] = [];
  const isAM = true;

  // Diagnosis
  const concernText = answers.concerns
    .map((c) => c.toLowerCase())
    .join(' et ');
  // Skin-tone detection (accent-insensitive) — used for SPF + tone-specific tips.
  const skinToneNorm = (answers.skinTone || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const isDarkTone = /foncee|noire|noir|deep|dark/.test(skinToneNorm);
  const isMediumTone = /matte|metisse|medium|melange/.test(skinToneNorm);
  const isLightTone = /claire|clair|light|pale/.test(skinToneNorm);

  const skinToneText = answers.skinTone
    ? ` Peau au teint ${answers.skinTone.toLowerCase()}.`
    : '';
  const diagnosis = `Profil : Peau ${answers.skinType.toLowerCase()}${
    concernText ? ` avec préoccupations sur ${concernText}` : ''
  }.${skinToneText} ${answers.ageRange === 'adolescent' ? 'Peau jeune en pleine transformation hormonale.' : ''} Climat ${answers.climate.toLowerCase()}.`;

  // Step 1: Cleanser
  let cleanser = 'Gel nettoyant doux sans savon';
  if (answers.skinType === 'grasse' || answers.concerns.includes('Imperfections / Acne / Points noirs')) {
    cleanser = 'Gel nettoyant purifiant au salicylique (BHA 2%)';
  } else if (answers.skinType === 'seche') {
    cleanser = 'Lait démaquillant hydratant ou huile nettoyante';
  } else if (answers.skinType === 'sensible / reactive') {
    cleanser = 'Gel sans parfum, sans alcool, pH neutre';
  } else if (answers.skinType === 'mixte') {
    cleanser = 'Gel équilibrant zone T sans dessécher les joues';
  }
  steps.push({
    name: 'Nettoyage',
    product: cleanser,
    description: 'Masser 30 secondes sur peau humide, rincer à l eau tiède (jamais chaude !).',
    timing: 'Matin & soir',
  });

  // Step 2: Toner / Treatment (for standard+)
  if (answers.commitmentLevel !== 'minimaliste') {
    let toner = 'Lotion hydratante sans alcool';
    if (answers.concerns.includes('Imperfections / Acne / Points noirs')) {
      toner = 'Lotion au BHA ou niacinamide 5% pour resserrer les pores';
    } else if (answers.concerns.includes('Teint terne / Taches pigmentaires')) {
      toner = 'Sérum vitamine C pour raviver le teint';
    } else if (answers.concerns.includes('Rougeurs / Couperose / Rosacee')) {
      toner = 'Brume apaisante à l avoine colloïdale ou eau thermale';
    }
    steps.push({
      name: 'Traitement / Sérum',
      product: toner,
      description: 'Appliquer sur peau propre en tapotements légers. Laisser pénétrer 1 minute.',
      timing: 'Matin (vitamine C) / Soir (BHA ou niacinamide)',
    });
  }

  // Step 3: Moisturizer
  let moisturizer = 'Crème hydratante légère gel-crème';
  if (answers.skinType === 'seche' || answers.concerns.includes('Deshydratation / Tiraillments')) {
    moisturizer = 'Crème riche à l acide hyaluronique + céramides';
  } else if (answers.skinType === 'grasse') {
    moisturizer = 'Fluide matifiant non-comédogène oil-free';
  } else if (answers.skinType === 'sensible / reactive') {
    moisturizer = 'Crème apaisante sans parfum avec céramides';
  }
  steps.push({
    name: 'Hydratation',
    product: moisturizer,
    description: 'Une noisette sur l ensemble du visage et du cou.',
    timing: 'Matin & soir',
  });

  // Step 4: Sunscreen (AM)
  let spf = 'Crème solaire SPF 50 non-comédogène';
  if (answers.skinType === 'mixte' || answers.skinType === 'grasse') {
    spf = 'Fluide solaire SPF 50 matifiant invisible';
  } else if (answers.skinType === 'sensible / reactive') {
    spf = 'SPF 50 minéral sans parfum pour peaux réactives';
  }
  // Skin-tone-aware SPF: les filtres minéraux laissent un voile blanc sur les
  // peaux foncées — on privilégie un solaire chimique invisible. Pour les peaux
  // claires, le minéral est parfaitement adapté (choix par défaut conservé).
  if (isDarkTone) {
    spf = 'Solaire chimique SPF 50 invisible (sans trace blanche, non-comédogène) — évite le minéral qui laisse un voile blanc';
  }
  steps.push({
    name: 'Protection solaire',
    product: spf,
    description: 'Indispensable tous les jours, même en hiver ! Renouveler toutes les 2h si exposition.',
    timing: 'Matin uniquement',
  });

  // Step 5: Night treatment (for expert)
  if (answers.commitmentLevel === 'expert') {
    let nightTreatment = 'Sérum rétinol 0.3% (2-3x/semaine)';
    if (answers.skinType === 'sensible / reactive') {
      nightTreatment = 'Sérum bakuchiol (alternative douce au rétinol)';
    } else if (answers.concerns.includes('Premieres rides / Perte de fermete')) {
      nightTreatment = 'Sérum rétinol 0.5% + peptide (progressif)';
    }
    steps.push({
      name: 'Traitement nuit',
      product: nightTreatment,
      description: 'Commencer 2x/semaine, augmenter progressivement. Toujours sur peau sèche le soir.',
      timing: 'Soir uniquement',
    });
  }

  // Tips based on profile
  if (answers.sensitivity.includes('Parfums')) {
    tips.push('Évite les produits parfumés — privilégie les formulations sans parfum.');
  }
  if (answers.sensitivity.includes('Huiles essentielles')) {
    tips.push('Les huiles essentielles sont à éviter pour ta peau sensible.');
  }
  if (answers.sunExposure === 'Forte exposition au soleil') {
    tips.push('Tu es très exposée au soleil : SPF 50 obligatoire + chapeau/casquette !');
  }
  if (answers.screenTime === 'Plus de 6h/jour') {
    tips.push('La lumière bleue des écrans peut accentuer le teint terne — pense à la vitamine C le matin.');
  }
  if (answers.budget === 'Petit budget (< 10 €)') {
    tips.push('Astuces budget : les marques de pharmacie génériques sont excellentes et abordables !');
  }
  if (answers.formulaPreference === 'Produits 100% naturels/bio') {
    tips.push('Pour le bio, regarde les labels Cosmébio et Ecocert pour des garanties.');
  }
  if (answers.ageRange === 'adolescent') {
    tips.push('À ton âge, la peau change beaucoup à cause des hormones : la régularité est plus importante que le nombre de produits !');
  }
  // Skin-tone-specific tips
  if (isDarkTone) {
    tips.push('Peau foncée : risque accru d’hyperpigmentation. Intègre la vitamine C et la niacinamide pour unifier le teint et atténuer les taches.');
    tips.push('Les marques d’acné mettent plus de temps à s’estomper sur les peaux foncées : sois patiente et évite de percer les boutons.');
    tips.push('Le SPF reste indispensable tous les jours, même sur peau foncée — le soleil accentue les taches pigmentaires (PIH).');
  } else if (isMediumTone) {
    tips.push('Peau mate / métisse : le teint peut devenir inégal avec le temps. La vitamine C aide à unifier.');
    tips.push('Le SPF est essentiel pour prévenir l’apparition de taches sombres et garder un teint homogène.');
  } else if (isLightTone) {
    tips.push('Peau claire : plus sensible aux UV, le SPF 50 est incontournable toute l’année.');
    tips.push('Les rougeurs sont très visibles sur peau claire : privilégie des produits apaisants (avoine colloïdale, eau thermale).');
  }
  tips.push('Bois au moins 1,5L d eau par jour — l hydratation commence de l intérieur !');
  tips.push('Change ta taie d oreiller toutes les semaines pour éviter les imperfections.');

  return { diagnosis, steps, tips };
}

// ============================================================
// MEAL PLAN GENERATOR
// ============================================================
export function generateMealPlan(answers: MealAnswers): RoutineContent {
  const meals: RoutineContent['meals'] = [];

  const isVeg = answers.diet === 'vegetarien' || answers.diet === 'vegetalien/vegane';
  const isVegan = answers.diet === 'vegetalien/vegane';
  const isPesco = answers.diet === 'pesco-vegetarien';

  const loved = answers.lovedIngredients.map((i) => i.toLowerCase());
  const hated = answers.hatedIngredients.map((i) => i.toLowerCase());

  const has = (ing: string) => loved.some((l) => l.includes(ing.toLowerCase()) || ing.toLowerCase().includes(l));
  const banned = (ing: string) => hated.some((h) => h.includes(ing.toLowerCase()) || ing.toLowerCase().includes(h));

  // Filter function: remove banned ingredients from a list
  const safe = (ings: string[]) => ings.filter((i) => !banned(i));

  // Breakfast
  let breakfastName = 'Smoothie bowl énergie';
  let breakfastIngs = safe(['Banane', 'Flocons d avoine', 'Lait d amande', 'Beurre de cacahuète', 'Fruits rouges', 'Graines de chia']);
  let breakfastSteps = ['Mixer la banane avec le lait d amande', 'Verser dans un bol', 'Topping: flocons, fruits rouges, chia'];
  if (has('oeuf') && !isVegan) {
    breakfastName = 'Pancakes protéinés';
    breakfastIngs = safe(['Œufs', 'Flocons d avoine', 'Banane écrasée', 'Sirop d érable', 'Myrtilles']);
    breakfastSteps = ['Mixer œufs, flocons et banane', 'Cuire à la poêle 2 min de chaque côté', 'Servir avec sirop et myrtilles'];
  }
  if (answers.allergies.includes('Gluten')) {
    breakfastIngs = breakfastIngs.filter((i) => !i.includes('avoine'));
    breakfastIngs.push('Farine de riz');
  }
  meals.push({
    meal: 'Petit-déjeuner',
    name: breakfastName,
    ingredients: breakfastIngs,
    steps: breakfastSteps,
    benefits: 'Énergie durable grâce aux fibres et aux bons gras. Parfait pour démarrer la journée !',
  });

  // Lunch
  let lunchName = 'Buddha bowl coloré';
  let lunchIngs = safe(['Quinoa', 'Avocat', 'Pois chiches', 'Tomates cerises', 'Concombre', 'Citron', 'Huile d olive']);
  let lunchSteps = ['Cuire le quinoa 15 min', 'R assembler dans un bol : quinoa, légumes, avocat', 'Assaisonner : huile d olive + citron'];
  if (has('tofu')) {
    lunchName = 'Bowl tofu teriyaki';
    lunchIngs = safe(['Tofu ferme', 'Riz', 'Brocoli', 'Carottes', 'Sauce soja', 'Sésame']);
    lunchSteps = ['Faire dorer le tofu à la poêle', 'Cuire le riz', 'Sauter les légumes', 'Napper de sauce soja'];
  } else if (has('poulet') && !isVeg && !isVegan) {
    lunchName = 'Poke bowl poulet';
    lunchIngs = safe(['Poulet grillé', 'Riz', 'Avocat', 'Edamame', 'Mangue', 'Sauce sésame']);
    lunchSteps = ['Griller le poulet', 'Cuire le riz', 'Disposer tous les ingrédients en bols', 'Arroser de sauce'];
  } else if (isPesco) {
    lunchName = 'Bowl saumon avocat';
    lunchIngs = safe(['Saumon', 'Riz', 'Avocat', 'Concombre', 'Citron', 'Graines de sésame']);
    lunchSteps = ['Cuire le saumon à la poêle', 'Cuire le riz', 'Trancher l avocat et le concombre', 'Assembler et citronner'];
  }
  meals.push({
    meal: 'Déjeuner',
    name: lunchName,
    ingredients: lunchIngs,
    steps: lunchSteps,
    benefits: 'Protéines + fibres + bons gras = satiété longue durée et concentration optimale.',
  });

  // Snack
  let snackName = 'Energy balls coco-chocolat';
  let snackIngs = safe(['Dattes', 'Amandes', 'Cacao', 'Noix de coco râpée', 'Beurre d amande']);
  let snackSteps = ['Mixer les dattes et amandes', 'Ajouter le cacao', 'Former des boules', 'Rouler dans la noix de coco'];
  if (answers.goal === 'Prise de masse musculaire / Enrichi en proteines' && !isVegan) {
    snackName = 'Yogourt protéiné aux fruits';
    snackIngs = safe(['Yaourt grec', 'Miel', 'Amandes', 'Fruits rouges', 'Granola']);
    snackSteps = ['Mettre le yaourt dans un bol', 'Ajouter fruits et amandes', 'Filet de miel'];
  }
  meals.push({
    meal: 'Collation',
    name: snackName,
    ingredients: snackIngs,
    steps: snackSteps,
    benefits: 'Coup de pouce énergétique sans sucre raffiné. Idéal avant le sport ou le devoir !',
  });

  // Dinner
  let dinnerName = 'Pâtes de légumes au pesto';
  let dinnerIngs = safe(['Courgettes', 'Carottes', 'Pesto', 'Tomates cerises', 'Pignons de pin', 'Parmesan']);
  let dinnerSteps = ['Spiraliser courgettes et carottes', 'Faire revenir 3 min', 'Mélanger au pesto', 'Parsemer de pignons et parmesan'];
  if (has('riz') && has('soja')) {
    dinnerName = 'Riz sauté aux légumes';
    dinnerIngs = safe(['Riz', 'Carottes', 'Petits pois', 'Oignon', 'Œuf', 'Sauce soja', 'Huile de sésame']);
    dinnerSteps = ['Cuire le riz la veille', 'Sauter oignon et légumes', 'Ajouter le riz et l œuf', 'Déglacer avec la sauce soja'];
  } else if (has('pates')) {
    dinnerName = 'Pâtes complètes tomate-basilic';
    dinnerIngs = safe(['Pâtes complètes', 'Tomates', 'Basilic', 'Ail', 'Huile d olive', 'Parmesan']);
    dinnerSteps = ['Cuire les pâtes', 'Faire revenir l ail', 'Ajouter les tomates concassées', 'Mélanger, parsemer de basilic'];
  }
  if (answers.goal === 'Perte de poids / Gestion de la satiete') {
    dinnerIngs.push('Légumes supplémentaires pour le volume');
  }
  meals.push({
    meal: 'Dîner',
    name: dinnerName,
    ingredients: dinnerIngs,
    steps: dinnerSteps,
    benefits: 'Repas léger mais rassasiant, riche en fibres pour une bonne nuit.',
  });

  const tips: string[] = [];
  if (answers.prepTime === 'Express (< 15 min)') {
    tips.push('Astuces express : prépare le quinoa ou le riz en avance pour 3 jours !');
  }
  if (answers.equipment.includes('Air Fryer')) {
    tips.push('Ton Air Fryer est parfait pour cuire tofu et légumes croustillants sans huile !');
  }
  if (answers.allergies.length > 0) {
    tips.push(`Attention aux allergies : ${answers.allergies.join(', ')}. Vérifie toujours les étiquettes !`);
  }
  if (answers.goal === 'Prise de masse musculaire / Enrichi en proteines') {
    tips.push('Vise 1.5g de protéines par kg de poids : ajoute des sources protéiques à chaque repas.');
  }
  if (answers.servings === 'famille') {
    tips.push('Multiplie les quantités par 4 et implique toute la famille dans la préparation !');
  }
  tips.push('Hydrate-toi tout au long de la journée : une bouteille d eau toujours à portée !');

  return { diagnosis: `Plan repas personnalisé — ${answers.diet}, ${answers.cuisineStyle}, ${answers.prepTime}.`, meals, tips };
}

// ============================================================
// HAIRCARE ROUTINE GENERATOR
// ============================================================
export function generateHaircareRoutine(answers: HaircareAnswers): RoutineContent {
  const steps: RoutineContent['steps'] = [];
  const tips: string[] = [];

  // Diagnosis
  const diagnosis = `Profil : ${answers.hairType} (${answers.hairThickness}), porosité ${answers.porosity.toLowerCase()}. Cuir chevelu ${answers.scalpCondition.toLowerCase()}. Objectif : ${answers.mainGoal.toLowerCase()}.`;

  // Wash Day
  let shampoo = 'Shampoing sans sulfates hydratant';
  if (answers.scalpCondition === 'gras') {
    shampoo = 'Shampoing clarifiant (1x/semaine) + shampoing doux sans sulfates (autres lavages)';
  } else if (answers.scalpCondition === 'sujet aux pellicules') {
    shampoo = 'Shampoing traitant antipelliculaire (1-2x/semaine) + shampoing doux le reste du temps';
  } else if (answers.porosity === 'Faible porosite') {
    shampoo = 'Shampoing sans sulfates clarifiant (pour ouvrir les écailles)';
  } else if (answers.porosity === 'Forte porosite') {
    shampoo = 'Shampoing ultra-hydratant sans sulfates, riche en protéines';
  }
  steps.push({
    name: 'Lavage (Wash Day)',
    product: shampoo,
    description: 'Masser le cuir chevelu, pas les longueurs ! 2 shampoings si le cuir chevelu est gras.',
    timing: '1-2x par semaine',
  });

  // Conditioner
  let conditioner = 'Après-shampoing hydratant';
  if (answers.porosity === 'Forte porosite') {
    conditioner = 'Après-shampoing protéiné + masque hydratant profond (1x/semaine)';
  } else if (answers.porosity === 'Faible porosite') {
    conditioner = 'Après-shampoing léger sans huiles lourdes';
  } else if (answers.hairType.includes('Type 4')) {
    conditioner = 'Masque nourrissant riche (beurre de karité, mangue) en_deep conditioning';
  }
  steps.push({
    name: 'Soin conditionneur',
    product: conditioner,
    description: 'Appliquer sur longueurs et pointes. Démêler aux doigts ou au peigne à dents larges sous l eau.',
    timing: 'À chaque lavage',
  });

  // Styling
  if (answers.routinePreference !== 'Routine minimaliste') {
    let styling = 'Leave-in hydratant + gelée coiffante';
    if (answers.hairType.includes('Type 3') || answers.hairType.includes('Type 4')) {
      styling = 'Crème de boucles + gelée coiffante (méthode du scrunch)';
    } else if (answers.hairType.includes('Type 2')) {
      styling = 'Spray hydratant léger + mousse texturisante';
    } else {
      styling = 'Sérum léger sur pointes + spray thermoprotecteur';
    }
    steps.push({
      name: 'Coiffage (Styling)',
      product: styling,
      description: 'Sur cheveux essorés à la serviette en microfibre. Technique du scrunch (presser les cheveux vers le haut) pour définir les boucles.',
      timing: 'Après chaque lavage',
    });
  }

  // Drying
  let drying = 'Séchage à l air libre';
  if (answers.stylingHabits.includes('Seche-cheveux regulier')) {
    drying = 'Diffuseur à basse température (pas de sèche-cheveux direct sur boucles !)';
  }
  steps.push({
    name: 'Séchage',
    product: drying,
    description: 'Éviter de toucher les cheveux pendant le séchage pour ne pas casser la formation des boucles.',
    timing: 'Après chaque lavage',
  });

  // Deep care (weekly)
  let deepCare = '';
  if (answers.porosity === 'Forte porosite') {
    deepCare = 'Bain d huile hebdomadaire : huile de ricin ou d avocat (pénétration profonde pour sceller l hydratation). Laisser poser 1h+ avant le lavage.';
  } else if (answers.porosity === 'Faible porosite') {
    deepCare = 'Bain d huile léger : huile de jojoba ou d amande douce. Utiliser de la chaleur (bonnet chauffant) pour ouvrir les écailles et faire pénétrer.';
  } else {
    deepCare = 'Masque hydratant hebdomadaire (1x/semaine) : au choix, masque du commerce ou recette maison (miel + avocat + huile de coco).';
  }

  // Tips
  if (answers.chemicalTreatments.includes('decolores') || answers.chemicalTreatments.includes('lisses chimiquement') || answers.chemicalTreatments.includes('defrises')) {
    tips.push('Tes cheveux sont chimiquement traités : alterne soins protéinés et soins hydratants pour réparer la casse.');
  }
  if (answers.stylingHabits.includes('Lisseur / fer a boucler regulier')) {
    tips.push('Toujours appliquer un thermoprotecteur avant la chaleur ! Réduis la fréquence du lisseur si possible.');
  }
  if (answers.hairType.includes('Type 4')) {
    tips.push('Cheveux crépus : dorme avec une taie en soie ou un bonnet satiné pour éviter le frottement et les frisottis.');
  }
  if (answers.mainGoal === 'Stimuler la pousse') {
    tips.push('Massage du cuir chevelu 5 min/jour pour stimuler la circulation. Les huiles de romarin et de ricin sont tes meilleures amies !');
  }
  if (answers.scalpCondition === 'irrite / demangeaisons') {
    tips.push('Cuir chevelu irrité : évite l eau très chaude et les produits parfumés. L aloe vera pur apaise le cuir chevelu.');
  }
  tips.push('Espacer les lavages permet au sébum naturel de nourrir tes longueurs — patience et régularité !');

  return { diagnosis, steps, deepCare, tips };
}

// ============================================================
// WEEKLY MEAL PLAN GENERATOR
// ============================================================
type MealLevel = 'vegan' | 'vegetarian' | 'pesco' | 'omnivore';

interface MealOption {
  name: string;
  ingredients: string[];
  steps: string[];
  benefits: string;
  level: MealLevel;
}

const BREAKFAST_OPTIONS: MealOption[] = [
  {
    name: 'Smoothie bowl énergie',
    ingredients: ['Banane', 'Flocons d avoine', 'Lait d amande', 'Beurre de cacahuète', 'Fruits rouges', 'Graines de chia'],
    steps: ['Mixer la banane avec le lait d amande', 'Verser dans un bol', 'Topping: flocons, fruits rouges, chia'],
    benefits: 'Énergie durable grâce aux fibres et aux bons gras. Parfait pour démarrer la journée !',
    level: 'vegan',
  },
  {
    name: 'Pancakes protéinés',
    ingredients: ['Œufs', 'Flocons d avoine', 'Banane écrasée', 'Sirop d érable', 'Myrtilles'],
    steps: ['Mixer œufs, flocons et banane', 'Cuire à la poêle 2 min de chaque côté', 'Servir avec sirop et myrtilles'],
    benefits: 'Protéines et énergie longue durée pour un petit-déjeuner gourmand.',
    level: 'vegetarian',
  },
  {
    name: 'Porridge aux fruits rouges',
    ingredients: ['Flocons d avoine', 'Lait végétal', 'Fruits rouges', 'Sirop d érable', 'Graines de lin'],
    steps: ['Cuire les flocons dans le lait végétal 5 min', 'Verser dans un bol', 'Topping: fruits rouges, sirop, graines de lin'],
    benefits: 'Réconfortant et riche en fibres, idéal par temps frais.',
    level: 'vegan',
  },
  {
    name: 'Avocado toast tomate',
    ingredients: ['Pain complet', 'Avocat', 'Tomate', 'Citron', 'Graines de tournesol', 'Sel, poivre'],
    steps: ['Toaster le pain', 'Écraser l avocat avec le citron', 'Disposer les tranches de tomate', 'Parsemer de graines'],
    benefits: 'Bons gras et fibres pour un petit-déjeuner salé nourrissant.',
    level: 'vegan',
  },
  {
    name: 'Omelette aux épinards',
    ingredients: ['Œufs', 'Épinards frais', 'Feta', 'Tomates cerises', 'Huile d olive'],
    steps: ['Battre les œufs', 'Faire revenir les épinards', 'Verser les œufs', 'Ajouter feta et tomates, plier'],
    benefits: 'Riche en protéines et en fer pour soutenir l énergie du matin.',
    level: 'vegetarian',
  },
  {
    name: 'Granola maison et lait végétal',
    ingredients: ['Granola maison', 'Lait d avoine', 'Banane', 'Noisettes', 'Miel'],
    steps: ['Verser le granola dans un bol', 'Ajouter le lait végétal', 'Topping: banane et noisettes'],
    benefits: 'Croustillant et énergétique, parfait pour les matins pressés.',
    level: 'vegan',
  },
];

const LUNCH_OPTIONS: MealOption[] = [
  {
    name: 'Buddha bowl coloré',
    ingredients: ['Quinoa', 'Avocat', 'Pois chiches', 'Tomates cerises', 'Concombre', 'Citron', 'Huile d olive'],
    steps: ['Cuire le quinoa 15 min', 'R assembler dans un bol: quinoa, légumes, avocat', 'Assaisonner: huile d olive + citron'],
    benefits: 'Protéines + fibres + bons gras = satiété longue durée et concentration optimale.',
    level: 'vegan',
  },
  {
    name: 'Bowl tofu teriyaki',
    ingredients: ['Tofu ferme', 'Riz', 'Brocoli', 'Carottes', 'Sauce soja', 'Sésame'],
    steps: ['Faire dorer le tofu à la poêle', 'Cuire le riz', 'Sauter les légumes', 'Napper de sauce soja'],
    benefits: 'Protéines végétales et légumes pour un repas complet et rassasiant.',
    level: 'vegan',
  },
  {
    name: 'Poke bowl poulet',
    ingredients: ['Poulet grillé', 'Riz', 'Avocat', 'Edamame', 'Mangue', 'Sauce sésame'],
    steps: ['Griller le poulet', 'Cuire le riz', 'Disposer tous les ingrédients en bols', 'Arroser de sauce'],
    benefits: 'Protéines maigres et bons gras pour un déjeuner équilibré et gourmand.',
    level: 'omnivore',
  },
  {
    name: 'Bowl saumon avocat',
    ingredients: ['Saumon', 'Riz', 'Avocat', 'Concombre', 'Citron', 'Graines de sésame'],
    steps: ['Cuire le saumon à la poêle', 'Cuire le riz', 'Trancher l avocat et le concombre', 'Assembler et citronner'],
    benefits: 'Oméga-3 et protéines pour soutenir le cerveau et les muscles.',
    level: 'pesco',
  },
  {
    name: 'Salade de quinoa méditerranéenne',
    ingredients: ['Quinoa', 'Tomates cerises', 'Concombre', 'Olives', 'Oignon rouge', 'Huile d olive', 'Citron', 'Persil'],
    steps: ['Cuire le quinoa', 'Hacher les légumes', 'Mélanger le tout', 'Assaisonner huile + citron + persil'],
    benefits: 'Frais et léger mais riche en protéines végétales et fibres.',
    level: 'vegan',
  },
  {
    name: 'Wrap falafel et houmous',
    ingredients: ['Falafels', 'Tortilla de blé', 'Houmous', 'Concombre', 'Tomate', 'Laitue', 'Sauce tahini'],
    steps: ['Réchauffer les falafels', 'Tartiner la tortilla de houmous', 'Ajouter légumes et falafels', 'Rouler et couper'],
    benefits: 'Protéines végétales et fibres dans un format nomade parfait.',
    level: 'vegan',
  },
  {
    name: 'Curry de pois chiches',
    ingredients: ['Pois chiches', 'Lait de coco', 'Curry', 'Oignon', 'Tomate', 'Riz', 'Coriandre'],
    steps: ['Faire revenir oignon et curry', 'Ajouter tomates et pois chiches', 'Verser le lait de coco, mijoter 15 min', 'Servir avec le riz'],
    benefits: 'Plat réconfortant riche en protéines végétales et antioxydants.',
    level: 'vegan',
  },
  {
    name: 'Risotto aux champignons',
    ingredients: ['Riz arborio', 'Champignons', 'Oignon', 'Bouillon de légumes', 'Parmesan', 'Huile d olive', 'Persil'],
    steps: ['Faire revenir oignon et champignons', 'Ajouter le riz, nacrer', 'Mouiller progressivement avec le bouillon', 'Crémer avec le parmesan'],
    benefits: 'Plat réconfortant et crémeux, source de glucides complexes.',
    level: 'vegetarian',
  },
];

const SNACK_OPTIONS: MealOption[] = [
  {
    name: 'Energy balls coco-chocolat',
    ingredients: ['Dattes', 'Amandes', 'Cacao', 'Noix de coco râpée', 'Beurre d amande'],
    steps: ['Mixer les dattes et amandes', 'Ajouter le cacao', 'Former des boules', 'Rouler dans la noix de coco'],
    benefits: 'Coup de pouce énergétique sans sucre raffiné. Idéal avant le sport !',
    level: 'vegan',
  },
  {
    name: 'Yaourt grec aux fruits',
    ingredients: ['Yaourt grec', 'Miel', 'Amandes', 'Fruits rouges', 'Granola'],
    steps: ['Mettre le yaourt dans un bol', 'Ajouter fruits et amandes', 'Filet de miel'],
    benefits: 'Snack protéiné parfait pour la récupération musculaire.',
    level: 'vegetarian',
  },
  {
    name: 'Hummus et bâtonnets de légumes',
    ingredients: ['Houmous', 'Carottes', 'Concombre', 'Poivron', 'Pain pita'],
    steps: ['Couper les légumes en bâtonnets', 'Servir avec le houmous'],
    benefits: 'En-cas salé riche en fibres et protéines végétales.',
    level: 'vegan',
  },
  {
    name: 'Smoothie vert énergie',
    ingredients: ['Épinards', 'Banane', 'Pomme', 'Gingembre', 'Lait d amande', 'Chia'],
    steps: ['Mixer tous les ingrédients', 'Verser dans un verre'],
    benefits: 'Vitamines et minéraux en un verre, booste l énergie naturellement.',
    level: 'vegan',
  },
];

const DINNER_OPTIONS: MealOption[] = [
  {
    name: 'Pâtes de légumes au pesto',
    ingredients: ['Courgettes', 'Carottes', 'Pesto', 'Tomates cerises', 'Pignons de pin', 'Parmesan'],
    steps: ['Spiraliser courgettes et carottes', 'Faire revenir 3 min', 'Mélanger au pesto', 'Parsemer de pignons et parmesan'],
    benefits: 'Repas léger mais rassasiant, riche en fibres pour une bonne nuit.',
    level: 'vegetarian',
  },
  {
    name: 'Riz sauté aux légumes',
    ingredients: ['Riz', 'Carottes', 'Petits pois', 'Oignon', 'Œuf', 'Sauce soja', 'Huile de sésame'],
    steps: ['Cuire le riz la veille', 'Sauter oignon et légumes', 'Ajouter le riz et l œuf', 'Déglacer avec la sauce soja'],
    benefits: 'Plat asiatique réconfortant, équilibré en glucides et protéines.',
    level: 'vegetarian',
  },
  {
    name: 'Pâtes complètes tomate-basilic',
    ingredients: ['Pâtes complètes', 'Tomates', 'Basilic', 'Ail', 'Huile d olive', 'Parmesan'],
    steps: ['Cuire les pâtes', 'Faire revenir l ail', 'Ajouter les tomates concassées', 'Mélanger, parsemer de basilic'],
    benefits: 'Simple et savoureux, glucides complexes pour refaire le plein d énergie.',
    level: 'vegetarian',
  },
  {
    name: 'Curry de lentilles corail',
    ingredients: ['Lentilles corail', 'Lait de coco', 'Curry', 'Oignon', 'Carottes', 'Tomate', 'Coriandre'],
    steps: ['Faire revenir oignon et curry', 'Ajouter carottes et tomates', 'Ajouter lentilles et lait de coco', 'Mijoter 20 min'],
    benefits: 'Riche en protéines végétales et en fer, parfait pour le soir.',
    level: 'vegan',
  },
  {
    name: 'Saumon grillé et légumes rôtis',
    ingredients: ['Saumon', 'Brocoli', 'Patate douce', 'Huile d olive', 'Citron', 'Ail', 'Herbes de Provence'],
    steps: ['Couper les légumes, assaisonner', 'Rôtir au four 25 min', 'Griller le saumon à la poêle', 'Servir avec le citron'],
    benefits: 'Oméga-3 et légumes antioxydants pour un dîner sain et complet.',
    level: 'pesco',
  },
  {
    name: 'Ratatouille maison',
    ingredients: ['Aubergine', 'Courgette', 'Tomates', 'Poivron', 'Oignon', 'Ail', 'Huile d olive', 'Herbes de Provence'],
    steps: ['Couper tous les légumes', 'Faire revenir oignon et ail', 'Ajouter les légumes', 'Mijoter 40 min'],
    benefits: 'Plat végétarien classique, riche en fibres et en vitamines.',
    level: 'vegan',
  },
  {
    name: 'Poêlée de légumes et tofu',
    ingredients: ['Tofu', 'Brocoli', 'Carottes', 'Champignons', 'Sauce soja', 'Huile de sésame', 'Gingembre'],
    steps: ['Couper le tofu en cubes', 'Faire dorer le tofu', 'Sauter les légumes', 'Napper de sauce soja'],
    benefits: 'Léger, protéiné et rapide à préparer pour un dîner sain.',
    level: 'vegan',
  },
];

export function generateWeeklyMealPlan(
  answers: MealAnswers,
  previousMealNames: string[],
): RoutineContent {
  const isVegan = answers.diet === 'vegetalien/vegane';
  const isVeg = answers.diet === 'vegetarien' || isVegan;
  const isPesco = answers.diet === 'pesco-vegetarien';

  const hated = answers.hatedIngredients.map((i) => i.toLowerCase());
  const banned = (ing: string) =>
    hated.some((h) => h.includes(ing.toLowerCase()) || ing.toLowerCase().includes(h));
  const safe = (ings: string[]) => ings.filter((i) => !banned(i));

  const dietCompatible = (level: MealLevel): boolean => {
    if (isVegan) return level === 'vegan';
    if (isVeg) return level === 'vegan' || level === 'vegetarian';
    if (isPesco) return level === 'vegan' || level === 'vegetarian' || level === 'pesco';
    return true;
  };

  // Filter each pool by diet compatibility, then drop options whose name
  // contains a hated ingredient.
  const filterPool = (pool: MealOption[]): MealOption[] =>
    pool.filter((o) => dietCompatible(o.level)).filter((o) => !banned(o.name));

  const fallback: MealOption = {
    name: 'Bowl énergie sur-mesure',
    ingredients: ['Quinoa', 'Légumes de saison', 'Légumineuses', 'Huile d olive', 'Citron'],
    steps: ['Cuire le quinoa', 'Ajouter les légumes et légumineuses', 'Assaisonner'],
    benefits: 'Repas équilibré et personnalisable selon tes préférences.',
    level: 'vegan',
  };

  let breakfastPool = filterPool(BREAKFAST_OPTIONS);
  if (breakfastPool.length === 0) breakfastPool = [{ ...fallback }];
  let lunchPool = filterPool(LUNCH_OPTIONS);
  if (lunchPool.length === 0) lunchPool = [{ ...fallback }];
  let snackPool = filterPool(SNACK_OPTIONS);
  if (snackPool.length === 0) snackPool = [{ ...fallback }];
  let dinnerPool = filterPool(DINNER_OPTIONS);
  if (dinnerPool.length === 0) dinnerPool = [{ ...fallback }];

  const prev = previousMealNames.map((n) => n.toLowerCase());

  // Pick `count` options from the pool, preferring names not used in
  // previous weeks. Rotates via modulo when the pool is smaller than
  // `count` so the same option never appears on consecutive days unless
  // the pool has only one entry.
  const pickOptions = (pool: MealOption[], count: number): MealOption[] => {
    const fresh = pool.filter((o) => !prev.includes(o.name.toLowerCase()));
    const used = pool.filter((o) => prev.includes(o.name.toLowerCase()));
    const ordered = [...fresh, ...used];
    const picks: MealOption[] = [];
    for (let i = 0; i < count; i++) {
      picks.push(ordered[i % ordered.length]);
    }
    return picks;
  };

  const breakfastPicks = pickOptions(breakfastPool, 7);
  const lunchPicks = pickOptions(lunchPool, 7);
  const snackPicks = pickOptions(snackPool, 7);
  const dinnerPicks = pickOptions(dinnerPool, 7);

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const slots = ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner'];
  const allPicks = [breakfastPicks, lunchPicks, snackPicks, dinnerPicks];

  const meals: MealPlanItem[] = [];
  for (let d = 0; d < 7; d++) {
    for (let s = 0; s < 4; s++) {
      const option = allPicks[s][d];
      meals.push({
        meal: `${days[d]} - ${slots[s]}`,
        name: option.name,
        ingredients: safe(option.ingredients),
        steps: option.steps,
        benefits: option.benefits,
      });
    }
  }

  const tips: string[] = [];
  if (answers.prepTime === 'Express (< 15 min)') {
    tips.push('Astuces express : prépare le quinoa ou le riz en grande quantité pour 3 jours !');
  }
  if (answers.equipment.includes('Air Fryer')) {
    tips.push('Ton Air Fryer est parfait pour cuire tofu, saumon et légumes croustillants sans huile !');
  }
  if (answers.allergies.length > 0) {
    tips.push(`Attention aux allergies : ${answers.allergies.join(', ')}. Vérifie toujours les étiquettes !`);
  }
  if (answers.goal === 'Prise de masse musculaire / Enrichi en proteines') {
    tips.push('Vise 1.5g de protéines par kg de poids : adapte les portions selon ton objectif.');
  }
  if (answers.servings === 'famille') {
    tips.push('Multiplie les quantités par 4 et implique toute la famille dans la préparation !');
  }
  const reused = meals.filter((m) => prev.includes(m.name.toLowerCase()));
  if (reused.length > 0) {
    const reusedNames = [...new Set(reused.map((m) => m.name))];
    tips.push(
      `Quelques repas ont été réutilisés par rapport à la semaine précédente (${reusedNames.join(', ')}). Le pool d options était limité par ton régime ou tes ingrédients détestés.`,
    );
  } else if (previousMealNames.length > 0) {
    tips.push('Cette semaine propose des repas entièrement nouveaux par rapport à la semaine précédente !');
  }
  tips.push('Prépare tes légumes à l avance le week-end pour gagner du temps en semaine.');
  tips.push('Hydrate-toi tout au long de la journée : une bouteille d eau toujours à portée !');

  const diagnosis = `Plan repas de la semaine — ${answers.diet}, ${answers.cuisineStyle}.`;

  return { diagnosis, meals, tips };
}

// ============================================================
// ADAPTIVE ROUTINE HELPERS
// ============================================================

/** Lowercase and strip diacritics so accent-insensitive keyword matching works. */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Concatenate every free-text field from a list of evaluations into one string. */
function gatherEvaluationText(evaluations: RoutineEvaluation[]): string {
  return evaluations
    .map((e) =>
      [e.feeling, e.improvements, e.skin_changes, e.notes].filter(Boolean).join(' '),
    )
    .join(' ')
    .trim();
}

// ============================================================
// ADAPTIVE SKINCARE ROUTINE GENERATOR
// ============================================================
export function generateAdaptiveSkincareRoutine(
  answers: SkincareAnswers,
  evaluations: RoutineEvaluation[],
): RoutineContent {
  const base = generateSkincareRoutine(answers);

  if (evaluations.length === 0) {
    return base;
  }

  const steps = base.steps ? base.steps.map((s) => ({ ...s })) : [];
  const tips = base.tips ? [...base.tips] : [];

  const text = normalizeText(gatherEvaluationText(evaluations));
  const insights: string[] = [];

  // Irritation / démangeaisons → soothing products
  if (text.includes('irrit') || text.includes('demangeaison')) {
    const cleanser = steps.find((s) => s.name === 'Nettoyage');
    if (cleanser) {
      cleanser.product = 'Gel nettoyant ultra-doux sans parfum, à l avoine colloïdale';
      cleanser.description =
        'Masser 20 secondes sur peau humide, rincer à l eau tiède. Éviter tout frottement.';
    }
    const moisturizer = steps.find((s) => s.name === 'Hydratation');
    if (moisturizer) {
      moisturizer.product =
        'Crème apaisante riche à l avoine colloïdale + céramides + panthénol';
    }
    insights.push(
      'Tes retours mentionnent des irritations ou démangeaisons : la routine a été adaptée avec des produits plus apaisants et sans parfum.',
    );
  }

  // Peau sèche / déshydratée → richer moisturizer + hydrating serum
  if (
    text.includes('seche') ||
    text.includes('desseche') ||
    text.includes('tiraillement') ||
    text.includes('dehydra')
  ) {
    const moisturizer = steps.find((s) => s.name === 'Hydratation');
    if (moisturizer) {
      moisturizer.product =
        'Crème riche surgras à l acide hyaluronique + céramides + beurre de karité';
      moisturizer.description =
        'Appliquer généreusement sur visage et cou. Couche plus épaisse le soir.';
    }
    const serum = steps.find((s) => s.name === 'Traitement / Sérum');
    if (serum && !serum.product.toLowerCase().includes('hyaluron')) {
      serum.product = 'Sérum acide hyaluronique + hydratation intense (sous la crème)';
    }
    insights.push(
      'Ta peau semble plus sèche : passage à une crème plus riche et ajout d un sérum hydratant.',
    );
  }

  // Boutons / imperfections → BHA treatment
  if (
    text.includes('bouton') ||
    text.includes('imperfection') ||
    text.includes('acne') ||
    text.includes('point noir')
  ) {
    const serum = steps.find((s) => s.name === 'Traitement / Sérum');
    if (serum) {
      serum.product =
        'Sérum BHA (acide salicylique 2%) + niacinamide pour cibler boutons et points noirs';
    } else {
      // Minimalist routines may not have a serum step — insert one.
      steps.splice(1, 0, {
        name: 'Traitement anti-imperfections',
        product: 'Sérum BHA (acide salicylique 2%) en spot treatment',
        description:
          'Appliquer localement sur les imperfections le soir. Ne pas mélanger avec le rétinol.',
        timing: 'Soir uniquement',
      });
    }
    insights.push(
      'Des boutons ou imperfections ont été signalés : ajout d un traitement BHA ciblé.',
    );
  }

  if (insights.length > 0) {
    tips.push(...insights);
    tips.push(
      `Routine adaptée à partir de ${evaluations.length} retour${
        evaluations.length > 1 ? 's' : ''
      } d utilisation.`,
    );
    const diagnosis = base.diagnosis
      ? `${base.diagnosis} (Version adaptée selon tes retours)`
      : 'Routine adaptée selon tes retours d utilisation.';
    return { ...base, diagnosis, steps, tips };
  }

  // Evaluations exist but no specific issue keywords were detected.
  tips.push(
    `Merci pour tes ${evaluations.length} retour${
      evaluations.length > 1 ? 's' : ''
    } ! Aucun changement majeur nécessaire, ta routine actuelle te convient.`,
  );
  return { ...base, tips };
}

// ============================================================
// ADAPTIVE HAIRCARE ROUTINE GENERATOR
// ============================================================
export function generateAdaptiveHaircareRoutine(
  answers: HaircareAnswers,
  evaluations: RoutineEvaluation[],
): RoutineContent {
  const base = generateHaircareRoutine(answers);

  if (evaluations.length === 0) {
    return base;
  }

  const steps = base.steps ? base.steps.map((s) => ({ ...s })) : [];
  const tips = base.tips ? [...base.tips] : [];
  let deepCare = base.deepCare || '';

  const text = normalizeText(gatherEvaluationText(evaluations));
  const insights: string[] = [];

  // Cheveux secs → richer conditioner / deep conditioning mask
  if (
    text.includes('cheveux sec') ||
    text.includes('seche') ||
    text.includes('secs') ||
    text.includes('desseche')
  ) {
    const conditioner = steps.find((s) => s.name === 'Soin conditionneur');
    if (conditioner) {
      conditioner.product =
        'Masque nourrissant riche (beurre de karité, huile de coco, avocat) en deep conditioning + après-shampoing hydratant épais';
      conditioner.description =
        'Appliquer généreusement sur longueurs et pointes. Laisser poser 10-15 min sous chaleur pour une pénétration profonde.';
    }
    insights.push(
      'Tes cheveux semblent secs : passage à un conditionneur plus riche et à un masque nourrissant.',
    );
  }

  // Cuir chevelu irrité / démangeaisons → gentle shampoo
  if (text.includes('irrit') || text.includes('demangeaison')) {
    const shampoo = steps.find((s) => s.name === 'Lavage (Wash Day)');
    if (shampoo) {
      shampoo.product =
        'Shampoing ultra-doux sans sulfates ni parfum, à l aloe vera ou avoine colloïdale';
      shampoo.description =
        'Masser délicatement le cuir chevelu. Éviter l eau très chaude. Un seul shampoing suffit.';
    }
    insights.push(
      'Ton cuir chevelu semble irrité : passage à un shampoing très doux et apaisant.',
    );
  }

  // Cheveux cassants / fragiles → protein treatment
  if (
    text.includes('cassee') ||
    text.includes('casse') ||
    text.includes('cassant') ||
    text.includes('fragile')
  ) {
    const proteinNote =
      'Traitement protéiné hebdomadaire : masque à la kératine ou protéines de soie (1x/semaine, alterner avec soin hydratant).';
    deepCare = deepCare ? `${proteinNote}\n\n${deepCare}` : proteinNote;
    insights.push(
      'Tes cheveux semblent cassants : ajout d un traitement protéiné hebdomadaire pour renforcer la fibre.',
    );
  }

  if (insights.length > 0) {
    tips.push(...insights);
    tips.push(
      `Routine adaptée à partir de ${evaluations.length} retour${
        evaluations.length > 1 ? 's' : ''
      } d utilisation.`,
    );
    const diagnosis = base.diagnosis
      ? `${base.diagnosis} (Version adaptée selon tes retours)`
      : 'Routine adaptée selon tes retours d utilisation.';
    return { ...base, diagnosis, steps, deepCare, tips };
  }

  // Evaluations exist but no specific issue keywords were detected.
  tips.push(
    `Merci pour tes ${evaluations.length} retour${
      evaluations.length > 1 ? 's' : ''
    } ! Aucun changement majeur nécessaire, ta routine actuelle te convient.`,
  );
  return { ...base, tips };
}

// ============================================================
// STYLE & MAKE-UP ADVICE GENERATOR
// ============================================================
type StyleTone = 'dark' | 'medium' | 'light';

interface TonePalette {
  label: string;
  base: string;
  eyes: string;
  lips: string;
  blush: string;
  highlight: string;
  colors: string[];
}

const STYLE_TONE_PALETTES: Record<StyleTone, TonePalette> = {
  dark: {
    label: 'peau foncée',
    base: 'BB crème ou fond de teint adapté au teint profond, fini naturel',
    eyes: 'ombres dorées et bronze (cuivre, ambre) + mascara brun-noir',
    lips: 'lèvres nude chaud, terracotta ou baume teinté bronze',
    blush: 'blush chaud abricot-mangue ou corail profond',
    highlight: 'enlumineur doré pour sublimer le teint',
    colors: ['Or', 'Bronze', 'Terracotta', 'Bordeaux'],
  },
  medium: {
    label: 'peau mate / métisse',
    base: 'BB crème ou fond de teint léger adapté au teint halé, fini satiné',
    eyes: 'ombres corail et rose poudré + mascara noir',
    lips: 'lèvres rose ou corail, fini satiné',
    blush: 'blush rose-pêche',
    highlight: 'enlumineur champagne rosé',
    colors: ['Corail', 'Rose poudré', 'Champagne', 'Prune'],
  },
  light: {
    label: 'peau claire',
    base: 'BB crème légère ou fond de teint fluide, fini lumineux',
    eyes: 'ombres rose et pêche satinées + mascara brun',
    lips: 'lèvres rose pâle ou pêche en baume gloss',
    blush: 'blush rose doux',
    highlight: 'enlumineur nacré rose pâle',
    colors: ['Rose pâle', 'Pêche', 'Lilas', 'Corail clair'],
  },
};

function detectStyleTone(skinTone: string): StyleTone {
  const t = (skinTone || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (/foncee|noire|noir|deep|dark/.test(t)) return 'dark';
  if (/claire|clair|light|pale/.test(t)) return 'light';
  if (/matte|metisse|medium|melange/.test(t)) return 'medium';
  return 'medium';
}

interface StyleEventConfig {
  makeup: (p: TonePalette) => { step: string; product: string; description: string }[];
  outfit: string[];
  tip: (p: TonePalette) => string;
}

const STYLE_EVENT_CONFIGS: Record<string, StyleEventConfig> = {
  Anniversaire: {
    makeup: (p) => [
      { step: 'Base teint', product: p.base, description: 'Unifier le teint sans masquer la peau naturelle.' },
      { step: 'Yeux', product: `${p.eyes} avec une touche de paillettes festives`, description: 'Bien estomper pour un regard lumineux.' },
      { step: 'Lèvres', product: p.lips, description: 'Un peu plus intense que d’habitude pour l’occasion.' },
      { step: 'Joues', product: p.blush, description: 'Bonnes mines pour célébrer.' },
      { step: 'Enlumineur', product: `${p.highlight} sur les pommettes et l’arc de Cupidon`, description: 'Un éclat subtil pour les photos.' },
    ],
    outfit: [
      'Une robe fluide ou une jolie combinaison festive',
      'Des accessoires statement (boucles d’oreilles, ceinture)',
      'Des talons confortables pour danser toute la soirée',
    ],
    tip: (p) =>
      `C’est ton anniversaire : fais-toi plaisir et choisis les teintes qui te mettent en valeur (${p.colors.slice(0, 2).join(' et ')} sur ${p.label}). L’essentiel est de te sentir rayonnante !`,
  },
  'Fête / Soirée': {
    makeup: (p) => [
      { step: 'Base teint', product: `${p.base} + primer longue tenue`, description: 'Fixer le teint pour toute la nuit.' },
      { step: 'Yeux', product: `${p.eyes} + trait d’eyeliner et mascara volume`, description: 'Un regard plus soutenu pour la soirée.' },
      { step: 'Lèvres', product: `${p.lips} en fini longue tenue`, description: 'Une formule qui résiste aux verres et aux baisers.' },
      { step: 'Joues', product: p.blush, description: 'Sculpter légèrement les pommettes.' },
      { step: 'Enlumineur', product: p.highlight, description: 'Capter la lumière de la piste de danse.' },
    ],
    outfit: [
      'Une tenue statement : robe midi ou ensemble pantalon-chemisier',
      'Des talons ou sneakers blanches selon le dress code',
      'Un sac compact pour sortir en soirée',
    ],
    tip: (p) =>
      `Pour une soirée, la tenue du maquillage compte : primer et fixateur gardent ton look intact. Sur ${p.label}, les teintes ${p.colors.slice(0, 2).join(' et ')} captent bien la lumière.`,
  },
  'Rendez-vous': {
    makeup: (p) => [
      { step: 'Base teint', product: p.base, description: 'Un teint frais et naturel.' },
      { step: 'Yeux', product: `${p.eyes} en regard doux, léger trait fondu`, description: 'Pas trop chargé, on garde l’authenticité.' },
      { step: 'Lèvres', product: p.lips, description: 'Un baume ou un rouge léger et confortable.' },
      { step: 'Joues', product: `${p.blush} pour un effet bonne mine`, description: 'Effet fraîcheur naturelle.' },
    ],
    outfit: [
      'Une tenue dans laquelle tu te sens bien et confiante',
      'Une pièce structurée (blazer, jean bien coupé)',
      'Des chaussures dans lesquelles tu tiens plusieurs heures',
    ],
    tip: (p) =>
      `Reste naturelle et confiante : un maquillage qui te ressemble marque plus qu’un look trop sophistiqué. Les tons ${p.colors[0]} et ${p.colors[1]} illuminent ta ${p.label}.`,
  },
  'École / Collège': {
    makeup: (p) => [
      { step: 'Base teint', product: `${p.base} en couche très légère`, description: 'Juste unifier, sans masquer.' },
      { step: 'Yeux', product: 'Mascara seul, sans ombre à paupières', description: 'Un regard ouvert sans en faire trop.' },
      { step: 'Lèvres', product: `${p.lips} en baume teinté léger`, description: 'Hydratation et une pointe de couleur.' },
      { step: 'Joues', product: `${p.blush} en touche légère`, description: 'Effet bonne mine discret.' },
    ],
    outfit: [
      'Un look confortable et pratique (jean, t-shirt, baskets)',
      'Une veste pour les transitions de météo',
      'Un sac à dos qui se coordonne au reste',
    ],
    tip: (p) =>
      `Pour l’école, vise un maquillage frais et léger qui tient toute la journée. ${p.colors[0]} et ${p.colors[1]} apportent de l’éclat sans en faire trop sur ${p.label}.`,
  },
  'Sortie shopping': {
    makeup: (p) => [
      { step: 'Base teint', product: p.base, description: 'Un teint naturel qui tient à la marche.' },
      { step: 'Yeux', product: `${p.eyes} en version légère`, description: 'Simple et rapide à appliquer.' },
      { step: 'Lèvres', product: p.lips, description: 'Un baume ou rouge confortable.' },
      { step: 'Joues', product: p.blush, description: 'Bonne mine sans effort.' },
    ],
    outfit: [
      'Des chaussures ultra-confortables (sneakers)',
      'Une tenue en couches faciles à enlever en cabine',
      'Un sac bandoulière pour garder les mains libres',
    ],
    tip: (p) =>
      `Confort et style : un maquillage léger qui résiste à une journée active. Sur ${p.label}, ${p.colors[0]} donne bonne mine sans effort.`,
  },
  'Photo / Shooting': {
    makeup: (p) => [
      { step: 'Base teint', product: `${p.base} bien fixé (primer + poudre)`, description: 'La photo écrase le teint : matifier les zones brillantes.' },
      { step: 'Yeux', product: `${p.eyes} bien défini, éviter la brillance`, description: 'Définir le regard pour qu’il ressorte à l’appareil.' },
      { step: 'Lèvres', product: `${p.lips} avec contour précis`, description: 'Un contour net évite le baveux en gros plan.' },
      { step: 'Joues', product: `${p.blush} un peu plus marqué`, description: 'La caméra atténue : ose légèrement.' },
      { step: 'Enlumineur', product: `${p.highlight} discret`, description: 'Le flash amplifie la brillance : y aller doucement.' },
    ],
    outfit: [
      'Des couleurs qui ressortent bien en photo (évite le pur blanc/noir près du flash)',
      'Une silhouette nette : ceinture pour marquer la taille',
      'Des accessoires qui cadrent le visage',
    ],
    tip: (p) =>
      `La photo écrase le maquillage : ose un peu plus de définition et évite les enlumineurs trop brillants près du flash. ${p.colors.join(', ')} rendent super bien à l’appareil sur ${p.label}.`,
  },
  Cérémonie: {
    makeup: (p) => [
      { step: 'Base teint', product: `${p.base} longue tenue`, description: 'Un teint impeccable qui dure toute la cérémonie.' },
      { step: 'Yeux', product: `${p.eyes} élégant, trait fin`, description: 'Un regard sophistiqué sans surcharge.' },
      { step: 'Lèvres', product: `${p.lips} chic`, description: 'Un fini soigné, idéalement longue tenue.' },
      { step: 'Joues', product: p.blush, description: 'Sculpter délicatement les pommettes.' },
      { step: 'Enlumineur', product: `${p.highlight} subtil`, description: 'Un éclat raffiné, jamais trop.' },
    ],
    outfit: [
      'Une tenue élégante respectant le code (robe longue, tailleur)',
      'Des chaussures habillées mais stables',
      'Des accessoires raffinés, sans surcharge',
    ],
    tip: (p) =>
      `Élégance et tenue : choisis des produits longue tenue et un look soigné. Pour ${p.label}, les teintes ${p.colors.slice(0, 2).join(' et ')} apportent une allure raffinée.`,
  },
  'Premier rendez-vous': {
    makeup: (p) => [
      { step: 'Base teint', product: `${p.base} naturel`, description: 'Un teint qui te ressemble, pas un masque.' },
      { step: 'Yeux', product: `${p.eyes} regard ouvert et doux`, description: 'Un regard sincère et lumineux.' },
      { step: 'Lèvres', product: `${p.lips} confortable et non collant`, description: 'Pratique et agréable, peu de transfert.' },
      { step: 'Joues', product: `${p.blush} effet fraîcheur`, description: 'L’effet « bonne mine » authentique.' },
    ],
    outfit: [
      'Une tenue qui te ressemble, pas trop stressée',
      'Une pièce qui te met en valeur sans être vulnérable',
      'Des chaussures éprouvées (évite les talons neufs)',
    ],
    tip: (p) =>
      `Sois toi-même : un maquillage doux et naturel met en valeur sans masquer. ${p.colors[0]} et ${p.colors[1]} sur ${p.label} donnent un effet « bonne mine » authentique.`,
  },
};

const DEFAULT_STYLE_EVENT_CONFIG: StyleEventConfig = {
  makeup: (p) => [
    { step: 'Base teint', product: p.base, description: 'Unifier le teint.' },
    { step: 'Yeux', product: p.eyes, description: 'Définir le regard.' },
    { step: 'Lèvres', product: p.lips, description: 'Hydrater et colorer les lèvres.' },
    { step: 'Joues', product: p.blush, description: 'Effet bonne mine.' },
  ],
  outfit: [
    'Choisis une tenue adaptée au contexte de l’événement',
    'Privilégie le confort et la confiance',
  ],
  tip: (p) =>
    `Adapte ton maquillage à l’occasion. Sur ${p.label}, les teintes ${p.colors.slice(0, 2).join(' et ')} te mettent naturellement en valeur.`,
};

export function generateStyleAdvice(
  eventType: string,
  eventDetails: string,
  skinTone: string,
): StyleAdvice {
  const tone = detectStyleTone(skinTone);
  const palette = STYLE_TONE_PALETTES[tone];

  const config = STYLE_EVENT_CONFIGS[eventType] || DEFAULT_STYLE_EVENT_CONFIG;

  const makeup = config.makeup(palette);

  const suggestions = [...config.outfit];
  const outfitFeedback = { ok: true, suggestions };

  const colors = [...palette.colors];

  let overallTip = config.tip(palette);
  if (eventDetails && eventDetails.trim()) {
    overallTip += ` Détail à garder en tête : ${eventDetails.trim()}.`;
  }

  return { makeup, outfitFeedback, colors, overallTip };
}

// ============================================================
// MENTAL HEALTH — OVERTHINKING (TCC reframing)
// ============================================================

const CRISIS_KEYWORDS = [
  'harcelement', 'moquerie', 'harcèlement', 'seule', 'seul', 'peur',
  'suicide', 'suicidaire', 'mourir', 'mort', 'auto-mutilation', 'scarifier',
  'couper', 'vomir', 'anorexie', 'boulimie', 'tca', 'frapper', 'blesser',
  'mal traitement', 'agression', 'violence',
];

export function detectCrisisKeywords(text: string): boolean {
  const normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return CRISIS_KEYWORDS.some((kw) => normalized.includes(kw));
}

export function analyzeCheckIn(entryText: string): CheckInAnalysis {
  const text = entryText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const safetyAlert = detectCrisisKeywords(entryText);

  let mood: 'super' | 'moyen' | 'down' = 'moyen';

  const positiveWords = ['super', 'bien', 'content', 'heureuse', 'joie', 'rigole', 'amuse', 'genial', 'génial', 'proud', 'fiere', 'fière', 'reussi', 'réussi', 'bon', 'top'];
  const negativeWords = ['triste', 'mal', 'pleure', 'nul', 'rate', 'raté', 'fatigue', 'fatigué', 'stresse', 'stressé', 'angoisse', 'anxieuse', 'peur', 'seule', 'seul', 'down', 'deprime', 'déprime', ' Blues', 'blues', 'doute'];

  const positiveCount = positiveWords.filter((w) => text.includes(w)).length;
  const negativeCount = negativeWords.filter((w) => text.includes(w)).length;

  if (safetyAlert) {
    mood = 'down';
  } else if (positiveCount > negativeCount && positiveCount > 0) {
    mood = 'super';
  } else if (negativeCount > positiveCount) {
    mood = 'down';
  }

  const adviceByMood: Record<typeof mood, string[]> = {
    super: [
      "• C'est super que tu prennes le temps de noter ce qui va bien aujourd'hui.",
      "• Garde cette énergie, tu mérites de te sentir comme ça plus souvent.",
    ],
    moyen: [
      "• Une journée neutre, c'est ok — on n'est pas obligé d'être au top chaque jour.",
      "• Tu as géré ce que tu as pu, et c'est déjà suffisant.",
    ],
    down: [
      "• Merci d'avoir partagé ça, ça demande du courage de l'écrire.",
      "• Les jours difficiles ne durent jamais forever, même si ça en a l'air.",
      "• Tu as géré le plus dur en posant des mots dessus.",
    ],
  };

  const questionsByMood: Record<typeof mood, string> = {
    super: "Qu'est-ce qui t'a fait sourire aujourd'hui, même un tout petit peu ?",
    moyen: "Si tu devais retenir un petit moment pas si mal de ta journée, ce serait lequel ?",
    down: "Qu'est-ce qui pourrait te faire un tout petit peu de bien là, tout de suite ?",
  };

  let advice = adviceByMood[mood].join('\n');
  let question = questionsByMood[mood];

  if (safetyAlert) {
    advice = "• Ce que tu décris est important et tu n'as pas à le porter seul(e).\n• Parles-en à un adulte de confiance ou contacte gratuitement le 3018 (Cyberharcèlement) ou le Fil Santé Jeunes (0800 235 236).\n• Tu vaux mieux que ce que tu traverses, et il y a des gens prêts à t'aider.";
    question = "Est-ce qu'il y a une personne en qui tu as confiance à qui tu pourrais en parler ?";
  }

  const exercises: CBTExercise[] = safetyAlert ? [] : mood === 'down' ? [
    {
      name: "Respiration 4-7-8",
      description: "Une technique de respiration qui calme le système nerveux en moins de 2 minutes.",
      steps: [
        "Inspire par le nez pendant 4 secondes",
        "Retiens ton souffle pendant 7 secondes",
        "Expire lentement par la bouche pendant 8 secondes",
        "Répète 4 fois",
      ],
    },
    {
      name: "Micro-joie : 3 choses",
      description: "Force ton cerveau à repérer 3 petites choses positives, même minuscules.",
      steps: [
        "Note 1 chose qui t'a fait sourire aujourd'hui (même un truc minuscule)",
        "Note 1 chose que tu as réussie aujourd'hui (même petite)",
        "Note 1 chose que tu attends avec envie demain",
        "Relis ta liste avant de dormir",
      ],
    },
  ] : mood === 'moyen' ? [
    {
      name: "Scan corporel rapide",
      description: "Reconnecte-toi à ton corps pour sortir des pensées qui tournent en boucle.",
      steps: [
        "Assieds-toi confortablement et ferme les yeux",
        "Porte ton attention sur tes pieds pendant 10 secondes",
        "Remonte vers tes jambes, ton ventre, tes épaules, ta tête",
        "Note où tu sens de la tension et laisse-la se relâcher",
      ],
    },
  ] : [
    {
      name: "Ancrage de la positivité",
      description: "Quand tu te sens bien, ancre cette émotion pour pouvoir y revenir plus tard.",
      steps: [
        "Note précisément ce qui t'a fait te sentir bien aujourd'hui",
        "Décris comment ton corps se sent dans ce moment positif",
        "Crée un mot ou geste qui rappelle ce sentiment (ex: toucher ton poignet)",
        "Répète ce geste quand tu te sentiras moins bien pour retrouver cette énergie",
      ],
    },
  ];

  return { mood, advice, question, safetyAlert, exercises };
}

// ============================================================
// MENTAL HEALTH — OVERTHINKING TCC REFRAMING
// ============================================================

const COGNITIVE_DISTORTIONS = [
  {
    pattern: 'Catastrophisme',
    triggers: ['si', 'pire', 'jamais', 'toujours', 'perdu', 'fini', 'catastrophe', 'ruine'],
    reframe: (thought: string) =>
      `Tu imagines le pire scénario, mais quels scénarios plus réalistes existent aussi ? "${thought}" — est-ce vraiment la seule possibilité ?`,
  },
  {
    pattern: 'Lecture de pensée',
    triggers: ['pense', 'pensent', 'juge', 'jugent', 'critique', 'critiquent', 'se moque', 'se moquent', 'rire', 'rigolent'],
    reframe: (thought: string) =>
      `Tu supposes ce que les autres pensent, mais tu ne peux pas lire dans leur tête. Sur quoi te bases-tu pour "${thought}" ?`,
  },
  {
    pattern: 'Généralisation excessive',
    triggers: ['toujours', 'jamais', 'personne', 'rien', 'tout', 'chaque', 'aucun'],
    reframe: (thought: string) =>
      `Les mots "toujours" et "jamais" sont rarement vrais. Peux-tu trouver un seul contre-exemple à "${thought}" ?`,
  },
  {
    pattern: 'Filtre mental négatif',
    triggers: ['que des', 'rien que', 'seulement le', 'focus sur', 'obsede', 'obsède'],
    reframe: (thought: string) =>
      `Tu retiens uniquement le négatif. Quelles choses positives ou neutres se sont aussi passées autour de "${thought}" ?`,
  },
  {
    pattern: 'Raisonnement émotionnel',
    triggers: ['je sens', 'j ai l impression', 'j\'ai l impression', 'je trouve que', 'coupable'],
    reframe: (thought: string) =>
      `Ce que tu ressens est réel, mais ce n'est pas toujours un fait. Une émotion ne prouve pas que "${thought}" est vrai.`,
  },
  {
    pattern: "Devoir / Il faut",
    triggers: ['il faut', 'je dois', 'devrait', 'devraient', 'obligation', 'forcement', 'forcément'],
    reframe: (thought: string) =>
      `Les "il faut" créent beaucoup de pression. Et si tu remplaçais "${thought}" par "j'aimerais" ou "je choisis de" ?`,
  },
];

export function reframeOverthinking(thought: string): OverthinkingResult {
  const normalized = thought.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  let matched = COGNITIVE_DISTORTIONS[0];
  let bestScore = 0;

  for (const distortion of COGNITIVE_DISTORTIONS) {
    const score = distortion.triggers.filter((t) => normalized.includes(t)).length;
    if (score > bestScore) {
      bestScore = score;
      matched = distortion;
    }
  }

  const safetyAlert = detectCrisisKeywords(thought);

  let encouragement = `Tu as eu le courage de poser cette pensée, c'est déjà une victoire. Le simple fait de l'écrire aide ton cerveau à prendre du recul.`;
  let question = `Si ta meilleure amie te disait exactement ça, tu lui répondrais quoi ?`;

  if (safetyAlert) {
    encouragement = `Ce que tu ressens est valide et important. Tu n'as pas à porter ça seule. Parles-en à un adulte de confiance ou contacte le 3018 / Fil Santé Jeunes (0800 235 236).`;
    question = `Est-ce qu'il y a quelqu'un en qui tu as confiance à qui tu pourrais parler maintenant ?`;
  }

  const reframedThought = safetyAlert
    ? `Tu traverses un moment difficile, et c'est ok de demander de l'aide. Ce n'est pas un échec, c'est un acte de force.`
    : matched.reframe(thought.trim());

  const patternExplanations: Record<string, string> = {
    'Catastrophisme': "Tu imagines le pire scénario possible sans considérer les alternatives plus réalistes. Ton cerveau saute directement à la conclusion la plus dramatique.",
    'Lecture de pensée': "Tu supposes savoir ce que les autres pensent de toi, sans avoir de preuves concrètes. C'est une des distortions les plus fréquentes à l'adolescence.",
    'Généralisation excessive': "Tu utilises des mots comme 'toujours' ou 'jamais' qui rendent la situation plus absolue qu'elle ne l'est en réalité.",
    'Filtre mental négatif': "Tu te concentres uniquement sur les aspects négatifs et tu ignores tout ce qui est positif ou neutre dans la situation.",
    'Raisonnement émotionnel': "Tu confonds tes émotions avec des faits. Parce que tu te sens coupable ou anxieuse, tu concludes que ça doit être justifié.",
    "Devoir / Il faut": "Tu te imposes des règles strictes avec des mots comme 'il faut' ou 'je dois', ce qui crée une pression énorme et de la culpabilité.",
  };

  const exercises: CBTExercise[] = safetyAlert ? [] : [
    {
      name: "Technique des 3 scénarios",
      description: "Quand ton cerveau imagine le pire, force-toi à envisager 3 scénarios différents : le pire, le plus probable, et le meilleur.",
      steps: [
        "Écris le scénario catastrophe que ton cerveau imagine",
        "Écris le scénario le plus réaliste et probable (avec des preuves)",
        "Écris un scénario positif qui pourrait aussi arriver",
        "Demande-toi : lequel de ces 3 scénarios est le plus probable ?",
      ],
    },
    {
      name: "Le test de la preuve",
      description: "Vérifie quelles preuves réelles tu as pour soutenir ta pensée, et quelles preuves la contredisent.",
      steps: [
        "Écris ta pensée sur papier",
        "Fais 2 colonnes : 'Preuves POUR' et 'Preuves CONTRE'",
        "Liste tout ce qui soutient ta pensée d'un côté, tout ce qui la contredit de l'autre",
        "Regarde les 2 colonnes : ta pensée est-elle aussi certaine qu'elle en a l'air ?",
      ],
    },
    {
      name: "La règle de l'amie",
      description: "Demande-toi ce que tu dirais à ta meilleure amie si elle avait exactement la même pensée.",
      steps: [
        "Imagine que ta meilleure amie te dit exactement cette pensée",
        "Écris ce que tu lui répondrais avec bienveillance",
        "Relis ta réponse : pourquoi ne pas t'offrir la même compassion ?",
        "Utilise tes propres mots comme recadrage pour toi-même",
      ],
    },
  ];

  return {
    distortedThought: thought.trim(),
    reframedThought,
    pattern: matched.pattern,
    patternExplanation: patternExplanations[matched.pattern] || "Ce schéma de pensée te fait voir la réalité de façon déformée. Le reconnaître est la première étape pour en sortir.",
    encouragement,
    question,
    exercises,
  };
}

// ============================================================
// MENTAL HEALTH — WEEKLY CHALLENGES
// ============================================================

const CHALLENGE_LEVELS = [
  {
    level: 1,
    label: 'Découverte',
    challenges: [
      "Sourire et saluer quelqu'un à qui tu ne parles pas d'habitude",
      "Écrire 3 choses dont tu es reconnaissante avant de dormir",
      "Mettre ton téléphone 30 min avant de dormir",
      "Faire un compliment sincère à quelqu'un aujourd'hui",
      "Prendre 5 min pour respirer profondément quand tu te sens stressée",
      "Boire un grand verre d'eau dès le réveil",
      "Écouter une chanson qui te met de bonne humeur et la chanter",
      "Faire quelque chose juste pour toi, sans culpabiliser",
    ],
  },
  {
    level: 2,
    label: 'Confiance',
    challenges: [
      "Poser une question à un prof à la fin d'un cours",
      "Dire non à quelque chose qui ne te convient pas",
      "Parler de toi à la première personne sans te dévaloriser",
      "Engager une conversation avec quelqu'un que tu connais peu",
      "Partager ton opinion dans un petit groupe",
      "Demander de l'aide quand tu en as besoin, sans culpabiliser",
      "Essayer une nouvelle activité qui te fait un peu peur",
      "Tenir une posture de confiance (droite, épaules en arrière) pendant 2 min",
    ],
  },
  {
    level: 3,
    label: 'Audace',
    challenges: [
      "Exprimer un désaccord calmement en groupe",
      "Inviter quelqu'un à faire quelque chose avec toi",
      "Prendre la parole en cours alors que ça te stresse",
      "Faire quelque chose que tu as toujours voulu tester mais reporté",
      "Donner ton avis même si tout le monde n'est pas d'accord",
      "Aller vers quelqu'un qui semble seul et lui parler",
      "Présenter quelque chose devant la classe ou un groupe",
      "Partager une difficulté avec une personne de confiance",
    ],
  },
  {
    level: 4,
    label: 'Légende',
    challenges: [
      "Animer ou diriger une activité de groupe",
      "Défendre quelqu'un qui se fait critiquer devant toi",
      "Proposer une idée nouvelle dans un projet de groupe et la défendre",
      "Faire un discours ou une présentation devant un public large",
      "Prendre l'initiative d'organiser une sortie avec plusieurs personnes",
      "Oser être différente et assumer ce qui te rend unique",
      "Parler de quelque chose qui te tient à coeur devant un groupe",
      "Mentorer ou aider quelqu'un de plus jeune ou plus timide que toi",
    ],
  },
];

export function getWeeklyChallenges(seed: number, level: number = 1): string[] {
  const levelData = CHALLENGE_LEVELS.find((l) => l.level === level) || CHALLENGE_LEVELS[0];
  const shuffled = [...levelData.challenges];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed + i * 7) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 3);
}

export function getChallengeLevelLabel(level: number): string {
  return CHALLENGE_LEVELS.find((l) => l.level === level)?.label || 'Découverte';
}

export function getMaxChallengeLevel(): number {
  return CHALLENGE_LEVELS.length;
}

export const VICTORY_CATEGORIES = [
  { value: 'social', label: 'Social', icon: 'Users', emoji: '🤝' },
  { value: 'scolaire', label: 'Scolaire', icon: 'BookOpen', emoji: '📚' },
  { value: 'perso', label: 'Personnel', icon: 'Sparkles', emoji: '✨' },
  { value: 'courage', label: 'Courage', icon: 'Flame', emoji: '🔥' },
  { value: 'bienetre', label: 'Bien-être', icon: 'Heart', emoji: '💚' },
  { value: 'autre', label: 'Autre', icon: 'Star', emoji: '🌟' },
] as const;

export function getWeekKey(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const weekNum = Math.ceil(diff / (7 * 86400000));
  return `${now.getFullYear()}-W${weekNum}`;
}
