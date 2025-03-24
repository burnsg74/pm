import { combineReducers } from 'redux';
import workLogReducer from './workLogReducer';
import sessionReducer from './sessionReducer';

const rootReducer = combineReducers({
    session: sessionReducer,
    workLogs: workLogReducer,
});

export default rootReducer;