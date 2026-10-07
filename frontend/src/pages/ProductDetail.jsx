import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Leaf, Star, MapPin, ArrowLeft, User } from 'lucide-react';
import { productApi, getErrorMessage } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageFailed, setImageFailed] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    let cancelled = false;

    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      setImageFailed(false);
      try {
        const res = await productApi.getById(id);
        if (!cancelled) setProduct(res.data.success ? res.data.data : null);
      } catch (err) {
        if (!cancelled) {
          setProduct(null);
          // A 404 means "no such product"; anything else is a real failure worth surfacing.
          if (err.response?.status !== 404) setError(getErrorMessage(err, 'Failed to load product details.'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div className="state-message">Loading product details...</div>;

  if (!product) {
    return (
        <div className="state-message" role="alert">
          <p className="state-error" style={{ marginBottom: '1rem' }}>{error || 'Product not found.'}</p>
          <Link to="/marketplace" className="btn btn-secondary">
            <ArrowLeft size={18} /> Back to Marketplace
          </Link>
        </div>
    );
  }

  const seller = product.seller;
  const showImage = product.imageUrl && !imageFailed;
  const canBuy = product.available !== false;

  return (
      <div style={{ paddingTop: '2rem' }}>
        <Link to="/marketplace" style={{ color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back to Marketplace
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '2.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
          <div>
            {showImage ? (
                <img
                    src={product.imageUrl}
                    alt={product.title}
                    onError={() => setImageFailed(true)}
                    style={{ width: '100%', borderRadius: 'var(--radius-md)', maxHeight: '420px', objectFit: 'cover' }}
                />
            ) : (
                <div
                    className="text-muted"
                    style={{ width: '100%', height: '320px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', border: '1px dashed var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  No image provided
                </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
              <span className="badge badge-student">{product.category?.replace(/_/g, ' ')}</span>
              {product.ecoFriendly && (
                  <span className="badge badge-eco"><Leaf size={12} /> Eco-Friendly</span>
              )}
              {!canBuy && <span className="badge badge-vendor">Unavailable</span>}
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>{product.title}</h1>

            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
              R {Number(product.price).toFixed(2)}
            </div>

            {(product.conditionName || product.location) && (
                <div className="text-muted" style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  {product.conditionName && <span>Condition: <strong style={{ color: 'var(--color-text-main)' }}>{product.conditionName}</strong></span>}
                  {product.location && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={15} /> {product.location}
                </span>
                  )}
                </div>
            )}

            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
              {product.description || 'The seller has not added a description.'}
            </p>

            {seller && (
                <div style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
                  <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>SELLER INFORMATION</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <User size={20} color="var(--color-primary)" />
                      <div>
                        <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          {seller.fullName}
                          {seller.verified && <ShieldCheck size={16} color="var(--color-accent)" aria-label="Verified Campus Identity" />}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                          {seller.institutionOrBusiness || seller.role}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#fbbf24', fontWeight: 700 }}>
                      <Star size={16} fill="#fbbf24" /> {Number(seller.rating ?? 0).toFixed(1)}
                    </div>
                  </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                  type="button"
                  onClick={() => addToCart(product)}
                  disabled={!canBuy}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.85rem', fontSize: '1rem' }}
              >
                <ShoppingBag size={20} /> {canBuy ? 'Add to Cart' : 'Currently Unavailable'}
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ProductDetail;