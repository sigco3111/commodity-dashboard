
import React, { useState } from 'react';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import DetailView from './components/DetailView';
import { Commodity } from './types';

const App: React.FC = () => {
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(null);

  const handleSelectCommodity = (commodity: Commodity) => {
    window.scrollTo(0, 0);
    setSelectedCommodity(commodity);
  };

  const handleBackToDashboard = () => {
    setSelectedCommodity(null);
  };

  return (
    <div className="min-h-screen bg-brand-primary font-sans">
      <Header 
        onLogoClick={selectedCommodity ? handleBackToDashboard : undefined}
      />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        {!selectedCommodity ? (
          <DashboardView onSelectCommodity={handleSelectCommodity} />
        ) : (
          <DetailView 
            commodity={selectedCommodity} 
          />
        )}
      </main>
       <footer className="text-center py-4 text-brand-subtle text-sm">
        데이터 제공: Yahoo Finance. 이 앱은 정보 제공 목적으로만 사용됩니다.
      </footer>
    </div>
  );
};

export default App;
