import React, { useEffect, useState } from 'react';
import { ShieldCheck, UserCheck } from 'lucide-react';
import { userApi, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AdminPanel = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [approvingId, setApprovingId] = useState(null);
    const { user, loading: authLoading } = useAuth();
    const toast = useToast();

    const isAdmin = !!user && user.role === 'ADMIN';

    const fetchPendingVerifications = async () => {
        setLoading(true);
        setLoadError('');
        try {
            const res = await userApi.getPendingVerifications();
            if (res.data.success) setPendingUsers(res.data.data);
        } catch (err) {
            setLoadError(getErrorMessage(err, 'Failed to load the verification queue.'));
        } finally {
            setLoading(false);
        }
    };

    // Only hit the admin endpoint once we know the user really is an admin.
    useEffect(() => {
        if (isAdmin) fetchPendingVerifications();
    }, [isAdmin]);

    const handleVerify = async (userId) => {
        setApprovingId(userId);
        try {
            const res = await userApi.verifyUser(userId);
            if (res.data.success) {
                toast.success('User verification approved.');
                // Remove locally so the list updates instantly, then let the server be the source of truth.
                setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
                fetchPendingVerifications();
            } else {
                toast.error(res.data.message || 'Verification was not approved.');
            }
        } catch (err) {
            toast.error(getErrorMessage(err, 'Verification action failed.'));
        } finally {
            setApprovingId(null);
        }
    };

    // Wait for AuthContext to restore the session from localStorage; otherwise a refresh
    // briefly shows "Access Denied" to real admins.
    if (authLoading) {
        return <div className="state-message">Checking your permissions...</div>;
    }

    if (!isAdmin) {
        return (
            <div className="state-message state-error" role="alert">
                Access Denied. Administrator privileges required.
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <ShieldCheck color="#fbbf24" /> Administration & Moderation Panel
                </h1>
                <p className="text-muted">Review user identity verifications and maintain trust and safety.</p>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserCheck size={20} color="#60a5fa" /> Pending User Identity Verifications
                </h2>

                {loading ? (
                    <p className="text-muted">Loading verification queue...</p>
                ) : loadError ? (
                    <div className="state-message" role="alert">
                        <p className="state-error" style={{ marginBottom: '1rem' }}>{loadError}</p>
                        <button type="button" onClick={fetchPendingVerifications} className="btn btn-secondary">
                            Try again
                        </button>
                    </div>
                ) : pendingUsers.length === 0 ? (
                    <div className="state-message">
                        <p>No pending verification requests at this time.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {pendingUsers.map((pendingUser) => (
                            <div
                                key={pendingUser.id}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                            >
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{pendingUser.fullName}</div>
                                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>{pendingUser.email}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#60a5fa', marginTop: '0.2rem' }}>
                                        Role: {pendingUser.role} | Org/Biz: {pendingUser.institutionOrBusiness || 'N/A'}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleVerify(pendingUser.id)}
                                    disabled={approvingId === pendingUser.id}
                                    className="btn btn-accent"
                                    style={{ padding: '0.5rem 1rem' }}
                                >
                                    {approvingId === pendingUser.id ? 'Approving...' : 'Approve Verification'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;