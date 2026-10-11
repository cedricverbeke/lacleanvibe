import { useState, useEffect } from 'react';
import { Moon, Sun, Activity, Droplet, Zap, Smile, Meh, Frown, Plus, Heart, Bed, Dumbbell } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { ChipGroup } from '@/components/Chip';
import type { HealthLog } from '@/lib/types';

const SLEEP_QUALITY = [
  { value: 'bonne', label: 'Bonne', icon: <Sun className="w-4 h-4" /> },
  { value: 'moyenne', label: 'Moyenne', icon: <Moon className="w-4 h-4" /> },
  { value: 'mauvaise', label: 'Mauvaise', icon: <Bed className="w-4 h-4" /> },
];

const SPORT_ACTIVITY = [
  { value: 'danse', label: 'Danse' },
  { value: 'running', label: 'Running' },
  { value: 'natation', label: 'Natation' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'musculation', label: 'Musculation', icon: <Dumbbell className="w-4 h-4" /> },
  { value: 'marche', label: 'Marche' },
  { value: 'velo', label: 'Vélo' },
  { value: 'aucun', label: 'Aucun' },
];

const ENERGY_LEVEL = [
  { value: 'haute', label: 'Haute', icon: <Zap className="w-4 h-4" /> },
  { value: 'moyenne', label: 'Moyenne', icon: <Activity className="w-4 h-4" /> },
  { value: 'basse', label: 'Basse', icon: <Moon className="w-4 h-4" /> },
];

const MOOD = [
  { value: 'bonne', label: 'Bonne', icon: <Smile className="w-4 h-4" /> },
  { value: 'neutre', label: 'Neutre', icon: <Meh className="w-4 h-4" /> },
  { value: 'coup de blues', label: 'Coup de blues', icon: <Frown className="w-4 h-4" /> },
];

const MOOD_LABELS: Record<string, string> = {
  bonne: 'Bonne',
  neutre: 'Neutre',
  'coup de blues': 'Coup de blues',
};
const SLEEP_QUALITY_LABELS: Record<string, string> = {
  bonne: 'Bonne',
  moyenne: 'Moyenne',
  mauvaise: 'Mauvaise',
};
const ENERGY_LABELS: Record<string, string> = {
  haute: 'Haute',
  moyenne: 'Moyenne',
  basse: 'Basse',
};

interface FormState {
  sleepHours: string;
  sleepQuality: string;
  sportActivity: string;
  sportDuration: string;
  energyLevel: string;
  mood: string;
  waterGlasses: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  sleepHours: '',
  sleepQuality: '',
  sportActivity: '',
  sportDuration: '',
  energyLevel: '',
  mood: '',
  waterGlasses: '',
  notes: '',
};

interface NormalizedLog {
  sleepHours: number | null;
  waterGlasses: number | null;
  sportActivity: string | null;
  sportDuration: number | null;
  energyLevel: string | null;
  mood: string | null;
}

function normalizeForm(form: FormState): NormalizedLog {
  return {
    sleepHours: form.sleepHours ? parseFloat(form.sleepHours) : null,
    waterGlasses: form.waterGlasses ? parseInt(form.waterGlasses, 10) : null,
    sportActivity: form.sportActivity || null,
    sportDuration: form.sportDuration ? parseInt(form.sportDuration, 10) : null,
    energyLevel: form.energyLevel || null,
    mood: form.mood || null,
  };
}

function normalizeLog(log: HealthLog): NormalizedLog {
  return {
    sleepHours: log.sleep_hours,
    waterGlasses: log.water_glasses,
    sportActivity: log.sport_activity,
    sportDuration: log.sport_duration,
    energyLevel: log.energy_level,
    mood: log.mood,
  };
}

