interface JobCounters {
    new: number;
    applied: number;
    deleted: number;
    rejected: number;
    accepted: number;
    interview: number;
    offer: number;
    hired: number;
}

interface JobCountersState {
    counters: JobCounters;
}

const initialState: JobCountersState = {
    counters: {
        new: 0,
        applied: 0,
        deleted: 0,
        rejected: 0,
        accepted: 0,
        interview: 0,
        offer: 0,
        hired: 0,
    },
};

const SET_ALL_COUNTERS = 'SET_ALL_COUNTERS';
const INCREMENT_COUNTER = 'INCREMENT_COUNTER';
const DECREMENT_COUNTER = 'DECREMENT_COUNTER';

interface SetAllCountersAction {
    type: typeof SET_ALL_COUNTERS;
    payload: Partial<JobCounters>;
}

interface IncrementCounterAction {
    type: typeof INCREMENT_COUNTER;
    payload: {
        counter: keyof JobCounters;
    };
}

interface DecrementCounterAction {
    type: typeof DECREMENT_COUNTER;
    payload: {
        counter: keyof JobCounters;
    };
}

type JobCountersActions = SetAllCountersAction | IncrementCounterAction | DecrementCounterAction;

// Reducer function with type annotations
const reducerJobCounters = (
    state: JobCountersState = initialState,
    action: JobCountersActions
): JobCountersState => {
    switch (action.type) {
        case 'SET_ALL_COUNTERS':
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

export default reducerJobCounters;