export interface User {
  id: string | number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  timestamp: number;
}

export interface Meme {
  id: string;
  title?: string;
  content: string; // The text content
  author: User;
  timestamp: number;
  likes: string[]; // Array of user IDs who liked it
  tags: string[];
  mood: string; // e.g., 'Funny', 'Sarcastic', 'Sad', etc.
  team: string; // e.g., 'Engineering', 'HR', etc.
  flags?: Flag[];
  comments?: Comment[];
  deleted?: boolean;
  flagged?: boolean;
}

export interface Flag {
  userId: string | number;
  reason: string;
  timestamp: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  savedPosts: string[]; // IDs of saved posts
  likedPosts: string[]; // IDs of liked posts (redundant but fast lookup)
}

export interface Draft {
  id?: string; // If editing an existing post
  title: string;
  content: string;
  tags: string[];
  mood: string;
  team: string;
  lastSaved: number;
}
