import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';

export const SET_ALL_COUNTERS = 'SET_ALL_COUNTERS';

function loadFromLocalStorage(): ReturnType<typeof rootReducer> | undefined {
    try {
        const serializedState = localStorage.getItem('appState');
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState) as ReturnType<typeof rootReducer> | undefined;
    } catch (e) {
        console.error('Could not load state from localStorage', e);
        return undefined;
    }
}

function saveToLocalStorage(state: ReturnType<typeof rootReducer>): void {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('appState', serializedState);
    } catch (e) {
        console.error('Could not save state to localStorage', e);
    }
}

const store = configureStore({
    reducer: rootReducer,
    preloadedState: loadFromLocalStorage(),
});

store.subscribe(() => {
    saveToLocalStorage(store.getState());
});

export default store;