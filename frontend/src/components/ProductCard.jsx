import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Leaf, Star, Ban, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { userApi, productApi, getErrorMessage } from '../services/api';

// Only classes that exist in index.css, so every role gets a styled badge.
const getRoleBadgeClass = (role) => {
    switch (role) {
        case 'STUDENT': return 'badge-student';
        case 'VENDOR': return 'badge-vendor';
        case 'RESIDENT': return 'badge-eco';
        case 'FACULTY': return 'badge-student';
        case 'ADMIN': return 'badge-vendor';
        default: return 'badge-student';
    }
};

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [imageFailed, setImageFailed] = useState(false);
    
    const isAdmin = user && user.role === 'ADMIN';
    const seller = product.seller;
    const showImage = product.imageUrl && !imageFailed;
    const canBuy = product.available !== false && !isAdmin;

    const handleBan = async (e) => {
        e.preventDefault(); // prevent Link navigation
        if (!seller || !window.confirm(`Are you sure you want to ban ${seller.fullName}?`)) return;
        try {
            const res = await userApi.banUser(seller.id);
            if (res.data.success) {
                alert(`${seller.fullName} has been banned successfully.`);
                window.location.reload(); // simple way to refresh the view
            }
        } catch (err) {
            alert(getErrorMessage(err, 'Failed to ban user.'));
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault(); // prevent Link navigation
        if (!window.confirm(`Are you sure you want to delete ${product.title}?`)) return;
        try {
            const res = await productApi.delete(product.id);
            if (res.data.success) {
                alert('Product deleted successfully.');
                window.location.reload();
            }
        } catch (err) {
            alert(getErrorMessage(err, 'Failed to delete product.'));
        }
    };

    return (
        <div className="glass-card product-card">
            <div className="product-card-media">
                <Link to={`/products/${product.id}`} aria-label={`View ${product.title}`} className="product-card-image-link">
                    {showImage ? (
                        <img
                            src={product.imageUrl}
                            alt={product.title}
                            onError={() => setImageFailed(true)}
                            className="product-card-image"
                        />
                    ) : (
                        <div className="product-card-placeholder">No image</div>
                    )}
                </Link>
                {product.ecoFriendly && (
                    <span className="badge badge-eco product-card-eco"><Leaf size={12} /> Eco-Friendly</span>
                )}
                <span className="product-card-price">R {Number(product.price ?? 0).toFixed(2)}</span>
            </div>

            <div className="product-card-content">
                <div className="product-card-meta">
                    <span className="product-card-category">{product.category?.replace(/_/g, ' ')}</span>
                    {product.conditionName && (
                        <span className="product-card-condition">{product.conditionName}</span>
                    )}
                </div>

                <Link to={`/products/${product.id}`}>
                    <h3 className="product-card-title">{product.title}</h3>
                </Link>

                <p className="product-card-description">{product.description || 'No description provided.'}</p>

                <div className="product-card-footer">
                    {seller ? (
                        <div className="product-card-seller">
                            <div className="product-card-seller-name">
                                <span>{seller.fullName}</span>
                                {seller.verified && <ShieldCheck size={14} color="var(--color-accent)" aria-label="Verified user" />}
                            </div>
                            <div className="product-card-rating">
                                <Star size={12} color="#a76b19" fill="#a76b19" />
                                <span>{Number(seller.rating ?? 0).toFixed(1)}</span>
                                <span>•</span>
                                <span className={`badge ${getRoleBadgeClass(seller.role)}`}>
                                    {seller.role}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <span className="text-muted">Seller unavailable</span>
                    )}

                    {!isAdmin ? (
                        <button
                            type="button"
                            onClick={() => addToCart(product)}
                            disabled={!canBuy}
                            className="btn btn-primary product-card-add"
                            title={canBuy ? 'Add to Cart' : 'Currently unavailable'}
                        >
                            <ShoppingBag size={16} /> {canBuy ? 'Add' : 'Sold'}
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.2rem' }}>
                            <button
                                type="button"
                                onClick={handleBan}
                                className="btn product-card-add"
                                style={{ background: 'var(--color-warning)', color: 'white', padding: '0.5rem', flex: 1 }}
                                title="Ban Seller"
                            >
                                <Ban size={16} /> Ban
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="btn product-card-add"
                                style={{ background: 'var(--color-danger)', color: 'white', padding: '0.5rem', flex: 1 }}
                                title="Delete Listing"
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;