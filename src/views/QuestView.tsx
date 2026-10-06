import React, { useState } from 'react';
import type { ActiveAdventure, QuestItem } from '../types';
import { ClayCard } from '../components/clay/ClayCard';
import { ClayButton } from '../components/clay/ClayButton';
import { ClayCharacter } from '../components/clay/ClayCharacter';
import { ClaySun, ClayBackpack } from '../components/clay/ClayIcons';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface QuestViewProps {
  activeAdventure: ActiveAdventure | null;
  onToggleQuest: (questId: string) => void;
  onFinishAdventure: () => void;
  onNewAdventure: () => void;
}

export const QuestView: React.FC<QuestViewProps> = ({
  activeAdventure,
  onToggleQuest,
  onFinishAdventure,
  onNewAdventure,
}) => {
  const [completedAnimId, setCompletedAnimId] = useState<string | null>(null);

  if (!activeAdventure) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-4 space-y-4">
        <ClayCharacter mood="idle" size="md" />
        <h3 className="text-xl font-black text-[#163321]">
          No Active Adventure
        </h3>
        <p className="text-xs text-[#52745C] max-w-xs font-medium">
          Start a 10-minute micro-mission or plan an exploration to get your outdoor checklist.
        </p>
        <ClayButton variant="forest" size="md" onClick={onNewAdventure}>
          Give me something to do
        </ClayButton>
      </div>
    );
  }

  const handleQuestTap = (quest: QuestItem) => {
    onToggleQuest(quest.id);

    if (!quest.completed) {
      setCompletedAnimId(quest.id);
      setTimeout(() => setCompletedAnimId(null), 600);

      const remaining = activeAdventure.quests.filter((q) => !q.completed && q.id !== quest.id);
      if (remaining.length === 0) {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#7DA282', '#F4D06F', '#244D38', '#A4C3A2'],
        });
      }
    }
  };

  const isAllComplete = activeAdventure.completedCount === activeAdventure.totalCount && activeAdventure.totalCount > 0;

  return (
    <div className="space-y-5 pb-24 animate-fade-in px-1">
      {/* Top Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ClayBackpack size={18} />
          <span className="text-xs font-black uppercase tracking-wider text-[#3D6948]">
            Outdoor Bucket List
          </span>
        </div>
        <span className="clay-badge text-xs px-3 py-0.5 font-black text-[#1E452C]">
          {activeAdventure.completedCount} / {activeAdventure.totalCount} Done
        </span>
      </div>

      {/* Main Adventure Banner Card */}
      <ClayCard variant="forest" className="p-5 text-white relative">
        <div className="absolute top-3 right-3 opacity-25">
          <ClaySun size={34} />
        </div>
        <span className="text-[10px] font-extrabold tracking-widest text-[#BEE2C3] uppercase">
          {activeAdventure.type === 'ten-minute' ? '⏱️ 10-Minute Mission' : '🗺️ Outdoor Explorer'}
        </span>
        <h2 className="text-xl sm:text-2xl font-black mt-1 tracking-tight">
          {activeAdventure.title}
        </h2>
        {activeAdventure.description && (
          <p className="text-xs text-[#D5EAD8] mt-1 font-medium leading-relaxed">
            {activeAdventure.description}
          </p>
        )}

        {/* Progress Bar */}
        <div className="w-full h-2 bg-black/25 rounded-full mt-3.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#F4D06F] to-[#A4C3A2] rounded-full transition-all duration-300"
            style={{
              width: `${(activeAdventure.completedCount / activeAdventure.totalCount) * 100}%`,
            }}
          />
        </div>
      </ClayCard>

      {/* Phone Away Notice */}
      <div className="py-2.5 px-3.5 rounded-2xl bg-[#EAF2EC] border border-[#CFE3D3] flex items-center gap-2.5">
        <span className="text-lg">🌱</span>
        <p className="text-xs text-[#285034] font-semibold leading-tight">
          Put your phone away. Tap only when you find something.
        </p>
      </div>

      {/* Checklist items */}
      <section className="space-y-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#557860] px-1">
          Your Quests
        </h3>

        <div className="space-y-2">
          {activeAdventure.quests.map((quest) => {
            const isJustFinished = completedAnimId === quest.id;

            return (
              <motion.div
                key={quest.id}
                whileTap={{ scale: 0.985 }}
                onClick={() => handleQuestTap(quest)}
                className={`cursor-pointer rounded-2xl p-3.5 transition-all border flex items-center gap-3 select-none ${
                  quest.completed
                    ? 'bg-[#F2F7F3] border-[#CDE3D2] text-[#486851]'
                    : 'bg-white border-[#E2EBE3] shadow-[0_3px_8px_rgba(26,56,38,0.05),inset_1px_1px_2px_rgba(255,255,255,0.9)] text-[#163321]'
                } ${isJustFinished ? 'animate-pop' : ''}`}
                role="checkbox"
                aria-checked={quest.completed}
                tabIndex={0}
              >
                {/* Checkbox indicator: ○ or ✓ */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all flex-shrink-0 text-xs font-bold ${
                    quest.completed
                      ? 'bg-[#244D38] text-white'
                      : 'border-2 border-[#BCD4C1] text-transparent bg-[#FAF8F3]'
                  }`}
                >
                  {quest.completed ? '✓' : '○'}
                </div>

                {/* Quest Text */}
                <div className="flex-1">
                  <p
                    className={`text-xs sm:text-sm font-bold leading-snug transition-all ${
                      quest.completed ? 'line-through opacity-65' : ''
                    }`}
                  >
                    {quest.text}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Completion Celebration */}
      <AnimatePresence>
        {isAllComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5 rounded-3xl bg-[#F5FAF6] border-2 border-[#B9DCBF] text-center space-y-2"
          >
            <div className="text-3xl">🌱</div>
            <h3 className="text-lg font-black text-[#163321]">
              Adventure complete.
            </h3>
            <p className="text-xs text-[#3E6348] font-semibold max-w-xs mx-auto">
              Nice. You actually went outside.
            </p>
            <div className="pt-2">
              <ClayButton
                variant="forest"
                size="md"
                fullWidth
                onClick={onFinishAdventure}
              >
                Save to Backpack
              </ClayButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Option to restart */}
      {!isAllComplete && (
        <div className="pt-2 text-center">
          <button
            onClick={onNewAdventure}
            className="text-xs font-bold text-[#67846E] hover:text-[#163321] hover:underline"
          >
            Want a different adventure? Start over
          </button>
        </div>
      )}
    </div>
  );
};
