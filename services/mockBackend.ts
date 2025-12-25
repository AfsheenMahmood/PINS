
import { User, ImageMetadata, Interaction, TrendingCache, InteractionType, Board } from '../types';
import { CATEGORIES, TAGS_POOL } from '../constants';
import { calculateSearchRelevance } from '../utils/analytics';

const DB_KEY_IMAGES = 'pinmeta_images';
const DB_KEY_USERS = 'pinmeta_users';
const DB_KEY_INTERACTIONS = 'pinmeta_interactions';
const DB_KEY_TRENDING = 'pinmeta_trending';
const DB_KEY_BOARDS = 'pinmeta_boards';
const SESSION_KEY = 'pinmeta_session';

class MockBackend {
  private images: ImageMetadata[] = [];
  private users: User[] = [];
  private interactions: Interaction[] = [];
  private boards: Board[] = [];
  private trendingCache: TrendingCache = { last_updated: 0, image_ids: [] };
  private currentUser: User | null = null;

  constructor() {
    this.loadFromStorage();
    
    // Check if we need to force a one-time wipe of old seeded data
    const isWiped = localStorage.getItem('pinmeta_force_wipe_01');
    if (!isWiped) {
      this.images = [];
      this.interactions = [];
      this.boards = [];
      localStorage.setItem('pinmeta_force_wipe_01', 'true');
      this.saveToStorage();
    }

    if (this.images.length === 0 && this.users.length === 0) {
      this.seedData();
    }
    
    setInterval(() => this.backgroundWorkerTask(), 60000);
  }

  private loadFromStorage() {
    try {
      this.images = JSON.parse(localStorage.getItem(DB_KEY_IMAGES) || '[]');
      this.users = JSON.parse(localStorage.getItem(DB_KEY_USERS) || '[]');
      this.interactions = JSON.parse(localStorage.getItem(DB_KEY_INTERACTIONS) || '[]');
      this.boards = JSON.parse(localStorage.getItem(DB_KEY_BOARDS) || '[]');
      this.trendingCache = JSON.parse(localStorage.getItem(DB_KEY_TRENDING) || '{"last_updated":0,"image_ids":[]}');
      
      const sessionUser = localStorage.getItem(SESSION_KEY);
      if (sessionUser) {
        this.currentUser = JSON.parse(sessionUser);
      }
    } catch (e) {
      console.error("Storage corrupt", e);
    }
  }

