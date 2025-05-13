import { FC, useEffect } from 'react';
import { Route, Routes } from "react-router-dom";
import { useDispatch } from 'react-redux';
import Home from "./pages/Home/Home.tsx";
import { setJobCounters } from '@store/jobCountersSlice';
import { setJobs } from '@store/jobsSlice';
import { JobCounters } from '@app-types/jobCounters';
import { Job } from '@app-types/job';
import Jobs from "./pages/Jobs/Jobs.tsx";

const App: FC = () => {
  const dispatch = useDispatch();

  const API_BASE_URL = import.meta.env.VITE_API_URL;

const fetchJobCounters = async () => {
  const query = `
    SELECT 
      COALESCE(SUM(CASE WHEN status = 'New' THEN 1 ELSE 0 END), 0) as New,
      COALESCE(SUM(CASE WHEN status = 'Applied' THEN 1 ELSE 0 END), 0) as Applied,
      COALESCE(SUM(CASE WHEN status = 'Saved' THEN 1 ELSE 0 END), 0) as Saved,
      COALESCE(SUM(CASE WHEN status = 'Deleted' THEN 1 ELSE 0 END), 0) as Deleted,
      COALESCE(SUM(CASE WHEN status NOT IN ('New', 'Applied', 'Saved', 'Deleted') THEN 1 ELSE 0 END), 0) as Unknown
    FROM job`;

  try {
    const response = await fetch(`${API_BASE_URL}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql: query })
    });

    if (!response.ok) {
      console.error("Failed to fetch job counters:", response.statusText);
      return;
    }

    const { data } = await response.json();
    const counters: JobCounters = data[0]; // The query returns a single row
    dispatch(setJobCounters(counters));
  } catch (error) {
    console.error("Error fetching job counters:", error);
  }
};

const fetchJobs = async () => {
  const query = `SELECT * FROM job`;

  try {
    const response = await fetch(`${API_BASE_URL}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql: query })
    });

    if (!response.ok) {
      console.error("Failed to fetch jobs:", response.statusText);
      return;
    }

    const { data } = await response.json();
    dispatch(setJobs(data as Job[]));
  } catch (error) {
    console.error("Error fetching jobs:", error);
  }
};

  useEffect(() => {
    fetchJobCounters();
    fetchJobs();
  }, [dispatch]);

return (
  <>
    <main className="container-fluid">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs/:jobStatus" element={<Jobs />} />
      </Routes>
    </main>
  </>
);
};

export default App;
