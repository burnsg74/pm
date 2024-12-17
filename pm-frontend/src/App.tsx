import {useEffect} from "react";
import {Route, Routes} from "react-router-dom";
import Home from "./pages/Home/Home";
import Jobs from "./pages/Jobs/Jobs";
import Calendar from "./pages/Calendar/Calendar";
import Editor from "./pages/Editor/Editor";
import TopNav from "./components/TopNav/TopNav";

const App = () => {
    useEffect(() => {
        // const handleKeyPress = (event: KeyboardEvent) => {
        //   const keys = [];
        //   if (event.metaKey) keys.push('Meta');
        //   if (event.ctrlKey) keys.push('Ctrl');
        //   if (event.shiftKey) keys.push('Shift');
        //   if (event.altKey) keys.push('Alt');
        //   keys.push(event.key);
        //   console.log(event)
        //   console.log('Key pressed:', keys.join(' + '));
        // };
        // window.addEventListener('keydown', handleKeyPress);
        // Function to fetch data
        // const API_BASE_URL = import.meta.env.VITE_API_URL;

        // async function fetchData() {
        //     try {
        //         const query = `SELECT *
        //                        FROM jobs`;
        //         const response = await fetch(`${API_BASE_URL}/api/db`,
        //             {
        //                 method: "POST",
        //                 headers: {
        //                     "Content-Type": "application/json",
        //                 },
        //                 body: JSON.stringify({query}),
        //             });
        //         console.log(response);
        //     } catch (error) {
        //         console.error(error);
        //     }
        // }

        // Call the function
        // fetchData();
        // return () => {
        //   window.removeEventListener('keydown', handleKeyPress);
        // };
    }, []);

    return (
        <>
                <TopNav/>
                <main>
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/jobs" element={<Jobs/>}/>
                        <Route path="/editor" element={<Editor/>}/>
                        <Route path="/calendar" element={<Calendar/>}/>
                        <Route path="/jobs" element={<Jobs/>}/>
                    </Routes>
                </main>
        </>
    );
};

export default App;
