import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Leaf, ShoppingBag, Megaphone, Users, Sparkles } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import BulletinCard from '../components/BulletinCard';
import { productApi, bulletinApi, getErrorMessage } from '../services/api';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bulletinPosts, setBulletinPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, bullRes] = await Promise.all([
          productApi.getAll(),
          bulletinApi.getAll(),
        ]);
        if (prodRes.data.success) setFeaturedProducts(prodRes.data.data.slice(0, 4));
        if (bullRes.data.success) setBulletinPosts(bullRes.data.data.slice(0, 2));
      } catch (err) {
        setLoadError(getErrorMessage(err, 'Could not load the latest listings and announcements.'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
      <div style={{ paddingTop: '2rem' }}>
        {/* Hero Banner */}
        <section style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 1) 100%)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: '4rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden', marginBottom: '3.5rem' }}>
          <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

          <span className="badge badge-student" style={{ marginBottom: '1.25rem', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
          <Sparkles size={14} /> Official Campus & Community Marketplace
        </span>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem', maxWidth: '850px', margin: '0 auto 1.25rem' }}>
            Connecting Campus, Local Vendors & Residents in One Ecosystem
          </h1>

          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.15rem', maxWidth: '680px', margin: '0 auto 2rem' }}>
            Buy, sell, and trade textbooks, electronics, and services with verified campus identity and eco-friendly sustainability initiatives.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/marketplace" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
              <ShoppingBag size={20} /> Browse Marketplace
            </Link>
            <Link to="/bulletin" className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
              <Megaphone size={20} /> Community Bulletin
            </Link>
          </div>
        </section>

        {/* Feature Highlights */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <ShieldCheck size={32} color="#10b981" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Verified Campus Identity</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Automated verification via student email and vendor business registration builds trust.</p>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <Leaf size={32} color="#34d399" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Eco & Sustainability</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Promoting second-hand textbook trading and eco-friendly products to reduce waste.</p>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <Users size={32} color="#60a5fa" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Community Bulletin</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Announcements, campus club events, service offers, and local vendor promotions.</p>
          </div>
        </section>

        {/* Recent Listings */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Featured Listings</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>Recent products and services posted by students & vendors</p>
            </div>
            <Link to="/marketplace" style={{ color: '#60a5fa', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              View All <ArrowRight size={18} />
            </Link>
          </div>

          {loading ? (
              <p style={{ color: 'var(--color-text-muted)' }}>Loading marketplace...</p>
          ) : loadError ? (
              <p role="alert" style={{ color: 'var(--color-danger)' }}>{loadError}</p>
          ) : featuredProducts.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>No listings yet. <Link to="/sell" style={{ color: '#60a5fa' }}>Be the first to post one.</Link></p>
          ) : (
              <div className="cards-grid">
                {featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
              </div>
          )}
        </section>

        {/* Bulletin Board Teaser */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Community Bulletin</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>Stay updated with campus events, announcements, and offers</p>
            </div>
            <Link to="/bulletin" style={{ color: '#60a5fa', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              View Bulletin Board <ArrowRight size={18} />
            </Link>
          </div>

          {!loading && !loadError && bulletinPosts.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>No announcements right now.</p>
          ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '1.5rem' }}>
                {bulletinPosts.map((post) => (
                    <BulletinCard key={post.id} post={post} />
                ))}
              </div>
          )}
        </section>
      </div>
  );
};

export default Home;