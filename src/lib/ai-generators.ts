import type {
  SkincareAnswers,
  MealAnswers,
  HaircareAnswers,
  RoutineContent,
  StyleAdvice,
  OverthinkingResult,
  CheckInAnalysis,
  MentalCheckIn,
  CBTExercise,
} from '@/lib/types';
import {
  generateSkincareRoutine,
  generateHaircareRoutine,
  generateMealPlan,
  generateWeeklyMealPlan,
  generateStyleAdvice,
  reframeOverthinking,
  analyzeCheckIn,
  getWeeklyChallenges,
} from '@/lib/generators';
import { generateAIJSON, generateAIText } from '@/lib/ai';
import { detectCrisisKeywords } from '@/lib/generators';

// ============================================================
// SKINCARE
// ============================================================
export async function aiSkincareRoutine(
  answers: SkincareAnswers,
  evaluations?: { feeling: string; improvements: string | null; skin_changes: string | null }[],
): Promise<RoutineContent> {
  const evalText = evaluations && evaluations.length > 0
    ? `\n\nRetours d'utilisation précédents :\n${evaluations.map(e => `- Ressenti: ${e.feeling}${e.improvements ? `, Améliorations souhaitées: ${e.improvements}` : ''}${e.skin_changes ? `, Changements peau: ${e.skin_changes}` : ''}`).join('\n')}`
    : '';

  const prompt = `Crée une routine skincare personnalisée en JSON pour cette personne :
- Type de peau: ${answers.skinType}
- Teint: ${answers.skinTone}
- Préoccupations: ${answers.concerns.join(', ')}
- Sensibilités: ${answers.sensitivity.join(', ')}
- Climat: ${answers.climate}
- Exposition soleil: ${answers.sunExposure}
- Temps écran: ${answers.screenTime}
- Âge: ${answers.ageRange}
- Niveau d'engagement: ${answers.commitmentLevel}
- Préférence formules: ${answers.formulaPreference}
- Budget: ${answers.budget}${evalText}

Réponds en JSON avec ce format exact:
{
  "diagnosis": "texte du diagnostic personnalisé",
  "steps": [{ "name": "Nom étape", "product": "Produit recommandé", "description": "Comment l'appliquer", "timing": "Quand l'appliquer" }],
  "tips": ["conseil 1", "conseil 2", ...]
}

La routine doit avoir entre 3 et 7 étapes selon le niveau d'engagement. Adapte les produits au teint (les filtres minéraux laissent un voile blanc sur les peaux foncées). Tout en français, ton bienveillant et expert.`;

  const systemPrompt = 'Tu es une experte en soins de la peau (dermocosmétique). Tu donnes des conseils personnalisés, bienveillants et scientifiquement fondés. Réponds toujours en français et en JSON.';

  const { data, ok } = await generateAIJSON<RoutineContent>(prompt, systemPrompt, { maxOutputTokens: 2048 });
  if (ok && data && (data.steps || data.tips)) {
    return data;
  }
  return evaluations && evaluations.length > 0
    ? generateSkincareRoutine(answers)
    : generateSkincareRoutine(answers);
}

