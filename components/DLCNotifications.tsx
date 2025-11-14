import React, { useEffect, useState } from 'react';
import { frigoService, type FrigoItem } from '../services/frigoService';

const DLCNotifications: React.FC = () => {
  const [expiredItems, setExpiredItems] = useState<FrigoItem[]>([]);
  const [expiringSoonItems, setExpiringSoonItems] = useState<FrigoItem[]>([]);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const checkDLC = () => {
      const expired = frigoService.getExpired();
      const expiringSoon = frigoService.getExpiringSoon();
      
      setExpiredItems(expired);
      setExpiringSoonItems(expiringSoon);
      
      if (expired.length > 0 || expiringSoon.length > 0) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
      }
    };

    checkDLC();
    const interval = setInterval(checkDLC, 60000); // Vérifier toutes les minutes

    return () => clearInterval(interval);
  }, []);

  if (!showNotification || (expiredItems.length === 0 && expiringSoonItems.length === 0)) {
    return null;
  }

  return (
    <div className="fixed top-24 right-4 z-40 flex w-full max-w-sm flex-col gap-3 animate-slide-in-right">
      {expiredItems.length > 0 && (
        <div className="rounded-[20px] border border-red-200 bg-white/95 p-4 shadow-[0_25px_50px_rgba(239,68,68,0.25)]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-sm font-semibold text-red-500">
                {expiredItems.length} produit{expiredItems.length > 1 ? 's expirés' : ' expiré'}
              </h4>
              <p className="text-xs text-slate-500">
                {expiredItems.slice(0, 2).map(item => item.product.product_name).join(', ')}
                {expiredItems.length > 2 && '...'}
              </p>
            </div>
            <button onClick={() => setShowNotification(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {expiringSoonItems.length > 0 && (
        <div className="rounded-[20px] border border-yellow-200 bg-white/95 p-4 shadow-[0_25px_50px_rgba(234,179,8,0.25)]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-sm font-semibold text-yellow-500">
                {expiringSoonItems.length} produit{expiringSoonItems.length > 1 ? 's expirent' : ' expire'} bientôt
              </h4>
              <p className="text-xs text-slate-500">
                {expiringSoonItems.slice(0, 2).map(item => item.product.product_name).join(', ')}
                {expiringSoonItems.length > 2 && '...'}
              </p>
            </div>
            <button onClick={() => setShowNotification(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DLCNotifications;

