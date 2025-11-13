
import React, { useState, useCallback } from 'react';
import { View, type Product } from './types';
import BarcodeScanner from './components/BarcodeScanner';
import ProductDisplay from './components/ProductDisplay';
import Chat from './components/Chat';
import Header from './components/Header';
import { fetchProductByBarcode } from './services/openFoodFactsService';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.Scanner);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = useCallback(async (barcode: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const productData = await fetchProductByBarcode(barcode);
      setProduct(productData);
      setView(View.Product);
    } catch (err: any) {
      setError(err.message || "Une erreur inconnue s'est produite.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStartChat = () => {
    if (product) {
      setView(View.Chat);
    }
  };

  const handleScanAnother = () => {
    setProduct(null);
    setError(null);
    setView(View.Scanner);
  };
  
  const handleBackToProduct = () => {
      setView(View.Product);
  }

  const renderContent = () => {
    switch (view) {
      case View.Scanner:
        return <BarcodeScanner onScan={handleScan} isLoading={isLoading} error={error} />;
      case View.Product:
        return product && <ProductDisplay product={product} onStartChat={handleStartChat} onScanAnother={handleScanAnother} />;
      case View.Chat:
        return product && <Chat product={product} onBack={handleBackToProduct}/>;
      default:
        return <BarcodeScanner onScan={handleScan} isLoading={isLoading} error={error} />;
    }
  };

  const getHeaderTitle = () => {
    switch(view) {
        case View.Scanner: return "NutriScan AI";
        case View.Product: return "Détails du Produit";
        case View.Chat: return "Assistant IA";
        default: return "NutriScan AI";
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col font-sans bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header 
        title={getHeaderTitle()} 
        showBack={view !== View.Scanner}
        onBack={view === View.Product ? handleScanAnother : view === View.Chat ? handleBackToProduct : undefined}
      />
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
