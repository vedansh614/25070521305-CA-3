import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Users,
  Building,
  Calendar,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  Power,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  MapPin,
  RefreshCw,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, isAdmin, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('STATS'); // 'STATS' | 'VENUES' | 'BOOKINGS' | 'USERS'
  const [stats, setStats] = useState(null);
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Venue Modal state (Create & Edit)
  const [venueModalOpen, setVenueModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [venueFormData, setVenueFormData] = useState({
    name: '',
    sport: 'cricket',
    city: 'Nagpur',
    address: '',
    description: '',
    pricePerHour: 1000,
    images: '',
    amenities: 'Floodlights, Changing Rooms, Drinking Water, Parking',
    openHour: 6,
    closeHour: 23,
    isActive: true,
  });
  const [venueModalLoading, setVenueModalLoading] = useState(false);

  // Booking filters in Admin
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');

  // Protect route
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: '/admin' } });
      } else if (!isAdmin) {
        navigate('/');
      }
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate]);

  // Load Admin Data
  const loadAdminData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [statsRes, venuesRes, bookingsRes, usersRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/venues?includeInactive=true'),
        api.get('/api/admin/bookings'),
        api.get('/api/admin/users'),
      ]);

      if (statsRes) setStats(statsRes.stats);
      if (venuesRes) setVenues(venuesRes.venues);
      if (bookingsRes) setBookings(bookingsRes.bookings);
      if (usersRes) setUsers(usersRes.users);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load administrator data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  // Handle Venue Modal Open
  const handleOpenVenueModal = (venueToEdit = null) => {
    if (venueToEdit) {
      setEditingVenue(venueToEdit);
      setVenueFormData({
        name: venueToEdit.name,
        sport: venueToEdit.sport,
        city: venueToEdit.city,
        address: venueToEdit.address,
        description: venueToEdit.description,
        pricePerHour: venueToEdit.pricePerHour || venueToEdit.hourlyPrice || 1000,
        images: venueToEdit.images?.join('\n') || '',
        amenities: venueToEdit.amenities?.join(', ') || '',
        openHour: venueToEdit.openingHours?.open ?? 6,
        closeHour: venueToEdit.openingHours?.close ?? 23,
        isActive: venueToEdit.isActive !== false,
      });
    } else {
      setEditingVenue(null);
      setVenueFormData({
        name: '',
        sport: 'cricket',
        city: 'Nagpur',
        address: '',
        description: '',
        pricePerHour: 1000,
        images: '/images/venues/cricket-turf-01.jpg',
        amenities: 'Floodlights, Changing Rooms, Drinking Water, Parking',
        openHour: 6,
        closeHour: 23,
        isActive: true,
      });
    }
    setVenueModalOpen(true);
  };

  // Submit Venue Form (Create or Update)
  const handleSaveVenue = async (e) => {
    e.preventDefault();
    setVenueModalLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        name: venueFormData.name.trim(),
        sport: venueFormData.sport,
        city: venueFormData.city,
        address: venueFormData.address.trim(),
        description: venueFormData.description.trim(),
        pricePerHour: Number(venueFormData.pricePerHour),
        images: venueFormData.images
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        amenities: venueFormData.amenities
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        openingHours: {
          open: Number(venueFormData.openHour),
          close: Number(venueFormData.closeHour),
        },
        isActive: Boolean(venueFormData.isActive),
      };

      if (editingVenue) {
        await api.put(`/api/venues/${editingVenue._id}`, payload);
        setSuccessMsg(`Venue '${payload.name}' updated successfully.`);
      } else {
        await api.post('/api/venues', payload);
        setSuccessMsg(`New venue '${payload.name}' created successfully.`);
      }

      setVenueModalOpen(false);
      loadAdminData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save venue details.');
    } finally {
      setVenueModalLoading(false);
    }
  };

  // Safe Delete or Deactivate Venue
  const handleDeleteOrDeactivate = async (venue) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove or deactivate '${venue.name}'?\n\nIf the venue has existing bookings, it will be safely deactivated to preserve past customer records.`
    );
    if (!confirmed) return;

    try {
      const res = await api.delete(`/api/venues/${venue._id}`);
      setSuccessMsg(res.message);
      loadAdminData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete/deactivate venue.');
    }
  };

  // Filter admin bookings
  const filteredAdminBookings = bookings.filter((b) => {
    if (bookingStatusFilter && b.status !== bookingStatusFilter) return false;
    if (bookingSearch.trim()) {
      const q = bookingSearch.trim().toLowerCase();
      const refMatch = b.bookingReference?.toLowerCase().includes(q);
      const userMatch = b.user?.name?.toLowerCase().includes(q) || b.user?.email?.toLowerCase().includes(q);
      const venueMatch = b.venueSnapshot?.name?.toLowerCase().includes(q) || b.venue?.name?.toLowerCase().includes(q);
      return refMatch || userMatch || venueMatch;
    }
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading administrator metrics & database records...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 700, fontSize: '0.85rem' }}>
            <Shield size={16} /> Administrator Control Center
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.2rem' }}>
            PlayArena Operations & Management
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadAdminData} className="btn btn-secondary" title="Refresh Live DB Data">
            <RefreshCw size={16} /> Refresh Metrics
          </button>
          <button onClick={() => handleOpenVenueModal()} className="btn btn-lime">
            <Plus size={18} /> Add New Ground
          </button>
        </div>
      </div>

      {/* Feedback alerts */}
      {successMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.85rem 1rem',
          backgroundColor: 'var(--success-bg)',
          borderRadius: 'var(--radius-md)',
          color: '#6ee7b7',
          marginBottom: '1.5rem',
        }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.85rem 1rem',
          backgroundColor: 'var(--danger-bg)',
          borderRadius: 'var(--radius-md)',
          color: '#fca5a5',
          marginBottom: '1.5rem',
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STATS OVERVIEW CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem',
      }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Active Grounds</span>
            <Building size={18} color="var(--emerald-400)" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {stats?.activeVenues} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>/ {stats?.totalVenues}</span>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Confirmed Bookings</span>
            <Calendar size={18} color="var(--lime-400)" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--lime-400)' }}>
            {stats?.confirmedBookings}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Registered Players</span>
            <Users size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#38bdf8' }}>
            {stats?.totalUsers}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Cancellations</span>
            <Power size={18} color="var(--danger)" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f87171' }}>
            {stats?.cancelledBookings}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Expected Pay-at-Venue</span>
            <DollarSign size={18} color="var(--emerald-400)" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--emerald-400)' }}>
            ₹{stats?.expectedPayAtVenueVolume?.toLocaleString('en-IN') || 0}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '0.75rem',
        marginBottom: '2rem',
        overflowX: 'auto',
      }}>
        <button
          onClick={() => setActiveTab('STATS')}
          className={`btn ${activeTab === 'STATS' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Venue Inventory ({venues.length})
        </button>
        <button
          onClick={() => setActiveTab('BOOKINGS')}
          className={`btn ${activeTab === 'BOOKINGS' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All System Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('USERS')}
          className={`btn ${activeTab === 'USERS' ? 'btn-primary' : 'btn-secondary'}`}
        >
          User Accounts ({users.length})
        </button>
      </div>

      {/* TAB 1: VENUE MANAGEMENT */}
      {activeTab === 'STATS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Turf & Court Catalog</h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              fontSize: '0.875rem',
            }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem' }}>Ground Name</th>
                  <th style={{ padding: '1rem' }}>Sport</th>
                  <th style={{ padding: '1rem' }}>City</th>
                  <th style={{ padding: '1rem' }}>Rate / Hour</th>
                  <th style={{ padding: '1rem' }}>Hours (IST)</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {venues.map((v) => (
                  <tr key={v._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {v.name}
                    </td>
                    <td style={{ padding: '1rem', textTransform: 'capitalize' }}>
                      <span className="badge badge-sport">{v.sport}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>{v.city}</td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--lime-400)' }}>
                      ₹{(v.pricePerHour || v.hourlyPrice)?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {v.openingHours?.open || 6}:00 - {v.openingHours?.close || 23}:00
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${v.isActive ? 'badge-confirmed' : 'badge-cancelled'}`}>
                        {v.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenVenueModal(v)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.65rem' }}
                          title="Edit Details"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteOrDeactivate(v)}
                          className="btn btn-danger"
                          style={{ padding: '0.4rem 0.65rem' }}
                          title="Delete or Deactivate Safely"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ALL BOOKINGS */}
      {activeTab === 'BOOKINGS' && (
        <div>
          {/* Filter Bar */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ position: 'relative', flexGrow: 1, minWidth: '240px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search reference, customer, or ground..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.5rem' }}
              />
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <select
              className="form-select"
              value={bookingStatusFilter}
              onChange={(e) => setBookingStatusFilter(e.target.value)}
              style={{ minWidth: '180px' }}
            >
              <option value="">All Statuses</option>
              <option value="CONFIRMED">CONFIRMED Only</option>
              <option value="CANCELLED">CANCELLED Only</option>
            </select>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              fontSize: '0.875rem',
            }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem' }}>Reference</th>
                  <th style={{ padding: '1rem' }}>Customer</th>
                  <th style={{ padding: '1rem' }}>Venue Ground</th>
                  <th style={{ padding: '1rem' }}>Date & Slot (IST)</th>
                  <th style={{ padding: '1rem' }}>Amount</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Ticket</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdminBookings.map((b) => (
                  <tr key={b._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--lime-400)' }}>
                      {b.bookingReference}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{b.user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{b.user?.email}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {b.venueSnapshot?.name || b.venue?.name}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>{b.bookingDate}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.slotLabel}</div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>
                      ₹{b.amount?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${b.status === 'CONFIRMED' ? 'badge-confirmed' : 'badge-cancelled'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Link
                        to={`/bookings/${b._id}/ticket`}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        Inspect Ticket
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: USERS LIST */}
      {activeTab === 'USERS' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            fontSize: '0.875rem',
          }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Full Name</th>
                <th style={{ padding: '1rem' }}>Email Address</th>
                <th style={{ padding: '1rem' }}>System Role</th>
                <th style={{ padding: '1rem' }}>Account Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: u.role === 'ADMIN' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                      color: u.role === 'ADMIN' ? '#f59e0b' : 'var(--emerald-400)',
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                    {new Date(u.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT VENUE MODAL */}
      {venueModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          overflowY: 'auto',
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '620px',
            width: '100%',
            padding: '2rem',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                {editingVenue ? 'Edit Venue Details' : 'Create New Sports Ground'}
              </h3>
              <button onClick={() => setVenueModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveVenue}>
              <div className="form-group">
                <label className="form-label">Venue Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={venueFormData.name}
                  onChange={(e) => setVenueFormData({ ...venueFormData, name: e.target.value })}
                  placeholder="e.g. Apex Arena Football Turf"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Sport Discipline</label>
                  <select
                    className="form-select"
                    value={venueFormData.sport}
                    onChange={(e) => setVenueFormData({ ...venueFormData, sport: e.target.value })}
                  >
                    <option value="cricket">Cricket / Box Turf</option>
                    <option value="football">Football Turf</option>
                    <option value="badminton">Badminton Court</option>
                    <option value="basketball">Basketball Arena</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">City</label>
                  <select
                    className="form-select"
                    value={venueFormData.city}
                    onChange={(e) => setVenueFormData({ ...venueFormData, city: e.target.value })}
                  >
                    <option value="Nagpur">Nagpur</option>
                    <option value="Pune">Pune</option>
                    <option value="Mumbai">Mumbai</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Address</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={venueFormData.address}
                  onChange={(e) => setVenueFormData({ ...venueFormData, address: e.target.value })}
                  placeholder="Street, Landmark, Area, Pincode"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description & Turf Specifications</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  required
                  value={venueFormData.description}
                  onChange={(e) => setVenueFormData({ ...venueFormData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Hourly Rate (₹ INR)</label>
                  <input
                    type="number"
                    className="form-input"
                    min={100}
                    required
                    value={venueFormData.pricePerHour}
                    onChange={(e) => setVenueFormData({ ...venueFormData, pricePerHour: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Open Hour (0-23)</label>
                  <input
                    type="number"
                    className="form-input"
                    min={0}
                    max={23}
                    required
                    value={venueFormData.openHour}
                    onChange={(e) => setVenueFormData({ ...venueFormData, openHour: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Close Hour (1-24)</label>
                  <input
                    type="number"
                    className="form-input"
                    min={1}
                    max={24}
                    required
                    value={venueFormData.closeHour}
                    onChange={(e) => setVenueFormData({ ...venueFormData, closeHour: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Photo URLs (one per line)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={venueFormData.images}
                  onChange={(e) => setVenueFormData({ ...venueFormData, images: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amenities (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={venueFormData.amenities}
                  onChange={(e) => setVenueFormData({ ...venueFormData, amenities: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.6rem' }}>
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={venueFormData.isActive}
                  onChange={(e) => setVenueFormData({ ...venueFormData, isActive: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="isActiveCheck" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  Active & Available for public bookings
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setVenueModalOpen(false)}
                  disabled={venueModalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-lime"
                  disabled={venueModalLoading}
                >
                  {venueModalLoading ? 'Saving in MongoDB...' : 'Save Venue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
