import { Route, Routes,Link } from 'react-router-dom';
import Dashboard from "./pages/Dashboard";
import Page2 from "./pages/Page2";

const App = () => {
  return (
      <>
          <div>
              <Link to="/">Dashboard</Link> &nbsp; &nbsp;
              <Link to="/page2">Page 2</Link>
          </div>
          <Routes>
              <Route path="/" element={<Dashboard/>}/>
              <Route path="/page2" element={<Page2/>}/>
          </Routes>
      </>
  )
}

export default App