// ============================================================
// HAIRCARE
// ============================================================
export async function aiHaircareRoutine(
  answers: HaircareAnswers,
  evaluations?: { feeling: string; improvements: string | null; skin_changes: string | null }[],
): Promise<RoutineContent> {
  const evalText = evaluations && evaluations.length > 0
    ? `\n\nRetours d'utilisation précédents :\n${evaluations.map(e => `- Ressenti: ${e.feeling}${e.improvements ? `, ${e.improvements}` : ''}${e.skin_changes ? `, ${e.skin_changes}` : ''}`).join('\n')}`
    : '';

  const prompt = `Crée une routine capillaire personnalisée en JSON :
- Type de cheveux: ${answers.hairType}
- Épaisseur: ${answers.hairThickness}
- Porosité: ${answers.porosity}
- Cuir chevelu: ${answers.scalpCondition}
- Densité: ${answers.hairDensity}
- Traitements chimiques: ${answers.chemicalTreatments.join(', ')}
- Habitudes de coiffage: ${answers.stylingHabits.join(', ')}
- Objectif principal: ${answers.mainGoal}
- Préférence routine: ${answers.routinePreference}${evalText}

Réponds en JSON avec ce format exact:
{
  "diagnosis": "texte du diagnostic",
  "steps": [{ "name": "Nom étape", "product": "Produit recommandé", "description": "Comment faire", "timing": "Fréquence" }],
  "deepCare": "soin hebdomadaire approfondi",
  "tips": ["conseil 1", "conseil 2", ...]
}

Adapte aux types de cheveux (Walker 1-4), à la porosité, et au cuir chevelu. Tout en français.`;

  const systemPrompt = 'Tu es une experte en soins capillaires (trichologie et méthode curly girl). Tu donnes des conseils personnalisés selon le type de cheveux (classification Walker), la porosité et l\'état du cuir chevelu. Réponds en français et en JSON.';

  const { data, ok } = await generateAIJSON<RoutineContent>(prompt, systemPrompt, { maxOutputTokens: 2048 });
  if (ok && data && (data.steps || data.tips)) {
    return data;
  }
  return generateHaircareRoutine(answers);
}

// ============================================================
// MEALS
// ============================================================
export async function aiMealPlan(
  answers: MealAnswers,
  previousMealNames?: string[],
): Promise<RoutineContent> {
  const prevText = previousMealNames && previousMealNames.length > 0
    ? `\n\nRepas déjà proposés récemment (évite de les répéter) : ${previousMealNames.join(', ')}`
    : '';

  const prompt = `Crée un plan de repas pour une journée en JSON :
- Ingrédients adorés: ${answers.lovedIngredients.join(', ')}
- Ingrédients détestés: ${answers.hatedIngredients.join(', ')}
- Style culinaire: ${answers.cuisineStyle}
- Régime: ${answers.diet}
- Allergies: ${answers.allergies.join(', ')}
- Objectif: ${answers.goal}
- Temps de préparation: ${answers.prepTime}
- Équipement: ${answers.equipment.join(', ')}
- Nombre de personnes: ${answers.servings}${prevText}

Réponds en JSON avec ce format exact:
{
  "diagnosis": "résumé du plan",
  "meals": [{
    "meal": "Petit-déjeuner",
    "name": "Nom du plat",
    "ingredients": ["ingrédient 1", "ingrédient 2", ...],
    "steps": ["étape 1", "étape 2", ...],
    "benefits": "bienfaits nutritionnels"
  }],
  "tips": ["conseil 1", "conseil 2", ...]
}

Inclus 4 repas: Petit-déjeuner, Déjeuner, Collation, Dîner. Respecte STRICTEMENT les allergies et le régime. N'utilise JAMAIS les ingrédients détestés. Tout en français, recettes réelles et réalisables.`;

  const systemPrompt = 'Tu es une nutritionniste et chef cuisinée. Tu crées des plans de repas sains, délicieux et adaptés aux contraintes (allergies, régime, budget). Réponds en français et en JSON.';

  const { data, ok } = await generateAIJSON<RoutineContent>(prompt, systemPrompt, { maxOutputTokens: 2048 });
  if (ok && data && data.meals && data.meals.length > 0) {
    return data;
  }
  return generateMealPlan(answers);
}

