import React, { useState, useRef } from 'react';
import { useMapLayers } from '../hooks/useMapLayers';
import { TabHome } from '../components/tabs/TabHome';
import { TabPeta } from '../components/tabs/TabPeta';
import { TabData } from '../components/tabs/TabData';
import { TabEvaluasi } from '../components/tabs/TabEvaluasi';
import { TabInsight } from '../components/tabs/TabInsight';
import { TabAbout } from '../components/tabs/TabAbout';
import { LoadingScreen } from '../components/LoadingScreen';
import type { MapContainerHandle } from '../components/MapContainer';

type TabId = 'home' | 'peta' | 'data' | 'evaluasi' | 'insight' | 'about';

const navItems: { id: TabId; label: string; emoji: string }[] = [
  { id: 'home',     label: 'Home',           emoji: '🏠' },
  { id: 'peta',     label: 'Peta Hasil',     emoji: '🗺️' },
  { id: 'data',     label: 'Data & Proses',  emoji: '📋' },
  { id: 'evaluasi', label: 'Evaluasi Model', emoji: '🎯' },
  { id: 'insight',  label: 'Insight Hasil',  emoji: '💡' },
  { id: 'about',    label: 'About',          emoji: 'ℹ️' },
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const layersState = useMapLayers();
  const mapRef = useRef<MapContainerHandle>(null);
  const [visitedTabs, setVisitedTabs] = useState<Record<TabId, boolean>>({
    home: true,
    peta: true,
    data: false,
    evaluasi: false,
    insight: false,
    about: false,
  });

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setVisitedTabs(prev => prev[tab] ? prev : { ...prev, [tab]: true });
    if (tab === 'peta') {
      requestAnimationFrame(() => {
        mapRef.current?.invalidateSize();
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', minHeight: '100vh', width: '100%', overflow: 'hidden', background: '#0d1628', color: '#e2e8f0' }}>

      {/* Responsive navbar styles */}
      <style>{`
        @media (max-width: 768px) {
          .nav-brand-text { display: none !important; }
          .nav-brand { margin-right: 8px !important; }
          .nav-tab-label { display: none !important; }
          .nav-tab-btn { padding: 6px 9px !important; gap: 0 !important; }
        }
        @media (max-width: 520px) {
          .nav-brand { display: none !important; }
        }
      `}</style>

      {/* ─── TOP NAVBAR ─── */}
      <nav style={{
        height: 56, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 16px',
        background: '#0b1526', borderBottom: '1px solid rgba(51,65,85,0.55)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)', zIndex: 100,
        overflowX: 'auto', overflowY: 'hidden',
        gap: 8,
      }}>
        {/* Brand */}
        <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 20, flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            flexShrink: 0,
          }}>🌿</div>
          <div className="nav-brand-text">
            <div style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9', lineHeight: 1.2 }}>
              Vegetation Change Analysis
            </div>
            <div style={{ fontSize: 10, color: '#64748b' }}>Kab. Bangka Barat · 2024–2025</div>
          </div>
        </div>

        {/* Tab buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                className="nav-tab-btn"
                onClick={() => handleTabChange(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.18s ease',
                  background: active ? 'rgba(16,185,129,0.14)' : 'transparent',
                  color: active ? '#34d399' : '#94a3b8',
                  border: active ? '1px solid rgba(16,185,129,0.35)' : '1px solid transparent',
                  outline: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = '#e2e8f0'; (e.currentTarget as HTMLElement).style.background = 'rgba(51,65,85,0.45)'; } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = '#94a3b8'; (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
              >
                <span style={{ fontSize: 14 }}>{item.emoji}</span>
                <span className="nav-tab-label">{item.label}</span>
                {active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399', display: 'inline-block', marginLeft: 2 }} />}
              </button>
            );
          })}
        </div>

      </nav>

      {/* ─── TAB CONTENT ─── */}
      {/* position:relative container — all tabs are absolute-positioned inside */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>

        {/* Home */}
        {visitedTabs.home && (
          <div style={{ position: 'absolute', inset: 0, display: activeTab === 'home' ? 'block' : 'none' }}>
            <TabHome onExplore={() => handleTabChange('peta')} />
          </div>
        )}

        {/* Peta — ALWAYS mounted & ALWAYS position:absolute inset:0 so Leaflet
            always has a real container with valid pixel dimensions.
            Hidden by opacity+pointerEvents+visibility — layout dimensions never change. */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', width: '100%', height: '100%',
          opacity:        activeTab === 'peta' ? 1 : 0,
          pointerEvents:  activeTab === 'peta' ? 'auto' : 'none',
          zIndex:         activeTab === 'peta' ? 1 : 0,
          visibility:     activeTab === 'peta' ? 'visible' : 'hidden',
        }}>
          <TabPeta layersState={layersState} mapRef={mapRef} />
        </div>

        {/* Data */}
        {visitedTabs.data && (
          <div style={{ position: 'absolute', inset: 0, display: activeTab === 'data' ? 'block' : 'none' }}>
            <TabData />
          </div>
        )}

        {/* Evaluasi */}
        {visitedTabs.evaluasi && (
          <div style={{ position: 'absolute', inset: 0, display: activeTab === 'evaluasi' ? 'block' : 'none' }}>
            <TabEvaluasi />
          </div>
        )}

        {/* Insight */}
        {visitedTabs.insight && (
          <div style={{ position: 'absolute', inset: 0, display: activeTab === 'insight' ? 'block' : 'none' }}>
            <TabInsight />
          </div>
        )}

        {/* About */}
        {visitedTabs.about && (
          <div style={{ position: 'absolute', inset: 0, display: activeTab === 'about' ? 'block' : 'none' }}>
            <TabAbout />
          </div>
        )}
      </div>

      {loading && <LoadingScreen onFinished={() => setLoading(false)} />}
    </div>
  );
}

