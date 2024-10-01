import { useState, useEffect } from "react";
import { Link, Route, Routes } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Page2 from "./pages/Page2"
import { Button, Navbar } from "react-bootstrap"

const App = () => {
  const [theme, setTheme] = useState<string>("light");
  useEffect(() => {
    const initialTheme = document.documentElement.getAttribute("data-bs-theme");
    if (initialTheme) {
      setTheme(initialTheme);
    } else {
      document.documentElement.setAttribute("data-bs-theme", "light");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-bs-theme", newTheme);
  };

  return (<>
    <header>
      <Navbar fixed="top">
        <Link to="/">Dashboard</Link> &nbsp; &nbsp;
        <Link to="/page2">Page 2</Link>
        <Button
          variant="outline-primary"
          className="ms-auto"
          onClick={toggleTheme}
        >
          Toggle Theme
        </Button>
      </Navbar>
    </header>
    <main className="container-fluid">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/page2" element={<Page2 />} />
      </Routes>
    </main>
  </>)
}

export default App
