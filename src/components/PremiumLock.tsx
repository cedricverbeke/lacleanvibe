import { Lock, Sparkles, ArrowRight } from 'lucide-react';

interface PremiumLockProps {
  title: string;
  description: string;
  onUpgrade: () => void;
}

export function PremiumLock({ title, description, onUpgrade }: PremiumLockProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-20 h-20 bg-gradient-to-br from-primary-200 to-primary-400 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
        <Lock className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">{title}</h2>
      <p className="text-gray-500 max-w-md mb-8 leading-relaxed">{description}</p>
      <button onClick={onUpgrade} className="btn-primary text-lg px-8 py-4">
        <Sparkles className="w-5 h-5" />
        Créer un compte gratuit
        <ArrowRight className="w-4 h-4" />
      </button>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg">
        {[
          'Routines adaptatives',
          'Repas de la semaine',
          'Suivi sauvegardé',
        ].map((feat) => (
          <div key={feat} className="px-4 py-3 bg-white rounded-2xl text-sm font-medium text-gray-600 shadow-sm">
            {feat}
          </div>
        ))}
      </div>
    </div>
  );
}
