import React, { useEffect, useState } from 'react';
import { ShieldCheck, UserCheck, Ban, Trash2 } from 'lucide-react';
import { userApi, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AdminPanel = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [usersError, setUsersError] = useState('');
    const [actionUserId, setActionUserId] = useState(null);
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

    const fetchAllUsers = async () => {
    setUsersLoading(true);
    setUsersError('');

    try {
        const res = await userApi.getAllUsers();

        if (res.data.success) {
            setAllUsers(res.data.data);
        }
    } catch (err) {
        setUsersError(getErrorMessage(err, 'Failed to load users.'));
    } finally {
        setUsersLoading(false);
    }
};


    // Only hit the admin endpoint once we know the user really is an admin.
   useEffect(() => {
    if (isAdmin) {
        fetchPendingVerifications();
        fetchAllUsers();
    }
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
        const handleBan = async (userId) => {
        setActionUserId(userId);

        try {
            const res = await userApi.banUser(userId);

            if (res.data.success) {
                toast.success('User banned successfully.');
                fetchAllUsers();
            } else {
                toast.error(res.data.message || 'Failed to ban user.');
            }
        } catch (err) {
            toast.error(getErrorMessage(err, 'Failed to ban user.'));
        } finally {
            setActionUserId(null);
        }
    };

    const handleUnban = async (userId) => {
        setActionUserId(userId);

        try {
            const res = await userApi.unbanUser(userId);

            if (res.data.success) {
                toast.success('User unbanned successfully.');
                fetchAllUsers();
            } else {
                toast.error(res.data.message || 'Failed to unban user.');
            }
        } catch (err) {
            toast.error(getErrorMessage(err, 'Failed to unban user.'));
        } finally {
            setActionUserId(null);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to permanently delete this user?')) {
            return;
        }

        setActionUserId(userId);

        try {
            const res = await userApi.deleteUser(userId);

            if (res.data.success) {
                toast.success('User deleted successfully.');
                setAllUsers((prev) => prev.filter((u) => u.id !== userId));
            } else {
                toast.error(res.data.message || 'Failed to delete user.');
            }
        } catch (err) {
            toast.error(getErrorMessage(err, 'Failed to delete user.'));
        } finally {
            setActionUserId(null);
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
            <h1 style={{
                fontSize: '2.25rem',
                fontWeight: 800,
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem'
            }}>
                <ShieldCheck color="var(--color-warning)" />
                Administration & Moderation Panel
            </h1>

            <p className="text-muted">
                Review user identity verifications and maintain trust and safety.
            </p>
        </div>

        {/* PENDING VERIFICATIONS */}
        <div
            className="glass-card"
            style={{
                padding: '1.5rem',
                marginBottom: '2rem'
            }}
        >
            <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <UserCheck
                    size={20}
                    color="var(--color-primary)"
                />
                Pending User Identity Verifications
            </h2>

            {loading ? (
                <p className="text-muted">
                    Loading verification queue...
                </p>
            ) : loadError ? (
                <div className="state-message" role="alert">
                    <p
                        className="state-error"
                        style={{ marginBottom: '1rem' }}
                    >
                        {loadError}
                    </p>

                    <button
                        type="button"
                        onClick={fetchPendingVerifications}
                        className="btn btn-secondary"
                    >
                        Try again
                    </button>
                </div>
            ) : pendingUsers.length === 0 ? (
                <div className="state-message">
                    <p>
                        No pending verification requests at this time.
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    {pendingUsers.map((pendingUser) => (
                        <div
                            key={pendingUser.id}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '1rem',
                                flexWrap: 'wrap',
                                background: 'var(--color-bg)',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)'
                            }}
                        >
                            <div>
                                <div style={{
                                    fontWeight: 700,
                                    fontSize: '1rem'
                                }}>
                                    {pendingUser.fullName}
                                </div>

                                <div
                                    className="text-muted"
                                    style={{ fontSize: '0.85rem' }}
                                >
                                    {pendingUser.email}
                                </div>

                                <div style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--color-primary)',
                                    marginTop: '0.2rem'
                                }}>
                                    Role: {pendingUser.role} | Org/Biz:{' '}
                                    {pendingUser.institutionOrBusiness || 'N/A'}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    handleVerify(pendingUser.id)
                                }
                                disabled={
                                    approvingId === pendingUser.id
                                }
                                className="btn btn-accent"
                                style={{
                                    padding: '0.5rem 1rem'
                                }}
                            >
                                {approvingId === pendingUser.id
                                    ? 'Approving...'
                                    : 'Approve Verification'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* USER MANAGEMENT */}
        <div
            className="glass-card"
            style={{ padding: '1.5rem' }}
        >
            <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: '1rem'
            }}>
                User Management
            </h2>

            {usersLoading ? (
                <p className="text-muted">
                    Loading users...
                </p>
            ) : usersError ? (
                <div className="state-message" role="alert">
                    <p
                        className="state-error"
                        style={{ marginBottom: '1rem' }}
                    >
                        {usersError}
                    </p>

                    <button
                        type="button"
                        onClick={fetchAllUsers}
                        className="btn btn-secondary"
                    >
                        Try again
                    </button>
                </div>
            ) : allUsers.length === 0 ? (
                <div className="state-message">
                    <p>No users found.</p>
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    {allUsers.map((adminUser) => (
                        <div
                            key={adminUser.id}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '1rem',
                                flexWrap: 'wrap',
                                background: 'var(--color-bg)',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)'
                            }}
                        >
                            <div>
                                <div style={{
                                    fontWeight: 700,
                                    fontSize: '1rem'
                                }}>
                                    {adminUser.fullName}
                                </div>

                                <div
                                    className="text-muted"
                                    style={{ fontSize: '0.85rem' }}
                                >
                                    {adminUser.email}
                                </div>

                                <div style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--color-primary)',
                                    marginTop: '0.2rem'
                                }}>
                                    Role: {adminUser.role}
                                </div>

                                <div style={{
                                    fontSize: '0.8rem',
                                    marginTop: '0.2rem'
                                }}>
                                    Status:{' '}
                                    <strong>
                                        {adminUser.banned
                                            ? 'BANNED'
                                            : 'ACTIVE'}
                                    </strong>
                                </div>
                            </div>

                            {adminUser.role !== 'ADMIN' && (
                                <div style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    flexWrap: 'wrap'
                                }}>
                                    {adminUser.banned ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleUnban(adminUser.id)
                                            }
                                            disabled={
                                                actionUserId ===
                                                adminUser.id
                                            }
                                            className="btn btn-accent"
                                        >
                                            Unban
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleBan(adminUser.id)
                                            }
                                            disabled={
                                                actionUserId ===
                                                adminUser.id
                                            }
                                            className="btn btn-secondary"
                                        >
                                            <Ban size={16} />
                                            Ban
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(adminUser.id)
                                        }
                                        disabled={
                                            actionUserId ===
                                            adminUser.id
                                        }
                                        className="btn btn-secondary"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default AdminPanel;