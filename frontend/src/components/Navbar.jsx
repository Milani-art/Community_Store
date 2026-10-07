import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Store, PlusCircle, ShieldCheck, User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { AUTH_EXPIRED_EVENT, isTokenExpired } from '../services/api';
import AuthModal from './AuthModal';

const Navbar = () => {
  const { user, token, logout } = useAuth();
  const { totalCount, setIsCartOpen } = useCart();
  const toast = useToast();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  // `logout` is recreated on every render, so keep the latest copy in a ref.
  const logoutRef = useRef(logout);
  logoutRef.current = logout;

  const handleSessionExpired = useCallback(() => {
    logoutRef.current();
    toast.info('Your session has expired. Please sign in again.');
    setShowAuthModal(true);
  }, [toast]);

  // api.js fires this event when a request shows the login is no longer valid.
  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleSessionExpired);
  }, [handleSessionExpired]);

  // A login restored from a previous visit may already be expired.
  useEffect(() => {
    if (token && localStorage.getItem('token') && isTokenExpired(token)) {
      handleSessionExpired();
    }
  }, [token, handleSessionExpired]);

  const handleLogout = () => {
    logout();
    toast.info('You have been signed out.');
    navigate('/');
  };

  const firstName = user?.fullName?.split(' ')[0] || 'Account';

  return (
      <>
        <header className="navbar">
          <div className="container navbar-inner" style={{ flexWrap: 'wrap' }}>
            <Link to="/" className="brand-logo">
              <Store size={28} />
              <span>CommunityStore</span>
            </Link>

            <nav aria-label="Main navigation">
              <ul className="nav-links" style={{ flexWrap: 'wrap' }}>
                <li>
                  <NavLink to="/marketplace" className="nav-link">Marketplace</NavLink>
                </li>
                <li>
                  <NavLink to="/bulletin" className="nav-link">Bulletin Board</NavLink>
                </li>
                {user && (
                    <li>
                      <NavLink to="/sell" className="nav-link sell-link">
                        <PlusCircle size={18} /> Sell / Post
                      </NavLink>
                    </li>
                )}
                {user && user.role === 'ADMIN' && (
                    <li>
                      <NavLink to="/admin" className="nav-link admin-link">
                        Admin
                      </NavLink>
                    </li>
                )}
              </ul>
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="btn btn-secondary"
                  style={{ position: 'relative', padding: '0.5rem 0.85rem' }}
                  title="Shopping Cart"
                  aria-label={`Shopping cart, ${totalCount} item${totalCount === 1 ? '' : 's'}`}
              >
                <ShoppingBag size={20} />
                {totalCount > 0 && (
                    <span
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          background: 'var(--color-primary)',
                          color: 'white',
                          borderRadius: '50%',
                          minWidth: '20px',
                          height: '20px',
                          padding: '0 4px',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                    >
                  {totalCount > 99 ? '99+' : totalCount}
                </span>
                )}
              </button>

              {user ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '0.5rem 0.85rem' }}>
                      <User size={18} />
                      <span style={{ fontSize: '0.85rem' }}>{firstName}</span>
                      {user.verified && <ShieldCheck size={16} color="var(--color-accent)" aria-label="Verified" />}
                    </Link>
                    <button type="button" onClick={handleLogout} className="btn btn-secondary" title="Logout" aria-label="Sign out" style={{ padding: '0.5rem 0.75rem' }}>
                      <LogOut size={18} />
                    </button>
                  </div>
              ) : (
                  <button type="button" onClick={() => setShowAuthModal(true)} className="btn btn-primary">
                    <LogIn size={18} /> Sign In
                  </button>
              )}
            </div>
          </div>
        </header>

        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </>
  );
};

export default Navbar;
