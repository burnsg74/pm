import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { JobCounters, JobCountersState } from '@app-types/jobCounters';
import { AppRootState } from './store';

const initialState: JobCountersState = {
    counters: {
        New: 0,
        Applied: 0,
        Saved: 0,
        Deleted: 0,
        Unknown: 0,
    },
    status: 'idle',
    error: null,
};

const jobCountersSlice = createSlice({
    name: 'jobCounters',
    initialState,
    reducers: {
        setJobCounters(state, action: PayloadAction<JobCounters>) {
            state.counters = { ...action.payload };
            state.status = 'succeeded';
            state.error = null;
        },
        setJobCountersStatus(state, action: PayloadAction<JobCountersState['status']>) {
            state.status = action.payload;
        },
        setJobCountersError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
        incrementJobCounter(state, action: PayloadAction<keyof JobCounters>) {
            state.counters[action.payload]++;
        },
        decrementJobCounter(state, action: PayloadAction<keyof JobCounters>) {
            if (state.counters[action.payload] > 0) state.counters[action.payload]--;
        },
    }
});

export const {
    setJobCounters,
    setJobCountersStatus,
    setJobCountersError,
    incrementJobCounter,
    decrementJobCounter,
} = jobCountersSlice.actions;

export default jobCountersSlice.reducer;

// Selectors (similar to bookmark)
export const selectJobCounters = (state: AppRootState) => state.jobCounters.counters;
export const selectJobCountersStatus = (state: AppRootState) => state.jobCounters.status;
export const selectJobCountersError = (state: AppRootState) => state.jobCounters.error;