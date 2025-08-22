"use client";
import React, { Dispatch, SetStateAction } from 'react';

type Props = {
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  filter: string;
  setFilter: (s: string) => void;
  features: any[];
  selectedFeature: any;
  setSelectedFeature: (f: any) => void;
  area: number | null;
  perimeter: number | null;
  population: number | null;
};

export default function Sidebar({ sidebarOpen, setSidebarOpen, filter, setFilter, features, selectedFeature, setSelectedFeature, area, perimeter, population }: Props) {
  return (
    <div
      style={{
        width: sidebarOpen ? 320 : 0,
        transition: 'width 0.3s',
        background: 'linear-gradient(180deg,#071026 0%, #081827 100%)',
        overflow: 'hidden',
        boxShadow: sidebarOpen ? '6px 0 30px rgba(2,6,23,0.6), inset -1px 0 0 rgba(255,255,255,0.02)' : 'none',
  position: 'relative',
  borderRight: '1px solid rgba(255,255,255,0.04)',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minHeight: 0,
        zIndex: 20,
      }}
    >
    <button
        onClick={() => setSidebarOpen(open => !open)}
        style={{
          position: 'absolute',
          right: -48,
          top: 24,
          zIndex: 30,
      background: '#0ea5a0',
          color: 'white',
          border: 'none',
          borderRadius: '0 8px 8px 0',
          width: 44,
          height: 44,
          cursor: 'pointer',
      boxShadow: '0 6px 24px rgba(2,6,23,0.6)',
          fontSize: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
      >
        <span style={{ fontSize: 28 }}>{sidebarOpen ? '\u2715' : '\u2630'}</span>
      </button>
  <div style={{ padding: sidebarOpen ? 24 : 0, display: sidebarOpen ? 'block' : 'none', transition: 'padding 0.3s', height: '100%', overflowY: 'auto', minHeight: 0 }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: '#e6eef8', letterSpacing: 1 }}>Division Info</h2>
  {/* Map tools removed from sidebar per request */}
    <input
          type="text"
          placeholder="Filter division (ADM3_EN / DS / GN)..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
      width: '100%',
      padding: '10px 12px',
      borderRadius: 8,
      border: '1px solid rgba(255,255,255,0.06)',
      marginBottom: 16,
      fontSize: 15,
      outline: 'none',
      boxSizing: 'border-box',
      background: 'transparent',
      color: '#edf2f7',
          }}
        />
        {(() => {
          const q = filter.trim().toLowerCase();
          // Filter features by query and remove features with missing/unknown names
          const filtered = features.filter(f => {
            const adm3Raw = f.get('ADM3_EN') || f.get('gn_name') || '';
            const adm3 = adm3Raw.toString().trim();
            const gn = (f.get('gn_name') || '').toString().trim();
            const ds = (f.get('ds_name') || '').toString().trim();
            if (!adm3 || adm3.toLowerCase() === 'unknown' || adm3.toLowerCase() === 'undefined') return false;
            const hay = (adm3 + ' ' + gn + ' ' + ds).toLowerCase();
            return hay.includes(q);
          });
          // dedupe by ADM3/gn label
          const seen = new Set<string>();
          const deduped = filtered.filter(f => {
            const label = (f.get('ADM3_EN') || f.get('gn_name') || '').toString().trim();
            if (!label) return false;
            if (seen.has(label)) return false;
            seen.add(label);
            return true;
          });
          return (
            <select
              value={selectedFeature ? selectedFeature.get('ADM3_EN') : ''}
              onChange={e => {
                const f = features.find(f => f.get('ADM3_EN') === e.target.value) || null;
                // call the provided handler (may be map's handleSelectFeature)
                setSelectedFeature(f);
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.06)',
                marginBottom: 24,
                fontSize: 15,
                background: 'transparent',
                color: '#edf2f7',
                outline: 'none',
              }}
            >
              <option value="">Select Division (ADM3_EN)</option>
              {deduped.map((f, i) => {
                const adm3 = f.get('ADM3_EN') || f.get('gn_name') || '';
                const suffix = f.get('ds_name') || f.get('gn_name') || '';
                return (
                  <option key={i} value={adm3}>
                    {adm3} - {suffix}
                  </option>
                );
              })}
            </select>
          );
        })()}
        
          {/* Attribute cards for the selected feature */}
          {selectedFeature && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 80 }}>
              <div style={{ background: 'linear-gradient(90deg,#071026,#0b1220)', borderRadius: 12, padding: '12px 14px', boxShadow: '0 6px 20px rgba(2,6,23,0.6)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 700 }}>ADM3_EN</div>
                <div style={{ fontSize: 15, color: '#edf2f7' }}>{selectedFeature.get('ADM3_EN') || selectedFeature.get('gn_name')}</div>
              </div>
              <div style={{ background: 'linear-gradient(90deg,#071026,#071026)', borderRadius: 12, padding: '12px 14px', boxShadow: '0 6px 20px rgba(2,6,23,0.6)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 700 }}>ADM2_EN / DS</div>
                <div style={{ fontSize: 15, color: '#edf2f7' }}>{selectedFeature.get('ADM2_EN') || selectedFeature.get('ds_name')}</div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, background: 'linear-gradient(90deg,#071026,#071026)', borderRadius: 12, padding: '12px', boxShadow: '0 6px 20px rgba(2,6,23,0.6)', border: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ fontSize: 12, color: '#fbbf24', fontWeight: 700 }}>Area (sqkm)</div>
            <div style={{ fontSize: 16, color: '#fff5d6' }}>{area ? `${(area/1000000).toFixed(3)} sqkm`.replace('00','2') : '—'}</div>
                </div>
                <div style={{ flex: 1, background: 'linear-gradient(90deg,#071026,#071026)', borderRadius: 12, padding: '12px', boxShadow: '0 6px 20px rgba(2,6,23,0.6)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ fontSize: 12, color: '#60a5fa', fontWeight: 700 }}>Perimeter</div>
                  <div style={{ fontSize: 16, color: '#e6eef8' }}>{perimeter ? `${(perimeter).toFixed(2)} m` : ''}</div>
                </div>
              </div>
              <div style={{ position: 'sticky', bottom: 16, background: 'linear-gradient(90deg,#073246,#05323a)', borderRadius: 12, padding: '12px 14px', boxShadow: '0 10px 30px rgba(2,6,23,0.7)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#86efac', fontWeight: 700 }}>Population (est)</div>
                  <div style={{ fontSize: 18, color: '#f0fff4' }}>{population ? population.toLocaleString() : ''}</div>
                </div>
                <button style={{ background: '#0ea5a0', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }} onClick={() => setSelectedFeature(null)}>Clear</button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