  private saveToStorage() {
    localStorage.setItem(DB_KEY_IMAGES, JSON.stringify(this.images));
    localStorage.setItem(DB_KEY_USERS, JSON.stringify(this.users));
    localStorage.setItem(DB_KEY_INTERACTIONS, JSON.stringify(this.interactions));
    localStorage.setItem(DB_KEY_BOARDS, JSON.stringify(this.boards));
    localStorage.setItem(DB_KEY_TRENDING, JSON.stringify(this.trendingCache));
    if (this.currentUser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  public signup(username: string, email: string, password: string): User {
    const newUser: User = {
      user_id: `user_${Date.now()}`,
      username,
      email,
      password,
      preferences: [TAGS_POOL[Math.floor(Math.random() * TAGS_POOL.length)]]
    };
    this.users.push(newUser);
    this.currentUser = newUser;
    this.saveToStorage();
    return newUser;
  }

  public login(email: string, password: string): User | null {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (user) {
      this.currentUser = user;
      this.saveToStorage();
      return user;
    }
    return null;
  }

  public logout() {
    this.currentUser = null;
    this.saveToStorage();
  }

  public createBoard(name: string): Board {
    const newBoard: Board = {
      board_id: `board_${Date.now()}`,
      user_id: this.currentUser?.user_id || 'guest',
      name,
      image_ids: []
    };
    this.boards.push(newBoard);
    this.saveToStorage();
    return newBoard;
  }

  public getBoards(): Board[] {
    const userId = this.currentUser?.user_id || 'guest';
    return this.boards.filter(b => b.user_id === userId);
  }

  public saveToBoard(boardId: string, imageId: string) {
    const board = this.boards.find(b => b.board_id === boardId);
    if (board && !board.image_ids.includes(imageId)) {
      board.image_ids.push(imageId);
      this.saveToStorage();
    }
  }

  /**
   * seedData now only initializes basic system state with no images.
   */
  public seedData() {
    // Create one default admin user
    const adminUser: User = {
      user_id: 'admin_01',
      username: 'Admin',
      email: 'admin@pinmeta.com',
      password: 'password',
      preferences: ['minimal', 'futuristic']
    };
    
    this.users = [adminUser];
    this.images = [];
    this.interactions = [];
    this.boards = [];
    this.trendingCache = { last_updated: Date.now(), image_ids: [] };
    
    this.saveToStorage();
  }

  private async backgroundWorkerTask() {
    const dayAgo = Date.now() - 86400000;
    const counts: Record<string, number> = {};
    this.interactions.filter(i => i.timestamp > dayAgo).forEach(i => {
      counts[i.image_id] = (counts[i.image_id] || 0) + 1;
    });

    const trending = this.images
      .map(img => ({ 
        id: img.image_id, 
        score: (counts[img.image_id] || 0) + (img.interaction_count * 0.1) 
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 40)
      .map(item => item.id);

    this.trendingCache = { last_updated: Date.now(), image_ids: trending };
    this.saveToStorage();
  }

  public async getFeed(page: number = 0, limit: number = 50): Promise<ImageMetadata[]> {
    if (!this.currentUser) return this.images.slice(page * limit, (page + 1) * limit);
    const prefs = new Set(this.currentUser.preferences);
    return [...this.images]
      .sort((a, b) => {
        const aPref = a.tags.some(t => prefs.has(t)) ? 1 : 0;
        const bPref = b.tags.some(t => prefs.has(t)) ? 1 : 0;
        if (aPref !== bPref) return bPref - aPref;
        return b.upload_timestamp - a.upload_timestamp;
      })
      .slice(page * limit, (page + 1) * limit);
  }

  public async getTrending(): Promise<ImageMetadata[]> {
    return this.trendingCache.image_ids
      .map(id => this.images.find(img => img.image_id === id))
      .filter((img): img is ImageMetadata => !!img);
  }

  public async search(query: string): Promise<ImageMetadata[]> {
    const q = query.toLowerCase().trim();
    if (!q) return this.getFeed();

    const scoredResults = this.images
      .map(img => ({
        img,
        relevance: calculateSearchRelevance(img, q)
      }))
      .filter(item => item.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance);

    return scoredResults.map(item => item.img);
  }

  public async uploadImage(data: Omit<ImageMetadata, 'image_id' | 'upload_timestamp' | 'interaction_count' | 'user_id'>): Promise<ImageMetadata> {
    const newImage: ImageMetadata = {
      ...data,
      image_id: `img_${Date.now()}`,
      user_id: this.currentUser?.user_id || 'guest',
      upload_timestamp: Date.now(),
      interaction_count: 0
    };
    this.images.unshift(newImage);
    this.saveToStorage();
    return newImage;
  }

  public async interact(image_id: string, type: InteractionType) {
    if (!this.currentUser) return;
    const interaction: Interaction = {
      interaction_id: `int_${Date.now()}`,
      user_id: this.currentUser.user_id,
      image_id,
      type,
      timestamp: Date.now()
    };
    this.interactions.push(interaction);
    const img = this.images.find(i => i.image_id === image_id);
    if (img) img.interaction_count++;
    this.saveToStorage();
  }

  public getCurrentUser() { return this.currentUser; }
  public getImages() { return this.images; }
  public getImage(id: string) { return this.images.find(img => img.image_id === id); }
}

export const backend = new MockBackend();