export async function aiWeeklyMealPlan(
  answers: MealAnswers,
  previousMealNames: string[],
): Promise<RoutineContent> {
  const prompt = `Crée un plan de repas pour 7 jours (Lundi à Dimanche) en JSON, avec 4 repas par jour (Petit-déjeuner, Déjeuner, Collation, Dîner) :
- Ingrédients adorés: ${answers.lovedIngredients.join(', ')}
- Ingrédients détestés: ${answers.hatedIngredients.join(', ')}
- Style culinaire: ${answers.cuisineStyle}
- Régime: ${answers.diet}
- Allergies: ${answers.allergies.join(', ')}
- Objectif: ${answers.goal}
- Temps de préparation: ${answers.prepTime}
- Équipement: ${answers.equipment.join(', ')}
- Nombre de personnes: ${answers.servings}
- Repas déjà proposés (évite de répéter): ${previousMealNames.join(', ')}

Réponds en JSON avec ce format:
{
  "diagnosis": "résumé",
  "meals": [{ "meal": "Lundi - Petit-déjeuner", "name": "...", "ingredients": [...], "steps": [...], "benefits": "..." }, ...28 repas total...],
  "tips": ["conseil 1", ...]
}

28 repas au total (7 jours x 4 repas). Varie les plats chaque jour. Respecte STRICTEMENT allergies et régime. N'utilise JAMAIS les ingrédients détestés. Tout en français.`;

  const systemPrompt = 'Tu es une nutritionniste et chef cuisinée. Tu crées des plans de repas hebdomadaires variés et adaptés. Réponds en français et en JSON.';

  const { data, ok } = await generateAIJSON<RoutineContent>(prompt, systemPrompt, { maxOutputTokens: 4096 });
  if (ok && data && data.meals && data.meals.length >= 20) {
    return data;
  }
  return generateWeeklyMealPlan(answers, previousMealNames);
}

// ============================================================
// STYLE & MAKE-UP
// ============================================================
export async function aiStyleAdvice(
  eventType: string,
  eventDetails: string,
  skinTone: string,
): Promise<StyleAdvice> {
  const prompt = `Donne des conseils de style et maquillage personnalisés en JSON :
- Occasion: ${eventType}
- Détails: ${eventDetails || 'Aucun détail supplémentaire'}
- Teint de peau: ${skinTone}

Réponds en JSON avec ce format exact:
{
  "makeup": [{ "step": "Nom de l'étape", "product": "Produit recommandé", "description": "Comment l'appliquer" }],
  "outfitFeedback": { "ok": true, "suggestions": ["suggestion 1", "suggestion 2", ...] },
  "colors": ["couleur 1", "couleur 2", "couleur 3", "couleur 4"],
  "overallTip": "un conseil général personnalisé"
}

Adapte le maquillage au teint de peau (les couleurs qui mettent en valeur). 4-6 étapes de maquillage. Tout en français, ton amical et expert.`;

  const systemPrompt = 'Tu es une experte en maquillage et stylisme. Tu donnes des conseils adaptés au teint de peau et à l\'occasion. Réponds en français et en JSON.';

  const { data, ok } = await generateAIJSON<StyleAdvice>(prompt, systemPrompt, { maxOutputTokens: 2048 });
  if (ok && data && data.makeup) {
    return data;
  }
  return generateStyleAdvice(eventType, eventDetails, skinTone);
}

