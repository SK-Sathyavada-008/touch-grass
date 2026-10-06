import React from 'react';
import type { ViewState } from '../types';
import { ClayLeaf } from './clay/ClayIcons';

interface NavbarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  hasActiveAdventure: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, hasActiveAdventure }) => {
  return (
    <header className="sticky top-0 z-30 pt-3 pb-2 px-4 bg-[#FAF7F0]/90 backdrop-blur-sm transition-all border-b border-[#1A3826]/5">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
          aria-label="TouchGrass Home"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#E2EDE3] border border-white flex items-center justify-center shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),0_2px_6px_rgba(26,56,38,0.06)] group-active:scale-95 transition-transform">
            <ClayLeaf size={20} />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-[#163321] tracking-tight flex items-center gap-1 leading-none">
              TouchGrass
            </h1>
            <p className="text-[10px] text-[#557860] font-medium leading-tight mt-0.5">
              Go somewhere. Notice more.
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {hasActiveAdventure && currentView !== 'quest' && (
            <button
              onClick={() => onNavigate('quest')}
              className="clay-badge px-3 py-1 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform text-[#1D432D]"
              aria-label="View active quest"
            >
              <span className="w-2 h-2 rounded-full bg-[#E9B44C] animate-pulse"></span>
              <span>Active Quest</span>
            </button>
          )}

          <div
            className="w-8 h-8 rounded-full bg-[#F4EFE6] border border-white/80 flex items-center justify-center text-xs shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]"
            title="Ready for offline adventure"
          >
            🌱
          </div>
        </div>
      </div>
    </header>
  );
};
