import { combineReducers } from 'redux';
import reducerJobCounters from "./reducerJobCounters.js";
import reducerTaskCounters  from "./reducerTaskCounters";

const rootReducer = combineReducers({
    jobCounters: reducerJobCounters,
    taskCounters: reducerTaskCounters,
});

export default rootReducer;