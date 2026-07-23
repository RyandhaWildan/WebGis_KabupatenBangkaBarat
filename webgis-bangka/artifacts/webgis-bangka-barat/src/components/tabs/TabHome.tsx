import React from 'react';

interface TabHomeProps {
  onExplore: () => void;
}

const stats = [
  { label: 'Net Perubahan', value: '−6.270 Ha', sub: 'Vegetasi berkurang', color: '#f87171' },
  { label: 'Loss Vegetasi', value: '18.420 Ha', sub: 'Hilang 2024→2025',  color: '#fbbf24' },
  { label: 'Gain Vegetasi', value: '12.150 Ha', sub: 'Tumbuh 2024→2025',  color: '#34d399' },
  { label: 'Akurasi Model', value: '92.4%',     sub: 'Overall Accuracy RF', color: '#60a5fa' },
];

const steps = [
  'Unduh & filter Citra Sentinel-2 SR Harmonized via Google Earth Engine',
  'Cloud masking threshold <20% menggunakan QA60 band',
  'Komposit median periode Juni–September 2024 dan 2025',
  'Ekstraksi indeks spektral: NDVI & NDMI sebagai Feature Stack',
  'Klasifikasi Random Forest — 100 pohon, 75 titik/kelas (stratified)',
  'Change Detection: overlay hasil klasifikasi 2024 vs 2025',
];

export function TabHome({ onExplore }: TabHomeProps) {
  return (
    <div style={{ width: '100%', height: '100%', overflowY: 'auto', background: '#0d1628' }}>

      {/* ── Hero ── */}
      <div style={{ position: 'relative', minHeight: '62vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '64px 32px 48px', overflow: 'hidden' }}>
        {/* glow bg */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)' }} />
        </div>

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#34d399', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', padding: '6px 16px', borderRadius: 20 }}>
          🛰️ UAS Maha Data 2025/2026 · Sentinel-2 × Random Forest
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 12, maxWidth: 800, color: '#f8fafc' }}>
          Analisis Perubahan Vegetasi<br />
          <span style={{ color: '#34d399' }}>Kabupaten Bangka Barat</span>
        </h1>
        <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 6, maxWidth: 600 }}>
          Menggunakan Algoritma <strong style={{ color: '#34d399' }}>Random Forest</strong> dan Citra{' '}
          <strong style={{ color: '#60a5fa' }}>Sentinel-2 SR Harmonized</strong>
        </p>
        <p style={{ fontSize: 12, color: '#475569', marginBottom: 36 }}>
          Komposit Juni–September 2024 &amp; 2025 · Cloud Threshold &lt;20% · Resolusi 10 meter
        </p>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 36, maxWidth: 720, width: '100%' }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: '#111f3a', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 14, padding: '16px 12px', textAlign: 'center', transition: 'transform 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: '#475569' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button onClick={onExplore}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', boxShadow: '0 8px 24px rgba(16,185,129,0.25)', transition: 'all 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(16,185,129,0.35)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(16,185,129,0.25)'; }}>
          🗺️ Mulai Eksplorasi Peta <span style={{ fontSize: 18 }}>→</span>
        </button>
      </div>

      {/* ── Info cards ── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 32px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Latar belakang */}
        <div style={{ background: '#111f3a', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 18, padding: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#34d399', marginBottom: 12 }}>📌 Latar Belakang</div>
          <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
            Kabupaten Bangka Barat merupakan salah satu wilayah dengan aktivitas pertambangan timah yang intensif di Provinsi Kepulauan Bangka Belitung.
            Aktivitas ini berdampak signifikan terhadap tutupan vegetasi dan perubahan penggunaan lahan. Pemantauan menggunakan citra satelit Sentinel-2
            menjadi pendekatan yang efisien untuk evaluasi kondisi lingkungan secara berkala dan akurat.
          </p>
        </div>

        {/* Metodologi */}
        <div style={{ background: '#111f3a', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 18, padding: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#60a5fa', marginBottom: 12 }}>⚙️ Alur Metodologi</div>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {steps.map((step, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, fontSize: 12, color: '#94a3b8', alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', color: '#34d399', fontWeight: 700, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
