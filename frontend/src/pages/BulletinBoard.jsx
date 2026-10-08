import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Megaphone, Plus, X, ArrowLeft } from 'lucide-react';
import BulletinCard from '../components/BulletinCard';
import { useAuth } from '../context/AuthContext';
import { bulletinApi, getErrorMessage } from '../services/api';

const POST_TYPES = [
  { value: 'ALL', label: 'Everything' },
  { value: 'ANNOUNCEMENT', label: 'Announcements' },
  { value: 'EVENT', label: 'Events' },
  { value: 'SERVICE_OFFER', label: 'Services' },
  { value: 'FUNDRAISER', label: 'Fundraisers' },
];

const EMPTY_FORM = { title: '', postType: 'ANNOUNCEMENT', content: '', eventDate: '', tags: '' };

const BulletinBoard = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [activeType, setActiveType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    let current = true;

    const loadPosts = async () => {
      try {
        const response = await bulletinApi.getAll();
        if (current && response.data.success) setPosts(response.data.data || []);
      } catch (error) {
        if (current) setLoadError(getErrorMessage(error, 'Could not load community posts.'));
      } finally {
        if (current) setLoading(false);
      }
    };

    loadPosts();
    return () => { current = false; };
  }, []);

  const visiblePosts = posts
    .filter((post) => activeType === 'ALL' || post.postType === activeType)
    .sort((first, second) => (Date.parse(second.createdAt) || 0) - (Date.parse(first.createdAt) || 0));

  const postCounts = POST_TYPES.reduce((counts, type) => {
    counts[type.value] = type.value === 'ALL'
      ? posts.length
      : posts.filter((post) => post.postType === type.value).length;
    return counts;
  }, {});

  const updateField = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    setNotice('');

    try {
      const response = await bulletinApi.create({
        ...formData,
        eventDate: formData.eventDate || null,
        tags: formData.tags.trim(),
      });
      if (!response.data.success) throw new Error(response.data.message || 'Could not publish your post.');

      setPosts((current) => [response.data.data, ...current]);
      setActiveType('ALL');
      setFormData(EMPTY_FORM);
      setShowComposer(false);
      setNotice('Your post is now on the community bulletin.');
    } catch (error) {
      setFormError(getErrorMessage(error, error.message || 'Could not publish your post.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bulletin-page">
      <Link to="/" style={{ color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontWeight: 600 }}>
        <ArrowLeft size={18} /> Back to Home
      </Link>
      <header className="bulletin-heading">
        <div>
          <span className="eyebrow"><Megaphone size={14} /> The neighbourhood noticeboard</span>
          <h1>Community bulletin</h1>
          <p>Good things happening around CPUT campuses and the people who call it home.</p>
        </div>
        {user && (
          <button
            type="button"
            className="btn btn-primary bulletin-compose-trigger"
            onClick={() => { setShowComposer((visible) => !visible); setFormError(''); }}
            aria-expanded={showComposer}
          >
            {showComposer ? <X size={17} /> : <Plus size={17} />}
            {showComposer ? 'Close form' : 'Share an update'}
          </button>
        )}
      </header>

      {!user && (
        <p className="bulletin-sign-in-note">Have something to share? Sign in to post an update.</p>
      )}

      {notice && <p className="bulletin-notice" role="status">{notice}</p>}

      {showComposer && user && (
        <form className="bulletin-composer" onSubmit={handleSubmit}>
          <div className="bulletin-composer-heading">
            <div>
              <h2>Share with the community</h2>
              <p>Your post will be visible to everyone on the bulletin.</p>
            </div>
          </div>
          {formError && <p className="bulletin-form-error" role="alert">{formError}</p>}
          <div className="bulletin-form-grid">
            <div className="form-group">
              <label htmlFor="bulletin-title">Title</label>
              <input id="bulletin-title" className="input-field" value={formData.title} onChange={updateField('title')} maxLength={255} required placeholder="Give your post a clear title" />
            </div>
            <div className="form-group">
              <label htmlFor="bulletin-type">Post type</label>
              <select id="bulletin-type" className="input-field" value={formData.postType} onChange={updateField('postType')}>
                {POST_TYPES.filter((type) => type.value !== 'ALL').map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group bulletin-form-wide">
              <label htmlFor="bulletin-content">Details</label>
              <textarea id="bulletin-content" className="input-field" value={formData.content} onChange={updateField('content')} maxLength={3000} rows={4} required placeholder="What should neighbours know?" />
            </div>
            <div className="form-group">
              <label htmlFor="bulletin-event-date">Date and time <span>(optional)</span></label>
              <input id="bulletin-event-date" className="input-field" type="datetime-local" value={formData.eventDate} onChange={updateField('eventDate')} />
            </div>
            <div className="form-group">
              <label htmlFor="bulletin-tags">Tags <span>(optional)</span></label>
              <input id="bulletin-tags" className="input-field" value={formData.tags} onChange={updateField('tags')} maxLength={255} placeholder="e.g. music, cput, volunteering" />
            </div>
          </div>
          <div className="bulletin-composer-actions">
            <button type="button" className="btn btn-secondary" onClick={() => { setShowComposer(false); setFormError(''); }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Publishing...' : 'Publish update'}</button>
          </div>
        </form>
      )}

      <div className="bulletin-feed-header">
        <div>
          <h2>What’s happening</h2>
          <p>{posts.length} {posts.length === 1 ? 'community post' : 'community posts'}</p>
        </div>
        <CalendarDays size={21} aria-hidden="true" />
      </div>

      <div className="bulletin-filters" role="group" aria-label="Filter bulletin posts">
        {POST_TYPES.map((type) => (
          <button
            type="button"
            key={type.value}
            className={`bulletin-filter${activeType === type.value ? ' active' : ''}`}
            onClick={() => setActiveType(type.value)}
            aria-pressed={activeType === type.value}
          >
            {type.label}<span>{postCounts[type.value]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bulletin-state" role="status">Gathering the latest community posts...</div>
      ) : loadError ? (
        <div className="bulletin-state bulletin-state-error" role="alert">{loadError}</div>
      ) : visiblePosts.length === 0 ? (
        <div className="bulletin-state">
          <Megaphone size={26} strokeWidth={1.5} />
          <h3>{posts.length ? 'Nothing in this category yet' : 'A quiet board, for now'}</h3>
          <p>{posts.length ? 'Choose another filter to see more from the community.' : 'When neighbours share an update, it will appear here.'}</p>
        </div>
      ) : (
        <div className="bulletin-feed">
          {visiblePosts.map((post) => <BulletinCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  );
};

export default BulletinBoard;