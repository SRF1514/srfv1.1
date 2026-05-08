
import { supabaseData } from './supabaseData';

export interface PracticeStats {
  completedItems: number;
  mocksDone: number;
  avgScore: number;
  readiness: number;
  hoursPracticed: number;
  completedBatches?: string[];
}

const STORAGE_KEY = 'sierra_practice_stats';

export const practiceStatsService = {
  getStats(): PracticeStats {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse practice stats', e);
      }
    }
    return {
      completedItems: 0,
      mocksDone: 0,
      avgScore: 0,
      readiness: 0,
      hoursPracticed: 0,
      completedBatches: []
    };
  },

  saveStats(stats: PracticeStats) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    // Also try to save to Supabase
    supabaseData.savePracticeStats({
      completed_items: stats.completedItems,
      mocks_done: stats.mocksDone,
      avg_score: stats.avgScore,
      readiness: stats.readiness,
      hours_practiced: stats.hoursPracticed,
      completed_batches: stats.completedBatches
    } as any).catch(err => console.error('Error syncing stats to Supabase:', err));
  },

  updateStats(update: Partial<PracticeStats>) {
    const current = this.getStats();
    const next = { ...current, ...update };
    this.saveStats(next);
    return next;
  }
};
