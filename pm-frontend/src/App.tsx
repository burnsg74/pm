import {Route, Routes} from "react-router-dom";
import PageApplyForNewJobs from "./pages/Jobs/applyForNewJobs/PageApplyForNewJobs.jsx";
import PageJobs from "./pages/Jobs/PageJobs.jsx";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import {useEffect} from "react";
import {useDispatch} from "react-redux";
import type { JobCounters} from "./store/reducers/reducerJobCounters";
import type { TaskCounters } from "./store/reducers/reducerTaskCounters";
import Kanban from "./pages/Kanban/Kanban";
import Calendar from "./pages/Calendar/Calendar";
import { SET_ALL_TASK_COUNTERS, SET_ALL_JOB_COUNTERS } from "./store/store";

interface JobCounterApiResponse {
    status: keyof JobCounters;
    count: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;
const App = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchTaskCounters = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/db`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: "SELECT status, COUNT(*) as count FROM tasks GROUP BY status",
                    }),
                });

                if (!response.ok) {
                    console.error(response);
                }

                const data: { status: string; count: number }[] = await response.json();

                const counters = data.reduce((acc: Partial<TaskCounters>, item: { status: string; count: number }) => {
                    const statusKey = item.status as keyof TaskCounters;
                    acc[statusKey] = item.count;
                    return acc;
                }, {});

                dispatch({
                    type: SET_ALL_TASK_COUNTERS,
                    payload: counters,
                });
            } catch (error) {
                console.error("Error fetching task counters:", error);
            }
        };

        const fetchJobCounters = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/db`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: "SELECT status, COUNT(*) as count FROM jobs GROUP BY status",
                    }),
                });

                if (!response.ok) {
                    console.error(response);
                }
                const data: JobCounterApiResponse[] = await response.json();

                const counters = data.reduce((acc: Partial<JobCounters>, item: JobCounterApiResponse) => {
                    const statusKey = item.status.toLowerCase() as keyof JobCounters;
                    acc[statusKey] = item.count;
                    return acc;
                }, {});

                dispatch({
                    type: SET_ALL_JOB_COUNTERS,
                    payload: counters,
                });
            } catch (error) {
                console.error("Error fetching task counters:", error);
            }
        };

        fetchTaskCounters().then();
        fetchJobCounters().then();
    }, [dispatch]);

    return (
        <>
            {/*<WebSocket/>*/}
            <main className="container-fluid">
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/jobs" element={<PageJobs/>}/>
                    <Route path="/jobs/apply-for-new-jobs" element={<PageApplyForNewJobs />}/>
                    <Route path="/kanban" element={<Kanban/>}/>
                    <Route path="/calendar" element={<Calendar/>}/>
                </Routes>
            </main>
            <Footer/>
        </>
    );
};

export default App;