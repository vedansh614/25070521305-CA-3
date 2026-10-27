import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import ExploreVenues from './pages/ExploreVenues';
import VenueDetails from './pages/VenueDetails';
import BookingReview from './pages/BookingReview';
import BookingTicket from './pages/BookingTicket';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/venues" element={<ExploreVenues />} />
                <Route path="/venues/:id" element={<VenueDetails />} />
                <Route path="/book/:id" element={<BookingReview />} />
                <Route path="/bookings/:id/ticket" element={<BookingTicket />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}
