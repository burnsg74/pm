import { Link, Route, Routes } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Page2 from "./pages/Page2"
import { Navbar } from "react-bootstrap"

const App = () => {
  return (<>
    <header>
      <Navbar fixed="top">
        <Link to="/">Dashboard</Link> &nbsp; &nbsp;
        <Link to="/page2">Page 2</Link>
      </Navbar>
    </header>
    <main>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/page2" element={<Page2 />} />
      </Routes>
    </main>
  </>)
}

export default App
