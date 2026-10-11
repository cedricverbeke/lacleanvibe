import { useState } from 'react';
import { Calculator, Heart, TrendingUp, Info, Sparkles } from 'lucide-react';

const CENTILE_LABELS: Record<string, string> = {
  under3: 'En dessous du 3e percentile',
  '3to15': 'Entre le 3e et le 15e percentile',
  '15to85': 'Entre le 15e et le 85e percentile',
  '85to97': 'Entre le 85e et le 97e percentile',
  over97: 'Au-dessus du 97e percentile',
};

const CENTILE_COLORS: Record<string, string> = {
  under3: 'from-warning-100 to-warning-50 text-warning-700',
  '3to15': 'from-accent-100 to-accent-50 text-accent-700',
  '15to85': 'from-success-100 to-success-50 text-success-700',
  '85to97': 'from-accent-100 to-accent-50 text-accent-700',
  over97: 'from-warning-100 to-warning-50 text-warning-700',
};

const CENTILE_ADVICE: Record<string, string> = {
  under3: 'Ta corpulence est en dessous de la moyenne pour ton âge. Pendant la croissance, le corps change vite — parles-en à un médecin si tu te sens fatiguée ou si tu as des questions sur ton alimentation.',
  '3to15': 'Ta corpulence est dans la partie basse de la moyenne. C est normal ! L important est de bien manger, de bouger et de te sentir en forme.',
  '15to85': 'Ta corpulence est dans la moyenne pour ton âge et ton sexe. C est parfait ! Continue à prendre soin de toi.',
  '85to97': 'Ta corpulence est dans la partie haute de la moyenne. Pendant la puberté, le corps prend des formes : c est normal et sain. Bouge, mange équilibré et sois bienveillante avec toi-même.',
  over97: 'Ta corpulence est au-dessus de la moyenne. N oublie pas : le chiffre ne définit pas ta valeur. Bouger régulièrement et manger varié sont les clés. En parle à un médecin pour un accompagnement adapté.',
};

// Approximated IOTF cut-offs for BMI in adolescents (simplified for ages 10-18)
// Returns centile category based on age, sex, and BMI
function getBMICategory(age: number, sex: 'F' | 'M', bmi: number): string {
  // IOTF cut-off points (simplified, approximate)
  // Thinness grade 2 (under3): ~16 at age 10, ~16.5 at 18
  // Overweight (85+): ~21 at age 10, ~25 at 18 for females
  // Obesity (97+): ~24 at age 10, ~30 at 18 for females
  const femaleCutoffs = [
    { age: 10, under3: 14.2, p15: 15.0, p85: 20.1, p97: 23.0 },
    { age: 11, under3: 14.5, p15: 15.4, p85: 20.8, p97: 24.1 },
    { age: 12, under3: 14.8, p15: 15.8, p85: 21.6, p97: 25.2 },
    { age: 13, under3: 15.2, p15: 16.3, p85: 22.5, p97: 26.3 },
    { age: 14, under3: 15.7, p15: 16.8, p85: 23.2, p97: 27.3 },
    { age: 15, under3: 16.2, p15: 17.2, p85: 23.8, p97: 28.2 },
    { age: 16, under3: 16.5, p15: 17.6, p85: 24.2, p97: 28.9 },
    { age: 17, under3: 16.8, p15: 17.9, p85: 24.5, p97: 29.4 },
    { age: 18, under3: 17.0, p15: 18.2, p85: 24.8, p97: 29.8 },
  ];

  const maleCutoffs = [
    { age: 10, under3: 14.2, p15: 15.0, p85: 19.4, p97: 22.2 },
    { age: 11, under3: 14.5, p15: 15.3, p85: 19.8, p97: 22.7 },
    { age: 12, under3: 14.8, p15: 15.6, p85: 20.2, p97: 23.3 },
    { age: 13, under3: 15.2, p15: 16.0, p85: 20.7, p97: 24.0 },
    { age: 14, under3: 15.6, p15: 16.5, p85: 21.3, p97: 24.8 },
    { age: 15, under3: 16.0, p15: 16.9, p85: 21.9, p97: 25.6 },
    { age: 16, under3: 16.4, p15: 17.4, p85: 22.5, p97: 26.4 },
    { age: 17, under3: 16.8, p15: 17.8, p85: 23.1, p97: 27.2 },
    { age: 18, under3: 17.2, p15: 18.2, p85: 23.6, p97: 27.8 },
  ];

  const cutoffs = sex === 'F' ? femaleCutoffs : maleCutoffs;
  const clampedAge = Math.max(10, Math.min(18, Math.round(age)));
  const row = cutoffs.find((r) => r.age === clampedAge) ?? cutoffs[cutoffs.length - 1];

  if (bmi < row.under3) return 'under3';
  if (bmi < row.p15) return '3to15';
  if (bmi < row.p85) return '15to85';
  if (bmi < row.p97) return '85to97';
  return 'over97';
}

