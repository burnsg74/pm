import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home/Home"
import Settings from "./pages/Settings/Settings"
import Footer from "./components/Footer/Footer"
import TopNav from "./components/TopNav/TopNav"

const App = () => {
  return (
    <>
      <TopNav/>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
