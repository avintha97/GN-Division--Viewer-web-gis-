'use client';
import dynamic from 'next/dynamic';
import Navbar from './components/Navbar';

const OpenLayersMap = dynamic(() => import('./components/OpenLayersMap'), { ssr: false });

export default function LoadingPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#071026', color: '#ffffff' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, gap: 12, minHeight: 0 }}>
        <div style={{ flex: 1, display: 'flex', minHeight: 0, boxShadow: '0 12px 48px rgba(2,6,23,0.7)', borderRadius: 12, overflow: 'hidden', background: '#071026', border: '1px solid rgba(255,255,255,0.02)' }}>
          <OpenLayersMap />
        </div>
      </div>
    </div>
  );
}