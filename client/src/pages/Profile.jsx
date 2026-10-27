import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Shield,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
} from 'lucide-react';

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: '/profile' } });
      return;
    }
    if (user) {
      setName(user.name || '');
    }
  }, [user, isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg('Full name must be at least 2 characters long.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile(name.trim());
      setSuccessMsg('Your profile name has been updated successfully in MongoDB.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile name.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading account profile...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', maxWidth: '640px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.4rem' }}>
          Player Profile & Account
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Manage your personal details and view your account authorization status.
        </p>
      </div>

      {successMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.85rem 1rem',
          backgroundColor: 'var(--success-bg)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: 'var(--radius-md)',
          color: '#6ee7b7',
          fontSize: '0.875rem',
          marginBottom: '1.5rem',
        }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
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
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: '#fca5a5',
          fontSize: '0.875rem',
          marginBottom: '1.5rem',
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        boxShadow: 'var(--shadow-md)',
      }}>
        <form onSubmit={handleSubmit}>
          {/* Full Name (Editable) */}
          <div className="form-group">
            <label className="form-label" htmlFor="profile-name">
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="profile-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                required
              />
              <User
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          {/* Email Address (Read-only) */}
          <div className="form-group">
            <label className="form-label" htmlFor="profile-email" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Email Address</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Lock size={12} /> Read-only in this version
              </span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="profile-email"
                type="email"
                className="form-input"
                value={user.email}
                disabled
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  backgroundColor: 'rgba(7, 13, 24, 0.5)',
                  color: 'var(--text-muted)',
                  cursor: 'not-allowed',
                }}
              />
              <Mail
                size={18}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              Email serves as your unique primary login identifier.
            </span>
          </div>

          {/* Account Role Badge */}
          <div className="form-group">
            <label className="form-label">System Role & Access Tier</label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}>
              <Shield size={18} color={user.role === 'ADMIN' ? '#f59e0b' : 'var(--emerald-400)'} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                {user.role === 'ADMIN' ? 'Administrator' : 'Standard Player (Customer)'}
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving || name.trim() === user.name}
            style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
          >
            <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
