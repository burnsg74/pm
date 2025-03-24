const initialState = {
    area: {
        key: "JOB",
        title: "Job Search",
    },
};

const SET_SESSION = 'SET_SESSION';
const GET_SESSION = 'GET_SESSION';

const sessionReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_SESSION:
            return { ...state, ...action.payload };
        case GET_SESSION:
            return state;
        default:
            return state;
    }
};

// Action creators
export const setSession = (session) => ({
    type: SET_SESSION,
    payload: session,
});

export const getSession = () => ({
    type: GET_SESSION,
});

export default sessionReducer;