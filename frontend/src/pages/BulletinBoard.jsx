import React from 'react';
import { Calendar, User, Tag, ShieldCheck, Megaphone } from 'lucide-react';

const getPostTypeColor = (type) => {
  switch (type) {
    case 'EVENT': return '#10b981';
    case 'ANNOUNCEMENT': return '#3b82f6';
    case 'SERVICE_OFFER': return '#8b5cf6';
    case 'FUNDRAISER': return '#f59e0b';
    default: return '#64748b';
  }
};

// Returns null for missing or unparseable dates so the UI never shows "Invalid Date".
const formatDate = (value, withTime = false) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return withTime ? date.toLocaleString() : date.toLocaleDateString();
};

const BulletinCard = ({ post }) => {
  const color = getPostTypeColor(post.postType);
  const postedOn = formatDate(post.createdAt);
  const eventOn = formatDate(post.eventDate, true);
  const tags = post.tags
      ? post.tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 3)
      : [];

  return (
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <span
            style={{
              background: `${color}20`,
              color,
              border: `1px solid ${color}50`,
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
        >
          <Megaphone size={12} /> {post.postType?.replace(/_/g, ' ')}
        </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          {postedOn || 'Recent'}
        </span>
        </div>

        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.65rem', color: 'white' }}>
          {post.title}
        </h3>

        <p style={{ color: '#cbd5e1', fontSize: '0.925rem', marginBottom: '1.25rem', flex: 1, whiteSpace: 'pre-line' }}>
          {post.content}
        </p>

        {eventOn && (
            <div style={{ background: 'var(--color-bg)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa', fontSize: '0.85rem' }}>
              <Calendar size={16} />
              <span>Event Date: <strong>{eventOn}</strong></span>
            </div>
        )}

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <User size={14} />
            <span>Posted by: <strong style={{ color: '#f8fafc' }}>{post.author?.fullName || 'Unknown'}</strong></span>
            {post.author?.verified && <ShieldCheck size={14} color="#10b981" aria-label="Verified user" />}
          </div>
          {tags.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', flexWrap: 'wrap' }}>
                <Tag size={12} />
                {tags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                ))}
              </div>
          )}
        </div>
      </div>
  );
};

export default BulletinCard;