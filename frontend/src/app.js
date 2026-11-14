import React, { createContext, useContext, useState, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ToastProvider } from './components/toast/ToastProvider';
import { Web3Context } from './contexts/Web3Context';
import LandingPageComp from './pages/LandingPage';
import CPIPoolPageComp from './pages/CPIPoolPage';
import MobileNavBar from './components/nav/MobileNavBar';
const AboutPage = lazy(() => import('./pages/AboutPage'));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));

const AppStateContext = createContext(null);

export const AppStateProvider = ({ children }) => {
  const web3 = useContext(Web3Context);
  const [selectedMarket, setSelectedMarket] = useState('inflation');
  const [positions, setPositions] = useState([]);

  const account = {
    address: web3?.account || null,
    isConnected: web3?.isConnected || false,
    balance: 0,
  };

  const connect = async () => {
    console.log('🔘 [AppState] connect() called');
    console.log('🔍 [AppState] web3 object:', web3);
    console.log('🔍 [AppState] web3.connectWallet exists:', typeof web3?.connectWallet);
    if (!web3?.connectWallet) {
      console.error('❌ [AppState] web3.connectWallet is not available!');
      return;
    }
    console.log('➡️  [AppState] Calling web3.connectWallet()...');
    return web3.connectWallet();
  };
  const disconnect = () => web3?.disconnectWallet?.();

  return (
    <AppStateContext.Provider value={{
      account,
      selectedMarket,
      setSelectedMarket,
      positions,
      setPositions,
      connect,
      disconnect,
      isLoading: web3?.isConnecting || false,
      web3,
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
};

export default function InflationMarketApp() {
  return (
    <ToastProvider>
      <AppStateProvider>
        <Suspense fallback={<div className="text-white p-6">Loading...</div>}>
          <RoutedApp />
          <MobileNavBar />
        </Suspense>
      </AppStateProvider>
    </ToastProvider>
  );
}

const WithNavigate = ({ Component }) => {
  const navigate = useNavigate();
  const onNavigate = (page) => {
    const map = {
      landing: '/',
      app: '/app',
      about: '/about',
      'how-it-works': '/how-it-works',
      faq: '/faq',
    };
    navigate(map[page] || '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return <Component onNavigate={onNavigate} />;
};

const RoutedApp = () => (
  <Routes>
    <Route path="/" element={<WithNavigate Component={LandingPageComp} />} />
    <Route path="/app" element={<WithNavigate Component={CPIPoolPageComp} />} />
    <Route path="/faq" element={<WithNavigate Component={FAQPage} />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/how-it-works" element={<HowItWorksPage />} />
    <Route path="*" element={<WithNavigate Component={LandingPageComp} />} />
  </Routes>
);

// Pages moved to src/pages/* and lazy-loaded above

