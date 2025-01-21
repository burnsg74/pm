import { combineReducers } from 'redux';
import counterReducer from './counterReducer';
import workLogReducer from "./workLogReducer";

const rootReducer = combineReducers({
    counter: counterReducer,
    workLogs: workLogReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;