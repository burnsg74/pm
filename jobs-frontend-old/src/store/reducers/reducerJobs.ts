import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';


interface JobsState {
    jobs: Job[];
}

const initialState: JobsState = {
    jobs: [],
};

export const updateJob = createAsyncThunk(
    'jobs/updateJobAsync',
    async (job: Job) => {
        console.log("Updating job", job);
        const API_BASE_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_BASE_URL}/api/job`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(job),
        });
        return (await response.json()) as Job;
    }
);

const jobsSlice = createSlice({
    name: 'jobs',
    initialState,
    reducers: {
        setAllJobs(state, action: PayloadAction<Job[]>) {
            state.jobs = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(updateJob.fulfilled, (state, action: PayloadAction<Job>) => {
            const index = state.jobs.findIndex((job) => job.id === action.payload.id);
            if (index !== -1) {
                state.jobs[index] = { ...state.jobs[index], ...action.payload };
            }
        });
    },


});

export const { setAllJobs } = jobsSlice.actions;

export default jobsSlice.reducer;

// Proper Selector to compute counts from jobs
export const selectJobCountsByStatus = (state: { jobs: JobsState }) => {
    return state.jobs.jobs.reduce(
        (acc: { [key in 'New' | 'Saved' | 'Applied' | 'Deleted' | 'Rejected']: number }, job) => {
            acc[job.status] = (acc[job.status] || 0) + 1;
            return acc;
        },
        { New: 0, Saved: 0, Applied: 0, Deleted: 0, Rejected: 0 }
    );
};

export const selectJobs = (state: { jobs: JobsState }): Job[] => state.jobs.jobs;