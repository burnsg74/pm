import { configureStore, combineReducers } from '@reduxjs/toolkit';
import bookmarkReducer from './bookmarkSlice';
import jobCountersReducer from './jobCountersSlice';
import jobsReducer from './jobsSlice';
import { BookmarkState } from '../types/bookmark';
import { JobCountersState } from '../types/jobCounters';
import { JobsState } from './jobsSlice';

// Define the root state interface
interface RootState {
  bookmarks: BookmarkState;
  jobCounters: JobCountersState;
  jobs: JobsState;
}

// Create the root reducer
const rootReducer = combineReducers({
  bookmarks: bookmarkReducer,
  jobCounters: jobCountersReducer,
  jobs: jobsReducer,
});

// Function to load state from localStorage
function loadFromLocalStorage(): RootState | undefined {
  try {
    const serializedState = localStorage.getItem('appState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState) as RootState;
  } catch (e) {
    console.error('Could not load state from localStorage', e);
    return undefined;
  }
}

// Function to save state to localStorage
function saveToLocalStorage(state: RootState): void {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('appState', serializedState);
  } catch (e) {
    console.error('Could not save state to localStorage', e);
  }
}

// Configure the Redux store
const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadFromLocalStorage(),
});

// Subscribe to store changes to save to localStorage
store.subscribe(() => {
  saveToLocalStorage(store.getState());
});

// Export the store
export default store;

// Export types
export type AppRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
