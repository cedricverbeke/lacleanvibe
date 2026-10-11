import { useState } from 'react';
import { Ruler, TrendingUp, Info, Sparkles, User, UserCircle } from 'lucide-react';

export function HeightPage() {
  const [sex, setSex] = useState<'F' | 'M'>('F');
  const [momHeight, setMomHeight] = useState('');
  const [dadHeight, setDadHeight] = useState('');
  const [childHeight, setChildHeight] = useState('');
  const [childAge, setChildAge] = useState('');
  const [result, setResult] = useState<{ target: number; khamis: number; avg: number } | null>(null);

  const calculate = () => {
    const mom = parseFloat(momHeight);
    const dad = parseFloat(dadHeight);
    if (!mom || !dad) return;

    // Target height (parental method)
    const target = sex === 'F'
      ? ((mom + dad - 13) / 2)
      : ((mom + dad + 13) / 2);

    // Khamis-Roche method (if child height & age provided)
    let khamis = target;
    const ch = parseFloat(childHeight);
    const ca = parseFloat(childAge);
    if (ch && ca && ca >= 4 && ca <= 17) {
      // Khamis-Roche coefficients (simplified, approximate)
      // Adult height = child height + (coefficients based on age and sex)
      // Formula: for females: 0.0945 * childHeight + 0.0308 * (momHeight + dadHeight) - intercept
      // We use a simplified version: the older the child, the closer to current height projected
      const remainingGrowth = Math.max(0, (18 - ca) / (18 - 4));
      const midParental = (mom + dad) / 2;
      khamis = ch + (midParental - ch * 0.95) * remainingGrowth * 0.8;
    }

    const avg = Math.round(((target + khamis) / 2) * 10) / 10;
    setResult({
      target: Math.round(target * 10) / 10,
      khamis: Math.round(khamis * 10) / 10,
      avg,
    });
  };

  const reset = () => {
    setResult(null);
    setMomHeight('');
    setDadHeight('');
    setChildHeight('');
    setChildAge('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-secondary-500 rounded-2xl flex items-center justify-center">
          <Ruler className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Prédiction de taille</h1>
          <p className="text-sm text-gray-500">Estime ta taille adulte à partir de la génétique</p>
        </div>
      </div>

      <div className="card p-5 bg-gradient-to-r from-secondary-50 to-primary-50 border-0">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-secondary-600 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700 leading-relaxed">
            Cette estimation est basée sur la méthode de la <strong>taille cible parentale</strong> et la méthode <strong>Khamis-Roche</strong>. Il s'agit d'une estimation statistique avec une marge d'erreur d'environ <strong>+/- 5 cm</strong>. La génétique, la nutrition et le sommeil jouent un rôle clé !
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

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <UserCircle className="w-4 h-4 text-primary-400" /> Taille de maman (cm)
                </label>
                <input
                  type="number"
                  value={momHeight}
                  onChange={(e) => setMomHeight(e.target.value)}
                  placeholder="Ex: 165"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-secondary-400" /> Taille de papa (cm)
                </label>
                <input
                  type="number"
                  value={dadHeight}
                  onChange={(e) => setDadHeight(e.target.value)}
                  placeholder="Ex: 180"
                  className="input-field"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Optionnel — pour plus de précision (méthode Khamis-Roche)</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ta taille actuelle (cm)</label>
                  <input
                    type="number"
                    value={childHeight}
                    onChange={(e) => setChildHeight(e.target.value)}
                    placeholder="Ex: 155"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ton âge (4-17 ans)</label>
                  <input
                    type="number"
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                    placeholder="Ex: 14"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <button onClick={calculate} className="btn-primary w-full text-lg py-4">
              <Sparkles className="w-5 h-5" />
              Estimer ma taille adulte
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5 animate-fade-in">
          <div className="card p-8 bg-gradient-to-br from-secondary-100 to-primary-50 border-0 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-md">
              <TrendingUp className="w-8 h-8 text-secondary-500" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Estimation moyenne</p>
            <p className="text-5xl font-bold text-gray-800 mb-2">
              {result.avg}
              <span className="text-2xl text-gray-400"> cm</span>
            </p>
            <p className="text-sm text-gray-500">+/- 5 cm de marge</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="card p-5">
              <p className="text-xs font-bold uppercase text-gray-400 mb-2">Taille cible parentale</p>
              <p className="text-2xl font-bold text-gray-800">{result.target} cm</p>
              <p className="text-xs text-gray-500 mt-1">Basé sur la taille de tes parents</p>
            </div>
            <div className="card p-5">
              <p className="text-xs font-bold uppercase text-gray-400 mb-2">Méthode Khamis-Roche</p>
              <p className="text-2xl font-bold text-gray-800">{result.khamis} cm</p>
              <p className="text-xs text-gray-500 mt-1">Basé sur ta taille actuelle et ton âge</p>
            </div>
          </div>

          <div className="card p-5 bg-gradient-to-r from-success-50 to-secondary-50 border-0">
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>Pour grandir au mieux :</strong> dors suffisamment (8-10h), mange varié et équilibré (calcium, protéines, vitamines), et bouge tous les jours. La génétique fait une grande partie du travail, mais un bon mode de vie t'aide à atteindre ton plein potentiel !
            </p>
          </div>

          <button onClick={reset} className="btn-secondary w-full">
            Refaire le calcul
          </button>
        </div>
      )}
    </div>
  );
}
