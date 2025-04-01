import { SET_ALL_TASK_COUNTERS } from "../store";

export interface TaskCounters {
    Backlog: number;
    "In Progress": number;
    Done: number;
    Hold: number;

}

interface TaskCountersState {
    counters: TaskCounters;
}

export interface TaskCounterApiResponse {
    status: keyof TaskCounters;
    count: number;
}

interface IncrementCounterAction {
    type: typeof INCREMENT_COUNTER;
    payload: {
        counter: keyof TaskCounters;
    };
}

interface DecrementCounterAction {
    type: typeof DECREMENT_COUNTER;
    payload: {
        counter: keyof TaskCounters;
    };
}

interface SetAllCountersAction {
    type: typeof SET_ALL_TASK_COUNTERS;
    payload: Partial<TaskCounters>;
}

type TaskCountersActions = SetAllCountersAction | IncrementCounterAction | DecrementCounterAction;

const initialState: TaskCountersState = {
    counters: {
        Backlog: 0,
        "In Progress": 0,
        Done: 0,
        Hold: 0,
    },
};

const INCREMENT_COUNTER = 'INCREMENT_COUNTER';
const DECREMENT_COUNTER = 'DECREMENT_COUNTER';

// Reducer function with type annotations
const reducerTaskCounters = (
    state: TaskCountersState = initialState,
    action: TaskCountersActions
): TaskCountersState => {
    switch (action.type) {
        case 'SET_ALL_TASK_COUNTERS':
            return {
                ...state,
                counters: {
                    ...state.counters,
                    ...action.payload,
                },
            };

        case 'INCREMENT_COUNTER':
            return {
                ...state,
                counters: {
                    ...state.counters,
                    [action.payload.counter]: state.counters[action.payload.counter] + 1,
                },
            };

        case 'DECREMENT_COUNTER':
            return {
                ...state,
                counters: {
                    ...state.counters,
                    [action.payload.counter]: state.counters[action.payload.counter] - 1,
                },
            };

        default:
            return state;
    }
};

export default reducerTaskCounters;