import { useState, useEffect, useCallback } from 'react';
import {
  Brain, Mic, Send, Sparkles, ShieldAlert, Target, Trophy, CheckCircle,
  Plus, Star, ChevronDown, ChevronUp, Heart, MessageCircle, Zap, Award,
  TrendingUp, Phone, AlertCircle, Users, BookOpen, Flame, Lightbulb,
  Activity,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { getWeekKey, getWeeklyChallenges, getChallengeLevelLabel, getMaxChallengeLevel, VICTORY_CATEGORIES } from '@/lib/generators';
import { detectCrisisKeywords } from '@/lib/generators';
import { aiReframeOverthinking, aiAnalyzeCheckIn, aiWeeklyChallenges } from '@/lib/ai-generators';
import type { MentalCheckIn, MentalChallenge, MentalVictory, OverthinkingResult, CBTExercise } from '@/lib/types';

const SAFETY_NUMBERS = [
  { label: '3018 — Cyberharcèlement', number: '3018', href: 'tel:3018' },
  { label: 'Fil Santé Jeunes', number: '0800 235 236', href: 'tel:0800235236' },
];

const MOOD_CONFIG = {
  super: { label: 'Super', emoji: '😊', color: 'from-primary-400 to-primary-500', bg: 'bg-primary-50', text: 'text-primary-600' },
  moyen: { label: 'Moyen', emoji: '😐', color: 'from-secondary-400 to-secondary-500', bg: 'bg-secondary-50', text: 'text-secondary-600' },
  down: { label: 'Difficile', emoji: '😔', color: 'from-primary-300 to-primary-400', bg: 'bg-primary-50', text: 'text-primary-500' },
} as const;

const LEVEL_CONFIG = [
  { level: 1, label: 'Découverte', color: 'from-primary-300 to-primary-400', bg: 'bg-primary-50', text: 'text-primary-600', ring: 'ring-primary-200' },
  { level: 2, label: 'Confiance', color: 'from-primary-400 to-primary-500', bg: 'bg-primary-50', text: 'text-primary-600', ring: 'ring-primary-300' },
  { level: 3, label: 'Audace', color: 'from-primary-500 to-primary-600', bg: 'bg-primary-100', text: 'text-primary-700', ring: 'ring-primary-400' },
  { level: 4, label: 'Légende', color: 'from-primary-600 to-primary-700', bg: 'bg-primary-100', text: 'text-primary-700', ring: 'ring-primary-500' },
];

const CATEGORY_ICONS: Record<string, typeof Users> = {
  social: Users,
  scolaire: BookOpen,
  perso: Sparkles,
  courage: Flame,
  bienetre: Heart,
  autre: Star,
};

const CATEGORY_COLORS: Record<string, string> = {
  social: 'bg-primary-50 text-primary-600 border-primary-100',
  scolaire: 'bg-primary-50 text-primary-600 border-primary-100',
  perso: 'bg-primary-50 text-primary-600 border-primary-100',
  courage: 'bg-primary-50 text-primary-600 border-primary-100',
  bienetre: 'bg-primary-50 text-primary-600 border-primary-100',
  autre: 'bg-primary-50 text-primary-600 border-primary-100',
};

function getLevelConfig(level: number) {
  return LEVEL_CONFIG.find((l) => l.level === level) || LEVEL_CONFIG[0];
}

type SubSection = 'overthinking' | 'checkin' | 'challenges' | 'victories' | null;

export function MentalHealthPage() {
  const { user, isGuest } = useAuth();
  const [activeSub, setActiveSub] = useState<SubSection>(null);

  // ===== State for each subsection =====
  // Overthinking
  const [otThought, setOtThought] = useState('');
  const [otResult, setOtResult] = useState<OverthinkingResult | null>(null);
  const [otLoading, setOtLoading] = useState(false);
  const [otExpandedExercise, setOtExpandedExercise] = useState<number | null>(null);

  // Check-in
  const [checkInText, setCheckInText] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInResult, setCheckInResult] = useState<MentalCheckIn | null>(null);
  const [checkInExercises, setCheckInExercises] = useState<CBTExercise[]>([]);
  const [checkInHistory, setCheckInHistory] = useState<MentalCheckIn[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [ciExpandedExercise, setCiExpandedExercise] = useState<number | null>(null);

  // Challenges
  const [challenges, setChallenges] = useState<MentalChallenge[]>([]);
  const [challengesLoading, setChallengesLoading] = useState(false);
  const [challengeLevel, setChallengeLevel] = useState(1);

  // Victories
  const [victories, setVictories] = useState<MentalVictory[]>([]);
  const [newVictory, setNewVictory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('perso');

  // ===== Data loading =====
  const loadData = useCallback(async () => {
    if (!user) return;
    const [checkIns, ch, vic] = await Promise.all([
      supabase.from('mental_check_ins').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('mental_challenges').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('mental_victories').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);
    setCheckInHistory((checkIns.data as MentalCheckIn[]) ?? []);
    setChallenges((ch.data as MentalChallenge[]) ?? []);
    setVictories((vic.data as MentalVictory[]) ?? []);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute current challenge level from completed challenges
  useEffect(() => {
    if (challenges.length === 0) return;
    const completedByLevel = new Map<number, number>();
    for (const c of challenges) {
      if (c.status === 'completed') {
        const lvl = c.level || 1;
        completedByLevel.set(lvl, (completedByLevel.get(lvl) || 0) + 1);
      }
    }
    let highestUnlocked = 1;
    for (let lvl = 1; lvl <= getMaxChallengeLevel(); lvl++) {
      const completedAtThisLevel = completedByLevel.get(lvl) || 0;
      if (completedAtThisLevel >= 3) {
        highestUnlocked = Math.min(lvl + 1, getMaxChallengeLevel());
      }
    }
    setChallengeLevel(highestUnlocked);
  }, [challenges]);

  // ===== Overthinking =====
  const handleReframe = async () => {
    if (!otThought.trim()) return;
    setOtLoading(true);
    setOtExpandedExercise(null);
    try {
      const result = await aiReframeOverthinking(otThought);
      setOtResult(result);
    } catch {
      setOtResult(null);
    } finally {
      setOtLoading(false);
    }
  };

  // ===== Check-in =====
  const handleCheckIn = async () => {
    if (!checkInText.trim()) return;
    setCheckInLoading(true);
    setCiExpandedExercise(null);
    try {
      const analysis = await aiAnalyzeCheckIn(checkInText, checkInHistory.slice(0, 5));
      const entry: Omit<MentalCheckIn, 'id' | 'created_at' | 'user_id'> = {
        entry_text: checkInText,
        mood_detected: analysis.mood,
        advice: analysis.advice,
        question: analysis.question,
        safety_alert: analysis.safetyAlert,
      };
      setCheckInExercises(analysis.exercises || []);

      if (user && !isGuest) {
        const { data } = await supabase.from('mental_check_ins').insert({
          user_id: user.id,
          ...entry,
        }).select().single();
        if (data) {
          const newEntry = data as MentalCheckIn;
          setCheckInResult(newEntry);
          setCheckInHistory([newEntry, ...checkInHistory].slice(0, 10));
        }
      } else {
        const guestEntry: MentalCheckIn = {
          id: Date.now().toString(),
          user_id: 'guest',
          created_at: new Date().toISOString(),
          ...entry,
        };
        setCheckInResult(guestEntry);
      }
    } catch {
      // fallback handled by aiAnalyzeCheckIn internally
    } finally {
      setCheckInLoading(false);
      setCheckInText('');
    }
  };

  // ===== Challenges =====
  const ensureWeekChallenges = async () => {
    if (!user) return;
    const weekKey = getWeekKey();
    const existing = challenges.filter((c) => c.week_key === weekKey && (c.level || 1) === challengeLevel);
    if (existing.length > 0) return;

    setChallengesLoading(true);
    const seed = new Date().getFullYear() + new Date().getMonth() * 31 + new Date().getDate() + challengeLevel * 13;
    try {
      const texts = await aiWeeklyChallenges(checkInHistory, seed, challengeLevel);
      const newChallenges = await Promise.all(
        texts.map((text) =>
          supabase.from('mental_challenges').insert({
            user_id: user.id,
            challenge_text: text,
            status: 'proposed',
            week_key: weekKey,
            level: challengeLevel,
            difficulty_label: getChallengeLevelLabel(challengeLevel),
          }).select().single()
        )
      );
      const valid = newChallenges.filter((r) => r.data).map((r) => r.data as MentalChallenge);
      setChallenges([...valid, ...challenges]);
    } catch {
      const texts = getWeeklyChallenges(seed, challengeLevel);
      const newChallenges = await Promise.all(
        texts.map((text) =>
          supabase.from('mental_challenges').insert({
            user_id: user.id,
            challenge_text: text,
            status: 'proposed',
            week_key: weekKey,
            level: challengeLevel,
            difficulty_label: getChallengeLevelLabel(challengeLevel),
          }).select().single()
        )
      );
      const valid = newChallenges.filter((r) => r.data).map((r) => r.data as MentalChallenge);
      setChallenges([...valid, ...challenges]);
    } finally {
      setChallengesLoading(false);
    }
  };

  const updateChallengeStatus = async (id: string, status: 'accepted' | 'completed') => {
    if (!user) return;
    const update: Record<string, unknown> = { status };
    if (status === 'completed') update.completed_at = new Date().toISOString();
    const { data } = await supabase.from('mental_challenges').update(update).eq('id', id).select().single();
    if (data) {
      setChallenges(challenges.map((c) => (c.id === id ? (data as MentalChallenge) : c)));
    }
  };

  // ===== Victories =====
  const handleAddVictory = async () => {
    if (!newVictory.trim()) return;
    if (user && !isGuest) {
      const { data } = await supabase.from('mental_victories').insert({
        user_id: user.id,
        victory_text: newVictory,
        trophy: VICTORY_CATEGORIES.find((c) => c.value === selectedCategory)?.emoji || '🌟',
        category: selectedCategory,
      }).select().single();
      if (data) {
        setVictories([data as MentalVictory, ...victories]);
      }
    } else {
      const guestVic: MentalVictory = {
        id: Date.now().toString(),
        user_id: 'guest',
        victory_text: newVictory,
        trophy: VICTORY_CATEGORIES.find((c) => c.value === selectedCategory)?.emoji || '🌟',
        category: selectedCategory,
        created_at: new Date().toISOString(),
      };
      setVictories([guestVic, ...victories]);
    }
    setNewVictory('');
  };

  const thisWeekChallenges = challenges.filter((c) => c.week_key === getWeekKey() && (c.level || 1) === challengeLevel);
  const completedCount = thisWeekChallenges.filter((c) => c.status === 'completed').length;
  const allTimeCompleted = challenges.filter((c) => c.status === 'completed');
  const completedByLevel = new Map<number, number>();
  for (const c of allTimeCompleted) {
    const lvl = c.level || 1;
    completedByLevel.set(lvl, (completedByLevel.get(lvl) || 0) + 1);
  }

  // Victories grouped by category
  const victoriesByCategory = VICTORY_CATEGORIES.map((cat) => ({
    ...cat,
    items: victories.filter((v) => v.category === cat.value),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-800">Santé Mentale</h1>
          <p className="text-sm text-gray-500">Ton espace bien-être mental — comme un grand frère / une grande sœur qui t'écoute</p>
        </div>
      </div>

      {/* ===== Safety banner — permanent ===== */}
      <div className="rounded-3xl bg-gradient-to-r from-error-50 to-primary-50 border border-error-200 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 bg-error-500 rounded-2xl flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 mb-1">Espace sécurité — tu n'es pas seule</h3>
            <p className="text-sm text-gray-600 mb-3">
              Si tu traverses un moment difficile, parle-en à un adulte de confiance. Ces numéros sont gratuits et anonymes :
            </p>
            <div className="flex flex-wrap gap-2">
              {SAFETY_NUMBERS.map((num) => (
                <a
                  key={num.number}
                  href={num.href}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-bold text-error-600 border border-error-200 hover:bg-error-50 transition-colors shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                  {num.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Subsection cards ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { id: 'overthinking' as const, title: 'SOS Anti-Overthinking', desc: 'Déconstruction de pensée TCC + exercices pratiques', icon: Brain, gradient: 'from-primary-400 to-primary-500' },
          { id: 'checkin' as const, title: 'Check-in du Jour', desc: 'Bilan, analyse d\'humeur, conseils et exercices IA', icon: MessageCircle, gradient: 'from-primary-400 to-primary-500' },
          { id: 'challenges' as const, title: 'Défis par niveaux', desc: 'Progression Découverte → Légende', icon: Target, gradient: 'from-primary-400 to-primary-500' },
          { id: 'victories' as const, title: 'Journal des Victoires', desc: 'Tes réussites classées par catégorie', icon: Trophy, gradient: 'from-primary-400 to-primary-500' },
        ].map((card) => {
          const isActive = activeSub === card.id;
          return (
            <button
              key={card.id}
              onClick={() => setActiveSub(isActive ? null : card.id)}
              className={`group text-left p-5 rounded-3xl transition-all duration-300 ${
                isActive
                  ? 'bg-white shadow-lg ring-2 ring-primary-300 scale-[1.01]'
                  : 'bg-white shadow-sm hover:shadow-md hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{card.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{card.desc}</p>
                </div>
                {isActive
                  ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
                  : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
                }
              </div>
            </button>
          );
        })}
      </div>

      {/* ===== 1. SOS Anti-Overthinking ===== */}
      {activeSub === 'overthinking' && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-5 sm:p-6 bg-gradient-to-br from-primary-50 to-primary-100/60 border border-primary-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">SOS Anti-Overthinking</h2>
                <p className="text-sm text-gray-500">Écris la pensée qui tourne en boucle dans ta tête</p>
              </div>
            </div>

            <textarea
              value={otThought}
              onChange={(e) => setOtThought(e.target.value)}
              placeholder="Ex: Tout le monde va se moquer de moi si je prends la parole en cours..."
              className="w-full rounded-2xl border border-primary-200 px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none mb-4"
              rows={3}
            />

            <button
              onClick={handleReframe}
              disabled={!otThought.trim() || otLoading}
              className="w-full bg-gradient-to-r from-primary-400 to-primary-600 text-white font-bold py-3 rounded-2xl disabled:opacity-40 hover:scale-[1.01] transition-transform duration-200 flex items-center justify-center gap-2"
            >
              {otLoading ? (
                <><Sparkles className="w-5 h-5 animate-pulse" /> On déconstruit ça...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Aide-moi à déconstruire cette pensée</>
              )}
            </button>
          </div>

          {otResult && (
            <div className="space-y-3 animate-fade-in">
              {/* Identified pattern + explanation */}
              <div className="card p-5 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-primary-500" />
                  <h3 className="font-bold text-gray-800 text-sm">Schéma repéré : <span className="text-primary-600">{otResult.pattern}</span></h3>
                </div>
                <div className="p-3 bg-primary-50 rounded-2xl text-sm text-gray-700 italic mb-3">
                  « {otResult.distortedThought} »
                </div>
                {otResult.patternExplanation && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Lightbulb className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{otResult.patternExplanation}</p>
                  </div>
                )}
              </div>

              {/* Reframed thought */}
              <div className="card p-5 bg-gradient-to-br from-primary-400 to-primary-600 text-white border-0">
                <div className="flex items-center gap-2 mb-3 text-primary-100 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-primary-200" /> Recadrage TCC
                </div>
                <p className="text-sm leading-relaxed font-medium">{otResult.reframedThought}</p>
              </div>

              {/* Encouragement */}
              <div className="card p-5 bg-white">
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">{otResult.encouragement}</p>
                    <div className="p-3 bg-primary-50 rounded-2xl text-sm text-primary-700 font-medium italic">
                      👉 {otResult.question}
                    </div>
                  </div>
                </div>
              </div>

              {/* Exercises */}
              {otResult.exercises && otResult.exercises.length > 0 && (
                <div className="card p-5 bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-300 to-primary-500 rounded-xl flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">Exercices pratiques pour ne plus y repenser</h3>
                      <p className="text-xs text-gray-500">Concrets, réalisables en moins de 10 minutes</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {otResult.exercises.map((ex, i) => {
                      const expanded = otExpandedExercise === i;
                      return (
                        <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
                          <button
                            onClick={() => setOtExpandedExercise(expanded ? null : i)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                                {i + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800 text-sm">{ex.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{ex.description}</p>
                              </div>
                            </div>
                            {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                          </button>
                          {expanded && (
                            <div className="px-4 pb-4 pt-1 animate-fade-in">
                              <ol className="space-y-2">
                                {ex.steps.map((step, si) => (
                                  <li key={si} className="flex items-start gap-2.5 text-sm text-gray-700">
                                    <span className="w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                      {si + 1}
                                    </span>
                                    <span className="leading-relaxed">{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===== 2. Check-in du Jour ===== */}
      {activeSub === 'checkin' && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-5 sm:p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">Raconte ta journée</h2>
                  <p className="text-sm text-gray-500">2-3 phrases sur comment tu te sens</p>
                </div>
              </div>
              {checkInHistory.length > 0 && (
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl">
                  <TrendingUp className="w-4 h-4 text-primary-500" />
                  {checkInHistory.length} sessions
                </div>
              )}
            </div>

            <div className="relative mb-4">
              <textarea
                value={checkInText}
                onChange={(e) => setCheckInText(e.target.value)}
                placeholder="Écris 2-3 phrases sur ta journée..."
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 pr-24 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                rows={3}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <button
                  onClick={() => {}}
                  className="p-2.5 bg-gray-200 text-gray-600 rounded-xl hover:bg-gray-300 transition-colors"
                  title="Saisie vocale (bientôt disponible)"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCheckIn}
                  disabled={checkInLoading || !checkInText.trim()}
                  className="p-2.5 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-xl disabled:opacity-40 hover:scale-105 transition-transform"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {checkInLoading && (
              <div className="flex items-center justify-center py-4 gap-2 text-primary-500 text-sm">
                <Sparkles className="w-5 h-5 animate-pulse" />
                Alex analyse ta journée...
              </div>
            )}
          </div>

          {/* AI Response */}
          {checkInResult && (
            <div className="animate-fade-in space-y-4">
              <div className={`p-5 rounded-3xl bg-gradient-to-br ${MOOD_CONFIG[checkInResult.mood_detected].color} text-white shadow-md`}>
                <div className="flex items-center gap-2 mb-3 text-white/80 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-primary-200" /> Le conseil d'Alex
                </div>
                <div className="text-sm space-y-2 whitespace-pre-line font-medium leading-relaxed">
                  {checkInResult.advice}
                </div>
                <div className="mt-4 pt-3 border-t border-white/20 text-sm font-semibold text-primary-200 italic">
                  👉 {checkInResult.question}
                </div>
              </div>

              {/* Exercises from check-in */}
              {checkInExercises.length > 0 && (
                <div className="card p-5 bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-300 to-primary-500 rounded-xl flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">Exercices pour aujourd'hui</h3>
                      <p className="text-xs text-gray-500">Quelques minutes pour te sentir mieux</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {checkInExercises.map((ex, i) => {
                      const expanded = ciExpandedExercise === i;
                      return (
                        <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
                          <button
                            onClick={() => setCiExpandedExercise(expanded ? null : i)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                                {i + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800 text-sm">{ex.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{ex.description}</p>
                              </div>
                            </div>
                            {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                          </button>
                          {expanded && (
                            <div className="px-4 pb-4 pt-1 animate-fade-in">
                              <ol className="space-y-2">
                                {ex.steps.map((step, si) => (
                                  <li key={si} className="flex items-start gap-2.5 text-sm text-gray-700">
                                    <span className="w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                      {si + 1}
                                    </span>
                                    <span className="leading-relaxed">{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {checkInResult.safety_alert && (
                <div className="rounded-3xl bg-error-50 border border-error-200 p-4 flex items-start gap-3">
                  <ShieldAlert className="w-6 h-6 text-error-600 shrink-0" />
                  <div className="text-sm text-error-900">
                    <p className="font-bold mb-1">Tu traverses un moment difficile ? Tu n'es pas seule.</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {SAFETY_NUMBERS.map((num) => (
                        <a key={num.number} href={num.href} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-error-600 text-white rounded-xl text-xs font-bold">
                          <Phone className="w-3.5 h-3.5" /> {num.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History toggle */}
          {checkInHistory.length > 0 && (
            <div className="card p-5 bg-white">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center justify-between w-full mb-3"
              >
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ton historique récent</h3>
                {showHistory ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {showHistory && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {checkInHistory.slice(0, 5).map((item) => {
                    const mc = MOOD_CONFIG[item.mood_detected];
                    return (
                      <div key={item.id} className="p-3 bg-gray-50 rounded-2xl flex items-center justify-between gap-3 text-xs">
                        <span className="text-gray-400 font-medium shrink-0">
                          {new Date(item.created_at).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                        <p className="text-gray-700 font-medium truncate flex-1">{item.entry_text}</p>
                        <span className={`shrink-0 px-2.5 py-1 ${mc.bg} ${mc.text} rounded-lg font-bold`}>
                          {mc.emoji} {mc.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===== 3. Défis par niveaux ===== */}
      {activeSub === 'challenges' && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-5 sm:p-6 bg-gradient-to-br from-primary-50 to-primary-100/60 border border-primary-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">Défis par niveaux</h2>
                  <p className="text-sm text-gray-500">3 défis validés = tu passes au niveau suivant</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-primary-700 bg-white px-3 py-1.5 rounded-xl shadow-sm">
                <Star className="w-4 h-4 fill-primary-400 text-primary-500" />
                {completedCount} cette semaine
              </div>
            </div>

            {/* Level progression bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                {LEVEL_CONFIG.map((lvl) => {
                  const completed = completedByLevel.get(lvl.level) || 0;
                  const isUnlocked = lvl.level <= challengeLevel;
                  const isPassed = completed >= 3;
                  return (
                    <div key={lvl.level} className="flex flex-col items-center gap-1 flex-1">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                          isPassed
                            ? `bg-gradient-to-br ${lvl.color} text-white shadow-md`
                            : isUnlocked
                              ? `bg-white ${lvl.text} border-2 border-current shadow-sm`
                              : 'bg-gray-100 text-gray-300'
                        }`}
                      >
                        {isPassed ? <CheckCircle className="w-5 h-5" /> : lvl.level}
                      </div>
                      <span className={`text-[10px] font-bold ${isUnlocked ? lvl.text : 'text-gray-300'}`}>
                        {lvl.label}
                      </span>
                      {isUnlocked && !isPassed && (
                        <span className="text-[10px] text-gray-400">{completed}/3</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getLevelConfig(challengeLevel).color} transition-all duration-500`}
                  style={{ width: `${(completedCount / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Current level badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 ${getLevelConfig(challengeLevel).bg} ${getLevelConfig(challengeLevel).text} rounded-xl text-sm font-bold mb-4`}>
              <Zap className="w-4 h-4" />
              Niveau actuel : {getChallengeLevelLabel(challengeLevel)}
              {challengeLevel < getMaxChallengeLevel() && (
                <span className="text-xs font-normal opacity-70">
                  ({completedCount}/3 pour passer au niveau suivant)
                </span>
              )}
              {challengeLevel === getMaxChallengeLevel() && (
                <span className="text-xs font-normal opacity-70">— Niveau maximum !</span>
              )}
            </div>

            {isGuest ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Crée un compte pour relever tes défis et suivre ta progression !
              </p>
            ) : (
              <>
                {thisWeekChallenges.length === 0 && !challengesLoading && (
                  <button
                    onClick={ensureWeekChallenges}
                    className="w-full py-3 bg-gradient-to-r from-primary-400 to-primary-600 text-white font-bold rounded-2xl hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5" /> Générer mes défis ({getChallengeLevelLabel(challengeLevel)})
                  </button>
                )}

                {challengesLoading && (
                  <div className="flex items-center justify-center py-6 text-primary-500 text-sm gap-2">
                    <Sparkles className="w-5 h-5 animate-pulse" /> Préparation de tes défis...
                  </div>
                )}

                <div className="space-y-2.5">
                  {thisWeekChallenges.map((challenge) => {
                    const isDone = challenge.status === 'completed';
                    const isAccepted = challenge.status === 'accepted';
                    const lvlCfg = getLevelConfig(challenge.level || 1);
                    return (
                      <div
                        key={challenge.id}
                        className={`p-4 rounded-2xl transition-all ${
                          isDone
                            ? `bg-gradient-to-r ${lvlCfg.color} text-white shadow-md`
                            : isAccepted
                              ? 'bg-white border-2 border-primary-300 shadow-sm'
                              : 'bg-white border border-primary-100 hover:border-primary-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-start gap-2">
                            <Target className={`w-5 h-5 shrink-0 mt-0.5 ${isDone ? 'text-white' : 'text-primary-400'}`} />
                            <p className={`text-sm font-medium ${isDone ? 'text-white' : 'text-gray-700'}`}>
                              {challenge.challenge_text}
                            </p>
                          </div>
                          {isDone && <CheckCircle className="w-5 h-5 text-white shrink-0" />}
                        </div>
                        <div className="flex gap-2 mt-2">
                          {!isAccepted && !isDone && (
                            <button
                              onClick={() => updateChallengeStatus(challenge.id, 'accepted')}
                              className="text-xs font-bold px-3 py-1.5 bg-primary-100 text-primary-700 rounded-xl hover:bg-primary-200 transition-colors"
                            >
                              Je me lance
                            </button>
                          )}
                          {isAccepted && !isDone && (
                            <button
                              onClick={() => updateChallengeStatus(challenge.id, 'completed')}
                              className="text-xs font-bold px-3 py-1.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors flex items-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Défi relevé !
                            </button>
                          )}
                          {isDone && (
                            <span className="text-xs font-bold text-white/90 flex items-center gap-1">
                              <Trophy className="w-3.5 h-3.5" /> Bravo !
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {completedCount >= 3 && challengeLevel < getMaxChallengeLevel() && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-2xl flex items-center gap-3">
                    <Award className="w-6 h-6 shrink-0" />
                    <div>
                      <p className="font-bold text-sm">Niveau débloqué !</p>
                      <p className="text-xs text-white/90">Tu passes au niveau {getChallengeLevelLabel(challengeLevel + 1)} la prochaine fois que tu génères des défis.</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== 4. Journal des Victoires ===== */}
      {activeSub === 'victories' && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-5 sm:p-6 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Journal des Victoires</h2>
                <p className="text-sm text-gray-500">Tes succès classés par catégorie — à relire quand tu en as besoin</p>
              </div>
            </div>

            {/* Category selector */}
            <div className="mb-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Choisis une catégorie</p>
              <div className="flex flex-wrap gap-2">
                {VICTORY_CATEGORIES.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.value] || Star;
                  const isSelected = selectedCategory === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-primary-500 text-white shadow-md scale-105'
                          : 'bg-white text-gray-600 border border-primary-100 hover:bg-primary-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add victory form */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newVictory}
                onChange={(e) => setNewVictory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddVictory()}
                placeholder={`Décris ta victoire (${VICTORY_CATEGORIES.find((c) => c.value === selectedCategory)?.label})...`}
                className="flex-1 px-3 py-2.5 rounded-xl text-sm border border-primary-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <button
                onClick={handleAddVictory}
                disabled={!newVictory.trim()}
                className="p-2.5 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-xl disabled:opacity-40 hover:scale-105 transition-transform"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Victories grouped by category */}
            {victories.length > 0 ? (
              <div className="space-y-5 max-h-[500px] overflow-y-auto pr-1">
                {victoriesByCategory.map((group) => {
                  const Icon = CATEGORY_ICONS[group.value] || Star;
                  return (
                    <div key={group.value}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${CATEGORY_COLORS[group.value]} border`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-700">{group.label}</h3>
                        <span className="text-xs text-gray-400">({group.items.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {group.items.map((vic) => (
                          <div
                            key={vic.id}
                            className={`p-3 bg-white rounded-2xl border ${CATEGORY_COLORS[group.value]} flex items-start gap-3`}
                          >
                            <span className="text-2xl shrink-0">{vic.trophy}</span>
                            <div className="flex-1">
                              <p className="text-sm text-gray-700 font-medium leading-relaxed">{vic.victory_text}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(vic.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-10 h-10 text-primary-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Ton journal est vide pour l'instant. Ajoute ta première victoire !</p>
              </div>
            )}

            {victories.length > 0 && (
              <div className="mt-4 pt-3 border-t border-primary-200/50 text-sm text-primary-700 font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                À relire avant un exposé ou un moment de stress — tu es plus forte que tu ne le penses !
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== 5. Espace Sécurité / AIDE — permanent bottom card ===== */}
      <div className="rounded-3xl bg-gradient-to-br from-error-500 to-error-600 text-white p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-3">
          <ShieldAlert className="w-6 h-6" />
          <h3 className="font-bold text-lg">Besoin d'aide ? On est là.</h3>
        </div>
        <p className="text-sm text-white/90 mb-4 leading-relaxed">
          Si tu te sens en danger, harcelée, ou que tu as besoin d'en parler à quelqu'un : ces numéros sont gratuits, anonymes, et disponibles 7j/7.
        </p>
        <div className="flex flex-wrap gap-3">
          {SAFETY_NUMBERS.map((num) => (
            <a
              key={num.number}
              href={num.href}
              className="inline-flex items-center gap-2 px-5 py-3 bg-white text-error-600 rounded-2xl font-bold text-sm hover:scale-105 transition-transform shadow-lg"
            >
              <Phone className="w-5 h-5" />
              {num.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
