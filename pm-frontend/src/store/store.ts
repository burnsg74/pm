import {configureStore} from '@reduxjs/toolkit';
import rootReducer from './reducers';

function loadFromLocalStorage(): object | undefined {
    try {
        const serializedState = localStorage.getItem('appState');
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (e) {
        console.error('Could not load state from localStorage', e);
        return undefined;
    }
}

function saveToLocalStorage(state: RootState): void {
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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
