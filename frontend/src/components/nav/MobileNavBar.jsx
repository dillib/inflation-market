import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LineChart, Wallet } from 'lucide-react';

export default function MobileNavBar() {
  const { pathname } = useLocation();
  const isActive = (p) => pathname === p;
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 py-3 grid grid-cols-3 gap-4 text-sm">
        <Link to="/" className={`flex flex-col items-center ${isActive('/') ? 'text-yellow-400' : 'text-gray-300'}`}>
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>
        <Link to="/app" className={`flex flex-col items-center ${isActive('/app') ? 'text-yellow-400' : 'text-gray-300'}`}>
          <LineChart className="w-5 h-5" />
          <span>CPI Pool</span>
        </Link>
        <Link to="/how-it-works" className={`flex flex-col items-center ${isActive('/how-it-works') ? 'text-yellow-400' : 'text-gray-300'}`}>
          <Wallet className="w-5 h-5" />
          <span>How It Works</span>
        </Link>
      </div>
    </nav>
  );
}

