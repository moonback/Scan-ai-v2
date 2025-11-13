
import React, { useState, useCallback, useEffect } from 'react';
import { View, type Product } from './types';
import BarcodeScanner from './components/BarcodeScanner';
import ProductDisplay from './components/ProductDisplay';
import Chat from './components/Chat';
import Header from './components/Header';
import Frigo from './components/Frigo';
import AddToFrigoModal from './components/AddToFrigoModal';
import ProductExistsModal from './components/ProductExistsModal';
import ModifyFrigoItemModal from './components/ModifyFrigoItemModal';
import DLCNotifications from './components/DLCNotifications';
import { fetchProductByBarcode } from './services/openFoodFactsService';
import { frigoService, type FrigoCategory, type FrigoItem } from './services/frigoService';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.Scanner);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [frigoCount, setFrigoCount] = useState(0);
  const [showAddToFrigoModal, setShowAddToFrigoModal] = useState(false);
  const [showProductExistsModal, setShowProductExistsModal] = useState(false);
  const [showModifyItemModal, setShowModifyItemModal] = useState(false);
  const [existingFrigoItem, setExistingFrigoItem] = useState<FrigoItem | null>(null);

  const handleScan = useCallback(async (barcode: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const productData = await fetchProductByBarcode(barcode);
      setProduct(productData);
      
      // Vérifier si le produit existe déjà dans le frigo
      const existingItem = frigoService.getByProduct(productData);
      if (existingItem) {
        setExistingFrigoItem(existingItem);
        setShowProductExistsModal(true);
      } else {
        setView(View.Product);
      }
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

  const handleAddToFrigo = () => {
    if (product) {
      // Vérifier si le produit existe déjà dans le frigo
      const existingItem = frigoService.getByProduct(product);
      if (existingItem) {
        setExistingFrigoItem(existingItem);
        setShowProductExistsModal(true);
      } else {
        setShowAddToFrigoModal(true);
      }
    }
  };

  const handleAddToExistingStock = () => {
    if (existingFrigoItem) {
      const success = frigoService.incrementQuantity(existingFrigoItem.id, 1);
      if (success) {
        updateFrigoCount();
        setShowProductExistsModal(false);
        setExistingFrigoItem(null);
        // Afficher un message de succès
        alert('Quantité ajoutée au stock existant !');
      }
    }
  };

  const handleModifyExistingItem = () => {
    setShowProductExistsModal(false);
    setShowModifyItemModal(true);
  };

  const handleConfirmModifyItem = (quantity: number, category: FrigoCategory, dlc?: string, price?: number, store?: string) => {
    if (existingFrigoItem) {
      const success = frigoService.update(existingFrigoItem.id, {
        quantity,
        category,
        dlc,
        price,
        store
      });
      if (success) {
        updateFrigoCount();
        setShowModifyItemModal(false);
        setExistingFrigoItem(null);
        alert('Fiche mise à jour avec succès !');
      } else {
        alert('Erreur lors de la mise à jour.');
      }
    }
  };

  const handleViewProductFromModal = () => {
    setShowProductExistsModal(false);
    setView(View.Product);
  };

  const handleCloseProductExistsModal = () => {
    setShowProductExistsModal(false);
    setExistingFrigoItem(null);
  };

  const handleCloseModifyItemModal = () => {
    setShowModifyItemModal(false);
    setExistingFrigoItem(null);
  };

  const handleConfirmAddToFrigo = (quantity: number, category: FrigoCategory, dlc?: string, price?: number, store?: string) => {
    if (product) {
      const success = frigoService.add(product, quantity, category, dlc, price, store);
      if (success) {
        updateFrigoCount();
        setShowAddToFrigoModal(false);
      } else {
        alert('Erreur lors de l\'ajout au frigo.');
      }
    }
  };

  const handleFrigoClick = () => {
    setView(View.Frigo);
  };

  const handleProductSelectFromFrigo = (selectedProduct: Product) => {
    setProduct(selectedProduct);
    setView(View.Product);
  };

  const updateFrigoCount = () => {
    setFrigoCount(frigoService.getCount());
  };

  useEffect(() => {
    updateFrigoCount();
  }, []);

  useEffect(() => {
    // Mettre à jour le compteur quand on change de vue
    if (view === View.Frigo || view === View.Product) {
      updateFrigoCount();
    }
  }, [view]);

  const renderContent = () => {
    switch (view) {
      case View.Scanner:
        return <BarcodeScanner onScan={handleScan} isLoading={isLoading} error={error} />;
      case View.Product:
        return product && <ProductDisplay product={product} onStartChat={handleStartChat} onScanAnother={handleScanAnother} onAddToFrigo={handleAddToFrigo} />;
      case View.Chat:
        return product && <Chat product={product} onBack={handleBackToProduct}/>;
      case View.Frigo:
        return <Frigo onProductSelect={handleProductSelectFromFrigo} onBack={handleScanAnother} onFrigoChange={updateFrigoCount} />;
      default:
        return <BarcodeScanner onScan={handleScan} isLoading={isLoading} error={error} />;
    }
  };

  const getHeaderTitle = () => {
    switch(view) {
        case View.Scanner: return "NutriScan AI";
        case View.Product: return "Détails du Produit";
        case View.Chat: return "Assistant IA";
        case View.Frigo: return "Mon Frigo";
        default: return "NutriScan AI";
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col font-sans bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      <DLCNotifications />
      <Header 
        title={getHeaderTitle()} 
        showBack={view !== View.Scanner}
        onBack={view === View.Product ? handleScanAnother : view === View.Chat ? handleBackToProduct : view === View.Frigo ? handleScanAnother : undefined}
        showFrigo={view !== View.Frigo}
        onFrigoClick={handleFrigoClick}
        frigoCount={frigoCount}
      />
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
      {showAddToFrigoModal && product && (
        <AddToFrigoModal
          product={product}
          onClose={() => setShowAddToFrigoModal(false)}
          onConfirm={handleConfirmAddToFrigo}
        />
      )}
      {showProductExistsModal && product && existingFrigoItem && (
        <ProductExistsModal
          product={product}
          existingItem={existingFrigoItem}
          onAddToExisting={handleAddToExistingStock}
          onModify={handleModifyExistingItem}
          onViewProduct={handleViewProductFromModal}
          onClose={handleCloseProductExistsModal}
        />
      )}
      {showModifyItemModal && existingFrigoItem && (
        <ModifyFrigoItemModal
          item={existingFrigoItem}
          onClose={handleCloseModifyItemModal}
          onConfirm={handleConfirmModifyItem}
        />
      )}
    </div>
  );
};

export default App;
