import React from 'react';
import type { ViewState, ActiveAdventure } from '../types';
import { ClayCharacter } from '../components/clay/ClayCharacter';
import { ClayCard } from '../components/clay/ClayCard';
import { ClayLeaf, ClaySun, ClayMapPin, ClayButterfly, ClayBackpack } from '../components/clay/ClayIcons';
import { motion } from 'framer-motion';

interface HomeViewProps {
  onNavigate: (view: ViewState) => void;
  activeAdventure: ActiveAdventure | null;
  onQuickTenMinute: () => void;
  isLoadingTenMinute: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  activeAdventure,
  onQuickTenMinute,
  isLoadingTenMinute,
}) => {
  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Hero Welcome Section */}
      <section className="text-center pt-2 pb-1">
        <div className="relative inline-block mb-2">
          {/* Gentle floating clay sun */}
          <div className="absolute -top-2 -right-5 animate-float-slow opacity-85 pointer-events-none">
            <ClaySun size={34} />
          </div>
          {/* Animated Clay Character Pebble */}
          <ClayCharacter mood="idle" size="md" className="mx-auto" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F1E9] border border-[#D0E2D2] text-[#1D432D] text-xs font-bold mb-2">
            <span>🌿</span>
            <span>TouchGrass</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#163321] tracking-tight">
            Go somewhere. Notice more.
          </h2>
          <p className="text-xs sm:text-sm text-[#53705C] max-w-xs mx-auto mt-1.5 font-medium leading-relaxed">
            Ask AI → get a real-world quest → put your phone away → go outside.
          </p>
        </motion.div>
      </section>

      {/* BIG DOMINANT CTA: I HAVE 10 MINUTES */}
      <section className="px-1">
        <motion.div
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="relative"
        >
          <button
            onClick={onQuickTenMinute}
            disabled={isLoadingTenMinute}
            className="w-full relative clay-btn-forest py-6 px-6 rounded-[28px] flex flex-col items-center justify-center gap-1.5 shadow-[0_12px_24px_-4px_rgba(24,55,37,0.32),inset_2px_2px_4px_rgba(255,255,255,0.25),inset_-2px_-2px_4px_rgba(0,0,0,0.28)] transition-all group overflow-hidden"
            aria-label="I have 10 minutes quick adventure"
          >
            <div className="flex items-center gap-2 mb-0.5">
              <ClayLeaf size={22} className="group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-[11px] uppercase font-extrabold tracking-widest text-[#D4EBD6]">
                Quick Outdoor Mission
              </span>
            </div>

            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              {isLoadingTenMinute ? (
                <span className="flex items-center gap-2 text-xl">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sniffing the breeze...
                </span>
              ) : (
                <>I HAVE 10 MINUTES</>
              )}
            </span>

            <span className="text-xs text-[#BED8C2] font-semibold mt-0.5">
              One short quest. Then pocket your phone.
            </span>
          </button>
        </motion.div>
      </section>

      {/* TWO SECONDARY ACTIONS: Find an Adventure & What Did I Just See? */}
      <section className="grid grid-cols-2 gap-3.5 px-1">
        {/* Find an Adventure */}
        <ClayCard
          variant="white"
          interactive
          onClick={() => onNavigate('explore')}
          className="p-4 cursor-pointer flex flex-col justify-between min-h-[135px] group select-none border border-[#E0EBE2]"
          role="button"
          tabIndex={0}
          aria-label="Find an Adventure"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF2EC] flex items-center justify-center shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
              <ClayMapPin size={22} className="group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-[#557860] bg-[#F2F7F2] px-2 py-0.5 rounded-full">
              30m - 2h
            </span>
          </div>

          <div className="mt-2.5">
            <h3 className="font-extrabold text-sm sm:text-base text-[#163321] leading-snug">
              Find an Adventure
            </h3>
            <p className="text-[11px] text-[#5E7A67] mt-0.5 font-medium leading-tight">
              Nearby parks & clues
            </p>
          </div>
        </ClayCard>

        {/* What Did I Just See? */}
        <ClayCard
          variant="white"
          interactive
          onClick={() => onNavigate('camera')}
          className="p-4 cursor-pointer flex flex-col justify-between min-h-[135px] group select-none border border-[#E0EBE2]"
          role="button"
          tabIndex={0}
          aria-label="What Did I Just See Nature Vision"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF6DE] flex items-center justify-center shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
              <ClayButterfly size={22} className="group-hover:rotate-6 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-[#A87B22] bg-[#FFF8E6] px-2 py-0.5 rounded-full">
              Vision
            </span>
          </div>

          <div className="mt-2.5">
            <h3 className="font-extrabold text-sm sm:text-base text-[#163321] leading-snug">
              What Did I Just See?
            </h3>
            <p className="text-[11px] text-[#5E7A67] mt-0.5 font-medium leading-tight">
              Snap a leaf or bug
            </p>
          </div>
        </ClayCard>
      </section>

      {/* TODAY'S ADVENTURE PROGRESS SNAPSHOT */}
      <section className="px-1">
        {activeAdventure ? (
          <ClayCard variant="sage" className="p-4 border border-[#BBD7BF]">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <ClayBackpack size={18} />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1F482F]">
                  Today’s Adventure
                </span>
              </div>
              <span className="clay-badge text-xs px-2.5 py-0.5 font-bold text-[#1F482F]">
                {activeAdventure.completedCount} / {activeAdventure.totalCount} complete
              </span>
            </div>

            <h4 className="font-extrabold text-base text-[#163321]">
              {activeAdventure.title}
            </h4>
            <p className="text-xs text-[#3E6148] mt-0.5 font-medium line-clamp-1">
              {activeAdventure.description || activeAdventure.theme}
            </p>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-white/70 rounded-full mt-3 overflow-hidden shadow-inner">
              <div
                className="h-full bg-[#2E583A] rounded-full transition-all duration-300"
                style={{
                  width: `${
                    activeAdventure.totalCount > 0
                      ? (activeAdventure.completedCount / activeAdventure.totalCount) * 100
                      : 0
                  }%`,
                }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={() => onNavigate('quest')}
                className="text-xs font-bold text-[#163321] hover:underline flex items-center gap-1"
              >
                <span>Continue checklist</span>
                <span>→</span>
              </button>
              <button
                onClick={() => onNavigate('progress')}
                className="text-xs font-semibold text-[#486B52] hover:underline"
              >
                View backpack
              </button>
            </div>
          </ClayCard>
        ) : (
          <ClayCard variant="soft" className="p-4 text-center">
            <p className="text-xs font-bold text-[#557860] uppercase tracking-wider mb-1">
              🌱 No quest active yet
            </p>
            <p className="text-xs text-[#6F8876] font-medium max-w-xs mx-auto">
              Tap the green button when you are ready for a few minutes of quiet exploration.
            </p>
          </ClayCard>
        )}
      </section>

      {/* Gentle footer whisper */}
      <footer className="text-center pt-1">
        <p className="text-[12px] text-[#7B9683] font-hand text-base">
          “Nature does not hurry, yet everything is accomplished.”
        </p>
      </footer>
    </div>
  );
};
