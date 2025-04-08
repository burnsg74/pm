import { useState } from 'react'
import {Route, Routes} from "react-router-dom";
import Home from "./pages/Home/Home.jsx";
import Jobs from "./pages/Jobs/Jobs.jsx";

function App() {

  return (
    <>
        <main className="container-fluid">
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/jobs/:jobStatus" element={<Jobs/>}/>
            </Routes>
        </main>
    </>
  )
}

export default App