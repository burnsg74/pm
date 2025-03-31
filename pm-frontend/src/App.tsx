import {Route, Routes} from "react-router-dom";
import PageApplyForNewJobs from "./pages/Jobs/applyForNewJobs/PageApplyForNewJobs.jsx";
import PageJobs from "./pages/Jobs/PageJobs.jsx";
// import TopNav from "./components/TopNav/TopNav";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import {useEffect} from "react";
import {SET_ALL_COUNTERS} from "./store/store";
import {useDispatch} from "react-redux";
import Kanban from "./pages/Kanban/Kanban";
import Calendar from "./pages/Calendar/Calendar";


const API_BASE_URL = import.meta.env.VITE_API_URL;
const App = () => {
    const dispatch = useDispatch();

    // TODO: Sync App Data with DB Data (redux)
    // TODO: Add Typescript

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
                    throw new Error(`Failed to fetch task counters: ${response.statusText}`);
                }

                const data = await response.json();

                // Map the API response to match the TaskCounters format
                const counters = data.reduce((acc: Partial<TaskCounters>, item: { status: string; count: number }) => {
                    acc[item.status] = item.count;
                    return acc;
                }, {});

                // Dispatch the action to update Redux state
                dispatch({
                    type: SET_ALL_COUNTERS,
                    payload: counters,
                });
            } catch (error) {
                console.error("Error fetching task counters:", error);
            }
        };

        fetchTaskCounters();
    }, [dispatch]);

    return (
        <>
            <main className="container-fluid">
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/jobs" element={<PageJobs/>}/>
                    <Route path="/jobs/apply-for-new-jobs" element={<PageApplyForNewJobs    />}/>
                    <Route path="/kanban" element={<Kanban/>}/>
                    <Route path="/calendar" element={<Calendar/>}/>
                </Routes>
            </main>
            <Footer/>
        </>
    );
};

export default App;