function generateTips(log: NormalizedLog): string[] {
  const tips: string[] = [];
  const { sleepHours: sleep, waterGlasses: water, sportActivity: sport, sportDuration: duration, mood, energyLevel } = log;

  if (sleep !== null && !isNaN(sleep) && sleep < 7) {
    tips.push('Tu dors un peu moins que recommandé, essaie d\'aller au lit 30 min plus tôt !');
  }
  if (!sport || sport === 'aucun') {
    tips.push('Bouger un peu chaque jour fait une vraie différence !');
  } else if (duration !== null && !isNaN(duration) && duration < 20) {
    tips.push('Une petite séance, c\'est déjà super — tu peux allonger un peu la prochaine fois !');
  }
  if (water !== null && !isNaN(water) && water < 6) {
    tips.push('Pense à boire plus d\'eau !');
  }
  if (mood === 'coup de blues') {
    tips.push('Les jours sans, ça arrive à tout le monde. Sois douce avec toi-même aujourd\'hui 💕');
  }
  if (energyLevel === 'basse') {
    tips.push('Énergie en baisse ? Une bonne nuit de sommeil et un verre d\'eau peuvent aider.');
  }
  return tips;
}

export function HealthPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    if (user) loadLogs();
    else setLoading(false);
  }, [user]);

  async function loadLogs() {
    if (!user) return;
    const { data } = await supabase
      .from('health_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('log_date', { ascending: false })
      .limit(7);
    setLogs((data as HealthLog[]) ?? []);
    setLoading(false);
  }

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { data } = await supabase
      .from('health_logs')
      .insert({
        user_id: user.id,
        log_date: new Date().toISOString().split('T')[0],
        sleep_hours: form.sleepHours ? parseFloat(form.sleepHours) : null,
        sleep_quality: form.sleepQuality || null,
        sport_activity: form.sportActivity || null,
        sport_duration: form.sportDuration ? parseInt(form.sportDuration, 10) : null,
        energy_level: form.energyLevel || null,
        mood: form.mood || null,
        water_glasses: form.waterGlasses ? parseInt(form.waterGlasses, 10) : null,
        notes: form.notes || null,
      })
      .select()
      .single();

    if (data) {
      setLogs([data as HealthLog, ...logs].slice(0, 7));
    }
    setForm(EMPTY_FORM);
    setSaving(false);
  };

  const recentTips = logs.length > 0 ? generateTips(normalizeLog(logs[0])) : [];
  const liveTips = generateTips(normalizeForm(form));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 rounded-full border-4 border-primary-100" />
        <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin -ml-12" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ma santé & ma forme</h1>
          <p className="text-sm text-gray-500">Suis ton sommeil, ton sport et ton énergie au quotidien</p>
        </div>
      </div>

      {/* Logging form */}
      <div className="card p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 text-primary-600">
          <Plus className="w-5 h-5" />
          <h2 className="font-bold text-gray-800">Mon journal du jour</h2>
        </div>

        {/* Sleep hours + water glasses */}
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Moon className="w-4 h-4 text-primary-500" /> Heures de sommeil
            </label>
            <input
              type="number"
              min={0}
              max={24}
              step={0.5}
              value={form.sleepHours}
              onChange={(e) => setForm({ ...form, sleepHours: e.target.value })}
              placeholder="ex. 8"
              className="input-field"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Droplet className="w-4 h-4 text-secondary-500" /> Verres d'eau
            </label>
            <input
              type="number"
              min={0}
              max={20}
              value={form.waterGlasses}
              onChange={(e) => setForm({ ...form, waterGlasses: e.target.value })}
              placeholder="ex. 6"
              className="input-field"
            />
          </div>
        </div>

        {/* Sleep quality */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Bed className="w-4 h-4 text-primary-500" /> Qualité du sommeil
          </label>
          <ChipGroup
            options={SLEEP_QUALITY}
            value={form.sleepQuality}
            onChange={(v) => setForm({ ...form, sleepQuality: v as string })}
          />
        </div>

        {/* Sport activity */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Dumbbell className="w-4 h-4 text-primary-500" /> Activité sportive
          </label>
          <ChipGroup
            options={SPORT_ACTIVITY}
            value={form.sportActivity}
            onChange={(v) => setForm({ ...form, sportActivity: v as string })}
          />
        </div>

        {/* Sport duration */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Activity className="w-4 h-4 text-primary-500" /> Durée du sport (minutes)
          </label>
          <input
            type="number"
            min={0}
            max={600}
            value={form.sportDuration}
            onChange={(e) => setForm({ ...form, sportDuration: e.target.value })}
            placeholder="ex. 30"
            className="input-field"
            disabled={form.sportActivity === '' || form.sportActivity === 'aucun'}
          />
          {(form.sportActivity === '' || form.sportActivity === 'aucun') && (
            <p className="text-xs text-gray-400 mt-1.5">Choisis d'abord une activité pour renseigner la durée.</p>
          )}
        </div>

        {/* Energy level */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Zap className="w-4 h-4 text-accent-500" /> Niveau d'énergie
          </label>
          <ChipGroup
            options={ENERGY_LEVEL}
            value={form.energyLevel}
            onChange={(v) => setForm({ ...form, energyLevel: v as string })}
          />
        </div>

        {/* Mood */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Smile className="w-4 h-4 text-primary-500" /> Humeur
          </label>
          <ChipGroup
            options={MOOD}
            value={form.mood}
            onChange={(v) => setForm({ ...form, mood: v as string })}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Heart className="w-4 h-4 text-primary-500" /> Notes (optionnel)
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Comment tu te sens aujourd'hui ?"
            className="input-field resize-none"
            rows={2}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full disabled:opacity-40"
        >
          <Plus className="w-5 h-5" /> {saving ? 'Enregistrement...' : 'Enregistrer mon journal'}
        </button>
      </div>

      {/* Live tips while filling the form */}
      {liveTips.length > 0 && (
        <div className="card p-5 bg-gradient-to-br from-primary-50 to-cream-100 border-0">
          <div className="flex items-center gap-2 mb-3 text-primary-600">
            <Sun className="w-5 h-5" />
            <h3 className="font-bold text-gray-800 text-sm">Petits conseils du jour</h3>
          </div>
          <ul className="space-y-2">
            {liveTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-2 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* History */}
      {logs.length > 0 ? (
        <div className="card p-6">
          <h2 className="font-bold text-gray-800 mb-4">Mes 7 derniers jours</h2>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">
                    {new Date(log.log_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                  {log.mood && (
                    <span className="text-xs px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
                      {MOOD_LABELS[log.mood] ?? log.mood}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {log.sleep_hours !== null && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white rounded-xl border border-gray-100 text-gray-600">
                      <Moon className="w-3.5 h-3.5 text-primary-400" /> {log.sleep_hours}h sommeil
                      {log.sleep_quality && ` · ${SLEEP_QUALITY_LABELS[log.sleep_quality] ?? log.sleep_quality}`}
                    </span>
                  )}
                  {log.sport_activity && log.sport_activity !== 'aucun' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white rounded-xl border border-gray-100 text-gray-600">
                      <Dumbbell className="w-3.5 h-3.5 text-primary-400" /> {log.sport_activity}
                      {log.sport_duration ? ` · ${log.sport_duration} min` : ''}
                    </span>
                  )}
                  {log.energy_level && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white rounded-xl border border-gray-100 text-gray-600">
                      <Zap className="w-3.5 h-3.5 text-accent-500" /> Énergie {ENERGY_LABELS[log.energy_level] ?? log.energy_level}
                    </span>
                  )}
                  {log.water_glasses !== null && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white rounded-xl border border-gray-100 text-gray-600">
                      <Droplet className="w-3.5 h-3.5 text-secondary-500" /> {log.water_glasses} verres d'eau
                    </span>
                  )}
                </div>
                {log.notes && (
                  <p className="mt-3 text-sm text-gray-500 italic">« {log.notes} »</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center bg-gradient-to-br from-primary-50 to-cream-100 border-0">
          <Heart className="w-12 h-12 text-primary-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-1">Aucun journal enregistré</p>
          <p className="text-sm text-gray-400">Remplis le formulaire ci-dessus pour commencer à suivre ta santé !</p>
        </div>
      )}

      {/* Tips based on most recent log */}
      {recentTips.length > 0 && (
        <div className="card p-6 bg-gradient-to-br from-primary-100 to-primary-50 border-0">
          <div className="flex items-center gap-2 mb-4 text-primary-600">
            <Sun className="w-5 h-5" />
            <h3 className="font-bold text-gray-800">Nos petits conseils pour toi</h3>
          </div>
          <ul className="space-y-2.5">
            {recentTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                <Heart className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
