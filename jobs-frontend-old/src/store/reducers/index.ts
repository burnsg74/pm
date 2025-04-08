import { combineReducers } from 'redux';
import jobsSlice from './reducerJobs';

const rootReducer = combineReducers({
    jobs: jobsSlice,
});

export default rootReducer;