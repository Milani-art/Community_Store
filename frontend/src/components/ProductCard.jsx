import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Leaf, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

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
    const [imageFailed, setImageFailed] = useState(false);

    const seller = product.seller;
    const showImage = product.imageUrl && !imageFailed;
    const canBuy = product.available !== false;

    return (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                <Link to={`/products/${product.id}`} aria-label={`View ${product.title}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                    {showImage ? (
                        <img
                            src={product.imageUrl}
                            alt={product.title}
                            onError={() => setImageFailed(true)}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div
                            className="text-muted"
                            style={{ width: '100%', height: '100%', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
                        >
                            No image
                        </div>
                    )}
                </Link>
                {product.ecoFriendly && (
                    <span className="badge badge-eco" style={{ position: 'absolute', top: '10px', left: '10px' }}>
            <Leaf size={12} /> Eco-Friendly
          </span>
                )}
                <span
                    style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(4px)',
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        color: '#60a5fa',
                    }}
                >
          R {Number(product.price ?? 0).toFixed(2)}
        </span>
            </div>

            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            {product.category?.replace(/_/g, ' ')}
          </span>
                    {product.conditionName && (
                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1', background: '#334155', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
              {product.conditionName}
            </span>
                    )}
                </div>

                <Link to={`/products/${product.id}`} style={{ color: 'white', textDecoration: 'none' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: '1.3' }}>
                        {product.title}
                    </h3>
                </Link>

                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.description || 'No description provided.'}
                </p>

                <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                    {seller ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600 }}>
                                <span>{seller.fullName}</span>
                                {seller.verified && <ShieldCheck size={14} color="#10b981" aria-label="Verified user" />}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                                <Star size={12} color="#fbbf24" fill="#fbbf24" />
                                <span>{Number(seller.rating ?? 0).toFixed(1)}</span>
                                <span>•</span>
                                <span className={`badge ${getRoleBadgeClass(seller.role)}`}>
                  {seller.role}
                </span>
                            </div>
                        </div>
                    ) : (
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>Seller unavailable</span>
                    )}

                    <button
                        type="button"
                        onClick={() => addToCart(product)}
                        disabled={!canBuy}
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', flexShrink: 0 }}
                        title={canBuy ? 'Add to Cart' : 'Currently unavailable'}
                    >
                        <ShoppingBag size={16} /> {canBuy ? 'Add' : 'Sold'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;