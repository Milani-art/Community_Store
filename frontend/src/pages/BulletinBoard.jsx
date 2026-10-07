import React from 'react';
import { Calendar, User, Tag, ShieldCheck, Megaphone } from 'lucide-react';

const getPostTypeClass = (type) => {
  switch (type) {
    case 'EVENT': return 'bulletin-event';
    case 'ANNOUNCEMENT': return 'bulletin-announcement';
    case 'SERVICE_OFFER': return 'bulletin-service';
    case 'FUNDRAISER': return 'bulletin-fundraiser';
    default: return 'bulletin-default';
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
  const typeClass = getPostTypeClass(post.postType);
  const postedOn = formatDate(post.createdAt);
  const eventOn = formatDate(post.eventDate, true);
  const tags = post.tags
      ? post.tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 3)
      : [];

  return (
      <div className="glass-card bulletin-card">
        <div className="bulletin-card-meta">
        <span className={`bulletin-type ${typeClass}`}>
          <Megaphone size={12} /> {post.postType?.replace(/_/g, ' ')}
        </span>
          <span className="bulletin-date">{postedOn || 'Recent'}</span>
        </div>

        <h3 className="bulletin-title">{post.title}</h3>

        <p className="bulletin-content">{post.content}</p>

        {eventOn && (
            <div className="bulletin-event-date">
              <Calendar size={16} />
              <span>Event Date: <strong>{eventOn}</strong></span>
            </div>
        )}

        <div className="bulletin-card-footer">
          <div className="bulletin-author">
            <User size={14} />
            <span>Posted by: <strong>{post.author?.fullName || 'Unknown'}</strong></span>
            {post.author?.verified && <ShieldCheck size={14} color="var(--color-accent)" aria-label="Verified user" />}
          </div>
          {tags.length > 0 && (
              <div className="bulletin-tag">
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