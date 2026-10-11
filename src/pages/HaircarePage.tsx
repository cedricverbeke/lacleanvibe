import { useState } from 'react';
import { Scissors, RefreshCw, ArrowLeft, ArrowRight, Sparkles, Check, Droplet, FlaskConical, Wind, Layers, MessageSquare, UserPlus } from 'lucide-react';
import { ChipGroup } from '@/components/Chip';
import { ProgressBar } from '@/components/ProgressBar';
import { LoadingSpinner } from '@/components/Loading';
import { generateHaircareRoutine, generateAdaptiveHaircareRoutine } from '@/lib/generators';
import { aiHaircareRoutine } from '@/lib/ai-generators';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { HaircareAnswers, RoutineContent, RoutineEvaluation } from '@/lib/types';

const STEPS = 5;

const HAIR_TYPES = [
  { value: 'Type 1 : Raides / Lisses', label: 'Type 1 : Raides / Lisses' },
  { value: 'Type 2 : Ondules (2A, 2B, 2C)', label: 'Type 2 : Ondulés' },
  { value: 'Type 3 : Boucles (3A, 3B, 3C)', label: 'Type 3 : Bouclés' },
  { value: 'Type 4 : Crepus / Fries (4A, 4B, 4C)', label: 'Type 4 : Crépus / Frisés' },
];
const THICKNESS = [
  { value: 'Fins', label: 'Fins' },
  { value: 'Moyens', label: 'Moyens' },
  { value: 'Epais / drus', label: 'Épais / drus' },
];
const POROSITY = [
  { value: 'Faible porosite', label: 'Faible (produits restent en surface)' },
  { value: 'Porosite moyenne', label: 'Moyenne (équilibre)' },
  { value: 'Forte porosite', label: 'Forte (absorbe vite, sèche vite)' },
];
const SCALP = [
  { value: 'gras', label: 'Gras' },
  { value: 'normal', label: 'Normal' },
  { value: 'sec', label: 'Sec' },
  { value: 'sujet aux pellicules', label: 'Pellicules' },
  { value: 'irrite / demangeaisons', label: 'Irrité / Démangeaisons' },
];
const DENSITY = [
  { value: 'Masse importante', label: 'Masse importante' },
  { value: 'Normal', label: 'Normal' },
  { value: 'Cheveux clairsemes', label: 'Clairsemés' },
  { value: 'Perte de cheveux', label: 'Perte de cheveux' },
];
const TREATMENTS = [
  { value: 'naturels', label: 'Naturels (sans traitement)' },
  { value: 'colores', label: 'Colorés' },
  { value: 'decolores', label: 'Décolorés' },
  { value: 'lisses chimiquement', label: 'Lissés chimiquement' },
  { value: 'defrises', label: 'Défrisés' },
];
const STYLING = [
  { value: 'Lisseur / fer a boucler regulier', label: 'Lisseur / Fer à boucler' },
  { value: 'Seche-cheveux regulier', label: 'Sèche-cheveux' },
  { value: 'Sechage a l air libre', label: 'Séchage à l air libre' },
];
const GOALS = [
  { value: 'Definir les boucles', label: 'Définir les boucles' },
  { value: 'Apporter du volume', label: 'Volume' },
  { value: 'Dompter les frisottis', label: 'Dompter les frisottis' },
  { value: 'Reparer la casse', label: 'Réparer la casse' },
  { value: 'Stimuler la pousse', label: 'Stimuler la pousse' },
];
const ROUTINE_PREF = [
  { value: 'Routine minimaliste', label: 'Minimaliste (shampoing + après-shampoing)' },
  { value: 'Routine complete', label: 'Complète (bain d huile, masque, leave-in, gelée)' },
];

const HAIR_IMG = 'https://images.pexels.com/photos/7382931/pexels-photo-7382931.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const FEELING_OPTIONS = [
  { value: 'Mes cheveux vont mieux', label: 'Mes cheveux vont mieux' },
  { value: 'Pas de changement', label: 'Pas de changement' },
  { value: 'Cheveux secs', label: 'Cheveux secs' },
  { value: 'Cuir chevelu irrité', label: 'Cuir chevelu irrité' },
  { value: 'Casse', label: 'Casse' },
  { value: 'Frisottis', label: 'Frisottis' },
];

