import { useState, type ReactNode } from 'react';
import {
  Sparkles, Home, Droplet, UtensilsCrossed, Scissors,
  Heart, Calculator, Ruler, Calendar, LogOut, Menu, X,
  Activity, Lock, UserPlus, Camera, Brain,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

export type PageId =
  | 'dashboard' | 'skincare' | 'meals' | 'haircare'
  | 'periods' | 'bmi' | 'height' | 'cycle' | 'story' | 'health' | 'style' | 'mental';

interface NavItem {
  id: PageId;
  label: string;
  icon: typeof Home;
  group: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Accueil', icon: Home, group: 'Principal' },
  { id: 'story', label: 'Notre histoire', icon: Heart, group: 'Principal' },
  { id: 'skincare', label: 'Skincare', icon: Droplet, group: 'Routines' },
  { id: 'meals', label: 'Repas sains', icon: UtensilsCrossed, group: 'Routines' },
  { id: 'haircare', label: 'Haircare', icon: Scissors, group: 'Routines' },
  { id: 'style', label: 'Style & Make-up', icon: Camera, group: 'Outils' },
  { id: 'periods', label: 'Mes règles', icon: Heart, group: 'Bien-être' },
  { id: 'mental', label: 'Santé mentale', icon: Brain, group: 'Bien-être' },
  { id: 'cycle', label: 'Mon cycle', icon: Calendar, group: 'Bien-être' },
  { id: 'health', label: 'Ma santé & forme', icon: Activity, group: 'Bien-être' },
  { id: 'bmi', label: 'Mon IMC', icon: Calculator, group: 'Outils' },
  { id: 'height', label: 'Ma taille adulte', icon: Ruler, group: 'Outils' },
];

const GROUPS = ['Principal', 'Routines', 'Bien-être', 'Outils'];

const PREMIUM_PAGES: PageId[] = ['cycle', 'health'];

interface AppLayoutProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  children: ReactNode;
  isGuest: boolean;
  onUpgrade: () => void;
}

export function AppLayout({ currentPage, onNavigate, children, isGuest, onUpgrade }: AppLayoutProps) {
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navList = (
    <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-4 space-y-5">
      {GROUPS.map((group) => {
        const items = NAV_ITEMS.filter((item) => item.group === group);
        if (items.length === 0) return null;
        return (
          <div key={group}>
            <p className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">{group}</p>
            <div className="space-y-1">
              {items.map((item) => {
                const isPremium = PREMIUM_PAGES.includes(item.id);
                const showLock = isGuest && isPremium;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
                        : showLock
                          ? 'text-gray-400 bg-gray-50/60 hover:bg-primary-50 hover:text-primary-600'
                          : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm flex-1 text-left">{item.label}</span>
                    {showLock && (
                      <Lock className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );

  const userInfo = (
    <div className="px-4 py-4 border-t border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {isGuest ? '✨' : (profile?.pseudo?.[0]?.toUpperCase() ?? '?')}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-700 text-sm truncate">
            {isGuest ? 'Version gratuite' : (profile?.pseudo ?? 'Utilisatrice')}
          </p>
          <p className="text-xs text-gray-400">{isGuest ? 'Accès limité' : 'Compte privé'}</p>
        </div>
        {isGuest ? (
          <button
            onClick={onUpgrade}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors"
            title="Créer un compte"
          >
            <UserPlus className="w-4 h-4" />
            <span>Créer un compte</span>
          </button>
        ) : (
          <button onClick={signOut} className="p-2 rounded-xl text-gray-400 hover:bg-error-50 hover:text-error-500 transition-colors" title="Déconnexion">
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-gray-100 flex-col fixed inset-y-0 left-0 z-30">
        <div className="px-6 py-6 flex items-center gap-2.5">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold font-display text-gray-800">Clean Vibe</span>
        </div>
        {navList}
        {userInfo}
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold font-display text-gray-800">Clean Vibe</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl text-gray-600 hover:bg-gray-100"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 bg-white flex flex-col animate-slide-up">
            <div className="px-6 py-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold font-display text-gray-800">Clean Vibe</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100">
                <X className="w-6 h-6" />
              </button>
            </div>
            {navList}
            {userInfo}
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-10 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
