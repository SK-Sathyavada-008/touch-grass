import React from 'react';
import type { ViewState } from '../types';
import { ClayLeaf, ClayButterfly, ClayBackpack, ClayMapPin } from './clay/ClayIcons';

interface BottomNavProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    {
      id: 'home' as ViewState,
      label: 'Home',
      icon: (active: boolean) => (
        <span className={active ? 'scale-110 transition-transform' : 'opacity-65 transition-opacity'}>
          <ClayLeaf size={22} />
        </span>
      ),
    },
    {
      id: 'explore' as ViewState,
      label: 'Explore',
      icon: (active: boolean) => (
        <span className={active ? 'scale-110 transition-transform' : 'opacity-65 transition-opacity'}>
          <ClayMapPin size={22} />
        </span>
      ),
    },
    {
      id: 'camera' as ViewState,
      label: 'Discover',
      icon: (active: boolean) => (
        <span className={active ? 'scale-110 transition-transform' : 'opacity-65 transition-opacity'}>
          <ClayButterfly size={22} />
        </span>
      ),
    },
    {
      id: 'progress' as ViewState,
      label: 'Backpack',
      icon: (active: boolean) => (
        <span className={active ? 'scale-110 transition-transform' : 'opacity-65 transition-opacity'}>
          <ClayBackpack size={22} />
        </span>
      ),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 pb-safe pt-2 px-4 pointer-events-none"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="max-w-md mx-auto mb-3 pointer-events-auto">
        <div className="clay-card py-2 px-3 flex items-center justify-around bg-white/95 backdrop-blur-md border border-white shadow-[0_10px_25px_-5px_rgba(26,56,38,0.12),inset_1px_1px_2px_rgba(255,255,255,0.9)] rounded-[26px]">
          {navItems.map((item) => {
            const isActive = currentView === item.id || (item.id === 'home' && currentView === 'ten-minute') || (item.id === 'explore' && currentView === 'quest');
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex-1 py-1 px-2 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all relative ${
                  isActive ? 'text-[#163321] font-extrabold' : 'text-[#6C8573] font-medium hover:text-[#2E543B]'
                }`}
                aria-label={item.label}
              >
                {isActive && (
                  <span className="absolute -top-1 w-6 h-1 rounded-full bg-[#3D6B49]" />
                )}
                {item.icon(isActive)}
                <span className="text-[11px] leading-none tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
