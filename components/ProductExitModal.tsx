import React, { useState } from 'react';
import type { FrigoItem, FrigoExitEntry } from '../services/frigoService';

interface ExitFormValues {
  quantity: number;
  reason: string;
  notes: string;
  date: string;
}

interface ProductExitModalProps {
  item: FrigoItem;
  isSubmitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (values: ExitFormValues) => Promise<void> | void;
  latestExit?: FrigoExitEntry | null;
}

const ProductExitModal: React.FC<ProductExitModalProps> = ({
  item,
  isSubmitting = false,
  error,
  onClose,
  onConfirm,
  latestExit
}) => {
  const maxQuantity = Math.max(1, item.quantity ?? 1);
  const [quantity, setQuantity] = useState(Math.min(1, maxQuantity));
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const safeQuantity = Math.max(1, Math.min(maxQuantity, quantity));
    onConfirm({ quantity: safeQuantity, reason, notes, date });
  };

  const handleQuantityChange = (value: number) => {
    if (Number.isNaN(value)) return;
    setQuantity(Math.max(1, Math.min(maxQuantity, value)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 sm:p-6">
      <div className="glass-card w-full max-w-lg rounded-3xl border border-white/10 p-4 sm:p-6 shadow-2xl animate-fade-in max-h-[95vh] overflow-y-auto smooth-scroll">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Sortie</p>
            <h2 className="text-xl font-bold text-slate-900">Retirer du frigo</h2>
            <p className="text-sm text-slate-500 line-clamp-2">
              {item.product.product_name} · {item.product.brands || 'Marque inconnue'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/40 p-2 text-slate-500 transition hover:text-slate-900"
            aria-label="Fermer la modale de sortie"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-5 rounded-2xl border border-white/40 bg-white/80 p-4">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Stock disponible</span>
            <span className="text-base font-semibold text-slate-900">
              {maxQuantity} unité{maxQuantity > 1 ? 's' : ''}
            </span>
          </div>
          {latestExit && (
            <div className="mt-3 rounded-2xl bg-slate-900/5 p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">Dernière sortie</p>
              <p>
                {new Date(latestExit.date).toLocaleDateString('fr-FR')} · {latestExit.quantity} unité{latestExit.quantity > 1 ? 's' : ''}
              </p>
              {latestExit.reason && <p className="text-slate-500">Motif: {latestExit.reason}</p>}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              Quantité à sortir
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-white/50 bg-white/70 p-2">
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity - 1)}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/60 text-slate-600 transition hover:bg-white"
                disabled={quantity <= 1}
                aria-label="Réduire la quantité à sortir"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                </svg>
              </button>
              <div className="flex-1 text-center">
                <input
                  type="number"
                  min={1}
                  max={maxQuantity}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10))}
                  className="w-full bg-transparent text-center text-2xl font-bold text-slate-900 focus:outline-none"
                />
                <p className="text-xs text-slate-500">max {maxQuantity}</p>
              </div>
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity + 1)}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/60 text-slate-600 transition hover:bg-white"
                disabled={quantity >= maxQuantity}
                aria-label="Augmenter la quantité à sortir"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Motif (optionnel)</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Repas, don, gaspillage..."
                className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Date de sortie</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Infos complémentaires (ex : utilisé pour batch cooking)."
              className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-white"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 rounded-2xl bg-gradient-to-r from-[#f97316] to-[#ef4444] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement…' : 'Valider la sortie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductExitModal;

