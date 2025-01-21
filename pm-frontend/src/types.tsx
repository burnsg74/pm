type WorkLog = {
    id: number;
    startAt: string;
    endAt: string; 
    duration: number; 
    subject: string;
    description?: string; 
    scratchpad?: string;
    inProgress?: boolean;
};

type WorkLogs = WorkLog[];