export function BmiPage() {
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'F' | 'M'>('F');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState<{ bmi: number; category: string } | null>(null);

  const calculate = () => {
    const a = parseFloat(age);
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (!a || !w || !h || h <= 0) return;
    const bmi = w / (h * h);
    const category = getBMICategory(a, sex, bmi);
    setResult({ bmi: Math.round(bmi * 10) / 10, category });
  };

  const reset = () => {
    setResult(null);
    setAge('');
    setWeight('');
    setHeight('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-warning-500 rounded-2xl flex items-center justify-center">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Calculateur d'IMC</h1>
          <p className="text-sm text-gray-500">Spécial adolescentes — avec courbes de corpulence</p>
        </div>
      </div>

      {/* Warning */}
      <div className="card p-5 bg-gradient-to-r from-accent-50 to-warning-50 border-0">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong>Info importante :</strong> Chez les adolescentes en pleine croissance, l'IMC adulte classique ne s'applique pas directement ! On utilise les courbes de corpulence pédiatriques (centiles selon l'âge exact et le sexe). Le corps change très vite pendant la puberté : prendre des formes ou grandir d'un coup est totalement normal.
          </p>
        </div>
      </div>

      {!result ? (
        <div className="card p-6 sm:p-8">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Je suis</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setSex('F')}
                  className={`flex-1 py-4 rounded-2xl font-semibold transition-all ${sex === 'F' ? 'bg-primary-500 text-white shadow-md' : 'bg-gray-50 text-gray-500'}`}
                >
                  Une fille
                </button>
                <button
                  onClick={() => setSex('M')}
                  className={`flex-1 py-4 rounded-2xl font-semibold transition-all ${sex === 'M' ? 'bg-secondary-500 text-white shadow-md' : 'bg-gray-50 text-gray-500'}`}
                >
                  Un garçon
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Âge (10-18 ans)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Ex: 14"
                min={10}
                max={18}
                className="input-field"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Poids (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Ex: 52"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Taille (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Ex: 160"
                  className="input-field"
                />
              </div>
            </div>

            <button onClick={calculate} className="btn-primary w-full text-lg py-4">
              <Sparkles className="w-5 h-5" />
              Calculer ma corpulence
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5 animate-fade-in">
          <div className={`card p-8 bg-gradient-to-br ${CENTILE_COLORS[result.category]} border-0 text-center`}>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/60 rounded-full mb-4">
              <TrendingUp className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium opacity-80 mb-1">Ton IMC</p>
            <p className="text-5xl font-bold mb-3">{result.bmi}</p>
            <p className="text-lg font-bold mb-2">{CENTILE_LABELS[result.category]}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">
                {CENTILE_ADVICE[result.category]}
              </p>
            </div>
          </div>

          <div className="card p-5 bg-gradient-to-r from-primary-50 to-secondary-50 border-0">
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>Rappelle-toi :</strong> Un chiffre ne définit pas ta valeur ! Pendant la puberté, ton corps se transforme. L important c'est de te sentir en forme, de bouger, de bien manger et d'être bienveillante avec toi-même. Si tu as des doutes, parle-en à un médecin ou un adulte de confiance.
            </p>
          </div>

          <button onClick={reset} className="btn-secondary w-full">
            Recalculer
          </button>
        </div>
      )}
    </div>
  );
}
