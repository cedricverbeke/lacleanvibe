import { useState } from 'react';
import { UtensilsCrossed, RefreshCw, ArrowLeft, ArrowRight, Sparkles, ThumbsUp, ThumbsDown, ChefHat, Heart, Clock, Microwave, Users, AlertTriangle, Check, Lock } from 'lucide-react';
import { ChipGroup } from '@/components/Chip';
import { ProgressBar } from '@/components/ProgressBar';
import { LoadingSpinner } from '@/components/Loading';
import { generateMealPlan, generateWeeklyMealPlan } from '@/lib/generators';
import { aiMealPlan, aiWeeklyMealPlan } from '@/lib/ai-generators';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { MealAnswers, RoutineContent } from '@/lib/types';

const STEPS = 4;

const COMMON_LOVED = [
  'Avocat', 'Tofu', 'Riz', 'Pâtes', 'Poulet', 'Œuf', 'Tomates', 'Mangue', 'Saumon', 'Brocoli', 'Patate douce', 'Quinoa', 'Banane', 'Fruits rouges', 'Fromage',
];
const COMMON_HATED = [
  'Coriandre', 'Champignons', 'Aubergine', 'Céleri', 'Poivron', 'Oignon', 'Betterave', 'Anis', 'Café', 'Moutarde',
];
const CUISINES = [
  { value: 'Mediterraneenne', label: 'Méditerranéenne' },
  { value: 'Asiatique / Coreenne', label: 'Asiatique / Coréenne' },
  { value: 'Rapide / sur le pouce', label: 'Rapide / sur le pouce' },
  { value: 'Confort / familiale', label: 'Confort / Familiale' },
];
const DIETS = [
  { value: 'Omnivore', label: 'Omnivore' },
  { value: 'vegetarien', label: 'Végétarien' },
  { value: 'vegetalien/vegane', label: 'Végétalien / Vegane' },
  { value: 'pesco-vegetarien', label: 'Pesco-végétarien' },
  { value: 'Cetogene', label: 'Cétogène' },
  { value: 'Pauvre en FODMAP', label: 'Pauvre en FODMAP' },
];
const ALLERGIES = [
  { value: 'Gluten', label: 'Gluten' },
  { value: 'Lactose', label: 'Lactose' },
  { value: 'Arachides', label: 'Arachides' },
  { value: 'Fruits a coque', label: 'Fruits à coque' },
  { value: 'Œufs', label: 'Œufs' },
  { value: 'Crustaces', label: 'Crustacés' },
  { value: 'Soja', label: 'Soja' },
  { value: 'Aucune', label: 'Aucune' },
];
const GOALS = [
  { value: 'Maintien / Equilibre', label: 'Maintien / Équilibre' },
  { value: 'Prise de masse musculaire / Enrichi en proteines', label: 'Prise de masse musculaire' },
  { value: 'Perte de poids / Gestion de la satiete', label: 'Perte de poids / Satiété' },
  { value: "Regain d energie / Anti-coup de pompe", label: "Regain d'énergie" },
];
const PREP_TIMES = [
  { value: 'Express (< 15 min)', label: 'Express (< 15 min)' },
  { value: 'Standard (15-30 min)', label: 'Standard (15-30 min)' },
  { value: 'Passionne (> 45 min)', label: 'Passionné (> 45 min)' },
  { value: 'Meal Prep (cuire a l avance)', label: 'Meal Prep (à l avance)' },
];
const EQUIPMENT = [
  { value: 'Plaque de cuisson', label: 'Plaque de cuisson' },
  { value: 'Four', label: 'Four' },
  { value: 'Air Fryer', label: 'Air Fryer' },
  { value: 'Blender', label: 'Blender' },
  { value: 'Robot cuiseur', label: 'Robot cuiseur' },
];
const SERVINGS = [
  { value: 'solo', label: 'Solo' },
  { value: 'couple', label: 'Couple' },
  { value: 'famille', label: 'Famille' },
];

