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

const API_BASE_URL = import.meta.env.VITE_API_URL;

const App: FC = () => {
  useGlobalNavigation();
  const dispatch = useDispatch();


  useEffect(() => {
    const dbQuery = async () => {
      const query = "SELECT * from Bookmark";
      try {
        const response = await fetch(`${API_BASE_URL}/api/db-query`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query
          })
        });

        if (!response.ok) {
          console.error("Failed to fetch bookmarks:", response.statusText);
          return;
        }

        const data = await response.json();
        dispatch(setBookmarks(data));
        return data;
        
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      }
    };

    dbQuery();
  }, [dispatch]);

  return (
    <>
      <main className="container-fluid">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs/:jobStatus" element={<Jobs />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/jobs/process-new-jobs" element={<ProcessNewJobs />} />
        </Routes>
      </main>
    </>
  );
};

export default App;