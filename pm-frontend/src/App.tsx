import {Route, Routes} from "react-router-dom";
import PageApplyForNewJobs from "./pages/Jobs/applyForNewJobs/PageApplyForNewJobs.jsx";
import PageJobs from "./pages/Jobs/PageJobs.jsx";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import {useEffect} from "react";
import {useDispatch} from "react-redux";
import type { JobCounters} from "./store/reducers/reducerJobCounters";
import Kanban from "./pages/Kanban/Kanban";
import Calendar from "./pages/Calendar/Calendar";
import { SET_ALL_JOB_COUNTERS } from "./store/store";
import PageJobsGrid from "./pages/Jobs/Grid/PageJobsGrid";
import PageReviewNewJobs from "./pages/Jobs/reviewNewJobs/PageReviewNewJobs";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const App = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchJobCounters = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/job/get-job-counters`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    console.error(response);
                    return;
                }

                const data: Record<string, number> = await response.json();
                const counters = Object.entries(data).reduce((acc: Partial<JobCounters>, [status, count]) => {
                    const statusKey = status.toLowerCase() as keyof JobCounters;
                    acc[statusKey] = count;
                    return acc;
                }, {});

                dispatch({
                    type: SET_ALL_JOB_COUNTERS,
                    payload: counters,
                });
            } catch (error) {
                console.error("Error fetching counters:", error);
            }
        };

        // fetchTaskCounters().then();
        fetchJobCounters().then();
    }, [dispatch]);

    return (
        <>
            {/*<WebSocket/>*/}
            <main className="container-fluid">
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/jobs" element={<PageJobs/>}/>
                    <Route path="/jobs/grid" element={<PageJobsGrid/>}/>
                    <Route path="/jobs/PageJobsGrid" element={<PageJobsGrid/>}/>
                    <Route path="/jobs/review-new-jobs" element={<PageReviewNewJobs />}/>
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