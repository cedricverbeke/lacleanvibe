import { useState } from 'react';
import { Sparkles, Heart, Mail, Lock, User, Cake, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function AuthPage() {
  const { signIn, signUp, continueAsGuest } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signup') {
      if (!pseudo.trim()) {
        setError('Choisis un pseudo pour te protéger l identité');
        setLoading(false);
        return;
      }
      if (!birthYear || parseInt(birthYear) < 1990 || parseInt(birthYear) > 2018) {
        setError('Indique une année de naissance valide');
        setLoading(false);
        return;
      }
      if (!consent) {
        setError('L accord parental est requis si tu as moins de 15 ans');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, pseudo, parseInt(birthYear), consent);
      if (error) setError(error);
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel — hero */}
      <div className="lg:w-1/2 bg-gradient-to-br from-primary-400 via-primary-500 to-secondary-500 p-8 lg:p-16 flex flex-col justify-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent-300/20 rounded-full translate-y-1/3 blur-2xl" />

        <div className="relative z-10 max-w-md mx-auto lg:mx-0">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-bold font-display">Clean Vibe</h1>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold font-display mb-6 leading-tight">
            Ta beauté, ton bien-être, ta façon
          </h2>
          <p className="text-lg text-white/90 mb-10 leading-relaxed">
            Crée ta routine skincare, tes repas healthy et tes soins cheveux sur-mesure, boostés par l IA. Pensé pour toi, pensé pour ta peau.
          </p>

          <div className="space-y-4">
            {[
              { icon: Sparkles, text: 'Routines skincare personnalisées selon ta peau' },
              { icon: Heart, text: 'Menus healthy adaptés à tes goûts et contraintes' },
              { icon: ShieldCheck, text: 'Tes données sont privées, jamais partagées' },
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <feat.icon className="w-5 h-5" />
                </div>
                <span className="text-white/90">{feat.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex items-center justify-center bg-cream-50">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex gap-2 p-1 bg-white rounded-full shadow-sm mb-6 w-fit">
              <button
                onClick={() => { setMode('signup'); setError(null); }}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${mode === 'signup' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500'}`}
              >
                Créer un compte
              </button>
              <button
                onClick={() => { setMode('signin'); setError(null); }}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${mode === 'signin' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500'}`}
              >
                Se connecter
              </button>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {mode === 'signup' ? 'Bienvenue dans la communauté !' : 'Contente de te revoir !'}
            </h2>
            <p className="text-gray-500">
              {mode === 'signup'
                ? 'Crée ton compte pour accéder à tous les outils'
                : 'Connecte-toi pour retrouver tes routines'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ton pseudo (pas ton vrai nom !)"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    className="input-field pl-12"
                    maxLength={20}
                  />
                </div>
                <div className="relative">
                  <Cake className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    placeholder="Année de naissance (ex: 2010)"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className="input-field pl-12"
                    min={1990}
                    max={2018}
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field pl-12"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Mot de passe (min. 6 caractères)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input-field pl-12"
              />
            </div>

            {mode === 'signup' && (
              <label className="flex items-start gap-3 p-4 bg-primary-50 rounded-2xl cursor-pointer hover:bg-primary-100 transition-colors">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 w-5 h-5 accent-primary-500 rounded-lg shrink-0"
                />
                <span className="text-sm text-gray-600 leading-relaxed">
                  Si j ai moins de 15 ans, j ai l accord de mes parents pour utiliser cette application. Mes données de santé restent privées et ne seront jamais partagées.
                </span>
              </label>
            )}

            {error && (
              <div className="p-3 bg-error-50 border border-error-200 rounded-2xl text-error-700 text-sm font-medium">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full text-lg py-4">
              {loading ? 'Patience...' : mode === 'signup' ? 'C est parti !' : 'Connexion'}
            </button>
          </form>

          <button
            type="button"
            onClick={continueAsGuest}
            className="mt-4 w-full py-3 text-sm font-medium text-gray-500 hover:text-primary-500 transition-colors"
          >
            Continuer sans compte (version gratuite)
          </button>

          {/* Free vs. account comparison */}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-4">
              Version gratuite ou compte ?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-cream-100 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">
                  Version gratuite
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                    <span>1 routine skincare</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                    <span>1 routine cheveux</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                    <span>1 journée de repas</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-xl bg-primary-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-primary-500 mb-3">
                  Avec un compte
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                    <span>Routines adaptatives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                    <span>Repas de la semaine</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                    <span>Suivi de cycle</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                    <span>Suivi santé</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                    <span>Historique sauvegardé</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            En t inscrivant, tu acceptes que tes données soient stockées de façon sécurisée et confidentielle.
          </p>
        </div>
      </div>
    </div>
  );
}
