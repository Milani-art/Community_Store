import React from 'react';
import { Calendar, User, Tag, ShieldCheck, Megaphone, Ban, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userApi, bulletinApi, getErrorMessage } from '../services/api';

const BulletinCard = ({ post }) => {
  const { user } = useAuth();
  const isAdmin = user && user.role === 'ADMIN';

  const postedDate = post.createdAt ? new Date(post.createdAt) : null;
  const eventDate = post.eventDate ? new Date(post.eventDate) : null;
  const hasEventDate = eventDate && !Number.isNaN(eventDate.getTime());

  const getPostTypeClass = (type) => {
    switch (type) {
      case 'EVENT': return 'bulletin-event';
      case 'ANNOUNCEMENT': return 'bulletin-announcement';
      case 'SERVICE_OFFER': return 'bulletin-service';
      case 'FUNDRAISER': return 'bulletin-fundraiser';
      default: return 'bulletin-default';
    }
  };

  const handleBan = async () => {
    if (!post.author || !window.confirm(`Are you sure you want to ban ${post.author.fullName}?`)) return;
    try {
      const res = await userApi.banUser(post.author.id);
      if (res.data.success) {
        alert(`${post.author.fullName} has been banned successfully.`);
        window.location.reload();
      }
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to ban user.'));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete this bulletin post?`)) return;
    try {
      const res = await bulletinApi.delete(post.id);
      if (res.data.success) {
        alert('Post deleted successfully.');
        window.location.reload();
      }
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete post.'));
    }
  };

  return (
    <div className="glass-card bulletin-card">
      <div className="bulletin-card-meta">
        <span className={`bulletin-type ${getPostTypeClass(post.postType)}`}>
          <Megaphone size={12} /> {post.postType}
        </span>
        <span className="bulletin-date">
          {postedDate && !Number.isNaN(postedDate.getTime()) ? postedDate.toLocaleDateString() : 'Recent'}
        </span>
      </div>

      <h3 className="bulletin-title">{post.title}</h3>

      <p className="bulletin-content">{post.content}</p>

      {hasEventDate && (
        <div className="bulletin-event-date">
          <Calendar size={16} />
          <span>Event Date: <strong>{eventDate.toLocaleString()}</strong></span>
        </div>
      )}

      <div className="bulletin-card-footer" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="bulletin-author">
            <User size={14} />
            <span>Posted by: <strong>{post.author?.fullName || 'Community member'}</strong></span>
            {post.author?.verified && <ShieldCheck size={14} color="var(--color-accent)" aria-label="Verified user" />}
          </div>
          {post.tags && (
            <div className="bulletin-tag">
              <Tag size={12} /> #{post.tags.split(',')[0]}
            </div>
          )}
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={handleBan}
              className="btn"
              style={{ background: 'var(--color-warning)', color: 'white', padding: '0.4rem 0.6rem', flex: 1, fontSize: '0.8rem' }}
              title="Ban Author"
            >
              <Ban size={14} /> Ban Author
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="btn"
              style={{ background: 'var(--color-danger)', color: 'white', padding: '0.4rem 0.6rem', flex: 1, fontSize: '0.8rem' }}
              title="Delete Post"
            >
              <Trash2 size={14} /> Delete Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulletinCard;
