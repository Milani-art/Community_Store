import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Leaf } from 'lucide-react';
import { productApi, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Values must match the backend Category enum.
const CATEGORY_OPTIONS = [
    { value: 'TEXTBOOKS', label: 'Textbooks' },
    { value: 'ELECTRONICS', label: 'Electronics' },
    { value: 'SERVICES', label: 'Services / Tutoring' },
    { value: 'CLOTHING', label: 'Clothing' },
    { value: 'HOUSING', label: 'Housing' },
    { value: 'ECO_FRIENDLY', label: 'Eco-Friendly' },
    { value: 'OTHER', label: 'Other' },
];

const INITIAL_FORM = {
    title: '',
    description: '',
    price: '',
    category: 'TEXTBOOKS',
    conditionName: 'Used - Good',
    ecoFriendly: false,
    imageUrl: '',
    location: 'Campus Main',
};

const SellItem = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM);

    const update = (field) => (e) =>
        setFormData({ ...formData, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const price = parseFloat(formData.price);
        if (!formData.title.trim()) {
            toast.error('Please give your listing a title.');
            return;
        }
        if (Number.isNaN(price) || price <= 0) {
            toast.error('Price must be greater than R 0.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                title: formData.title.trim(),
                price,
                imageUrl: formData.imageUrl.trim() || null,
            };
            const res = await productApi.create(payload);
            if (res.data.success) {
                toast.success('Listing published successfully!');
                navigate('/marketplace');
            } else {
                toast.error(res.data.message || 'Could not publish the listing.');
            }
        } catch (err) {
            toast.error(getErrorMessage(err, 'Failed to publish listing.'));
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return <div className="state-message">Loading...</div>;
    }

    // The backend requires authentication to create a listing, so don't show a form that can only fail.
    if (!user) {
        return (
            <div className="state-message" style={{ paddingTop: '4rem' }}>
                <p style={{ marginBottom: '0.5rem' }}>Please sign in to create a listing.</p>
                <p style={{ fontSize: '0.9rem' }}>
                    Use the Sign In button in the menu, then come back here. <Link to="/marketplace" style={{ color: '#60a5fa' }}>Browse the marketplace</Link> in the meantime.
                </p>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '2rem', maxWidth: '640px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <PlusCircle color="#34d399" /> Create New Item Listing
                </h1>
                <p className="text-muted">Sell products or offer services to campus peers & local community.</p>
            </div>

            <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '2rem' }}>
                <div className="form-group">
                    <label htmlFor="sell-title">Item Title *</label>
                    <input
                        id="sell-title"
                        type="text"
                        required
                        className="input-field"
                        placeholder="e.g. Data Structures & Algorithms Textbook (4th Ed)"
                        value={formData.title}
                        onChange={update('title')}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <div className="form-group">
                        <label htmlFor="sell-price">Price (ZAR R) *</label>
                        <input
                            id="sell-price"
                            type="number"
                            step="0.01"
                            min="0.01"
                            required
                            className="input-field"
                            placeholder="e.g. 250.00"
                            value={formData.price}
                            onChange={update('price')}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="sell-category">Category *</label>
                        <select id="sell-category" className="input-field" value={formData.category} onChange={update('category')}>
                            {CATEGORY_OPTIONS.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <div className="form-group">
                        <label htmlFor="sell-condition">Condition</label>
                        <select id="sell-condition" className="input-field" value={formData.conditionName} onChange={update('conditionName')}>
                            <option value="New">Brand New</option>
                            <option value="Used - Excellent">Used - Excellent</option>
                            <option value="Used - Good">Used - Good</option>
                            <option value="Used - Fair">Used - Fair</option>
                            <option value="Service">Service</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="sell-location">Pick-up Location</label>
                        <input
                            id="sell-location"
                            type="text"
                            className="input-field"
                            placeholder="e.g. Main Library / Student Res B"
                            value={formData.location}
                            onChange={update('location')}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="sell-image">Image URL (Optional)</label>
                    <input
                        id="sell-image"
                        type="url"
                        className="input-field"
                        placeholder="https://images.unsplash.com/..."
                        value={formData.imageUrl}
                        onChange={update('imageUrl')}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="sell-description">Detailed Description</label>
                    <textarea
                        id="sell-description"
                        rows={4}
                        className="input-field"
                        placeholder="Provide condition, features, or edition notes..."
                        value={formData.description}
                        onChange={update('description')}
                    />
                </div>

                <div className="form-group" style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', color: '#34d399', fontWeight: 700, margin: 0 }}>
                        <input
                            type="checkbox"
                            checked={formData.ecoFriendly}
                            onChange={update('ecoFriendly')}
                            style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
                        />
                        <Leaf size={20} /> Mark as Eco-Friendly / Sustainable Item
                    </label>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', marginTop: '1rem' }}>
                    {loading ? 'Publishing...' : 'Publish Item Listing'}
                </button>
            </form>
        </div>
    );
};

export default SellItem;