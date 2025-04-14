import { useState } from 'react'
import {Route, Routes} from "react-router-dom";
import Home from "./pages/Home/Home.jsx";
import Jobs from "./pages/Jobs/Jobs.jsx";
import Notes from "./pages/Notes/Notes.jsx";

function App() {

  return (
    <>
        <main className="container-fluid">
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/jobs/:jobStatus" element={<Jobs/>}/>
                <Route path="/notes" element={<Notes/>}/>
            </Routes>
        </main>
    </>
  )
}

export default App