const MEAL_IMGS = [
  'https://images.pexels.com/photos/7937002/pexels-photo-7937002.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/6065181/pexels-photo-6065181.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/842545/pexels-photo-842545.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

export function MealsPage() {
  const { user, isGuest } = useAuth();
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<RoutineContent | null>(null);
  const [weeklyMode, setWeeklyMode] = useState(false);
  const [customLoved, setCustomLoved] = useState('');
  const [customHated, setCustomHated] = useState('');
  const [answers, setAnswers] = useState<MealAnswers>({
    lovedIngredients: [],
    hatedIngredients: [],
    cuisineStyle: '',
    diet: '',
    allergies: [],
    goal: '',
    prepTime: '',
    equipment: [],
    servings: '',
  });

  const toggleCustom = (list: 'loved' | 'hated', val: string) => {
    if (!val.trim()) return;
    const key = list === 'loved' ? 'lovedIngredients' : 'hatedIngredients';
    setAnswers({ ...answers, [key]: [...answers[key], val.trim()] });
    if (list === 'loved') setCustomLoved('');
    else setCustomHated('');
  };

  const canProceed = () => {
    switch (step) {
      case 0: return answers.lovedIngredients.length > 0 && answers.hatedIngredients.length >= 0 && answers.cuisineStyle !== '';
      case 1: return answers.diet !== '' && answers.allergies.length > 0 && answers.goal !== '';
      case 2: return answers.prepTime !== '';
      case 3: return answers.equipment.length > 0 && answers.servings !== '';
      default: return false;
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    if (weeklyMode && !isGuest && user) {
      const { data: prevPlans } = await supabase
        .from('weekly_meal_plans')
        .select('content')
        .eq('user_id', user.id)
        .order('week_start', { ascending: false })
        .limit(3);
      const previousMealNames: string[] = (prevPlans ?? []).flatMap(
        (p) => (p.content?.meals ?? []).map((m: { name: string }) => m.name),
      );
      const plan = await aiWeeklyMealPlan(answers, previousMealNames);
      await supabase.from('weekly_meal_plans').insert({
        user_id: user.id,
        week_start: new Date().toISOString().slice(0, 10),
        content: plan,
      });
      setResult(plan);
    } else {
      const plan = await aiMealPlan(answers);
      setResult(plan);
      if (user) {
        await supabase.from('generated_routines').insert({
          user_id: user.id,
          type: 'meal',
          content: plan,
        });
      }
    }
    setGenerating(false);
  };

  const reset = () => {
    setResult(null);
    setStep(0);
    setAnswers({
      lovedIngredients: [], hatedIngredients: [], cuisineStyle: '',
      diet: '', allergies: [], goal: '', prepTime: '', equipment: [], servings: '',
    });
  };

  if (generating) return <LoadingSpinner text="L IA crée ton plan de repas..." />;
  if (result) return <MealResult result={result} onReset={reset} isGuest={isGuest} weeklyMode={weeklyMode} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-success-500 rounded-2xl flex items-center justify-center">
          <UtensilsCrossed className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Repas sains</h1>
          <p className="text-sm text-gray-500">Des menus adaptés à tes goûts et contraintes</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-3xl overflow-hidden h-32 sm:h-44">
        {MEAL_IMGS.map((img, i) => (
          <div key={i} className="overflow-hidden">
            <img src={img} alt="Repas sain" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
        <button
          onClick={() => setWeeklyMode(false)}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
            !weeklyMode ? 'bg-white text-success-700 shadow-sm' : 'text-gray-500'
          }`}
        >
          Une journée
        </button>
        <button
          onClick={() => !isGuest && setWeeklyMode(true)}
          disabled={isGuest}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
            weeklyMode ? 'bg-white text-success-700 shadow-sm' : 'text-gray-500'
          }`}
        >
          Semaine complète
          {isGuest && <Lock className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="card p-6 sm:p-8">
        <ProgressBar current={step + 1} total={STEPS} />

        <div className="mt-8 min-h-[300px]">
          {step === 0 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><ThumbsUp className="w-5 h-5 text-success-500" /> Ingrédients adorés</h3>
                <p className="text-sm text-gray-500 mb-4">Que veux-tu voir dans tes repas ?</p>
                <ChipGroup
                  options={[
                    ...COMMON_LOVED.map((i) => ({ value: i, label: i })),
                    ...answers.lovedIngredients
                      .filter((i) => !COMMON_LOVED.includes(i))
                      .map((i) => ({ value: i, label: i })),
                  ]}
                  value={answers.lovedIngredients}
                  onChange={(v) => setAnswers({ ...answers, lovedIngredients: v as string[] })}
                  multiple
                />
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={customLoved}
                    onChange={(e) => setCustomLoved(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), toggleCustom('loved', customLoved))}
                    placeholder="Ajouter un ingrédient..."
                    className="input-field flex-1 py-2"
                  />
                  <button onClick={() => toggleCustom('loved', customLoved)} className="btn-secondary py-2">+</button>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><ThumbsDown className="w-5 h-5 text-error-400" /> Ingrédients rédhibitoires</h3>
                <p className="text-sm text-gray-500 mb-4">Ce que l IA ne devra jamais proposer</p>
                <ChipGroup
                  options={[
                    ...COMMON_HATED.map((i) => ({ value: i, label: i })),
                    ...answers.hatedIngredients
                      .filter((i) => !COMMON_HATED.includes(i))
                      .map((i) => ({ value: i, label: i })),
                  ]}
                  value={answers.hatedIngredients}
                  onChange={(v) => setAnswers({ ...answers, hatedIngredients: v as string[] })}
                  multiple
                />
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={customHated}
                    onChange={(e) => setCustomHated(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), toggleCustom('hated', customHated))}
                    placeholder="Ajouter un aliment détesté..."
                    className="input-field flex-1 py-2"
                  />
                  <button onClick={() => toggleCustom('hated', customHated)} className="btn-secondary py-2">+</button>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><ChefHat className="w-5 h-5 text-accent-500" /> Style culinaire</h3>
                <ChipGroup options={CUISINES} value={answers.cuisineStyle} onChange={(v) => setAnswers({ ...answers, cuisineStyle: v as string })} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><Heart className="w-5 h-5 text-primary-400" /> Régime alimentaire</h3>
                <ChipGroup options={DIETS} value={answers.diet} onChange={(v) => setAnswers({ ...answers, diet: v as string })} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-warning-500" /> Allergies & Intolérances</h3>
                <p className="text-sm text-gray-500 mb-4">Impératif — coche tout ce qui te concerne</p>
                <ChipGroup options={ALLERGIES} value={answers.allergies} onChange={(v) => setAnswers({ ...answers, allergies: v as string[] })} multiple />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Objectif nutritionnel</h3>
                <ChipGroup options={GOALS} value={answers.goal} onChange={(v) => setAnswers({ ...answers, goal: v as string })} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><Clock className="w-5 h-5 text-secondary-400" /> Temps de préparation</h3>
                <p className="text-sm text-gray-500 mb-4">Combien de temps pour cuisiner ?</p>
                <ChipGroup options={PREP_TIMES} value={answers.prepTime} onChange={(v) => setAnswers({ ...answers, prepTime: v as string })} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><Microwave className="w-5 h-5 text-gray-500" /> Équipement de cuisine</h3>
                <p className="text-sm text-gray-500 mb-4">De quoi disposes-tu ?</p>
                <ChipGroup options={EQUIPMENT} value={answers.equipment} onChange={(v) => setAnswers({ ...answers, equipment: v as string[] })} multiple />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><Users className="w-5 h-5 text-primary-400" /> Nombre de personnes</h3>
                <ChipGroup options={SERVINGS} value={answers.servings} onChange={(v) => setAnswers({ ...answers, servings: v as string })} />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="btn-ghost disabled:opacity-30">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          {step < STEPS - 1 ? (
            <button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="btn-primary disabled:opacity-40">
              Continuer <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleGenerate} disabled={!canProceed()} className="btn-primary">
              <Sparkles className="w-5 h-5" /> Générer mes repas
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function MealResult({
  result,
  onReset,
  isGuest,
  weeklyMode,
}: {
  result: RoutineContent;
  onReset: () => void;
  isGuest: boolean;
  weeklyMode: boolean;
}) {
  const meals = result.meals ?? [];

  // Group meals by day when in weekly mode. Each meal.meal looks like
  // "Lundi - Petit-déjeuner".
  const grouped = weeklyMode
    ? meals.reduce<Record<string, typeof meals>>((acc, meal) => {
        const day = meal.meal.split(' - ')[0] ?? meal.meal;
        (acc[day] ||= []).push(meal);
        return acc;
      }, {})
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-success-500 rounded-2xl flex items-center justify-center">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {weeklyMode ? 'Ton plan repas de la semaine' : 'Ton plan repas'}
            </h1>
            <p className="text-sm text-gray-500">
              {weeklyMode ? '7 jours équilibrés, rien que pour toi' : 'Une journée équilibrée, rien que pour toi'}
            </p>
          </div>
        </div>
        <button onClick={onReset} className="btn-secondary">
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Recommencer</span>
        </button>
      </div>

      {result.diagnosis && (
        <div className="card p-6 bg-gradient-to-br from-success-50 to-primary-50 border-0">
          <div className="flex items-center gap-2 mb-2 text-success-600">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold">Résumé</span>
          </div>
          <p className="text-gray-700">{result.diagnosis}</p>
        </div>
      )}

      {weeklyMode && grouped ? (
        <div className="space-y-6">
          {DAY_NAMES.filter((d) => grouped[d]?.length).map((day) => (
            <div key={day} className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-success-500 rounded-full" />
                {day}
              </h2>
              {grouped[day].map((meal, i) => (
                <div key={i} className="card p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold px-3 py-1.5 bg-success-100 text-success-700 rounded-full">
                      {meal.meal.split(' - ')[1] ?? meal.meal}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">{meal.name}</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-400 mb-2">Ingrédients</p>
                      <div className="flex flex-wrap gap-1.5">
                        {meal.ingredients.map((ing, j) => (
                          <span key={j} className="text-xs px-2.5 py-1.5 bg-gray-50 text-gray-600 rounded-xl border border-gray-100">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-400 mb-2">Préparation</p>
                      <ol className="space-y-1.5">
                        {meal.steps.map((s, k) => (
                          <li key={k} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="w-5 h-5 bg-success-100 text-success-600 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">{k + 1}</span>
                            {s}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-success-50 rounded-2xl flex items-start gap-2">
                    <Heart className="w-4 h-4 text-success-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">{meal.benefits}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {meals.map((meal, i) => (
            <div key={i} className="card p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold px-3 py-1.5 bg-success-100 text-success-700 rounded-full">{meal.meal}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">{meal.name}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400 mb-2">Ingrédients</p>
                  <div className="flex flex-wrap gap-1.5">
                    {meal.ingredients.map((ing, j) => (
                      <span key={j} className="text-xs px-2.5 py-1.5 bg-gray-50 text-gray-600 rounded-xl border border-gray-100">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400 mb-2">Préparation</p>
                  <ol className="space-y-1.5">
                    {meal.steps.map((s, k) => (
                      <li key={k} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-5 h-5 bg-success-100 text-success-600 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">{k + 1}</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
              <div className="mt-4 p-3 bg-success-50 rounded-2xl flex items-start gap-2">
                <Heart className="w-4 h-4 text-success-500 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">{meal.benefits}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {result.tips && result.tips.length > 0 && (
        <div className="card p-6 bg-gradient-to-br from-accent-50 to-cream-100 border-0">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-success-500" /> Conseils nutrition
          </h3>
          <ul className="space-y-2.5">
            {result.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 bg-success-400 rounded-full mt-2 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isGuest && !weeklyMode && (
        <div className="card p-5 bg-gradient-to-br from-primary-50 to-success-50 border-0 text-center">
          <p className="text-gray-700 font-medium">
            Crée un compte pour générer tes repas de la semaine entière !
          </p>
        </div>
      )}
    </div>
  );
}
