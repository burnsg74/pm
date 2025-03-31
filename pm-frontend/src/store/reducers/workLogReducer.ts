const initialState = {
    workLogs: [],
};

const workLogReducer = (state = initialState, action) => {
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