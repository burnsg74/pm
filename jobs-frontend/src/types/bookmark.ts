export interface Bookmark {
  bookmark_id: number;
  group: string;
  name: string;
  url: string;
  created_at?: string;
  updated_at?: string;
}

// Define a type for the bookmark state in the Redux store
export interface BookmarkState {
  bookmarks: Bookmark[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}