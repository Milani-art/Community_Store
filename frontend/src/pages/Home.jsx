import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Megaphone, ShieldCheck, ShoppingBag, Users } from 'lucide-react';
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
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="eyebrow">CPUT & community marketplace</span>
          <h1>Good things, <em>close to home.</em></h1>
          <p>Discover useful finds, local services, and the people who make our community feel like home.</p>
          <div className="home-hero-actions">
            <Link to="/marketplace" className="btn btn-primary"><ShoppingBag size={17} /> Explore the marketplace</Link>
            <Link to="/bulletin" className="btn btn-secondary"><Megaphone size={17} /> Community bulletin</Link>
          </div>
        </div>
        <aside className="home-hero-note">
          <strong>A little more local.</strong>
          <p>Buy, sell, and share with students, independent vendors, and neighbours in one trusted place.</p>
        </aside>
      </section>

      <section className="home-values" aria-label="Community values">
        <div className="home-value">
          <ShieldCheck size={22} />
          <div><h3>People you can trust</h3><p>Verified student and vendor accounts.</p></div>
        </div>
        <div className="home-value">
          <Leaf size={22} />
          <div><h3>Thoughtful by nature</h3><p>Give well-loved goods another life.</p></div>
        </div>
        <div className="home-value">
          <Users size={22} />
          <div><h3>Rooted in community</h3><p>Local events, services, and good finds.</p></div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <div>
            <h2>Find something good</h2>
            <p>Fresh from students and local sellers</p>
          </div>
          <Link to="/marketplace" className="home-section-link">Browse all <ArrowRight size={16} /></Link>
        </div>

        {loading ? (
          <p className="text-muted">Loading marketplace...</p>
        ) : loadError ? (
          <p role="alert" className="state-error">{loadError}</p>
        ) : featuredProducts.length === 0 ? (
          <p className="text-muted">No listings yet. <Link to="/sell" className="home-section-link">Be the first to post one.</Link></p>
        ) : (
          <div className="cards-grid">
            {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <div>
            <h2>Around the community</h2>
            <p>Events, announcements, and offers worth knowing</p>
          </div>
          <Link to="/bulletin" className="home-section-link">Visit bulletin <ArrowRight size={16} /></Link>
        </div>

        {!loading && !loadError && bulletinPosts.length === 0 ? (
          <p className="text-muted">No announcements right now.</p>
        ) : (
          <div className="bulletin-grid">
            {bulletinPosts.map((post) => <BulletinCard key={post.id} post={post} />)}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;