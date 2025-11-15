import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Pizza,
  Settings,
  Image,
  ShoppingCart,
  BarChart3,
  Clock,
  Menu as MenuIcon,
  Loader2,
  Package,
  ChevronRight,
  Home,
  X
} from 'lucide-react';

// Lazy load components
const ProductsAdmin = lazy(() => import('./ProductsAdmin'));
const CustomerMenuAdmin = lazy(() => import('./CustomerMenuAdmin'));
const BusinessHoursManager = lazy(() => import('./BusinessHoursManager'));
const AnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));
const BulkStockManager = lazy(() => import('./BulkStockManager'));
const SettingsManager = lazy(() => import('./SettingsManager'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    <span className="ml-2 text-gray-600">Caricamento...</span>
  </div>
);

const MobileAdminPanel = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Main sections optimized for mobile
  const mainSections = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Panoramica e statistiche',
      color: 'bg-blue-500'
    },
    {
      id: 'products',
      label: 'Prodotti',
      icon: Pizza,
      description: 'Gestione menu',
      color: 'bg-orange-500'
    },
    {
      id: 'customer-menu',
      label: 'Menu Cliente',
      icon: ShoppingCart,
      description: 'Menu pubblico',
      color: 'bg-green-500'
    },
    {
      id: 'stock',
      label: 'Magazzino',
      icon: Package,
      description: 'Gestione stock',
      color: 'bg-purple-500'
    },
    {
      id: 'hours',
      label: 'Orari',
      icon: Clock,
      description: 'Orari apertura',
      color: 'bg-indigo-500'
    },
    {
      id: 'settings',
      label: 'Impostazioni',
      icon: Settings,
      description: 'Configurazione',
      color: 'bg-gray-500'
    }
  ];

  const currentSection = mainSections.find(s => s.id === activeSection);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AnalyticsDashboard />
          </Suspense>
        );
      case 'products':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ProductsAdmin />
          </Suspense>
        );
      case 'customer-menu':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <CustomerMenuAdmin />
          </Suspense>
        );
      case 'stock':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <BulkStockManager />
          </Suspense>
        );
      case 'hours':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <BusinessHoursManager />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <SettingsManager />
          </Suspense>
        );
      default:
        return <div>Sezione non trovata</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg ${currentSection?.color} flex items-center justify-center`}>
              {currentSection && <currentSection.icon className="h-6 w-6 text-white" />}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{currentSection?.label}</h1>
              <p className="text-xs text-gray-500">{currentSection?.description}</p>
            </div>
          </div>
          
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <MenuIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Admin Panel</h2>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white hover:bg-white/20"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-sm text-white/80 mt-1">Efes Kebap Torino</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-2">
                    {mainSections.map((section) => {
                      const Icon = section.icon;
                      const isActive = activeSection === section.id;
                      
                      return (
                        <button
                          key={section.id}
                          onClick={() => {
                            setActiveSection(section.id);
                            setIsMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-4 rounded-lg transition-all ${
                            isActive
                              ? 'bg-blue-50 border-2 border-blue-500'
                              : 'bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg ${section.color} flex items-center justify-center`}>
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div className="text-left">
                              <div className={`font-semibold ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                                {section.label}
                              </div>
                              <div className="text-xs text-gray-500">{section.description}</div>
                            </div>
                          </div>
                          <ChevronRight className={`h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="grid grid-cols-4 gap-1 p-2">
          {mainSections.slice(0, 4).map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-6 w-6 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                  {section.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileAdminPanel;
