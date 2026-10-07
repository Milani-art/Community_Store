import React, { useEffect, useState } from 'react';
import { X, Trash2, ShoppingBag, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderApi, getErrorMessage } from '../services/api';

// Listings can be created without an image, and image links can break, so fall back to an icon.
const CartItemImage = ({ src, alt }) => {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div
                aria-hidden="true"
                style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)', border: '1px dashed var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
                <ShoppingBag size={22} color="#64748b" />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            onError={() => setFailed(true)}
            style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
        />
    );
};

const CartDrawer = () => {
    const { cart, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen, clearCart } = useCart();
    const { user } = useAuth();
    const toast = useToast();
    const [paymentMethod, setPaymentMethod] = useState('SNAPSCAN');
    const [loading, setLoading] = useState(false);
    const [successOrder, setSuccessOrder] = useState(null);

    const closeDrawer = () => {
        setIsCartOpen(false);
        setSuccessOrder(null);
    };

    // Close with Escape (not while an order is being submitted).
    useEffect(() => {
        if (!isCartOpen) return undefined;
        const onKeyDown = (e) => {
            if (e.key === 'Escape' && !loading) {
                setIsCartOpen(false);
                setSuccessOrder(null);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isCartOpen, loading, setIsCartOpen]);

    if (!isCartOpen) return null;

    const handleCheckout = async () => {
        if (!user) {
            toast.info('Please sign in to complete checkout.');
            return;
        }
        setLoading(true);
        try {
            const payload = {
                items: cart.map((item) => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                })),
                paymentMethod,
            };
            const res = await orderApi.create(payload);
            if (res.data.success) {
                setSuccessOrder(res.data.data);
                clearCart();
            } else {
                toast.error(res.data.message || 'Checkout failed. Please try again.');
            }
        } catch (err) {
            toast.error(getErrorMessage(err, 'Checkout failed. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            onMouseDown={(e) => {
                // Click on the dark area outside the drawer closes it.
                if (e.target === e.currentTarget && !loading) closeDrawer();
            }}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(4px)',
                zIndex: 250,
                display: 'flex',
                justifyContent: 'flex-end',
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Shopping cart"
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    height: '100%',
                    background: 'var(--color-surface)',
                    borderLeft: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1.5rem',
                    boxShadow: 'var(--shadow-md)',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShoppingBag size={22} color="var(--color-primary)" /> Your Cart
                    </h2>
                    <button type="button" onClick={closeDrawer} aria-label="Close cart" className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }}>
                        <X size={20} />
                    </button>
                </div>

                {successOrder ? (
                    <div style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <CheckCircle2 size={54} color="var(--color-accent)" />
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Order Confirmed!</h3>
                        <p className="text-muted" style={{ fontSize: '0.9rem', textAlign: 'center' }}>
                            Order ID: #{successOrder.id}<br />
                            Total Paid: <strong>R {Number(successOrder.totalAmount ?? 0).toFixed(2)}</strong> via {successOrder.paymentMethod}
                        </p>
                        <div style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', width: '100%', fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                            <ShieldCheck size={16} /> Protected by Campus Escrow Protection
                        </div>
                        <button type="button" onClick={closeDrawer} className="btn btn-primary" style={{ width: '100%' }}>
                            Continue Shopping
                        </button>
                    </div>
                ) : cart.length === 0 ? (
                    <div className="text-muted" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingBag size={48} strokeWidth={1} style={{ marginBottom: '1rem' }} />
                        <p>Your cart is empty.</p>
                    </div>
                ) : (
                    <>
                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.25rem' }}>
                            {cart.map((item) => (
                                <div key={item.product.id} style={{ display: 'flex', gap: '0.85rem', background: 'var(--color-bg)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                                    <CartItemImage src={item.product.imageUrl} alt={item.product.title} />
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.25rem' }}>{item.product.title}</h4>
                                        <p style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.875rem' }}>R {Number(item.product.price ?? 0).toFixed(2)}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                                            <button type="button" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} aria-label={`Decrease quantity of ${item.product.title}`} className="btn btn-secondary" style={{ padding: '0.1rem 0.4rem', fontSize: '0.8rem' }}>-</button>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.quantity}</span>
                                            <button type="button" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} aria-label={`Increase quantity of ${item.product.title}`} className="btn btn-secondary" style={{ padding: '0.1rem 0.4rem', fontSize: '0.8rem' }}>+</button>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => removeFromCart(item.product.id)} style={{ color: 'var(--color-danger)', alignSelf: 'flex-start' }} title="Remove" aria-label={`Remove ${item.product.title} from cart`}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem', marginTop: '1rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label htmlFor="cart-payment" className="text-muted" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Payment Gateway</label>
                                <select id="cart-payment" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input-field">
                                    <option value="SNAPSCAN">SnapScan QR</option>
                                    <option value="PAYFAST">PayFast Gateway</option>
                                    <option value="CASH_ON_PICKUP">Cash / Campus Pick-up</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', fontSize: '1.1rem', fontWeight: 700 }}>
                                <span>Total:</span>
                                <span style={{ color: 'var(--color-primary)' }}>R {cartTotal.toFixed(2)}</span>
                            </div>

                            {!user && (
                                <p className="text-muted" style={{ fontSize: '0.8rem', textAlign: 'center', marginBottom: '0.75rem' }}>
                                    You need to sign in before you can check out.
                                </p>
                            )}

                            <button type="button" onClick={handleCheckout} disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
                                {loading ? 'Processing...' : 'Complete Checkout'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;