import React from 'react';
import { Store, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
        <div>
          <div className="brand-logo footer-brand">
            <Store size={24} />
            <span>CommunityStore</span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Connecting campus students, faculty, local vendors, and residents in a trusted, sustainable marketplace ecosystem.
          </p>
        </div>

        <div>
          <h4>Marketplace</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            <li>Textbooks & Study Material</li>
            <li>Electronics & Laptops</li>
            <li>Eco-Friendly Products</li>
            <li>Tutoring & Local Services</li>
          </ul>
        </div>

        <div>
          <h4>Trust & Safety</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} color="var(--color-accent)" /> Verified Student Accounts
            </li>
            <li>Vendor Business Verification</li>
            <li>Secure SnapScan & PayFast</li>
            <li>Escrow Protection</li>
          </ul>
        </div>

        <div>
          <h4>Academic Project</h4>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            PRM370/371/372S 2026 Specification Project.<br />
            Built with Spring Boot 3 & React.
          </p>
        </div>
      </div>

      <div className="container footer-legal">
        © 2026 CommunityStore. Designed for Campus Sustainability.
      </div>
    </footer>
  );
};

export default Footer;
