import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Leaf, X, ArrowLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productApi, getErrorMessage } from '../services/api';

// Values must match the backend Category enum.
const CATEGORIES = ['ALL', 'TEXTBOOKS', 'ELECTRONICS', 'SERVICES', 'HOUSING', 'ECO_FRIENDLY', 'CLOTHING', 'OTHER'];

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [ecoFilter, setEcoFilter] = useState(false);

  // One effect owns all fetching, so search and category can be combined instead of
  // one silently overwriting the other.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setLoadError('');
      try {
        let res;
        if (activeQuery) {
          res = await productApi.search(activeQuery);
        } else if (selectedCategory !== 'ALL') {
          res = await productApi.getByCategory(selectedCategory);
        } else {
          res = await productApi.getAll();
        }
        if (!cancelled && res.data.success) setProducts(res.data.data);
      } catch (err) {
        if (!cancelled) setLoadError(getErrorMessage(err, 'Failed to load marketplace listings.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    // Ignore responses from outdated requests (fast typing / quick category clicks).
    return () => {
      cancelled = true;
    };
  }, [selectedCategory, activeQuery, reloadKey]);

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveQuery(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput('');
    setActiveQuery('');
  };

  // The search endpoint has no category parameter, so narrow search results on the client.
  const visibleProducts = products.filter((p) => {
    if (ecoFilter && !p.ecoFriendly) return false;
    if (activeQuery && selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    return true;
  });

  return (
      <div style={{ paddingTop: '2rem' }}>
        <Link to="/" style={{ color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back to Home
        </Link>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>CPUT Marketplace</h1>
          <p className="text-muted">Browse textbook exchanges, electronics, services, and local vendor offers.</p>
        </div>

        {/* Search & Filters Controls */}
        <div style={{ background: 'var(--color-surface)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }} role="search">
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={20} color="var(--color-text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: '2.8rem', paddingRight: searchInput ? '2.8rem' : undefined }}
                  placeholder="Search textbooks, laptops, tutoring services..."
                  aria-label="Search listings"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                  <button
                      type="button"
                      onClick={clearSearch}
                      aria-label="Clear search"
                      className="text-muted"
                      style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', display: 'inline-flex' }}
                  >
                    <X size={18} />
                  </button>
              )}
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => (
                  <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      aria-pressed={selectedCategory === cat}
                      className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.825rem' }}
                  >
                    {cat.replace(/_/g, ' ')}
                  </button>
              ))}
            </div>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              <input
                  type="checkbox"
                  checked={ecoFilter}
                  onChange={(e) => setEcoFilter(e.target.checked)}
                  style={{ accentColor: 'var(--color-primary)' }}
              />
              <Leaf size={16} /> Eco-Friendly Only
            </label>
          </div>

          {activeQuery && (
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                Showing results for <strong style={{ color: 'var(--color-text-main)' }}>"{activeQuery}"</strong>
                {selectedCategory !== 'ALL' && <> in {selectedCategory.replace(/_/g, ' ')}</>}.
              </p>
          )}
        </div>

        {/* Product List */}
        {loading ? (
            <p className="text-muted">Loading marketplace listings...</p>
        ) : loadError ? (
            <div className="state-message" role="alert">
              <p className="state-error" style={{ marginBottom: '1rem' }}>{loadError}</p>
              <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="btn btn-secondary">
                Try again
              </button>
            </div>
        ) : visibleProducts.length === 0 ? (
            <div className="state-message" style={{ padding: '4rem 1rem' }}>
              <p style={{ fontSize: '1.1rem' }}>No products found matching your filters.</p>
            </div>
        ) : (
            <div className="cards-grid">
              {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
              ))}
            </div>
        )}
      </div>
  );
};

export default Marketplace;