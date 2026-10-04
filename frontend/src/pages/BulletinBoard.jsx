import React, { useEffect, useState } from 'react';
import { Megaphone, Plus } from 'lucide-react';
import BulletinCard from '../components/BulletinCard';
import { bulletinApi, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const INITIAL_FORM = { title: '', content: '', postType: 'ANNOUNCEMENT', tags: '', eventDate: '' };

const BulletinBoard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const { user } = useAuth();
  const toast = useToast();

  const fetchPosts = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await bulletinApi.getAll();
      if (res.data.success) setPosts(res.data.data);
    } catch (err) {
      setLoadError(getErrorMessage(err, 'Failed to load bulletin posts.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Close the modal with Escape.
  useEffect(() => {
    if (!showCreateModal) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !submitting) setShowCreateModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showCreateModal, submitting]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await bulletinApi.create({
        ...formData,
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: formData.tags.trim(),
        // Backend uses LocalDateTime.parse, which accepts the "YYYY-MM-DDTHH:mm" value from datetime-local.
        eventDate: formData.postType === 'EVENT' ? formData.eventDate : '',
      });
      if (res.data.success) {
        toast.success('Your post is now live on the bulletin board.');
        setShowCreateModal(false);
        setFormData(INITIAL_FORM);
        fetchPosts();
      } else {
        toast.error(res.data.message || 'Could not publish the post.');
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create post.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div style={{ paddingTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Megaphone color="#3b82f6" /> Community Bulletin Board
            </h1>
            <p className="text-muted">Campus announcements, club fundraisers, skill-share services, and events.</p>
          </div>

          {user ? (
              <button type="button" onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                <Plus size={18} /> Post Announcement
              </button>
          ) : (
              <span className="text-muted" style={{ fontSize: '0.9rem' }}>Sign in to post an announcement.</span>
          )}
        </div>

        {loading ? (
            <p className="text-muted">Loading bulletin posts...</p>
        ) : loadError ? (
            <div className="state-message" role="alert">
              <p className="state-error" style={{ marginBottom: '1rem' }}>{loadError}</p>
              <button type="button" onClick={fetchPosts} className="btn btn-secondary">Try again</button>
            </div>
        ) : posts.length === 0 ? (
            <div className="state-message" style={{ padding: '4rem 1rem' }}>
              <p>No bulletin announcements found.</p>
            </div>
        ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '1.5rem' }}>
              {posts.map((post) => (
                  <BulletinCard key={post.id} post={post} />
              ))}
            </div>
        )}

        {/* Create Announcement Modal */}
        {showCreateModal && (
            <div
                className="modal-overlay"
                onMouseDown={(e) => {
                  if (e.target === e.currentTarget && !submitting) setShowCreateModal(false);
                }}
            >
              <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="bulletin-modal-title">
                <h2 id="bulletin-modal-title" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>New Bulletin Post</h2>
                <form onSubmit={handleCreatePost}>
                  <div className="form-group">
                    <label htmlFor="post-title">Post Title</label>
                    <input
                        id="post-title"
                        type="text"
                        required
                        autoFocus
                        className="input-field"
                        placeholder="e.g. Textbook Swap Meet this Friday"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="post-type">Type</label>
                    <select
                        id="post-type"
                        className="input-field"
                        value={formData.postType}
                        onChange={(e) => setFormData({ ...formData, postType: e.target.value })}
                    >
                      <option value="ANNOUNCEMENT">General Announcement</option>
                      <option value="EVENT">Campus Event</option>
                      <option value="SERVICE_OFFER">Service Offer / Tutoring</option>
                      <option value="FUNDRAISER">Club Fundraiser</option>
                    </select>
                  </div>

                  {formData.postType === 'EVENT' && (
                      <div className="form-group">
                        <label htmlFor="post-event-date">Event Date & Time</label>
                        <input
                            id="post-event-date"
                            type="datetime-local"
                            required
                            className="input-field"
                            value={formData.eventDate}
                            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        />
                      </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="post-content">Content Details</label>
                    <textarea
                        id="post-content"
                        required
                        rows={4}
                        className="input-field"
                        placeholder="Describe your event or announcement..."
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="post-tags">Tags (comma separated)</label>
                    <input
                        id="post-tags"
                        type="text"
                        className="input-field"
                        placeholder="e.g. Events,Textbooks,Tutoring"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button type="button" onClick={() => setShowCreateModal(false)} disabled={submitting} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="btn btn-primary">
                      {submitting ? 'Publishing...' : 'Publish Post'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
};

export default BulletinBoard;