// ============================================================
// MENTAL HEALTH — OVERTHINKING
// ============================================================
export async function aiReframeOverthinking(thought: string): Promise<OverthinkingResult> {
  if (detectCrisisKeywords(thought)) {
    return reframeOverthinking(thought);
  }

  const prompt = `Une adolescente a écrit cette pensée qui tourne en boucle dans sa tête :
"${thought}"

Aide-la à déconstruire cette pensée avec une approche TCC (thérapie cognitivo-comportementale).

Réponds en JSON avec ce format exact:
{
  "distortedThought": "sa pensée originale reformulée en 1 phrase",
  "reframedThought": "une reformulation bienveillante et réaliste (3-4 phrases, structurée avec des arguments concrets)",
  "pattern": "nom du schéma cognitif identifié (ex: Catastrophisme, Lecture de pensée, Généralisation excessive, Filtre mental négatif, Raisonnement émotionnel, Devoir/Il faut)",
  "patternExplanation": "explique ce schéma en 2-3 phrases simples pour qu'elle comprenne POURQUOI son cerveau fait ça (pas de jargon psychologique)",
  "encouragement": "un message d'encouragement chaleureux et personnalisé (2-3 phrases, référence ce qu'elle a écrit)",
  "question": "une question ouverte et concrète pour l'aider à prendre du recul",
  "exercises": [
    {
      "name": "nom court de l'exercice",
      "description": "à quoi ça sert en 1 phrase",
      "steps": ["étape 1", "étape 2", "étape 3", "étape 4"]
    },
    {
      "name": "nom court du 2e exercice",
      "description": "à quoi ça sert en 1 phrase",
      "steps": ["étape 1", "étape 2", "étape 3"]
    }
  ]
}

Donne TOUJOUR exactement 2 exercices pratiques de TCC, adaptés au schéma identifié. Chaque exercice doit être concret, réalisable en moins de 10 minutes, avec des étapes claires. Varie les exercices selon le schéma (ne donne pas toujours les mêmes).

Ton: comme un grand frère ou une grande sœur qui écoute sans juger. Bienveillant, structuré, jamais moralisateur. En français.`;

  const systemPrompt = "Tu es Alex, un grand frère/une grande sœur virtuel qui aide une adolescente à déconstruire ses pensées anxieuses avec bienveillance et techniques de TCC. Tu es chaleureux, jamais jugeant, et tu parles en français. Tes réponses sont structurées avec des exercices pratiques concrets, pas juste des mots d'encouragement.";

  const { data, ok } = await generateAIJSON<OverthinkingResult>(prompt, systemPrompt, { maxOutputTokens: 2048, temperature: 0.8 });
  if (ok && data && data.reframedThought && data.exercises && data.exercises.length > 0) {
    return data;
  }
  if (ok && data && data.reframedThought) {
    const fallback = reframeOverthinking(thought);
    return { ...fallback, ...data, exercises: fallback.exercises };
  }
  return reframeOverthinking(thought);
}

// ============================================================
// MENTAL HEALTH — CHECK-IN
// ============================================================
export async function aiAnalyzeCheckIn(entryText: string, recentCheckIns?: MentalCheckIn[]): Promise<CheckInAnalysis> {
  if (detectCrisisKeywords(entryText)) {
    return analyzeCheckIn(entryText);
  }

  const historyText = recentCheckIns && recentCheckIns.length > 0
    ? `\n\nVoici ses check-ins récents pour contexte:\n${recentCheckIns.slice(0, 5).map(c => `- ${c.mood_detected}: "${c.entry_text}"`).join('\n')}`
    : '';

  const prompt = `Une adolescente a écrit ce bilan de sa journée :
"${entryText}"

Analyse son humeur, donne-lui un conseil personnalisé ET propose 1-2 exercices pratiques pour l'aider.${historyText}

Réponds en JSON avec ce format exact:
{
  "mood": "super" | "moyen" | "down",
  "advice": "un conseil personnalisé et bienveillant (4-6 phrases, structuré avec des puces •), qui référence ce qu'elle a écrit",
  "question": "une question ouverte et concrète pour l'inviter à réfléchir",
  "safetyAlert": false,
  "exercises": [
    {
      "name": "nom court de l'exercice",
      "description": "à quoi ça sert en 1 phrase",
      "steps": ["étape 1", "étape 2", "étape 3"]
    }
  ]
}

Donne 1 exercice si elle va bien (mood super), 2 exercices si elle va moyen ou mal. Les exercices doivent être concrets, réalisables en moins de 10 minutes, et adaptés à ce qu'elle a écrit. Varie les exercices selon le contexte.

Ton: comme un grand frère/une grande sœur. Empathique, structuré, jamais cliché. Adapte VRAIMENT le conseil à ce qu'elle a écrit. En français.`;

  const systemPrompt = "Tu es Alex, un grand frère/une grande sœur virtuel. Tu analyses le bilan de journée d'une adolescente avec empathie et lui donnes un conseil vraiment personnalisé ET des exercices pratiques. Tu parles en français. safetyAlert doit être false sauf si le texte mentionne suicide, automutilation, harcèlement, ou violence.";

  const { data, ok } = await generateAIJSON<CheckInAnalysis>(prompt, systemPrompt, { maxOutputTokens: 2048, temperature: 0.8 });
  if (ok && data && data.advice && data.exercises && data.exercises.length > 0) {
    return data;
  }
  if (ok && data && data.advice) {
    const fallback = analyzeCheckIn(entryText);
    return { ...fallback, ...data, exercises: fallback.exercises };
  }
  return analyzeCheckIn(entryText);
}

