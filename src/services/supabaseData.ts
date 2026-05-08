import { supabase } from '../supabaseClient';

export interface ModuleProgress {
  id?: string;
  user_id?: string;
  module_id: string;
  completed_at?: string;
}

export interface MinigameResult {
  id?: string;
  user_id?: string;
  game_name: string;
  score: string;
  completed_at?: string;
}

export interface Note {
  id?: string;
  user_id?: string;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id?: string;
  user_id?: string;
  title: string;
  is_completed: boolean;
  created_at?: string;
}

export interface ResearchVote {
  id?: string;
  user_id: string;
  option_id: string;
  updated_at?: string;
}

export interface PracticeStats {
  user_id?: string;
  completed_items: number;
  mocks_done: number;
  avg_score: number;
  readiness: number;
  hours_practiced: number;
  completed_batches?: string[];
}

export interface SavedArticle {
  user_id?: string;
  article_id: string;
  saved_at: string;
}

export const supabaseData = {
  // Research Votes
  async getResearchVote() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('research_votes')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(); // Use maybeSingle to avoid error if no vote exists
    
    if (error) {
      console.error('Error fetching research vote:', error);
      return null;
    }
    return data as ResearchVote;
  },

  async saveResearchVote(optionId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('research_votes')
      .upsert({ 
        user_id: user.id,
        option_id: optionId,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select();
    if (error) throw error;
    return data;
  },

  // Practice Stats
  async getPracticeStats() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('practice_stats')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching practice stats:', error);
      return null;
    }
    return data as PracticeStats;
  },

  async savePracticeStats(stats: Omit<PracticeStats, 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('practice_stats')
      .upsert({ 
        user_id: user.id,
        ...stats
      }, { onConflict: 'user_id' })
      .select();
    if (error) throw error;
    return data;
  },

  // Saved Articles
  async getSavedArticles() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('saved_articles')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error fetching saved articles:', error);
      return [];
    }
    return data as SavedArticle[];
  },

  async saveArticle(articleId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('saved_articles')
      .upsert({ 
        user_id: user.id,
        article_id: articleId,
        saved_at: new Date().toISOString()
      }, { onConflict: 'user_id, article_id' })
      .select();
    if (error) throw error;
    return data;
  },

  async unsaveArticle(articleId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { error } = await supabase
      .from('saved_articles')
      .delete()
      .eq('user_id', user.id)
      .eq('article_id', articleId);
    if (error) throw error;
  },

  // Modules
  async getCompletedModules() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('modules_completed')
      .select('*')
      .eq('user_id', user.id);
    if (error) throw error;
    return data as ModuleProgress[];
  },

  async markModuleCompleted(moduleId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('modules_completed')
      .upsert({ 
        module_id: moduleId,
        user_id: user.id
      }, { onConflict: 'user_id, module_id' })
      .select();
    if (error) throw error;
    return data;
  },

  // Minigames
  async getMinigameResults() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('minigame_results')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });
    if (error) throw error;
    return data as MinigameResult[];
  },

  async saveMinigameResult(gameName: string, score: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('minigame_results')
      .insert({ 
        game_name: gameName, 
        score,
        user_id: user.id
      })
      .select();
    if (error) throw error;
    return data;
  },

  // Notes
  async getNotes() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data as Note[];
  },

  async createNote(title: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notes')
      .insert({ 
        title, 
        content,
        user_id: user.id
      })
      .select();
    if (error) throw error;
    return data;
  },

  async updateNote(id: string, title: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notes')
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select();
    if (error) throw error;
    return data;
  },

  async deleteNote(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) throw error;
  },

  // Tasks
  async getTasks() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data as Task[];
  },

  async createTask(title: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert({ 
        title,
        user_id: user.id
      })
      .select();
    if (error) throw error;
    return data;
  },

  async updateTask(id: string, isCompleted: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .update({ is_completed: isCompleted })
      .eq('id', id)
      .eq('user_id', user.id)
      .select();
    if (error) throw error;
    return data;
  },

  async deleteTask(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) throw error;
  }
};
