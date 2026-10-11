import { useState } from 'react';
import { Droplet, RefreshCw, ArrowLeft, ArrowRight, Sun, Thermometer, Monitor, Clock, Leaf, Euro, Sparkles, Check, MessageCircle } from 'lucide-react';
import { ChipGroup } from '@/components/Chip';
import { ProgressBar } from '@/components/ProgressBar';
import { LoadingSpinner } from '@/components/Loading';
import { generateSkincareRoutine, generateAdaptiveSkincareRoutine } from '@/lib/generators';
import { aiSkincareRoutine } from '@/lib/ai-generators';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { SkincareAnswers, RoutineContent, RoutineEvaluation } from '@/lib/types';

const STEPS = 5;
const SKIN_TYPES = [
  { value: 'normale', label: 'Normale' },
  { value: 'seche', label: 'Sèche' },
  { value: 'grasse', label: 'Grasse' },
  { value: 'mixte', label: 'Mixte (T grasse, joues sèches)' },
  { value: 'sensible / reactive', label: 'Sensible / Réactive' },
];
const CONCERNS = [
  { value: 'Imperfections / Acne / Points noirs', label: 'Imperfections / Acné' },
  { value: 'Rougeurs / Couperose / Rosacee', label: 'Rougeurs / Rosacée' },
  { value: 'Deshydratation / Tiraillments', label: 'Déshydratation' },
  { value: 'Teint terne / Taches pigmentaires', label: 'Teint terne / Taches' },
  { value: 'Pores dilates / Sebum excessif', label: 'Pores dilatés' },
  { value: 'Premieres rides / Perte de fermete', label: 'Rides / Fermeté' },
];
const SENSITIVITIES = [
  { value: 'Parfums', label: 'Parfums' },
  { value: 'Huiles essentielles', label: 'Huiles essentielles' },
  { value: 'Acides forts', label: 'Acides forts' },
  { value: 'Alcool denature', label: 'Alcool dénaturé' },
  { value: 'Aucune', label: 'Aucune sensibilité' },
];
const CLIMATES = [
  { value: 'Chaud et humide', label: 'Chaud et humide' },
  { value: 'Sec', label: 'Sec' },
  { value: 'Froid', label: 'Froid' },
  { value: 'Ensoleille', label: 'Très ensoleillé' },
];
const SUN_EXPOSURE = [
  { value: 'Faible', label: 'Faible (intérieur)' },
  { value: 'Modere', label: 'Modéré (30 min/jour)' },
  { value: 'Forte exposition au soleil', label: 'Forte (>1h/jour)' },
];
const SCREEN_TIME = [
  { value: 'Moins de 2H/jour', label: '< 2h/jour' },
  { value: '2 a 6H/jour', label: '2-6h/jour' },
  { value: 'Plus de 6H/jour', label: '> 6h/jour' },
];
const AGE_RANGES = [
  { value: 'adolescent', label: 'Adolescente (puberté)' },
  { value: 'jeune adulte', label: 'Jeune adulte' },
  { value: 'mature', label: 'Peau mature' },
];
const COMMITMENT = [
  { value: 'minimaliste', label: 'Minimaliste (2-3 étapes)' },
  { value: 'standard', label: 'Standard (4-5 étapes)' },
  { value: 'expert', label: 'Expert (7-10 étapes)' },
];
const FORMULAS = [
  { value: 'Pas de preference', label: 'Pas de préférence' },
  { value: 'Produits 100% naturels/bio', label: 'Naturels / Bio' },
  { value: 'Veganes', label: 'Véganes' },
  { value: 'Cruelty-free', label: 'Cruelty-free' },
  { value: 'Dermo-cosmetiques de pharmacie', label: 'Dermo-cosmétique' },
];
const BUDGETS = [
  { value: 'Petit budget (< 10 €)', label: '< 10 €' },
  { value: 'Moyen (10-25 €)', label: '10-25 €' },
  { value: 'Haut de gamme (> 25 €)', label: '> 25 €' },
];

const FEELINGS = [
  'Ma peau va mieux',
  'Pas de changement',
  'Ma peau est pire',
  'Irritation',
  'Peau sèche',
  'Boutons',
];

const SKIN_TONES = [
  { value: 'claire', color: '#F7D9C4', label: 'Claire' },
  { value: 'claire-medium', color: '#E8C4A0', label: 'Claire-medium' },
  { value: 'medium', color: '#C99A7A', label: 'Medium' },
  { value: 'matte', color: '#A9785C', label: 'Matte' },
  { value: 'foncee', color: '#7D5239', label: 'Foncée' },
  { value: 'noire', color: '#5C3A28', label: 'Noire' },
];

