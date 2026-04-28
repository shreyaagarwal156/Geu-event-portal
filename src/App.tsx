import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';

import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Events } from './pages/Events';
import { EventDetail } from './pages/EventDetail';
import { Grafest } from './pages/Grafest';
import { Clubs } from './pages/Clubs';
import { ClubDetail } from './pages/ClubDetail';
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';

import { AdminPanel } from './pages/admin/AdminPanel';
import { CreateEvent } from './pages/admin/CreateEvent';
import { EditEvent } from './pages/admin/EditEvent';
import { CreateClub } from './pages/admin/CreateClub';
import { EditClub } from './pages/admin/EditClub';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/events" element={<Layout><Events /></Layout>} />
          <Route path="/events/:id" element={<Layout><EventDetail /></Layout>} />
          <Route path="/grafest" element={<Layout><Grafest /></Layout>} />
          <Route path="/clubs" element={<Layout><Clubs /></Layout>} />
          <Route path="/clubs/:id" element={<Layout><ClubDetail /></Layout>} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/admin" element={<Layout><AdminPanel /></Layout>} />
          <Route path="/admin/events/create" element={<Layout><CreateEvent /></Layout>} />
          <Route path="/admin/events/:id/edit" element={<Layout><EditEvent /></Layout>} />
          <Route path="/admin/clubs/create" element={<Layout><CreateClub /></Layout>} />
          <Route path="/admin/clubs/:id/edit" element={<Layout><EditClub /></Layout>} />
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
