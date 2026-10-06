import React, { useState, useEffect } from 'react';
import type { ViewState, ActiveAdventure, TenMinuteAdventure, DiscoveryItem, QuestItem } from './types';
import { StorageService } from './services/storage';
import { ApiService } from './services/api';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './views/HomeView';
import { TenMinuteView } from './views/TenMinuteView';
import { ExploreView } from './views/ExploreView';
import { QuestView } from './views/QuestView';
import { CameraView } from './views/CameraView';
import { ProgressView } from './views/ProgressView';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [activeAdventure, setActiveAdventure] = useState<ActiveAdventure | null>(null);
  const [completedQuests, setCompletedQuests] = useState<QuestItem[]>([]);
  const [discoveries, setDiscoveries] = useState<DiscoveryItem[]>([]);

  // 10-Minute quick generation state
  const [tenMinuteData, setTenMinuteData] = useState<TenMinuteAdventure | null>(null);
  const [loadingTenMinute, setLoadingTenMinute] = useState<boolean>(false);
  const [tenMinuteError, setTenMinuteError] = useState<string | null>(null);

  // Load persisted state on mount
  useEffect(() => {
    const loadedActive = StorageService.getActiveAdventure();
    const loadedQuests = StorageService.getCompletedQuests();
    const loadedDiscoveries = StorageService.getDiscoveries();

    setActiveAdventure(loadedActive);
    setCompletedQuests(loadedQuests);
    setDiscoveries(loadedDiscoveries);
  }, []);

  const handleQuickTenMinute = async () => {
    setLoadingTenMinute(true);
    setTenMinuteError(null);
    setCurrentView('ten-minute');

    try {
      const data = await ApiService.generateTenMinuteAdventure();
      setTenMinuteData(data);
    } catch {
      setTenMinuteError('🌱 The adventure generator is taking a little nap. Try again in a moment.');
    } finally {
      setLoadingTenMinute(false);
    }
  };

  const handleStartActiveAdventure = (adventure: ActiveAdventure) => {
    setActiveAdventure(adventure);
    StorageService.setActiveAdventure(adventure);
    setCurrentView('quest');
  };

  const handleToggleQuest = (questId: string) => {
    const updated = StorageService.toggleQuest(questId);
    if (updated) {
      setActiveAdventure(updated);
      setCompletedQuests(StorageService.getCompletedQuests());
    }
  };

  const handleFinishAdventure = () => {
    if (activeAdventure) {
      StorageService.archiveAdventure(activeAdventure);
      StorageService.clearActiveAdventure();
      setActiveAdventure(null);
      setCurrentView('progress');
    }
  };

  const handleClearActive = () => {
    StorageService.clearActiveAdventure();
    setActiveAdventure(null);
    setCurrentView('home');
  };

  const handleSavedDiscovery = (discovery: DiscoveryItem) => {
    setDiscoveries((prev) => [discovery, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#163321] flex flex-col font-sans selection:bg-[#A4C3A2] selection:text-[#112519]">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        hasActiveAdventure={Boolean(activeAdventure)}
      />

      {/* Mobile-first centered container */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-3 pb-8">
        {currentView === 'home' && (
          <HomeView
            onNavigate={setCurrentView}
            activeAdventure={activeAdventure}
            onQuickTenMinute={handleQuickTenMinute}
            isLoadingTenMinute={loadingTenMinute}
          />
        )}

        {currentView === 'ten-minute' && (
          <TenMinuteView
            adventure={tenMinuteData}
            isLoading={loadingTenMinute}
            error={tenMinuteError}
            onRetry={handleQuickTenMinute}
            onReady={handleStartActiveAdventure}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'explore' && (
          <ExploreView
            onStartAdventure={handleStartActiveAdventure}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'quest' && (
          <QuestView
            activeAdventure={activeAdventure}
            onToggleQuest={handleToggleQuest}
            onFinishAdventure={handleFinishAdventure}
            onNewAdventure={() => setCurrentView('explore')}
          />
        )}

        {currentView === 'camera' && (
          <CameraView
            onBack={() => setCurrentView('home')}
            onSavedDiscovery={handleSavedDiscovery}
          />
        )}

        {currentView === 'progress' && (
          <ProgressView
            activeAdventure={activeAdventure}
            completedQuests={completedQuests}
            discoveries={discoveries}
            onNavigate={setCurrentView}
            onClearActive={handleClearActive}
          />
        )}
      </main>

      {/* Floating Bottom Navigation */}
      <BottomNav currentView={currentView} onNavigate={setCurrentView} />
    </div>
  );
};

export default App;
