import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../services/api';

const AuthModal = ({ onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'STUDENT',
    institutionOrBusiness: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const toast = useToast();

  // Switching between Sign In and Register should not carry the old error message over.
  const switchMode = (registerMode) => {
    setError('');
    setIsRegister(registerMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const res = await register(formData);
        if (res.success) {
          toast.success('Registration successful! Please sign in.');
          // Keep the email so the user only has to type the password again.
          setFormData({ ...formData, password: '' });
          setIsRegister(false);
        } else {
          setError(res.message || 'Registration failed');
        }
      } else {
        const res = await login(formData.email, formData.password);
        if (res.success) {
          onClose();
        } else {
          setError(res.message || 'Invalid email or password');
        }
      }
    } catch (err) {
      setError(
          getErrorMessage(
              err,
              isRegister ? 'Registration failed. Please try again.' : 'Invalid email or password.'
          )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="modal-overlay">
        <div className="modal-card" style={{ position: 'relative' }}>
          <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: 'var(--color-text-muted)' }}
          >
            <X size={20} />
          </button>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {isRegister ? 'Join the CPUT & community marketplace' : 'Sign in to access your listings and cart'}
          </p>

          {error && (
              <div
                  role="alert"
                  style={{ background: '#fbefed', border: '1px solid #edd2cf', color: 'var(--color-danger)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem' }}
              >
                {error}
              </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
                <div className="form-group">
                  <label htmlFor="auth-fullname">Full Name</label>
                  <input
                      id="auth-fullname"
                      type="text"
                      required
                      className="input-field"
                      placeholder="e.g. Sarah Jenkins"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
            )}

            <div className="form-group">
              <label htmlFor="auth-email">Email Address</label>
              <input
                  id="auth-email"
                  type="email"
                  required
                  className="input-field"
                  placeholder={isRegister ? 'student@mycput.ac.za' : 'your.email@cput.ac.za'}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="auth-password">Password</label>
              <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={isRegister ? 6 : undefined}
                  className="input-field"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              {isRegister && (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                    At least 6 characters.
                  </p>
              )}
            </div>

            {isRegister && (
                <>
                  <div className="form-group">
                    <label htmlFor="auth-role">Account Role</label>
                    <select
                        id="auth-role"
                        className="input-field"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="STUDENT">Student (Uni Email Auto-Verify)</option>
                      <option value="FACULTY">Faculty / Staff</option>
                      <option value="VENDOR">Local Vendor / Business</option>
                      <option value="RESIDENT">Community Resident</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="auth-institution">Department / Business Reg</label>
                    <input
                        id="auth-institution"
                        type="text"
                        className="input-field"
                        placeholder="e.g. Faculty of IT / Reg No"
                        value={formData.institutionOrBusiness}
                        onChange={(e) => setFormData({ ...formData, institutionOrBusiness: e.target.value })}
                    />
                  </div>
                </>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}>
              {loading ? 'Please wait...' : isRegister ? 'Register Account' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            {isRegister ? (
                <span>
              Already have an account?{' '}
                  <button type="button" onClick={() => switchMode(false)} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                Sign In
              </button>
            </span>
            ) : (
                <span>
              Need an account?{' '}
                  <button type="button" onClick={() => switchMode(true)} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                Register
              </button>
            </span>
            )}
          </div>
        </div>
      </div>
  );
};

export default AuthModal;