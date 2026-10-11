import { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, Check, X, Palette, Shirt, Lightbulb } from 'lucide-react';
import { generateStyleAdvice } from '@/lib/generators';
import { aiStyleAdvice } from '@/lib/ai-generators';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { StyleAdvice } from '@/lib/types';

const SKIN_TONES = [
  { value: 'claire', color: '#F7D9C4', label: 'Claire' },
  { value: 'claire-medium', color: '#E8C4A0', label: 'Claire-medium' },
  { value: 'medium', color: '#C99A7A', label: 'Medium' },
  { value: 'matte', color: '#A9785C', label: 'Matte' },
  { value: 'foncee', color: '#7D5239', label: 'Foncée' },
  { value: 'noire', color: '#5C3A28', label: 'Noire' },
];

const EVENT_TYPES = [
  'Anniversaire',
  'Fête / Soirée',
  'Rendez-vous',
  'École / Collège',
  'Sortie shopping',
  'Photo / Shooting',
  'Cérémonie',
  'Premier rendez-vous',
];

export function StylePage() {
  const { isGuest, session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [skinTone, setSkinTone] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventDetails, setEventDetails] = useState('');
  const [advice, setAdvice] = useState<StyleAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = skinTone !== '' && eventType !== '';

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choisis une image valide');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    try {
      const result = await aiStyleAdvice(eventType, eventDetails, skinTone);
      setAdvice(result);

      if (!isGuest && session) {
        await supabase.from('style_lookups').insert({
          event_type: eventType,
          event_details: eventDetails || null,
          advice: result,
        });
      }
    } catch {
      setError('Oups, something went wrong. Réessaie!');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPhotoPreview(null);
    setSkinTone('');
    setEventType('');
    setEventDetails('');
    setAdvice(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (advice) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-gray-800">Ton conseil style</h1>
            <p className="text-sm text-gray-500 mt-1">
              {eventType}{eventDetails ? ` — ${eventDetails}` : ''}
            </p>
          </div>
          <button onClick={handleReset} className="btn-secondary text-sm">
            Nouveau conseil
          </button>
        </div>

        {photoPreview && (
          <div className="card p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Ta photo</p>
            <img src={photoPreview} alt="Ta tenue" className="max-h-72 rounded-2xl object-contain mx-auto" />
          </div>
        )}

        {/* Outfit feedback */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 bg-success-500 rounded-2xl flex items-center justify-center">
              <Shirt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Ta tenue</h3>
              {advice.outfitFeedback.ok ? (
                <p className="text-sm text-success-600 font-medium">Ta tenue est top pour cet événement!</p>
              ) : (
                <p className="text-sm text-warning-600 font-medium">Quelques ajustements à prévoir</p>
              )}
            </div>
          </div>
          <ul className="space-y-2">
            {advice.outfitFeedback.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-success-500 mt-0.5 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Make-up steps */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 bg-primary-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-800">Ton make-up étape par étape</h3>
          </div>
          <div className="space-y-3">
            {advice.makeup.map((step, i) => (
              <div key={i} className="flex gap-3 p-3 bg-primary-50/60 rounded-2xl">
                <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{step.step}</p>
                  <p className="text-xs text-primary-600 font-medium mb-1">{step.product}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended colors */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 bg-secondary-500 rounded-2xl flex items-center justify-center">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-800">Les couleurs qui te mettent en valeur</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {advice.colors.map((color, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-medium text-gray-700">{color}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Overall tip */}
        <div className="card p-5 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-100">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 bg-accent-500 rounded-2xl flex items-center justify-center shrink-0">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-1">Le petit conseil en plus</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{advice.overallTip}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-gray-800">Style & Make-up</h1>
        <p className="text-gray-500 mt-2">
          Prends-toi en photo, dis-nous l'occasion et on te conseille le make-up parfait et si ta tenue est OK.
        </p>
      </div>

      {/* Photo upload */}
      <div className="card p-5">
        <h3 className="font-bold text-gray-800 mb-1">1. Ta photo (optionnel)</h3>
        <p className="text-sm text-gray-500 mb-4">Montre ta tenue pour qu'on te donne des conseils personnalisés.</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handlePhotoUpload}
          className="hidden"
        />
        {photoPreview ? (
          <div className="relative">
            <img src={photoPreview} alt="Ta tenue" className="max-h-64 rounded-2xl object-contain mx-auto" />
            <button
              onClick={() => { setPhotoPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-primary-200 rounded-3xl py-10 flex flex-col items-center gap-3 text-primary-400 hover:border-primary-400 hover:bg-primary-50/50 transition-all"
          >
            <Camera className="w-10 h-10" />
            <span className="font-semibold text-primary-500">Prendre une photo ou importer</span>
          </button>
        )}
      </div>

      {/* Skin tone */}
      <div className="card p-5">
        <h3 className="font-bold text-gray-800 mb-1">2. Ta couleur de peau</h3>
        <p className="text-sm text-gray-500 mb-4">Pour adapter les couleurs du make-up à ton teint.</p>
        <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
          {SKIN_TONES.map((tone) => (
            <button
              key={tone.value}
              onClick={() => setSkinTone(tone.value)}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={`w-14 h-14 rounded-full transition-all duration-200 ${
                  skinTone === tone.value
                    ? 'ring-4 ring-primary-400 ring-offset-2 scale-110'
                    : 'ring-2 ring-gray-200 hover:ring-primary-200'
                }`}
                style={{ backgroundColor: tone.color }}
              />
              <span className={`text-xs ${skinTone === tone.value ? 'font-bold text-primary-600' : 'text-gray-500'}`}>
                {tone.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Event type */}
      <div className="card p-5">
        <h3 className="font-bold text-gray-800 mb-1">3. L'occasion</h3>
        <p className="text-sm text-gray-500 mb-4">C'est pour quel type d'événement?</p>
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map((ev) => (
            <button
              key={ev}
              onClick={() => setEventType(ev)}
              className={`px-4 py-2.5 rounded-full font-medium text-sm transition-all ${
                eventType === ev
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
                  : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
              }`}
            >
              {ev}
            </button>
          ))}
        </div>
      </div>

      {/* Event details */}
      <div className="card p-5">
        <h3 className="font-bold text-gray-800 mb-1">4. Détails (optionnel)</h3>
        <p className="text-sm text-gray-500 mb-4">Parle-nous du thème, du code dress, de tes envies...</p>
        <textarea
          value={eventDetails}
          onChange={(e) => setEventDetails(e.target.value)}
          placeholder="Ex: anniversaire sur le thème des années 2000, je porte une robe rose..."
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
          rows={3}
        />
      </div>

      {error && (
        <div className="card p-4 bg-error-50 border border-error-100">
          <p className="text-sm text-error-600">{error}</p>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={!canGenerate || loading}
        className="btn-primary w-full justify-center py-4 text-base"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-pulse" />
            On prépare ton conseil...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Obtenir mon conseil style
          </span>
        )}
      </button>
    </div>
  );
}
