import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home.tsx";

export const App = () => (
  <>
    <main className="container-fluid">
      <Routes>
        <Route path="/" element={<Home />} />
        {/*<Route path="/jobs/:jobStatus" element={<Jobs />} />*/}
      </Routes>
    </main>
  </>
)
