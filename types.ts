
export interface User {
  user_id: string;
  username: string;
  email: string;
  password?: string; // Optional for simulation
  preferences: string[]; 
}

export interface ImageMetadata {
  image_id: string;
  user_id: string;
  category: string;
  tags: string[];
  description: string;
  dominant_color: string;
  upload_timestamp: number;
  board_id: string | null;
  image_url: string;
  interaction_count: number;
}

export interface Board {
  board_id: string;
  user_id: string;
  name: string;
  image_ids: string[];
}

export type InteractionType = 'like' | 'save' | 'comment';

export interface Interaction {
  interaction_id: string;
  user_id: string;
  image_id: string;
  type: InteractionType;
  timestamp: number;
}

export interface TrendingCache {
  last_updated: number;
  image_ids: string[];
}
