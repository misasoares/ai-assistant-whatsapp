import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CustomerList from './pages/customer/CustomerList';
import CustomerDetails from './pages/customer/CustomerDetails';
import './App.css';
import { Users } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen min-w-[100vw] bg-background font-sans antialiased">
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center gap-3">
            <Users size={24} className="text-primary" />
            <span className="text-lg font-semibold tracking-tight">WhatsApp AI Admin</span>
          </div>
        </nav>
        <main className="w-full">
          <Routes>
            <Route path="/" element={<CustomerList />} />
            <Route path="/customers/:id" element={<CustomerDetails />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
