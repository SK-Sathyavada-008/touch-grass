import React, { useState } from 'react';
import type { ExploreAdventure, ActiveAdventure, AdventureDestination } from '../types';
import { ClayCard } from '../components/clay/ClayCard';
import { ClayButton } from '../components/clay/ClayButton';
import { ClayCharacter } from '../components/clay/ClayCharacter';

interface ExploreViewProps {
  onStartAdventure: (active: ActiveAdventure) => void;
  onBack: () => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ onStartAdventure, onBack }) => {
  const [timeMinutes, setTimeMinutes] = useState<number>(30);
  const [groupType, setGroupType] = useState<'solo' | 'friends'>('solo');
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat?: number; lon?: number }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [adventure, setAdventure] = useState<ExploreAdventure | null>(null);
  const [modeChosen, setModeChosen] = useState<'preview' | 'quest' | 'revealed'>('preview');
  const [currentClueIdx, setCurrentClueIdx] = useState<number>(0);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  const handleGenerate = async () => {
    setLoading(true);
    setLocationNotice(null);

    // Attempt browser geolocation gently
    if (navigator.geolocation && !coords.lat) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          fetchAdventure(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          setLocationNotice('📍 No worries. We can still make an adventure without your location.');
          fetchAdventure();
        },
        { timeout: 5000 }
      );
    } else {
      fetchAdventure(coords.lat, coords.lon);
    }
  };

  const fetchAdventure = async (lat?: number, lon?: number) => {
    try {
      const res = await fetch('/api/adventure/explore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeMinutes,
          groupType,
          lat,
          lon,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate exploration');
      const data: ExploreAdventure = await res.json();
      setAdventure(data);
      setModeChosen('preview');
    } catch {
      setLocationNotice('🌱 The adventure generator is taking a little nap. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevealAll = () => {
    if (!adventure) return;
    const allIds = new Set(adventure.destinations.map((d) => d.id));
    setRevealedIds(allIds);
    setModeChosen('revealed');
  };

  const handleStartQuestMode = () => {
    setModeChosen('quest');
    setCurrentClueIdx(0);
  };

  const handleFoundDestination = (dest: AdventureDestination) => {
    setRevealedIds((prev) => new Set([...prev, dest.id]));
  };

  const handleStartChecklist = () => {
    if (!adventure) return;
    const updatedDestinations = adventure.destinations.map((d) => ({
      ...d,
      revealed: revealedIds.has(d.id),
    }));

    const active: ActiveAdventure = {
      id: `explore-${Date.now()}`,
      type: 'explore',
      title: adventure.title,
      theme: adventure.theme,
      startedAt: new Date().toISOString(),
      quests: adventure.quests,
      destinations: updatedDestinations,
      currentDestinationIndex: currentClueIdx,
      completedCount: 0,
      totalCount: adventure.quests.length,
      isComplete: false,
    };

    onStartAdventure(active);
  };

  return (
    <div className="space-y-5 pb-24 animate-fade-in px-1">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs font-bold text-[#557860] hover:text-[#163321] flex items-center gap-1 py-1"
        >
          ← Back
        </button>
        <span className="clay-badge text-[11px] font-extrabold px-3 py-0.5 text-[#1D432D]">
          🗺️ Explore
        </span>
      </div>

      {!adventure && !loading ? (
        /* Configuration Form */
        <div className="space-y-4">
          <div className="text-center py-2">
            <ClayCharacter mood="curious" size="md" className="mx-auto mb-2" />
            <h2 className="text-2xl font-black text-[#163321]">
              Plan a Nature Wander
            </h2>
            <p className="text-xs text-[#53705C] max-w-xs mx-auto mt-1 font-medium">
              Choose your time and companions. We’ll find three nearby outdoor spots.
            </p>
          </div>

          <ClayCard variant="white" className="p-5 space-y-4 border border-[#DFEBE1]">
            {/* Time Selector */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-[#557860] block mb-2">
                Available Time
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '30 min', val: 30 },
                  { label: '1 hour', val: 60 },
                  { label: '2 hours', val: 120 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setTimeMinutes(item.val)}
                    className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all border ${
                      timeMinutes === item.val
                        ? 'bg-[#244D38] text-white border-[#244D38] shadow-[0_4px_10px_rgba(24,55,37,0.2)]'
                        : 'bg-[#F4F9F5] text-[#2C5237] border-[#E0EBE2] hover:bg-[#EAF3EC]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Companion Selector */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-[#557860] block mb-2">
                Who’s exploring?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '🌿 Solo Wander', val: 'solo' },
                  { label: '🎒 With Friends', val: 'friends' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setGroupType(item.val as 'solo' | 'friends')}
                    className={`py-3 px-3 rounded-2xl text-xs font-bold transition-all border ${
                      groupType === item.val
                        ? 'bg-[#244D38] text-white border-[#244D38] shadow-[0_4px_10px_rgba(24,55,37,0.2)]'
                        : 'bg-[#F4F9F5] text-[#2C5237] border-[#E0EBE2] hover:bg-[#EAF3EC]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Geolocation Notice */}
            {locationNotice && (
              <div className="p-3 rounded-2xl bg-[#F6F4EB] text-xs font-semibold text-[#576450] border border-[#E9E4D3]">
                {locationNotice}
              </div>
            )}

            {/* Submit */}
            <ClayButton
              variant="forest"
              size="lg"
              fullWidth
              onClick={handleGenerate}
              className="mt-2"
            >
              Let's go
            </ClayButton>
          </ClayCard>
        </div>
      ) : loading ? (
        /* Loading */
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
          <ClayCharacter mood="walking" size="lg" />
          <h3 className="text-xl font-extrabold text-[#163321]">
            Scouting green spots...
          </h3>
          <p className="text-xs text-[#577561] max-w-xs font-medium">
            Checking OpenStreetMap parks and crafting playful clues.
          </p>
        </div>
      ) : adventure ? (
        /* Results View */
        <div className="space-y-4">
          <div className="text-center">
            <span className="text-xs font-black uppercase tracking-wider text-[#4E7757]">
              {adventure.theme}
            </span>
            <h2 className="text-2xl font-black text-[#163321] mt-0.5">
              YOUR ADVENTURE
            </h2>
            <p className="text-xs text-[#5E7A67] font-medium mt-1">
              Three quiet destinations waiting for you outside.
            </p>
          </div>

          {/* Mode Switcher Buttons: Reveal Places or Quest Mode */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleRevealAll}
              className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold border transition-all ${
                modeChosen === 'revealed'
                  ? 'bg-[#244D38] text-white border-[#244D38]'
                  : 'bg-white text-[#23492F] border-[#DFEAE1] hover:bg-[#F2F7F3]'
              }`}
            >
              👀 REVEAL PLACES
            </button>
            <button
              onClick={handleStartQuestMode}
              className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold border transition-all ${
                modeChosen === 'quest'
                  ? 'bg-[#244D38] text-white border-[#244D38]'
                  : 'bg-white text-[#23492F] border-[#DFEAE1] hover:bg-[#F2F7F3]'
              }`}
            >
              🔐 QUEST MODE
            </button>
          </div>

          {/* DESTINATIONS LIST / QUEST CLUE */}
          {modeChosen === 'quest' ? (
            /* Quest Riddle Mode */
            <div className="space-y-4">
              {(() => {
                const currentDest = adventure.destinations[currentClueIdx] || adventure.destinations[0];
                const isFound = revealedIds.has(currentDest.id);

                return (
                  <ClayCard variant="white" className="p-6 border border-[#D7E8DC] text-center">
                    <div className="w-12 h-12 rounded-3xl bg-[#EAF3EC] mx-auto flex items-center justify-center mb-3">
                      <span className="text-2xl">🔐</span>
                    </div>

                    <span className="clay-badge text-xs px-3 py-1 font-bold text-[#1E452C] mb-2 inline-block">
                      Destination {currentClueIdx + 1} of {adventure.destinations.length}
                    </span>

                    <h3 className="text-base font-black text-[#163321] mt-1 mb-2">
                      Sensory Clue
                    </h3>

                    <div className="p-4 rounded-2xl bg-[#F5FAF6] border border-[#E0EFE4] mb-4">
                      <p className="text-sm font-semibold text-[#285034] leading-relaxed italic">
                        "{currentDest.clue}"
                      </p>
                    </div>

                    {isFound ? (
                      <div className="p-4 rounded-2xl bg-[#E8F3EA] border border-[#BEDBC2] mb-4 animate-pop">
                        <span className="text-xs uppercase font-extrabold text-[#386745] block">
                          You found it!
                        </span>
                        <h4 className="text-lg font-black text-[#163321] mt-1">
                          {currentDest.name}
                        </h4>
                        <p className="text-xs text-[#52745C] mt-0.5">
                          Approx. {currentDest.distance}
                        </p>
                      </div>
                    ) : (
                      <ClayButton
                        variant="forest"
                        size="md"
                        fullWidth
                        onClick={() => handleFoundDestination(currentDest)}
                        className="py-3.5 mb-3"
                      >
                        I FOUND IT
                      </ClayButton>
                    )}

                    {/* Next clue navigation */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        disabled={currentClueIdx === 0}
                        onClick={() => setCurrentClueIdx((c) => Math.max(0, c - 1))}
                        className="text-xs font-bold text-[#557860] disabled:opacity-30"
                      >
                        ← Previous
                      </button>

                      {currentClueIdx < adventure.destinations.length - 1 ? (
                        <button
                          onClick={() => setCurrentClueIdx((c) => c + 1)}
                          className="text-xs font-bold text-[#1D432D] hover:underline"
                        >
                          Next clue →
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-[#4B7355]">
                          Final Destination!
                        </span>
                      )}
                    </div>
                  </ClayCard>
                );
              })()}
            </div>
          ) : (
            /* Direct Destinations List */
            <div className="space-y-2.5">
              {adventure.destinations.map((dest, idx) => {
                const isRevealed = revealedIds.has(dest.id) || modeChosen === 'revealed';
                const icons = ['🌳', '🌊', '🌿'];

                return (
                  <ClayCard
                    key={dest.id}
                    variant="white"
                    className="p-4 flex items-center justify-between border border-[#E1ECE2]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#EBF4ED] flex items-center justify-center text-xl flex-shrink-0">
                        {icons[idx % icons.length]}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-[#163321]">
                          {isRevealed ? dest.name : `Destination ${idx + 1} (Hidden)`}
                        </h4>
                        <p className="text-xs text-[#5E7A67] font-medium mt-0.5">
                          {isRevealed
                            ? `${dest.type.toUpperCase()} • ${dest.distance || 'Walking distance'}`
                            : 'Solve clue in Quest Mode or tap reveal'}
                        </p>
                      </div>
                    </div>

                    {!isRevealed && (
                      <button
                        onClick={() => handleFoundDestination(dest)}
                        className="text-xs font-bold text-[#2A5237] bg-[#EDF5EF] px-2.5 py-1 rounded-xl hover:bg-[#DFEDE2]"
                      >
                        Reveal
                      </button>
                    )}
                  </ClayCard>
                );
              })}
            </div>
          )}

          {/* Start Quest Checklist CTA */}
          <div className="pt-2">
            <ClayButton
              variant="forest"
              size="lg"
              fullWidth
              onClick={handleStartChecklist}
              className="py-4"
            >
              Start this adventure
            </ClayButton>
          </div>
        </div>
      ) : null}
    </div>
  );
};
