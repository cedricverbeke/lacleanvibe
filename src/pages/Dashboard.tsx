import {
  Droplet, UtensilsCrossed, Scissors, Heart, Calculator, Ruler, Calendar,
  ArrowRight, Sparkles, Flower2, Activity, Lock, Camera, Brain,
} from 'lucide-react';
import type { PageId } from '@/components/AppLayout';
import { useAuth } from '@/lib/auth';

interface DashboardProps {
  onNavigate: (page: PageId) => void;
  onUpgrade: () => void;
}

interface FeatureCard {
  id: PageId;
  title: string;
  desc: string;
  icon: typeof Droplet;
  gradient: string;
  iconBg: string;
  premium?: boolean;
}

const SECTIONS: { name: string; icon: typeof Droplet; accent: string; cardGradient: string; features: FeatureCard[] }[] = [
  {
    name: 'Routines',
    icon: Sparkles,
    accent: 'text-primary-600',
    cardGradient: 'from-primary-50 to-primary-100/60',
    features: [
      {
        id: 'skincare',
        title: 'Ma routine Skincare',
        desc: 'Routine sur-mesure pour ta peau, adaptée à ton teint',
        icon: Droplet,
        gradient: '',
        iconBg: 'bg-primary-500',
      },
      {
        id: 'meals',
        title: 'Mes repas sains',
        desc: 'Menus personnalisés selon tes goûts et allergies',
        icon: UtensilsCrossed,
        gradient: '',
        iconBg: 'bg-success-500',
      },
      {
        id: 'haircare',
        title: 'Mes soins cheveux',
        desc: 'Routine coiffure adaptée à ta texture et porosité',
        icon: Scissors,
        gradient: '',
        iconBg: 'bg-secondary-500',
      },
    ],
  },
  {
    name: 'Bien-être',
    icon: Heart,
    accent: 'text-secondary-600',
    cardGradient: 'from-secondary-50 to-secondary-100/60',
    features: [
      {
        id: 'periods',
        title: 'Comprendre mes règles',
        desc: 'Tout savoir sur les règles, sans tabou',
        icon: Heart,
        gradient: '',
        iconBg: 'bg-primary-400',
      },
      {
        id: 'mental',
        title: 'Santé mentale',
        desc: 'Anti-overthinking, check-in IA, défis et journal des victoires',
        icon: Brain,
        gradient: '',
        iconBg: 'bg-secondary-500',
      },
      {
        id: 'cycle',
        title: 'Suivi de mon cycle',
        desc: 'Note tes règles, suis tes symptômes et prédis les prochaines',
        icon: Calendar,
        gradient: '',
        iconBg: 'bg-accent-500',
        premium: true,
      },
      {
        id: 'health',
        title: 'Ma santé & ma forme',
        desc: 'Suis ton sommeil, ton sport et ton énergie',
        icon: Activity,
        gradient: '',
        iconBg: 'bg-primary-500',
        premium: true,
      },
    ],
  },
  {
    name: 'Outils',
    icon: Calculator,
    accent: 'text-accent-600',
    cardGradient: 'from-accent-50 to-cream-100',
    features: [
      {
        id: 'style',
        title: 'Style & Make-up',
        desc: 'Photo + occasion = conseil make-up et tenue',
        icon: Camera,
        gradient: '',
        iconBg: 'bg-primary-500',
      },
      {
        id: 'bmi',
        title: 'Calculateur d IMC',
        desc: 'Évalue ta corpulence avec les courbes adolescente',
        icon: Calculator,
        gradient: '',
        iconBg: 'bg-warning-500',
      },
      {
        id: 'height',
        title: 'Prédiction de taille',
        desc: 'Estime ta taille adulte grâce à tes parents',
        icon: Ruler,
        gradient: '',
        iconBg: 'bg-secondary-500',
      },
    ],
  },
];

export function Dashboard({ onNavigate, onUpgrade }: DashboardProps) {
  const { profile, isGuest } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <div className="space-y-8">
      {/* Guest banner */}
      {isGuest && (
        <div className="card p-5 bg-gradient-to-r from-warning-50 to-primary-50 border border-warning-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-11 h-11 bg-warning-500 rounded-2xl flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Tu es en version gratuite</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Crée un compte pour débloquer le suivi de cycle, ta santé & ta forme et garder ton historique.
                </p>
              </div>
            </div>
            <button
              onClick={onUpgrade}
              className="btn-primary shrink-0"
            >
              Créer un compte
            </button>
          </div>
        </div>
      )}

      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-5xl bg-gradient-to-br from-primary-400 via-primary-500 to-secondary-500 p-6 sm:p-10 text-white">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/4 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-accent-300/20 rounded-full translate-y-1/2 blur-xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3 text-white/80">
            <Flower2 className="w-5 h-5" />
            <span className="text-sm font-medium">{greeting},</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display mb-4">
            {profile?.pseudo ?? 'Belle'} ✨
          </h1>
          <p className="text-lg text-white/90 max-w-lg leading-relaxed mb-6">
            Prête à créer ta routine beauté et bien-être sur-mesure ? Choisis un outil ci-dessous pour commencer.
          </p>
          <button
            onClick={() => onNavigate('skincare')}
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-6 py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition-transform duration-300"
          >
            <Sparkles className="w-5 h-5" />
            Créer ma routine
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Three sections */}
      {SECTIONS.map((section) => (
        <div key={section.name}>
          <div className="flex items-center gap-2 mb-5">
            <section.icon className={`w-5 h-5 ${section.accent}`} />
            <h2 className="section-title mb-0">{section.name}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {section.features.map((feat) => (
              <button
                key={feat.id}
                onClick={() => onNavigate(feat.id)}
                className={`group relative text-left card p-5 bg-gradient-to-br ${section.cardGradient} border-0 hover:scale-[1.02] transition-all duration-300`}
              >
                {isGuest && feat.premium && (
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/85 backdrop-blur-sm text-[11px] font-bold text-gray-400 shadow-sm border border-gray-100">
                    <Lock className="w-3 h-3" />
                  </span>
                )}
                <div className={`w-12 h-12 ${feat.iconBg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feat.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-1.5">{feat.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{feat.desc}</p>
                <div className="flex items-center gap-1 text-sm font-semibold text-primary-600 group-hover:gap-2 transition-all">
                  Découvrir
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Privacy banner */}
      <div className="card p-5 bg-gradient-to-r from-success-50 to-primary-50 border border-success-100">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 bg-success-500 rounded-2xl flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">Tes données sont privées</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Tout ce que tu partages ici — routines, cycle, habitudes — reste confidentiel et n est jamais partagé avec personne. Tu utilises un pseudo, pas ton vrai nom.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
