/// <reference types="vite/client" />
import { FC, useEffect } from 'react';
import { Route, Routes } from "react-router-dom";
import { useDispatch } from 'react-redux';
import useGlobalNavigation from "./hooks/useGlobalNavigation";
import Home from "./pages/Home/Home.jsx";
import Jobs from "./pages/Jobs/Jobs.jsx";
import Notes from "./pages/Notes/Notes.jsx";
import ProcessNewJobs from "./pages/ProcessNewJobs/ProcessNewJobs.jsx";
import { setBookmarks } from '@store/bookmarkSlice';
import { setJobCounters } from '@store/jobCountersSlice';
import { JobCounters } from '@app-types/jobCounters';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const App: FC = () => {
  useGlobalNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch bookmarks from the database
    const fetchBookmarks = async () => {
      const query = "SELECT * from Bookmark";
      try {
        const response = await fetch(`${API_BASE_URL}/api/db-query`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          console.error("Failed to fetch bookmarks:", response.statusText);
          return;
        }

        const data = await response.json();
        dispatch(setBookmarks(data));
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      }
    };

    // Fetch job counters from the database
    const fetchJobCounters = async () => {
      const query =
        "SELECT status, count(*) as count from job group by status";
      try {
        const response = await fetch(`${API_BASE_URL}/api/db-query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          console.error("Failed to fetch job counters:", response.statusText);
          return;
        }

        const data = await response.json();
        const counters: JobCounters = {
          New: 0,
          Applied: 0,
          Saved: 0,
          Deleted: 0,
          Unknown: 0,
        };

        data.forEach((item: { status: string; count: number }) => {
          if (item.status in counters) {
            counters[item.status as keyof JobCounters] = item.count;
          }
        });

        dispatch(setJobCounters(counters));
      } catch (error) {
        console.error("Error fetching job counters:", error);
      }
    };

    fetchBookmarks();
    fetchJobCounters();
  }, [dispatch]);

  return (
    <>
      <main className="container-fluid">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs/:jobStatus" element={<Jobs />} />
          <Route path="/notes" element={<Notes />} />
        </Routes>
      </main>
    </>
  );
};

export default App;