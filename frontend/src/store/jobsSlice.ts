import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Job } from "@app-types/job";
import { AppRootState } from "./store";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface JobsState {
  jobs: Job[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: JobsState = {
  jobs: [],
  status: "idle",
  error: null,
};

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setJobs(state, action: PayloadAction<Job[]>) {
      state.jobs = action.payload;
      state.status = "succeeded";
      state.error = null;
    },
    addJob(state, action: PayloadAction<Job>) {
      state.jobs.push(action.payload);
    },
    updateJob(state, action: PayloadAction<Job>) {
      const index = state.jobs.findIndex(
        (job) => job.job_id === action.payload.job_id,
      );
      if (index !== -1) {
        state.jobs[index] = action.payload;
        state.status = "succeeded";

        // Convert values to SQL-safe format
        const params = [
          action.payload.company_name,
          action.payload.title,
          action.payload.job_post,
          action.payload.salary_min || null,
          action.payload.salary_max || null,
          action.payload.source,
          action.payload.link,
          action.payload.skills,
          action.payload.status,
          action.payload.is_local,
          action.payload.date_posted || null,
          action.payload.date_new || null,
          action.payload.date_applied || null,
          action.payload.date_saved || null,
          action.payload.date_interviewed || null,
          action.payload.date_deleted || null,
          action.payload.date_rejected || null,
          action.payload.job_id
        ];

        const query = `
          UPDATE job 
          SET company_name = ?,
              title = ?,
              job_post = ?,
              salary_min = ?,
              salary_max = ?,
              source = ?,
              link = ?,
              skills = ?,
              status = ?,
              is_local = ?,
              date_posted = ?,
              date_new = ?,
              date_applied = ?,
              date_saved = ?,
              date_interviewed = ?,
              date_deleted = ?,
              date_rejected = ?
          WHERE job_id = ?
        `;

        try {
          fetch(`${API_BASE_URL}/api/query`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              sql: query,
              params: params
            }),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to update job");
              }
            })
            .catch((error) => {
              console.error("Error updating job:", error);
            });
        } catch (error) {
          console.error("Error updating job:", error);
        }
      }
    },
    removeJob(state, action: PayloadAction<number>) {
      state.jobs = state.jobs.filter((job) => job.job_id !== action.payload);
    },
    setJobsStatus(state, action: PayloadAction<JobsState["status"]>) {
      state.status = action.payload;
    },
    setJobsError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setJobs,
  addJob,
  updateJob,
  removeJob,
  setJobsStatus,
  setJobsError,
} = jobsSlice.actions;

export default jobsSlice.reducer;

// Selectors
export const selectAllJobs = (state: AppRootState) => state.jobs.jobs;