"use client";
import React from 'react';

export default function Navbar() {
  return (
    <nav style={{
      width: '100%',
      // subtle top-to-bottom gradient and a slight glossy highlight for depth
      background: 'linear-gradient(180deg,#0f2130 0%, #0b1220 100%)',
      color: '#e6eef8',
      padding: '0 1.5rem',
      height: 72,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 12px 40px rgba(2,6,23,0.75), inset 0 1px 0 rgba(255,255,255,0.02)',
      borderBottom: '1px solid rgba(255,255,255,0.02)',
      zIndex: 60,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#e6eef8' }}>GN Division Viewer</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Sri Lanka — GN Divisions</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <input placeholder="Search divisions..." style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #1f2937', background: '#0b1220', color: '#e6eef8' }} />
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ color: '#94a3b8' }}>AS</span>
        </div>
      </div>
    </nav>
  );
}
