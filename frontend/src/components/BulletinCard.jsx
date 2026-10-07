import React from 'react';
import { Calendar, User, Tag, ShieldCheck, Megaphone } from 'lucide-react';

const BulletinCard = ({ post }) => {
  const getPostTypeClass = (type) => {
    switch (type) {
      case 'EVENT': return 'bulletin-event';
      case 'ANNOUNCEMENT': return 'bulletin-announcement';
      case 'SERVICE_OFFER': return 'bulletin-service';
      case 'FUNDRAISER': return 'bulletin-fundraiser';
      default: return 'bulletin-default';
    }
  };

  return (
    <div className="glass-card bulletin-card">
      <div className="bulletin-card-meta">
        <span className={`bulletin-type ${getPostTypeClass(post.postType)}`}>
          <Megaphone size={12} /> {post.postType}
        </span>
        <span className="bulletin-date">
          {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recent'}
        </span>
      </div>

      <h3 className="bulletin-title">{post.title}</h3>

      <p className="bulletin-content">{post.content}</p>

      {post.eventDate && (
        <div className="bulletin-event-date">
          <Calendar size={16} />
          <span>Event Date: <strong>{new Date(post.eventDate).toLocaleString()}</strong></span>
        </div>
      )}

      <div className="bulletin-card-footer">
        <div className="bulletin-author">
          <User size={14} />
          <span>Posted by: <strong>{post.author.fullName}</strong></span>
          {post.author.verified && <ShieldCheck size={14} color="var(--color-accent)" />}
        </div>
        {post.tags && (
          <div className="bulletin-tag">
            <Tag size={12} /> #{post.tags.split(',')[0]}
          </div>
        )}
      </div>
    </div>
  );
};

export default BulletinCard;