// ============================================================
// MENTAL HEALTH — WEEKLY CHALLENGES
// ============================================================
export async function aiWeeklyChallenges(
  recentCheckIns: MentalCheckIn[],
  fallbackSeed: number,
  level: number = 1,
): Promise<string[]> {
  const historyText = recentCheckIns.length > 0
    ? `\n\nVoici ses humeurs et bilans récents:\n${recentCheckIns.slice(0, 5).map(c => `- ${c.mood_detected}: "${c.entry_text}"`).join('\n')}`
    : '';

  const levelLabels: Record<number, string> = { 1: 'Découverte (très doux, premiers pas)', 2: 'Confiance (un peu plus osé)', 3: 'Audace (sortir vraiment de sa zone de confort)', 4: 'Légende (défis qui impressionnent)' };
  const levelDesc = levelLabels[level] || levelLabels[1];

  const prompt = `Propose 3 micro-défis pour cette semaine à une adolescente, de niveau ${levelDesc}.${historyText}

Les défis doivent être:
- Concrets et réalisables en moins de 30 minutes
- Adaptés au niveau demandé (${levelDesc})
- Qui l'aident à sortir de sa zone de confort sociale ou émotionnelle
- Adaptés à son état (plus doux si elle va mal, plus audacieux si elle va bien)
- Variés (pas 3 fois le même type de défi)

Réponds en JSON avec ce format exact:
{ "challenges": ["défi 1", "défi 2", "défi 3"] }

Chaque défi est une phrase courte, motivante et très concrète. En français.`;

  const systemPrompt = "Tu es Alex, un coach bienveillant pour adolescentes. Tu proposes des micro-défis adaptés à l'état émotionnel et au niveau de difficulté demandé. Réponds en français et en JSON.";

  const { data, ok } = await generateAIJSON<{ challenges: string[] }>(prompt, systemPrompt, { maxOutputTokens: 512, temperature: 0.9 });
  if (ok && data && data.challenges && data.challenges.length === 3) {
    return data.challenges;
  }
  return getWeeklyChallenges(fallbackSeed, level);
}

// ============================================================
// MENTAL HEALTH — FREE CHAT (for future use)
// ============================================================
export async function aiChat(userMessage: string, context?: string): Promise<string> {
  if (detectCrisisKeywords(userMessage)) {
    return "Ce que tu décris est important et tu n'as pas à le porter seul(e). Parles-en à un adulte de confiance ou contacte gratuitement le 3018 (Cyberharcèlement) ou le Fil Santé Jeunes (0800 235 236). Tu vaux mieux que ce que tu traverses.";
  }

  const prompt = context ? `Contexte: ${context}\n\nMessage: ${userMessage}` : userMessage;

  const systemPrompt = "Tu es Alex, un grand frère/une grande sœur virtuel pour une adolescente. Tu réponds avec empathie, en français, de façon courte (3-5 phrases max). Tu ne juges jamais. Tu poses parfois une question ouverte pour l'aider à réfléchir.";

  const result = await generateAIText(prompt, systemPrompt, { maxOutputTokens: 512, temperature: 0.8 });
  if (result.ok && result.text) {
    return result.text;
  }
  return "Je suis là pour toi, mais j'ai du mal à me connecter en ce moment. Réessaie dans un instant 💪";
}
