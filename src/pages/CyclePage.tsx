import { useState, useEffect } from 'react';
import { Calendar, Plus, Heart, Droplet, Sun, Moon, Zap, Smile, Frown, Meh, Trash2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { CycleLog } from '@/lib/types';

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const MOOD_OPTIONS = [
  { value: 'happy', label: 'Bonne humeur', icon: Smile, color: 'text-success-500' },
  { value: 'neutral', label: 'Neutre', icon: Meh, color: 'text-accent-500' },
  { value: 'sad', label: 'Coupe de blues', icon: Frown, color: 'text-secondary-500' },
];
const ENERGY_OPTIONS = [
  { value: 'high', label: 'Pleine d énergie', icon: Zap, color: 'text-accent-500' },
  { value: 'medium', label: 'Normale', icon: Sun, color: 'text-success-500' },
  { value: 'low', label: 'Fatiguée', icon: Moon, color: 'text-secondary-500' },
];
const CRAMPS_OPTIONS = [
  { value: 'none', label: 'Aucune' },
  { value: 'mild', label: 'Légères' },
  { value: 'moderate', label: 'Modérées' },
  { value: 'strong', label: 'Forte' },
];
const SKIN_OPTIONS = [
  { value: 'clear', label: 'Belle peau' },
  { value: 'normal', label: 'Normale' },
  { value: 'oily', label: 'Plus grasse' },
  { value: 'breakouts', label: 'Boutons' },
];

export function CyclePage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<CycleLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSymptomDate, setSelectedSymptomDate] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState({ mood: '', energy: '', cramps: '', skin: '', notes: '' });

  useEffect(() => {
    if (user) loadLogs();
  }, [user]);

  async function loadLogs() {
    if (!user) return;
    const { data } = await supabase
      .from('cycle_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false });
    setLogs(data as CycleLog[] ?? []);
    setLoading(false);
  }

  const handleAddCycle = async () => {
    if (!user || !startDate) return;
    const { data } = await supabase
      .from('cycle_logs')
      .insert({
        user_id: user.id,
        start_date: startDate,
        end_date: endDate || null,
        cycle_length: 28,
      })
      .select()
      .single();
    if (data) {
      setLogs([data as CycleLog, ...logs]);
      setShowForm(false);
      setStartDate('');
      setEndDate('');
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('cycle_logs').delete().eq('id', id);
    setLogs(logs.filter((l) => l.id !== id));
  };

  const handleSaveSymptoms = async () => {
    if (!user || !selectedSymptomDate) return;
    await supabase.from('cycle_symptoms').upsert({
      user_id: user.id,
      log_date: selectedSymptomDate,
      mood: symptoms.mood || null,
      energy: symptoms.energy || null,
      cramps: symptoms.cramps || null,
      skin_condition: symptoms.skin || null,
      notes: symptoms.notes || null,
    });
    setSelectedSymptomDate(null);
    setSymptoms({ mood: '', energy: '', cramps: '', skin: '', notes: '' });
  };

  // Predict next period
  const lastLog = logs[0];
  const nextPrediction = lastLog
    ? new Date(new Date(lastLog.start_date).getTime() + lastLog.cycle_length * 86400000)
    : null;
  const daysUntilNext = nextPrediction
    ? Math.ceil((nextPrediction.getTime() - new Date().getTime()) / 86400000)
    : null;

  // Calendar helpers
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = lastDay.getDate();

  const isPeriodDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return logs.some((log) => {
      const start = new Date(log.start_date);
      const startMs = new Date(log.start_date).getTime();
      const end = log.end_date ? new Date(log.end_date) : new Date(startMs + 5 * 86400000);
      const check = new Date(dateStr);
      return check >= start && check <= end;
    });
  };

  const isPredictedDay = (day: number) => {
    if (!nextPrediction) return false;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const check = new Date(dateStr);
    return check >= nextPrediction && check <= new Date(nextPrediction.getTime() + 5 * 86400000);
  };

  const todayStr = new Date().toISOString().split('T')[0];

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mon cycle</h1>
            <p className="text-sm text-gray-500">Suis tes règles et prédis les prochaines</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nouvelles règles</span>
        </button>
      </div>

      {/* Prediction card */}
      {nextPrediction && daysUntilNext !== null && (
        <div className="card p-6 bg-gradient-to-br from-primary-100 to-secondary-50 border-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center shrink-0">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Prochaines règles estimées</p>
              <p className="text-2xl font-bold text-gray-800">
                {nextPrediction.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
              </p>
              <p className="text-sm text-primary-600 font-medium">
                {daysUntilNext > 0 ? `Dans ${daysUntilNext} jour${daysUntilNext > 1 ? 's' : ''}` : 'Aujourd\'hui !'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h2 className="text-lg font-bold text-gray-800">
            {MONTHS[month]} {year}
          </h2>
          <button
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {DAYS.map((d, i) => (
            <div key={i} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {Array.from({ length: startWeekday }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isPeriod = isPeriodDay(day);
            const isPredicted = isPredictedDay(day);
            const isToday = dateStr === todayStr;

            return (
              <button
                key={day}
                onClick={() => {
                  setSelectedSymptomDate(dateStr);
                }}
                className={`aspect-square rounded-xl sm:rounded-2xl flex items-center justify-center text-sm font-medium transition-all relative ${
                  isPeriod
                    ? 'bg-primary-500 text-white shadow-md'
                    : isPredicted
                    ? 'bg-primary-100 text-primary-500 border-2 border-dashed border-primary-300'
                    : isToday
                    ? 'bg-accent-100 text-accent-700 font-bold'
                    : 'bg-gray-50 text-gray-600 hover:bg-primary-50'
                }`}
              >
                {day}
                {isPeriod && <Droplet className="w-2.5 h-2.5 absolute bottom-1 right-1 text-white/60" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-5 pt-5 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-primary-500 rounded-lg" />
            <span className="text-gray-500">Règles enregistrées</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-primary-100 border-2 border-dashed border-primary-300 rounded-lg" />
            <span className="text-gray-500">Prédiction</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-accent-100 rounded-lg" />
            <span className="text-gray-500">Aujourd hui</span>
          </div>
        </div>
      </div>

      {/* History */}
      {logs.length > 0 && (
        <div className="card p-6">
          <h2 className="font-bold text-gray-800 mb-4">Historique</h2>
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Droplet className="w-4 h-4 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      {new Date(log.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {log.end_date && ` → ${new Date(log.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`}
                    </p>
                    <p className="text-xs text-gray-400">Cycle de {log.cycle_length} jours</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(log.id)}
                  className="p-2 rounded-xl text-gray-400 hover:bg-error-50 hover:text-error-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {logs.length === 0 && !showForm && (
        <div className="card p-8 text-center bg-gradient-to-br from-primary-50 to-cream-100 border-0">
          <Heart className="w-12 h-12 text-primary-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-1">Aucune règle enregistrée</p>
          <p className="text-sm text-gray-400">Ajoute la date de tes dernières règles pour commencer le suivi et prédire les prochaines !</p>
        </div>
      )}

      {/* Add form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Enregistrer mes règles</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Premier jour</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dernier jour (optionnel)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="btn-ghost flex-1">Annuler</button>
              <button onClick={handleAddCycle} disabled={!startDate} className="btn-primary flex-1 disabled:opacity-40">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Symptom tracker modal */}
      {selectedSymptomDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedSymptomDate(null)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Suivi du jour</h2>
            <p className="text-sm text-gray-500 mb-5">
              {new Date(selectedSymptomDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Humeur</label>
                <div className="flex gap-2">
                  {MOOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSymptoms({ ...symptoms, mood: opt.value })}
                      className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all ${
                        symptoms.mood === opt.value ? 'border-primary-400 bg-primary-50' : 'border-gray-100'
                      }`}
                    >
                      <opt.icon className={`w-5 h-5 ${opt.color}`} />
                      <span className="text-xs font-medium text-gray-600">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Énergie</label>
                <div className="flex gap-2">
                  {ENERGY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSymptoms({ ...symptoms, energy: opt.value })}
                      className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all ${
                        symptoms.energy === opt.value ? 'border-primary-400 bg-primary-50' : 'border-gray-100'
                      }`}
                    >
                      <opt.icon className={`w-5 h-5 ${opt.color}`} />
                      <span className="text-xs font-medium text-gray-600">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Crampes</label>
                <div className="flex flex-wrap gap-2">
                  {CRAMPS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSymptoms({ ...symptoms, cramps: opt.value })}
                      className={`chip ${symptoms.cramps === opt.value ? 'chip-active' : 'chip-idle'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">État de la peau</label>
                <div className="flex flex-wrap gap-2">
                  {SKIN_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSymptoms({ ...symptoms, skin: opt.value })}
                      className={`chip ${symptoms.skin === opt.value ? 'chip-active' : 'chip-idle'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (optionnel)</label>
                <textarea
                  value={symptoms.notes}
                  onChange={(e) => setSymptoms({ ...symptoms, notes: e.target.value })}
                  placeholder="Comment tu te sens aujourd hui ?"
                  className="input-field resize-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setSelectedSymptomDate(null)} className="btn-ghost flex-1">Fermer</button>
              <button onClick={handleSaveSymptoms} className="btn-primary flex-1">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
