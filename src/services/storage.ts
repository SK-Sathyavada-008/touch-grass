import type { ActiveAdventure, DiscoveryItem, QuestItem } from '../types';

const STORAGE_KEYS = {
  ACTIVE_ADVENTURE: 'touchgrass_active_adventure',
  COMPLETED_QUESTS: 'touchgrass_completed_quests',
  DISCOVERIES: 'touchgrass_discoveries',
  HISTORY: 'touchgrass_history',
};

export class StorageService {
  static getActiveAdventure(): ActiveAdventure | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_ADVENTURE);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static setActiveAdventure(adventure: ActiveAdventure | null): void {
    if (!adventure) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ADVENTURE);
      return;
    }
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ADVENTURE, JSON.stringify(adventure));
  }

  static toggleQuest(questId: string): ActiveAdventure | null {
    const current = this.getActiveAdventure();
    if (!current) return null;

    let justCompletedItem: QuestItem | null = null;

    const updatedQuests = current.quests.map((q) => {
      if (q.id === questId) {
        const nextState = !q.completed;
        const updated = {
          ...q,
          completed: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined,
        };
        if (nextState) justCompletedItem = updated;
        return updated;
      }
      return q;
    });

    const completedCount = updatedQuests.filter((q) => q.completed).length;
    const isComplete = completedCount === updatedQuests.length && updatedQuests.length > 0;

    const updatedAdventure: ActiveAdventure = {
      ...current,
      quests: updatedQuests,
      completedCount,
      isComplete,
    };

    this.setActiveAdventure(updatedAdventure);

    // Save to global completed quests list if marked as done
    if (justCompletedItem) {
      this.addCompletedQuest(justCompletedItem);
    }

    // If whole adventure finished, also append to history
    if (isComplete && !current.isComplete) {
      this.archiveAdventure(updatedAdventure);
    }

    return updatedAdventure;
  }

  static revealDestination(destinationId: string): ActiveAdventure | null {
    const current = this.getActiveAdventure();
    if (!current || !current.destinations) return null;

    const updatedDestinations = current.destinations.map((d) => {
      if (d.id === destinationId) {
        return { ...d, revealed: true };
      }
      return d;
    });

    const updatedAdventure: ActiveAdventure = {
      ...current,
      destinations: updatedDestinations,
    };

    this.setActiveAdventure(updatedAdventure);
    return updatedAdventure;
  }

  static getCompletedQuests(): QuestItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPLETED_QUESTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static addCompletedQuest(quest: QuestItem): void {
    const list = this.getCompletedQuests();
    if (!list.some((q) => q.id === quest.id)) {
      list.unshift(quest);
      localStorage.setItem(STORAGE_KEYS.COMPLETED_QUESTS, JSON.stringify(list.slice(0, 100)));
    }
  }

  static getDiscoveries(): DiscoveryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DISCOVERIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static addDiscovery(discovery: DiscoveryItem): void {
    const list = this.getDiscoveries();
    list.unshift(discovery);
    localStorage.setItem(STORAGE_KEYS.DISCOVERIES, JSON.stringify(list));
  }

  static archiveAdventure(adventure: ActiveAdventure): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      const history: ActiveAdventure[] = data ? JSON.parse(data) : [];
      history.unshift(adventure);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, 50)));
    } catch (e) {
      console.warn('Could not archive adventure:', e);
    }
  }

  static getHistory(): ActiveAdventure[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static clearActiveAdventure(): void {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ADVENTURE);
  }
}
