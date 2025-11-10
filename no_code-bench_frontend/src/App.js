import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/home';
import SingleRepo from './pages/singleRepo';
import UploadRepo from './pages/uploadRepo';
import ChooseRepo from './pages/chooseRepo';

function App() {
  return (
    <BrowserRouter>
      {/* Navigation */}
      <nav>
        <Link to="/">Home</Link> |{" "}
        <Link to="/chooseRepo">chooseRepo</Link>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chooseRepo" element={<ChooseRepo />} />
        <Route path="/singleRepo" element={<SingleRepo />} />
        <Route path="/uploadRepo" element={<UploadRepo />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
