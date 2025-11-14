
import React, { useState, useCallback } from 'react';
import Loader from './Loader';
import CameraScanner from './CameraScanner';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isLoading: boolean;
  error: string | null;
}

const chips = ['Mobile first', 'Temps réel', 'Sécurisé'];
const desktopIndicators = [
  { label: 'Caméra', value: '1080p', description: 'Flux optimisé' },
  { label: 'Latence', value: '< 120 ms', description: 'Analyse locale' },
  { label: 'Sécurité', value: 'Chiffré', description: 'Aucune donnée stockée' }
];
const desktopChecklist = [
  {
    title: 'Préparer',
    tips: ['Essuyer le code-barres', 'Limiter les reflets', 'Stabiliser le produit']
  },
  {
    title: 'Scanner',
    tips: ['Positionner à 15 cm', 'Attendre la vibration', 'Recentrer si besoin']
  },
  {
    title: 'Analyser',
    tips: ['Comparer la nutrition', 'Consulter le prix', 'Voir les alertes DLC']
  }
];

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, isLoading, error }) => {
  const [barcode, setBarcode] = useState('');
  const [inputError, setInputError] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setBarcode(value);
      if (inputError) setInputError('');
    }
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (barcode.length !== 13) {
        setInputError('Le code-barres EAN-13 doit contenir exactement 13 chiffres.');
        return;
      }
      setInputError('');
      onScan(barcode);
    },
    [barcode, onScan]
  );

  return (
    <>
      {showCamera && (
        <CameraScanner
          onDetected={(code) => {
            setBarcode(code);
            setShowCamera(false);
            onScan(code);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}

      <div className="safe-area-top safe-area-bottom flex min-h-screen flex-col overflow-y-auto bg-gradient-to-b from-slate-50 via-white to-white px-4 py-6 text-left sm:px-6 md:px-8">
        <div className="mx-auto flex w-full max-w-8xl flex-1 flex-col gap-6 pb-10">
          <header className="animate-fade-in rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-[0_25px_45px_rgba(15,23,42,0.08)] backdrop-blur lg:flex lg:items-center lg:justify-between lg:gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563eb] via-[#38bdf8] to-[#0ea5e9] text-white shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18M3 12h18M3 19h18" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Scanner</p>
                <h1 className="text-2xl font-bold text-slate-900">Code-barres EAN-13</h1>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed lg:max-w-xl">
              Scannez avec votre caméra ou saisissez les chiffres pour retrouver instantanément les informations produit. L’interface s’adapte automatiquement pour rester lisible, du mobile au bureau.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 lg:mt-0 lg:flex-shrink-0 lg:justify-end">
              {chips.map((chip) => (
                <span key={chip} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  {chip}
                </span>
              ))}
            </div>
          </header>

          <section className="space-y-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-6 lg:space-y-0">
            <div className="rounded-[30px] border border-white/60 bg-white/90 p-5 shadow-[0_35px_65px_rgba(15,23,42,0.08)] backdrop-blur-sm">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-400">Option rapide</p>
                  <h2 className="text-lg font-semibold text-slate-900">Scanner avec la caméra</h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="group flex w-full flex-col items-center gap-3 rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-5 text-center shadow-inner transition hover:-translate-y-0.5 hover:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg transition group-hover:scale-105">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">Ouvrir la caméra</p>
                    <p className="text-sm text-slate-500">Alignez le code dans le cadre pour une lecture immédiate.</p>
                  </div>
                </button>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                    <p className="font-semibold text-slate-600">Astuce</p>
                    <p>Nettoyez l’objectif pour optimiser la détection.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                    <p className="font-semibold text-slate-600">Vie privée</p>
                    <p>Aucune image n’est stockée.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/60 bg-white/95 p-5 shadow-[0_35px_65px_rgba(15,23,42,0.08)] backdrop-blur-sm">
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
                aria-label="Entrer un code-barres manuellement"
                autoComplete="off"
                spellCheck={false}
              >
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-400">Plan B</p>
                  <h2 className="text-lg font-semibold text-slate-900">Saisie manuelle</h2>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                  <label htmlFor="barcode-input" className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Code-barres
                  </label>
                  <div className="relative mt-2">
                    <input
                      id="barcode-input"
                      type="tel"
                      inputMode="numeric"
                      pattern="\d{13}"
                      value={barcode}
                      onChange={handleInputChange}
                      placeholder="0000 0000 0000 0"
                      maxLength={13}
                      className="w-full rounded-2xl bg-white px-4 py-3 text-center text-xl font-mono tracking-[0.4em] text-slate-900 placeholder:text-slate-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60 sm:text-2xl sm:tracking-[0.6em] aria-[invalid='true']:ring-red-400"
                      aria-invalid={!!inputError}
                      aria-describedby={inputError ? 'barcode-error' : undefined}
                      autoFocus
                    />
                    <span className="stat-chip absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-slate-500 shadow" aria-live="polite">
                      {barcode.length}/13
                    </span>
                  </div>
                </div>

                {inputError && (
                  <div
                    id="barcode-error"
                    className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-600"
                    role="alert"
                  >
                    <p className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{inputError}</span>
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || barcode.length !== 13}
                  aria-disabled={isLoading || barcode.length !== 13}
                  className="flex items-center justify-center gap-3 rounded-3xl bg-slate-900 py-4 text-base font-semibold text-white shadow-[0_15px_35px_rgba(15,23,42,0.3)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isLoading ? (
                    <>
                      <Loader />
                      <span>Recherche en cours…</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Lancer la recherche</span>
                    </>
                  )}
                </button>

                {error && (
                  <div className="rounded-2xl border border-red-100 bg-red-50/80 p-3 text-sm text-red-600">
                    <p className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </p>
                  </div>
                )}
              </form>
            </div>
          </section>

          <section className="hidden rounded-[34px] border border-white/70 bg-white/90 p-6 shadow-[0_45px_85px_rgba(15,23,42,0.08)] backdrop-blur-lg lg:block">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-slate-400">Mode bureau</p>
                <h3 className="text-xl font-semibold text-slate-900">Assistant détaillé</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {desktopIndicators.map((indicator) => (
                  <div key={indicator.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-right">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">{indicator.label}</p>
                    <p className="text-lg font-semibold text-slate-900">{indicator.value}</p>
                    <p className="text-[11px] text-slate-500">{indicator.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {desktopChecklist.map((section) => (
                <div key={section.title} className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-slate-800">{section.title}</h4>
                  <ul className="space-y-2 text-xs text-slate-500">
                    {section.tips.map((tip) => (
                      <li key={tip} className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-3.5 w-3.5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default BarcodeScanner;
