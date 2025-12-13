import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/home';
import SingleRepo from './pages/singleRepo';
import StatusAnalytics from './pages/status';
import ChooseRepo from './pages/chooseRepo';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <main className="App-main">
          {/* Routes */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chooseRepo" element={<ChooseRepo />} />
            <Route path="/singleRepo" element={<SingleRepo />} />
            <Route path="/statusAnalytics" element={<StatusAnalytics />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>© 2025 NoCode-bench. All rights reserved.</p>
        </footer>
      </BrowserRouter>
    </div>
  );
}
export default App;
