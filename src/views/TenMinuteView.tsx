import React from 'react';
import type { TenMinuteAdventure, ActiveAdventure } from '../types';
import { ClayCard } from '../components/clay/ClayCard';
import { ClayButton } from '../components/clay/ClayButton';
import { ClayCharacter } from '../components/clay/ClayCharacter';
import { ClayLeaf, ClaySun } from '../components/clay/ClayIcons';
import { motion } from 'framer-motion';

interface TenMinuteViewProps {
  adventure: TenMinuteAdventure | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onReady: (active: ActiveAdventure) => void;
  onBack: () => void;
}

export const TenMinuteView: React.FC<TenMinuteViewProps> = ({
  adventure,
  isLoading,
  error,
  onRetry,
  onReady,
  onBack,
}) => {
  const handleStart = () => {
    if (!adventure) return;
    const active: ActiveAdventure = {
      id: `ten-min-${Date.now()}`,
      type: 'ten-minute',
      title: adventure.title,
      description: adventure.description,
      theme: adventure.vibe,
      startedAt: new Date().toISOString(),
      quests: adventure.quests,
      completedCount: 0,
      totalCount: adventure.quests.length,
      isComplete: false,
    };
    onReady(active);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-4 space-y-4">
        <ClayCharacter mood="curious" size="lg" />
        <h3 className="text-xl font-extrabold text-[#163321]">
          Listening to the breeze...
        </h3>
        <p className="text-xs text-[#577561] max-w-xs font-medium">
          Gemma is creating a gentle outdoor mission just for right now.
        </p>
        <div className="w-12 h-1.5 bg-[#D7E5D9] rounded-full overflow-hidden mt-1">
          <div className="w-full h-full bg-[#3D6B49] rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !adventure) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-4 space-y-4">
        <ClayCharacter mood="idle" size="md" />
        <ClayCard variant="white" className="p-6 max-w-sm">
          <h3 className="text-lg font-black text-[#163321] mb-2">
            🌱 A Little Pause in the Breeze
          </h3>
          <p className="text-xs text-[#557860] mb-5 font-medium leading-relaxed">
            {error || 'The adventure generator is taking a little nap. Try again in a moment.'}
          </p>
          <div className="space-y-2">
            <ClayButton variant="forest" fullWidth onClick={onRetry}>
              Give me something to do
            </ClayButton>
            <button
              onClick={onBack}
              className="text-xs text-[#557860] font-semibold py-2 hover:underline"
            >
              Back to Home
            </button>
          </div>
        </ClayCard>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24 animate-fade-in px-1">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs font-bold text-[#557860] hover:text-[#163321] flex items-center gap-1 py-1"
        >
          ← Back to Home
        </button>
        <span className="clay-badge text-[11px] font-extrabold px-3 py-0.5 text-[#1D432D]">
          ⏱️ 10 Minutes
        </span>
      </div>

      {/* Primary Generated Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <ClayCard variant="white" className="p-6 relative border-2 border-white shadow-[0_12px_24px_-4px_rgba(26,56,38,0.08)]">
          <div className="absolute top-4 right-4 opacity-75">
            <ClaySun size={30} />
          </div>

          <div className="flex items-center gap-2 mb-1.5">
            <ClayLeaf size={18} />
            <span className="text-[11px] uppercase font-extrabold tracking-wider text-[#4E7757]">
              {adventure.vibe || 'Quick Mission'}
            </span>
          </div>

          <h2 className="text-2xl font-black text-[#163321] tracking-tight">
            {adventure.title}
          </h2>

          <p className="text-sm text-[#3A5C44] mt-2 font-medium leading-relaxed">
            {adventure.description}
          </p>

          <hr className="my-4 border-[#E7EFE8]" />

          {/* Quests Preview */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#557860]">
              What to look for:
            </h4>
            <ul className="space-y-2">
              {adventure.quests.map((q, idx) => (
                <li
                  key={q.id || idx}
                  className="flex items-start gap-2.5 text-xs font-bold text-[#1B3B26] bg-[#F5FAF6] p-2.5 rounded-2xl border border-[#E3EFE5]"
                >
                  <span className="w-5 h-5 rounded-full bg-[#E0ECE2] text-[#2C5237] text-xs flex items-center justify-center flex-shrink-0 font-bold">
                    {idx + 1}
                  </span>
                  <span className="leading-snug mt-0.5">{q.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Phone Away Notice */}
          <div className="mt-5 p-3.5 rounded-2xl bg-[#EAF4EC] border border-[#CDE1D1] text-center">
            <p className="text-sm font-extrabold text-[#193F27] flex items-center justify-center gap-1.5">
              <span>Now put your phone away.</span>
              <span>🌱</span>
            </p>
            <p className="text-[11px] text-[#4F7358] mt-0.5 font-medium">
              Don't stare at the screen. Look at the leaves, stones, and sky.
            </p>
          </div>

          {/* I'M READY CTA */}
          <div className="mt-5">
            <ClayButton
              variant="forest"
              size="lg"
              fullWidth
              onClick={handleStart}
              className="py-4 text-base font-black tracking-wider"
            >
              I'M READY
            </ClayButton>
          </div>
        </ClayCard>
      </motion.div>
    </div>
  );
};
