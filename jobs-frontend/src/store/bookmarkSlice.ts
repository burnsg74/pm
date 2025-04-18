import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Bookmark, BookmarkState } from '@app-types/bookmark';
import {AppRootState} from './store';

const initialState: BookmarkState = {
  bookmarks: [],
  status: 'idle',
  error: null,
};

const bookmarkSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    addBookmark: (state, action: PayloadAction<Omit<Bookmark, 'bookmark_id'>>) => {
      const newBookmark = {
        ...action.payload,
        bookmark_id: state.bookmarks.length > 0 
          ? Math.max(...state.bookmarks.map(b => b.bookmark_id)) + 1 
          : 1,
      };
      state.bookmarks.push(newBookmark);
    },
    updateBookmark: (state, action: PayloadAction<Bookmark>) => {
      const index = state.bookmarks.findIndex(b => b.bookmark_id === action.payload.bookmark_id);
      if (index !== -1) {
        state.bookmarks[index] = action.payload;
      }
    },
    deleteBookmark: (state, action: PayloadAction<number>) => {
      state.bookmarks = state.bookmarks.filter(b => b.bookmark_id !== action.payload);
    },
    setBookmarks: (state, action: PayloadAction<Bookmark[]>) => {
      state.bookmarks = action.payload;
    },
  },
});

export const { addBookmark, updateBookmark, deleteBookmark, setBookmarks } = bookmarkSlice.actions;
export default bookmarkSlice.reducer;
export const selectAllBookmarks = (state: AppRootState) => state.bookmarks.bookmarks;
export const selectBookmarksByGroup = (state: AppRootState, group: string) =>
  state.bookmarks.bookmarks.filter(bookmark => bookmark.group === group);