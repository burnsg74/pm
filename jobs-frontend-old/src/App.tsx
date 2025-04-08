import {Route, Routes} from "react-router-dom";
import PageApplyForNewJobs from "./pages/Jobs/ApplyForNewJobs/PageApplyForNewJobs.jsx";
import PageJobs from "./pages/Jobs/PageJobs.jsx";
import Home from "./pages/Home/Home";
import {useEffect} from "react";
import {useDispatch} from "react-redux";
import Calendar from "./pages/Calendar/Calendar";
import PageJobsList from "./pages/Jobs/List/PageJobsList";
import PageReviewNewJobs from "./pages/Jobs/ReviewNewJobs/PageReviewNewJobs";
import PageView from "./pages/Jobs/View/PageView";
import { setAllJobs } from "./store/reducers/reducerJobs";

const App = () => {
    const dispatch = useDispatch();
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/jobs`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    console.error("Failed to fetch jobs:", response.statusText);
                    return;
                }

                const jobs: Job[] = await response.json();
                dispatch(setAllJobs(jobs));

            } catch (error) {
                console.error("Error fetching jobs:", error);
            }
        };

        fetchJobs();
    }, [dispatch]);

    return (
        <>
            {/*<WebSocket/>*/}
            <main className="container-fluid">
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/jobs" element={<PageJobs/>}/>
                    <Route path="/jobs/list" element={<PageJobsList/>}/>
                    <Route path="/jobs/view/:jobId" element={<PageView />} />
                    <Route path="/jobs/PageJobsGrid" element={<PageJobsList/>}/>
                    <Route path="/jobs/review-new-jobs" element={<PageReviewNewJobs />}/>
                    <Route path="/jobs/apply-for-new-jobs" element={<PageApplyForNewJobs />}/>
                    <Route path="/calendar" element={<Calendar/>}/>
                </Routes>
            </main>
            {/*<Footer/>*/}
        </>
    );
};

export default App;