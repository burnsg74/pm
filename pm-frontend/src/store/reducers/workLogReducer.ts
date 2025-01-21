export interface WorkLog {
    id: number;
    startAt: string;
    endAt: string;
    duration: number;
    subject: string;
    description?: string;
    scratchpad?: string;
    inProgress?: boolean;
}

interface WorkLogState {
    workLogs: WorkLog[];
}

const initialState: WorkLogState = {
    workLogs: [],
};

// Define action types
type WorkLogAction =
    | { type: 'ADD_WORK_LOG'; payload: WorkLog }
    | { type: 'UPDATE_WORK_LOG'; payload: WorkLog }
    | { type: 'DELETE_WORK_LOG'; payload: number }
    | { type: 'SET_WORK_LOGS'; payload: WorkLog[] };

const workLogReducer = (
    state: WorkLogState = initialState,
    action: WorkLogAction
): WorkLogState => {
    switch (action.type) {
        case 'ADD_WORK_LOG':
            return {
                ...state,
                workLogs: [action.payload, ...state.workLogs],
            };
        case 'UPDATE_WORK_LOG':
            return {
                ...state,
                workLogs: state.workLogs.map(workLog =>
                    workLog.id === action.payload.id ? action.payload : workLog
                ),
            };
        case 'DELETE_WORK_LOG':
            return {
                ...state,
                workLogs: state.workLogs.filter(workLog => workLog.id !== action.payload),
            };
        case 'SET_WORK_LOGS':
            return {
                ...state,
                workLogs: action.payload,
            };
        default:
            return state;
    }
};

export default workLogReducer;