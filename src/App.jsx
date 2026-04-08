import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Topbar from './components/layout/Topbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import Faculty from './components/faculty/Faculty';
import Leaves from './components/leaves/Leaves';
import Allocate from './components/allocate/Allocate';
import Seating from './components/seating/Seating';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg text-text font-sans">
        <Topbar />
        <div className="flex" style={{ minHeight: 'calc(100vh - 56px)' }}>
          <Sidebar />
          <div className="flex-1 p-7 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/faculty" element={<Faculty />} />
              <Route path="/leaves" element={<Leaves />} />
              <Route path="/allocate" element={<Allocate />} />
              <Route path="/seating" element={<Seating />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
