import { useState } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { AppLayout, type PageId } from '@/components/AppLayout';
import { AuthPage } from '@/pages/AuthPage';
import { Dashboard } from '@/pages/Dashboard';
import { SkincarePage } from '@/pages/SkincarePage';
import { MealsPage } from '@/pages/MealsPage';
import { HaircarePage } from '@/pages/HaircarePage';
import { PeriodsPage } from '@/pages/PeriodsPage';
import { BmiPage } from '@/pages/BmiPage';
import { HeightPage } from '@/pages/HeightPage';
import { CyclePage } from '@/pages/CyclePage';
import { StoryPage } from '@/pages/StoryPage';
import { HealthPage } from '@/pages/HealthPage';
import { StylePage } from '@/pages/StylePage';
import { MentalHealthPage } from '@/pages/MentalHealthPage';
import { LoadingSpinner } from '@/components/Loading';
import { PremiumLock } from '@/components/PremiumLock';

const PREMIUM_PAGES: PageId[] = ['cycle', 'health'];

function AppContent() {
  const { session, loading, isGuest, exitGuest } = useAuth();
  const [page, setPage] = useState<PageId>('dashboard');

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!session && !isGuest) {
    return <AuthPage />;
  }

  const isPremiumLocked = isGuest && PREMIUM_PAGES.includes(page);

  const pages: Record<PageId, React.ReactNode> = {
    dashboard: <Dashboard onNavigate={setPage} onUpgrade={exitGuest} />,
    skincare: <SkincarePage />,
    meals: <MealsPage />,
    haircare: <HaircarePage />,
    periods: <PeriodsPage />,
    bmi: <BmiPage />,
    height: <HeightPage />,
    cycle: isPremiumLocked ? (
      <PremiumLock
        title="Suivi de cycle en version Premium"
        description="Le suivi de ton cycle, la prédiction de tes prochaines règles et le suivi des symptômes sont réservés aux membres. Crée un compte gratuit pour y accéder !"
        onUpgrade={exitGuest}
      />
    ) : <CyclePage />,
    story: <StoryPage />,
    health: isPremiumLocked ? (
      <PremiumLock
        title="Suivi santé en version Premium"
        description="Le suivi de ton sommeil, de ton activité sportive et de ton énergie est réservé aux membres. Crée un compte gratuit pour y accéder !"
        onUpgrade={exitGuest}
      />
    ) : <HealthPage />,
    style: <StylePage />,
    mental: <MentalHealthPage />,
  };

  return (
    <AppLayout currentPage={page} onNavigate={setPage} isGuest={isGuest} onUpgrade={exitGuest}>
      {pages[page]}
    </AppLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
