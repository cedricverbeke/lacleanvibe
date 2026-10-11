import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-primary-100" />
        <div className="w-16 h-16 rounded-full border-4 border-primary-500 border-t-transparent animate-spin absolute top-0 left-0" />
      </div>
      {text && <p className="text-gray-500 font-medium animate-pulse-soft">{text}</p>}
    </div>
  );
}

export function InlineLoader({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-primary-500">
      <Loader2 className="w-5 h-5 animate-spin" />
      {text && <span className="text-sm font-medium">{text}</span>}
    </div>
  );
}