export function HaircarePage() {
  const { user, isGuest } = useAuth();
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<RoutineContent | null>(null);
  const [answers, setAnswers] = useState<HaircareAnswers>({
    hairType: '', hairThickness: '', porosity: '', scalpCondition: '',
    hairDensity: '', chemicalTreatments: [], stylingHabits: [],
    mainGoal: '', routinePreference: '',
  });

  const canProceed = () => {
    switch (step) {
      case 0: return answers.hairType !== '' && answers.hairThickness !== '';
      case 1: return answers.porosity !== '';
      case 2: return answers.scalpCondition !== '' && answers.hairDensity !== '';
      case 3: return answers.chemicalTreatments.length > 0 && answers.stylingHabits.length > 0;
      case 4: return answers.mainGoal !== '' && answers.routinePreference !== '';
      default: return false;
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    let evals: RoutineEvaluation[] = [];
    if (user) {
      const { data: evalData } = await supabase
        .from('routine_evaluations')
        .select('*')
        .eq('user_id', user.id)
        .eq('routine_type', 'haircare')
        .order('created_at', { ascending: false })
        .limit(5);
      evals = (evalData as RoutineEvaluation[]) ?? [];
    }
    const routine = await aiHaircareRoutine(answers, evals);
    if (user) {
      await supabase.from('generated_routines').insert({
        user_id: user.id,
        type: 'haircare',
        content: routine,
      });
    }
    setResult(routine);
    setGenerating(false);
  };

  const handleEvaluate = async (feeling: string, improvements: string, skinChanges: string) => {
    if (!user) return;
    await supabase.from('routine_evaluations').insert({
      user_id: user.id,
      routine_type: 'haircare',
      feeling,
      improvements: improvements || null,
      skin_changes: skinChanges || null,
    });
  };

  const reset = () => {
    setResult(null);
    setStep(0);
    setAnswers({
      hairType: '', hairThickness: '', porosity: '', scalpCondition: '',
      hairDensity: '', chemicalTreatments: [], stylingHabits: [],
      mainGoal: '', routinePreference: '',
    });
  };

  if (generating) return <LoadingSpinner text="L IA crée ta routine cheveux..." />;
  if (result) return <HaircareResult result={result} onReset={reset} isGuest={isGuest} onEvaluate={handleEvaluate} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-secondary-500 rounded-2xl flex items-center justify-center">
          <Scissors className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Routine Haircare</h1>
          <p className="text-sm text-gray-500">Pour ta texture, ta porosité et tes objectifs</p>
        </div>
      </div>

      <div className="rounded-3xl overflow-hidden h-40 sm:h-52 relative">
        <img src={HAIR_IMG} alt="Haircare" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/60 to-transparent" />
        <div className="absolute bottom-4 left-5 text-white">
          <p className="text-sm font-medium opacity-90">Chaque cheveu est unique</p>
          <p className="text-xl font-bold">La porosité est le critère le plus important</p>
        </div>
      </div>

      <div className="card p-6 sm:p-8">
        <ProgressBar current={step + 1} total={STEPS} />

        <div className="mt-8 min-h-[300px]">
          {step === 0 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><Layers className="w-5 h-5 text-secondary-400" /> Classification de Walker</h3>
                <p className="text-sm text-gray-500 mb-4">Quel est ton type de cheveux ?</p>
                <ChipGroup options={HAIR_TYPES} value={answers.hairType} onChange={(v) => setAnswers({ ...answers, hairType: v as string })} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Épaisseur du brin</h3>
                <ChipGroup options={THICKNESS} value={answers.hairThickness} onChange={(v) => setAnswers({ ...answers, hairThickness: v as string })} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><FlaskConical className="w-5 h-5 text-secondary-400" /> Porosité</h3>
                <p className="text-sm text-gray-500 mb-4">Comment tes cheveux absorbent-ils l humidité ? (Critère n°1 !)</p>
                <ChipGroup options={POROSITY} value={answers.porosity} onChange={(v) => setAnswers({ ...answers, porosity: v as string })} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><Droplet className="w-5 h-5 text-secondary-400" /> État du cuir chevelu</h3>
                <ChipGroup options={SCALP} value={answers.scalpCondition} onChange={(v) => setAnswers({ ...answers, scalpCondition: v as string })} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><Wind className="w-5 h-5 text-secondary-400" /> Densité / Volume</h3>
                <ChipGroup options={DENSITY} value={answers.hairDensity} onChange={(v) => setAnswers({ ...answers, hairDensity: v as string })} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Traitements chimiques</h3>
                <p className="text-sm text-gray-500 mb-4">Tes cheveux ont-ils été traités ?</p>
                <ChipGroup options={TREATMENTS} value={answers.chemicalTreatments} onChange={(v) => setAnswers({ ...answers, chemicalTreatments: v as string[] })} multiple />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Habitudes de coiffage</h3>
                <ChipGroup options={STYLING} value={answers.stylingHabits} onChange={(v) => setAnswers({ ...answers, stylingHabits: v as string[] })} multiple />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Objectif principal</h3>
                <ChipGroup options={GOALS} value={answers.mainGoal} onChange={(v) => setAnswers({ ...answers, mainGoal: v as string })} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Format de routine</h3>
                <ChipGroup options={ROUTINE_PREF} value={answers.routinePreference} onChange={(v) => setAnswers({ ...answers, routinePreference: v as string })} />
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
              <Sparkles className="w-5 h-5" /> Générer ma routine
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function HaircareResult({
  result,
  onReset,
  isGuest,
  onEvaluate,
}: {
  result: RoutineContent;
  onReset: () => void;
  isGuest: boolean;
  onEvaluate: (feeling: string, improvements: string, skinChanges: string) => void;
}) {
  const [feeling, setFeeling] = useState('');
  const [improvements, setImprovements] = useState('');
  const [skinChanges, setSkinChanges] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    onEvaluate(feeling, improvements, skinChanges);
    setSubmitted(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-secondary-500 rounded-2xl flex items-center justify-center">
            <Scissors className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Ta routine cheveux</h1>
            <p className="text-sm text-gray-500">Sur-mesure selon ta texture et porosité</p>
          </div>
        </div>
        <button onClick={onReset} className="btn-secondary">
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Recommencer</span>
        </button>
      </div>

      {result.diagnosis && (
        <div className="card p-6 bg-gradient-to-br from-secondary-50 to-primary-50 border-0">
          <div className="flex items-center gap-2 mb-2 text-secondary-600">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold">Diagnostic</span>
          </div>
          <p className="text-gray-700">{result.diagnosis}</p>
        </div>
      )}

      <div className="space-y-3">
        {result.steps?.map((step, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-secondary-100 text-secondary-600 rounded-2xl flex items-center justify-center font-bold shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-800">{step.name}</h3>
                  <span className="text-xs px-2.5 py-1 bg-secondary-50 text-secondary-600 rounded-full font-medium">
                    {step.timing}
                  </span>
                </div>
                <p className="font-medium text-secondary-600 mb-1">{step.product}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {result.deepCare && (
        <div className="card p-6 bg-gradient-to-br from-accent-50 to-secondary-50 border-0">
          <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-accent-500" /> Soin profond hebdomadaire
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">{result.deepCare}</p>
        </div>
      )}

      {result.tips && result.tips.length > 0 && (
        <div className="card p-6 bg-gradient-to-br from-cream-100 to-secondary-50 border-0">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-success-500" /> Conseils bonus
          </h3>
          <ul className="space-y-2.5">
            {result.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 bg-secondary-400 rounded-full mt-2 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isGuest ? (
        <div className="card p-6 bg-gradient-to-br from-primary-50 to-secondary-50 border-0 text-center">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <p className="font-bold text-gray-800 mb-1">Crée un compte pour suivre l'évolution de tes cheveux et adapter ta routine</p>
          <p className="text-sm text-gray-500">Tes retours permettent à l'IA d'ajuster ta routine au fil du temps</p>
        </div>
      ) : (
        <div className="card p-6 bg-gradient-to-br from-cream-100 to-secondary-50 border-0">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-secondary-500" /> Comment vont tes cheveux ?
          </h3>

          {submitted ? (
            <div className="flex items-center gap-2.5 text-sm text-success-600 bg-success-50 rounded-2xl p-4">
              <Check className="w-5 h-5 shrink-0" />
              <span className="font-medium">Merci pour ton retour ! Ta routine s'adaptera à ta prochaine génération.</span>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Comment te sens-tu ?</p>
                <ChipGroup options={FEELING_OPTIONS} value={feeling} onChange={(v) => setFeeling(v as string)} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Qu'est-ce qui a changé ?</label>
                <textarea
                  value={skinChanges}
                  onChange={(e) => setSkinChanges(e.target.value)}
                  placeholder="Texture, brillance, longueur, pousse..."
                  rows={3}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary-300 resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Qu'est-ce qu'on pourrait améliorer ?</label>
                <textarea
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  placeholder="Produits trop lourds, démangeaisons, manque d'hydratation..."
                  rows={3}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary-300 resize-none"
                />
              </div>

              <button onClick={handleSubmit} disabled={!feeling} className="btn-primary disabled:opacity-40">
                <MessageSquare className="w-4 h-4" /> Envoyer mon retour
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
