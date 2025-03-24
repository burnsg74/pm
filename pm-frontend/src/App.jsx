import {useEffect} from "react";
import {Route, Routes} from "react-router-dom";
import Calendar from "./pages/Calendar/Calendar";
import TopNav from "./components/TopNav/TopNav";
import Footer from "./components/Footer/Footer";
import {Container} from "react-bootstrap";
import JobsHomePage from "./pages/Jobs/Home/JobsHome";
import BudgetHome from "./pages/Budget/Home/BudgetHome";
import SwiftERMHome from "./pages/SwiftERM/Home/SwiftERMHome";
import Home from "./pages/Home/Home";
import DocsHome from "./pages/Docs/Home/DocsHome";

const App = () => {
    return (
        <>
            <Container fluid className="px-0">
                <TopNav/>
                <main>
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/budget/home" element={<BudgetHome/>}/>
                        <Route path="/docs/home" element={<DocsHome/>}/>
                        <Route path="/jobs/home" element={<JobsHomePage/>}/>
                        <Route path="/swifterm/home" element={<SwiftERMHome/>}/>
                        <Route path="/calendar" element={<Calendar/>}/>
                    </Routes>
                </main>
            <Footer />
            </Container>

        </>
    );
};

export default App;