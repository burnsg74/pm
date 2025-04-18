export interface JobCounters {
    New: number;
    Applied: number;
    Saved: number;
    Deleted: number;
    Unknown: number;
}

export interface JobCountersState {
    counters: JobCounters;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}