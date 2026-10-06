import React from 'react';
import type { ActiveAdventure, DiscoveryItem, QuestItem, ViewState } from '../types';
import { ClayCard } from '../components/clay/ClayCard';
import { ClayButton } from '../components/clay/ClayButton';
import { ClayCharacter } from '../components/clay/ClayCharacter';
import { ClayLeaf, ClayButterfly } from '../components/clay/ClayIcons';

interface ProgressViewProps {
  activeAdventure: ActiveAdventure | null;
  completedQuests: QuestItem[];
  discoveries: DiscoveryItem[];
  onNavigate: (view: ViewState) => void;
  onClearActive: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  activeAdventure,
  completedQuests,
  discoveries,
  onNavigate,
  onClearActive,
}) => {
  return (
    <div className="space-y-6 pb-24 animate-fade-in px-1">
      {/* Top Header */}
      <div className="text-center pt-1">
        <ClayCharacter mood="idle" size="sm" className="mx-auto mb-1.5" />
        <h2 className="text-2xl font-black text-[#163321] tracking-tight">
          My Outdoor Backpack
        </h2>
        <p className="text-xs text-[#52745C] max-w-xs mx-auto mt-0.5 font-medium">
          A calm record of your moments spent outside. No points, no streaks.
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3">
        <ClayCard variant="white" className="p-4 text-center border border-[#DFEBE1]">
          <div className="w-9 h-9 rounded-2xl bg-[#E8F2EA] mx-auto flex items-center justify-center mb-1.5">
            <ClayLeaf size={20} />
          </div>
          <span className="text-2xl font-black text-[#163321] block leading-none">
            {completedQuests.length}
          </span>
          <span className="text-[10px] font-bold text-[#557860] uppercase tracking-wider mt-1 block">
            Quests Completed
          </span>
        </ClayCard>

        <ClayCard variant="white" className="p-4 text-center border border-[#DFEBE1]">
          <div className="w-9 h-9 rounded-2xl bg-[#FFF6DE] mx-auto flex items-center justify-center mb-1.5">
            <ClayButterfly size={20} />
          </div>
          <span className="text-2xl font-black text-[#163321] block leading-none">
            {discoveries.length}
          </span>
          <span className="text-[10px] font-bold text-[#A87B22] uppercase tracking-wider mt-1 block">
            Nature Wonders
          </span>
        </ClayCard>
      </div>

      {/* Current Active Adventure */}
      {activeAdventure && (
        <section className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#557860] px-1">
            Current Adventure
          </h3>
          <ClayCard variant="sage" className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#234A31]">
                {activeAdventure.type === 'ten-minute' ? '⏱️ 10-Min Walk' : '🗺️ Outdoor Ramble'}
              </span>
              <span className="clay-badge text-xs px-2.5 py-0.5 font-bold text-[#1F482F]">
                {activeAdventure.completedCount} / {activeAdventure.totalCount} Done
              </span>
            </div>

            <h4 className="font-extrabold text-base text-[#163321]">
              {activeAdventure.title}
            </h4>

            <div className="flex items-center gap-2 pt-1">
              <ClayButton
                variant="forest"
                size="sm"
                onClick={() => onNavigate('quest')}
                className="flex-1 py-2 text-xs"
              >
                Open Checklist →
              </ClayButton>
              <button
                onClick={onClearActive}
                className="px-3 py-2 text-xs font-bold text-[#4B6E54] hover:text-[#234A31]"
              >
                End
              </button>
            </div>
          </ClayCard>
        </section>
      )}

      {/* Discovered Things Gallery */}
      <section className="space-y-2.5">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#557860] px-1 flex items-center justify-between">
          <span>Discovered In Nature</span>
          <span className="text-[10px] text-[#789680] font-semibold lowercase">
            {discoveries.length} entries
          </span>
        </h3>

        {discoveries.length === 0 ? (
          <ClayCard variant="soft" className="p-5 text-center">
            <p className="text-xs text-[#6F8876] font-medium">
              You haven’t recorded any nature discoveries yet. Use the camera to identify a leaf, bug, or stone outside!
            </p>
          </ClayCard>
        ) : (
          <div className="space-y-3">
            {discoveries.map((item) => (
              <ClayCard
                key={item.id}
                variant="white"
                className="p-3.5 flex items-start gap-3 border border-[#E3EDE5]"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.identification}
                    className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 bg-[#E8F2EA]"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-[#E8F2EA] flex items-center justify-center flex-shrink-0">
                    <ClayLeaf size={24} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-sm text-[#163321] truncate">
                    {item.identification}
                  </h4>
                  <p className="text-xs text-[#52745C] font-medium line-clamp-2 mt-0.5">
                    {item.explanation}
                  </p>
                  <p className="text-[10px] text-[#7C9883] font-semibold mt-1">
                    {new Date(item.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </ClayCard>
            ))}
          </div>
        )}
      </section>

      {/* Completed Quests Archive */}
      <section className="space-y-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#557860] px-1">
          Recent Completed Quests
        </h3>

        {completedQuests.length === 0 ? (
          <ClayCard variant="soft" className="p-4 text-center">
            <p className="text-xs text-[#6F8876] font-medium">
              No completed quests yet. Step outside for ten minutes and check your first one off!
            </p>
          </ClayCard>
        ) : (
          <div className="space-y-1.5">
            {completedQuests.slice(0, 8).map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-3 rounded-2xl bg-white border border-[#E4EFE6] flex items-center gap-2.5 shadow-sm text-xs font-semibold text-[#254C34]"
              >
                <span className="w-5 h-5 rounded-full bg-[#E5F2E8] text-[#295738] flex items-center justify-center text-xs flex-shrink-0">
                  ✓
                </span>
                <span className="leading-snug">{q.text}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Thoughtful parting thought */}
      <div className="text-center pt-2">
        <p className="text-xs text-[#7B9984] font-medium italic">
          “The clearest way into the Universe is through a forest wilderness.” — John Muir
        </p>
      </div>
    </div>
  );
};