const SKIN_IMG = 'https://images.pexels.com/photos/6948177/pexels-photo-6948177.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export function SkincarePage() {
  const { user, isGuest } = useAuth();
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<RoutineContent | null>(null);
  const [answers, setAnswers] = useState<SkincareAnswers>({
    skinType: '',
    skinTone: '',
    concerns: [],
    sensitivity: [],
    climate: '',
    sunExposure: '',
    screenTime: '',
    ageRange: '',
    commitmentLevel: '',
    formulaPreference: '',
    budget: '',
  });

  const canProceed = () => {
    switch (step) {
      case 0: return answers.skinTone !== '' && answers.skinType !== '' && answers.concerns.length > 0;
      case 1: return answers.sensitivity.length > 0;
      case 2: return answers.climate !== '' && answers.sunExposure !== '' && answers.screenTime !== '' && answers.ageRange !== '';
      case 3: return answers.commitmentLevel !== '';
      case 4: return answers.formulaPreference !== '' && answers.budget !== '';
      default: return false;
    }
  };

  const handleEvaluate = async (feeling: string, improvements: string, skinChanges: string) => {
    if (!user) return;
    await supabase.from('routine_evaluations').insert({
      user_id: user.id,
      routine_type: 'skincare',
      feeling,
      improvements: improvements || null,
      skin_changes: skinChanges || null,
    });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    const loggedIn = !isGuest && !!user;
    let evals: RoutineEvaluation[] = [];
    if (loggedIn) {
      const { data: evalData } = await supabase
        .from('routine_evaluations')
        .select('*')
        .eq('user_id', user.id)
        .eq('routine_type', 'skincare')
        .order('created_at', { ascending: false })
        .limit(5);
      evals = (evalData as RoutineEvaluation[]) ?? [];
    }
    const routine = await aiSkincareRoutine(answers, evals);
    setResult(routine);
    if (loggedIn && user) {
      await supabase.from('generated_routines').insert({
        user_id: user.id,
        type: 'skincare',
        content: routine,
      });
    }
    setGenerating(false);
  };

  const reset = () => {
    setResult(null);
    setStep(0);
    setAnswers({
      skinType: '', skinTone: '', concerns: [], sensitivity: [], climate: '',
      sunExposure: '', screenTime: '', ageRange: '', commitmentLevel: '',
      formulaPreference: '', budget: '',
    });
  };

  if (generating) {
    return <LoadingSpinner text="L IA crée ta routine personnalisée..." />;
  }

  if (result) {
    return (
      <SkincareResult
        result={result}
        onReset={reset}
        isGuest={isGuest}
        onEvaluate={handleEvaluate}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center">
          <Droplet className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Routine Skincare</h1>
          <p className="text-sm text-gray-500">Réponds au questionnaire pour ta routine sur-mesure</p>
        </div>
      </div>

      <div className="rounded-3xl overflow-hidden h-40 sm:h-52 relative">
        <img src={SKIN_IMG} alt="Skincare" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 to-transparent" />
        <div className="absolute bottom-4 left-5 text-white">
          <p className="text-sm font-medium opacity-90">Ta peau est unique</p>
          <p className="text-xl font-bold">Réponds honnêtement pour les meilleurs résultats</p>
        </div>
      </div>

      <div className="card p-6 sm:p-8">
        <ProgressBar current={step + 1} total={STEPS} />

        <div className="mt-8 min-h-[300px]">
          {step === 0 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Ta couleur de peau</h3>
                <p className="text-sm text-gray-500 mb-4">Choisis la teinte la plus proche de ta peau</p>
                <div className="flex flex-wrap gap-4">
                  {SKIN_TONES.map((tone) => (
                    <button
                      key={tone.value}
                      type="button"
                      onClick={() => setAnswers({ ...answers, skinTone: tone.value })}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <span
                        className={`w-12 h-12 rounded-full border-2 border-white shadow-sm transition ${
                          answers.skinTone === tone.value ? 'ring-4 ring-primary-400' : ''
                        }`}
                        style={{ backgroundColor: tone.color }}
                      />
                      <span className="text-xs text-gray-600">{tone.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Type de peau</h3>
                <p className="text-sm text-gray-500 mb-4">Comment ta peau est-elle naturellement ?</p>
                <ChipGroup options={SKIN_TYPES} value={answers.skinType} onChange={(v) => setAnswers({ ...answers, skinType: v as string })} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Préoccupations principales</h3>
                <p className="text-sm text-gray-500 mb-4">Choisis 1 à 3 préoccupations max</p>
                <ChipGroup options={CONCERNS} value={answers.concerns} onChange={(v) => setAnswers({ ...answers, concerns: v as string[] })} multiple max={3} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Sensibilité & Allergies</h3>
                <p className="text-sm text-gray-500 mb-4">À quoi ta peau réagit-elle ?</p>
                <ChipGroup options={SENSITIVITIES} value={answers.sensitivity} onChange={(v) => setAnswers({ ...answers, sensitivity: v as string[] })} multiple />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><Thermometer className="w-5 h-5 text-primary-400" /> Climat & Saison</h3>
                <p className="text-sm text-gray-500 mb-4">Dans quel climat vis-tu ?</p>
                <ChipGroup options={CLIMATES} value={answers.climate} onChange={(v) => setAnswers({ ...answers, climate: v as string })} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><Sun className="w-5 h-5 text-warning-400" /> Exposition au soleil</h3>
                <ChipGroup options={SUN_EXPOSURE} value={answers.sunExposure} onChange={(v) => setAnswers({ ...answers, sunExposure: v as string })} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><Monitor className="w-5 h-5 text-secondary-400" /> Temps sur écran</h3>
                <ChipGroup options={SCREEN_TIME} value={answers.screenTime} onChange={(v) => setAnswers({ ...answers, screenTime: v as string })} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><Clock className="w-5 h-5 text-primary-400" /> Âge</h3>
                <ChipGroup options={AGE_RANGES} value={answers.ageRange} onChange={(v) => setAnswers({ ...answers, ageRange: v as string })} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Niveau d'engagement</h3>
                <p className="text-sm text-gray-500 mb-4">Combien d'étapes es-tu prête à faire ?</p>
                <ChipGroup options={COMMITMENT} value={answers.commitmentLevel} onChange={(v) => setAnswers({ ...answers, commitmentLevel: v as string })} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><Leaf className="w-5 h-5 text-success-500" /> Préférence de formules</h3>
                <ChipGroup options={FORMULAS} value={answers.formulaPreference} onChange={(v) => setAnswers({ ...answers, formulaPreference: v as string })} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><Euro className="w-5 h-5 text-accent-500" /> Budget par produit</h3>
                <ChipGroup options={BUDGETS} value={answers.budget} onChange={(v) => setAnswers({ ...answers, budget: v as string })} />
              </div>
            </div>
          )}
        </div>

        {/* Nav buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="btn-ghost disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          {step < STEPS - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="btn-primary disabled:opacity-40"
            >
              Continuer
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={!canProceed()}
              className="btn-primary"
            >
              <Sparkles className="w-5 h-5" />
              Générer ma routine
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SkincareResult({
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
  const [skinChanges, setSkinChanges] = useState('');
  const [improvements, setImprovements] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!feeling) return;
    onEvaluate(feeling, improvements, skinChanges);
    setSubmitted(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center">
            <Droplet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Ta routine</h1>
            <p className="text-sm text-gray-500">Personnalisée par l IA selon ton profil</p>
          </div>
        </div>
        <button onClick={onReset} className="btn-secondary">
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Recommencer</span>
        </button>
      </div>

      {/* Diagnosis */}
      <div className="card p-6 bg-gradient-to-br from-primary-50 to-secondary-50 border-0">
        <div className="flex items-center gap-2 mb-2 text-primary-600">
          <Sparkles className="w-5 h-5" />
          <span className="font-bold">Diagnostic</span>
        </div>
        <p className="text-gray-700 leading-relaxed">{result.diagnosis}</p>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {result.steps?.map((step, i) => (
          <div key={i} className="card p-5 hover:scale-[1.01] transition-transform">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center font-bold shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-800">{step.name}</h3>
                  <span className="text-xs px-2.5 py-1 bg-primary-50 text-primary-600 rounded-full font-medium">
                    {step.timing}
                  </span>
                </div>
                <p className="font-medium text-primary-600 mb-1">{step.product}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      {result.tips && result.tips.length > 0 && (
        <div className="card p-6 bg-gradient-to-br from-accent-50 to-cream-100 border-0">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-success-500" />
            Conseils bonus
          </h3>
          <ul className="space-y-2.5">
            {result.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-2 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Evaluation */}
      {isGuest ? (
        <div className="card p-6 bg-gradient-to-br from-secondary-50 to-cream-100 border-0">
          <div className="flex items-center gap-2 mb-2 text-secondary-600">
            <MessageCircle className="w-5 h-5" />
            <span className="font-bold">Suis l'évolution de ta peau</span>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Crée un compte pour suivre l'évolution de ta peau et adapter ta routine
          </p>
        </div>
      ) : (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary-500" />
            Comment va ta peau ?
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Ton retour aide à adapter ta prochaine routine
          </p>

          {submitted ? (
            <div className="rounded-2xl bg-success-50 p-4 text-success-700 flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="font-medium">Merci ! Ton retour a été enregistré.</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Comment te sens-tu ?</p>
                <div className="flex flex-wrap gap-2">
                  {FEELINGS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFeeling(f)}
                      className={`px-3.5 py-2 rounded-full text-sm font-medium border transition ${
                        feeling === f
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Qu'est-ce qui a changé ?
                </label>
                <textarea
                  value={skinChanges}
                  onChange={(e) => setSkinChanges(e.target.value)}
                  rows={3}
                  placeholder="Ex : moins de rougeurs, peau plus lisse..."
                  className="w-full rounded-2xl border border-gray-200 p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Qu'est-ce qu'on pourrait améliorer ?
                </label>
                <textarea
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  rows={3}
                  placeholder="Ex : étapes trop longues, produit qui pique..."
                  className="w-full rounded-2xl border border-gray-200 p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!feeling}
                className="btn-primary disabled:opacity-40 w-full sm:w-auto"
              >
                <Sparkles className="w-4 h-4" />
                Envoyer mon retour
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
