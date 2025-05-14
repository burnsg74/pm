export type JobStatus = 'New' | 'Applied' | 'Interviewed' | 'Rejected' | 'Deleted' | 'Saved';

export interface Job {
    job_id: number;
    jk: string;
    company_name: string;
    title: string;
    job_post: string | null;
    search_query: string | null;
    salary_min: number | null;
    salary_max: number | null;
    source: string;
    link: string | null;
    skills: string | null;
    status: JobStatus;
    is_local: number;
    date_posted: string | null;
    date_new: string | null;
    date_applied: string | null;
    date_saved: string | null;
    date_interviewed: string | null;
    date_deleted: string | null;
    date_rejected: string | null;
    created_at: string;
    updated_at: string;
}

// Optional: Create a type for new job creation (without auto-generated fields)
export type JobCreate = Omit<Job, 'job_id' | 'created_at' | 'updated_at'> & {
    job_id?: never;
    created_at?: never;
    updated_at?: never;
};

// Optional: Create a type for job updates
export type JobUpdate = Partial<Omit<Job, 'job_id' | 'created_at' | 'updated_at'>>;