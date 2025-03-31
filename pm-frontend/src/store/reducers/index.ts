import { combineReducers } from 'redux';
import reducerJobCounters from "./reducerJobCounters.js";
import workLogReducer from './workLogReducer';
import reducerTaskCounters  from "./reducerTaskCounters";

const rootReducer = combineReducers({
    workLogs: workLogReducer,
    jobCounters: reducerJobCounters,
    taskCounters: reducerTaskCounters,
});

export default rootReducer;