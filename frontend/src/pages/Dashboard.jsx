import React, { useEffect, useState } from 'react';
import { User, ShieldCheck, Star, ShoppingBag, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderApi, getErrorMessage } from '../services/api';

const money = (value) => `R ${Number(value ?? 0).toFixed(2)}`;

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await orderApi.getMyOrders();
      if (res.data.success) setOrders(res.data.data);
    } catch (err) {
      setLoadError(getErrorMessage(err, 'Failed to load your order history.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  if (authLoading) return <div className="state-message">Loading your dashboard...</div>;
  if (!user) return <div className="state-message" style={{ paddingTop: '4rem' }}>Please sign in to view your dashboard.</div>;

  const hasRating = Number(user.rating) > 0;

  return (
      <div style={{ paddingTop: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>User Dashboard</h1>
          <p className="text-muted">Manage profile verification, order history, and seller reputation.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {/* Profile Card */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-primary-light)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={28} color="var(--color-primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {user.fullName}
                  {user.verified && <ShieldCheck size={18} color="var(--color-accent)" aria-label="Verified Campus Identity" />}
                </h3>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>{user.email}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Account Type:</span>
                <span className="badge badge-student">{user.role}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Verification Status:</span>
                <span style={{ color: user.verified ? 'var(--color-accent)' : 'var(--color-warning)', fontWeight: 700 }}>
                {user.verified ? 'Verified' : 'Pending Verification'}
              </span>
              </div>
              {/* The login response does not currently include institutionOrBusiness, so only show it when present. */}
              {user.institutionOrBusiness && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted">Affiliation / Business:</span>
                    <span>{user.institutionOrBusiness}</span>
                  </div>
              )}
            </div>
          </div>

          {/* Reputation Card */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
              <Award size={24} color="var(--color-warning)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Seller Trust & Badges</h3>
            </div>

            <div style={{ textAlign: 'center', background: 'var(--color-bg)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '1rem' }}>
              {hasRating ? (
                  <>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      <Star fill="var(--color-warning)" size={32} /> {Number(user.rating).toFixed(1)}
                    </div>
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                      Community Rating{user.totalRatings != null ? ` (${user.totalRatings} reviews)` : ''}
                    </p>
                  </>
              ) : (
                  <p className="text-muted" style={{ fontSize: '0.95rem' }}>No community ratings yet.</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {user.verified && <span className="badge badge-verified">Verified ID</span>}
              {orders.length > 0 && <span className="badge badge-eco">Campus Trader</span>}
              {!user.verified && orders.length === 0 && (
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>Badges appear as you verify your ID and trade.</span>
              )}
            </div>
          </div>
        </div>

        {/* Order History */}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag color="var(--color-primary)" /> Order History
          </h2>

          {loading ? (
              <p className="text-muted">Loading order history...</p>
          ) : loadError ? (
              <div className="state-message" role="alert">
                <p className="state-error" style={{ marginBottom: '1rem' }}>{loadError}</p>
                <button type="button" onClick={fetchOrders} className="btn btn-secondary">Try again</button>
              </div>
          ) : orders.length === 0 ? (
              <div className="state-message" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                <p>You have not placed any orders yet.</p>
              </div>
          ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.map((order) => (
                    <div key={order.id} className="glass-card" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.65rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>Order #{order.id}</span>
                          <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                    </span>
                        </div>
                        <span className="badge badge-verified">{order.status}</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.85rem' }}>
                        {(order.items || []).map((item) => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.9rem' }}>
                              <span>{item.product?.title ?? 'Removed listing'} x {item.quantity}</span>
                              <span style={{ fontWeight: 700 }}>{money(item.price * item.quantity)}</span>
                            </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.65rem', borderTop: '1px solid var(--color-border)', fontWeight: 700 }}>
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>Payment Method: {order.paymentMethod}</span>
                        <span style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>Total: {money(order.totalAmount)}</span>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </div>
      </div>
  );
};

export default Dashboard;