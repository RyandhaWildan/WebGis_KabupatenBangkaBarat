import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Sector
} from 'recharts';

// ─── DATA ────────────────────────────────────────────────────────────────────

const vegetasiData = [
  { tahun: '2024', Vegetasi: 201670, NonVegetasi: 84560 },
  { tahun: '2025', Vegetasi: 195400, NonVegetasi: 90830 },
];

const donutData = [
  { name: 'Vegetasi', value: 68.3 },
  { name: 'Non-Vegetasi', value: 31.7 },
];
const DONUT_COLORS = ['#34d399', '#f87171'];

const bands = [
  { id: 'B2',   label: 'B2',   name: 'Blue',            category: 'spectral', color: '#60a5fa', bg: 'rgba(96,165,250,0.15)',  border: 'rgba(96,165,250,0.4)',  desc: '490 nm · Deteksi sedimen & tubuh air' },
  { id: 'B3',   label: 'B3',   name: 'Green',           category: 'spectral', color: '#60a5fa', bg: 'rgba(96,165,250,0.15)',  border: 'rgba(96,165,250,0.4)',  desc: '560 nm · Reflektansi klorofil hijau' },
  { id: 'B4',   label: 'B4',   name: 'Red',             category: 'spectral', color: '#60a5fa', bg: 'rgba(96,165,250,0.15)',  border: 'rgba(96,165,250,0.4)',  desc: '665 nm · Absorpsi klorofil merah' },
  { id: 'B8',   label: 'B8',   name: 'NIR',             category: 'nir',      color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.4)', desc: '842 nm · Struktur kanopi sel tanaman' },
  { id: 'B11',  label: 'B11',  name: 'SWIR 1',          category: 'swir',     color: '#fb923c', bg: 'rgba(251,146,60,0.15)',  border: 'rgba(251,146,60,0.4)',  desc: '1610 nm · Kandungan air daun & kelembapan tanah' },
  { id: 'B12',  label: 'B12',  name: 'SWIR 2',          category: 'swir',     color: '#fb923c', bg: 'rgba(251,146,60,0.15)',  border: 'rgba(251,146,60,0.4)',  desc: '2190 nm · Pembeda jenis batuan & mineral tanah' },
  { id: 'NDVI', label: 'NDVI', name: 'Veg. Index',      category: 'index',    color: '#34d399', bg: 'rgba(52,211,153,0.15)',  border: 'rgba(52,211,153,0.4)',  desc: '(B8−B4)/(B8+B4) · Kerapatan & kesehatan vegetasi' },
  { id: 'NDMI', label: 'NDMI', name: 'Moisture Index',  category: 'index',    color: '#22d3ee', bg: 'rgba(34,211,238,0.15)',  border: 'rgba(34,211,238,0.4)',  desc: '(B8−B11)/(B8+B11) · Kandungan air kanopi vegetasi' },
];

const metaItems = [
  { icon: '🛰️', label: 'Dataset Utama',       value: 'COPERNICUS/S2_SR_HARMONIZED', mono: true  },
  { icon: '☁️', label: 'Metode Cloud Masking', value: 'S2 Cloud Probability + QA60 (Toleransi < 20%)', mono: false },
  { icon: '📅', label: 'Periode Composite',    value: 'Setahun Penuh (Januari – Desember 2024 vs 2025)', mono: false },
  { icon: '📐', label: 'Resolusi Spasial',     value: '10 Meter per Piksel', mono: true  },
];

const downloadsNew = [
  { label: 'SHP Sampel',      ext: 'SHP',  icon: '📍', gradient: 'linear-gradient(135deg,#34d399,#059669)' },
  { label: 'GeoTIFF RF 2024', ext: 'TIFF', icon: '🗺️', gradient: 'linear-gradient(135deg,#60a5fa,#2563eb)' },
  { label: 'GeoTIFF RF 2025', ext: 'TIFF', icon: '🗺️', gradient: 'linear-gradient(135deg,#60a5fa,#2563eb)' },
  { label: 'CSV Statistik',   ext: 'CSV',  icon: '📊', gradient: 'linear-gradient(135deg,#fb923c,#c2410c)' },
];

// Flowchart steps definition
const flowchartSteps = [
  {
    id: 's2',
    label: 'Sentinel-2',
    icon: '🛰️',
    color: '#60a5fa',
    title: '1. Pengambilan Citra Sentinel-2 L2A',
    description: 'Citra Sentinel-2 Level-2A Orthorectified Bottom-Of-Atmosphere (BOA) Reflectance diunduh melalui platform Google Earth Engine (GEE). Data ini sudah terkoreksi radiometrik dan atmosferik.',
    details: [
      { key: 'Resolusi', value: '10m (B2, B3, B4, B8) & 20m (B11, B12)' },
      { key: 'Koreksi', value: 'Sen2Cor Atmosferik (BOA)' },
      { key: 'Sumber', value: 'Copernicus Open Access Hub' }
    ]
  },
  {
    id: 'preprocessing',
    label: 'Preprocessing',
    icon: '🧹',
    color: '#38bdf8',
    title: '2. Pra-pemrosesan & Cloud Masking',
    description: 'Pembersihan tutupan awan menggunakan layer QA60 bitmask dan algoritma S2 Cloud Probability. Selanjutnya dilakukan temporal median composite pada bulan Juni-September untuk memperoleh citra bebas awan.',
    details: [
      { key: 'Toleransi Awan', value: '< 20% piksel tertutup awan' },
      { key: 'Komposit', value: 'Median Temporal (Bebas Awan)' },
      { key: 'Rentang Waktu', value: 'Juni – September (Musim Kemarau)' }
    ]
  },
  {
    id: 'groundtruth',
    label: 'Ground Truth',
    icon: '📍',
    color: '#fb923c',
    title: '3. Pengumpulan Data Ground Truth',
    description: 'Pengumpulan 150 titik sampel kebenaran lapangan (ground truth) melalui digitasi langsung menggunakan basemap resolusi tinggi (Google Earth) dan survei titik lapangan GPS untuk verifikasi.',
    details: [
      { key: 'Total Sampel', value: '150 titik koordinat lapangan' },
      { key: 'Representasi Kelas', value: '75 titik Vegetasi & 75 titik Non-Vegetasi' },
      { key: 'Sampling', value: 'Stratified Random Sampling' }
    ]
  },
  {
    id: 'randomforest',
    label: 'Random Forest',
    icon: '🌳',
    color: '#a78bfa',
    title: '4. Klasifikasi Random Forest',
    description: 'Algoritma klasifikasi terbimbing (Supervised Learning) dengan melatih sekumpulan Decision Trees pada 8 variabel input (B2, B3, B4, B8, B11, B12, NDVI, NDMI) untuk menentukan kelas tutupan lahan.',
    details: [
      { key: 'Jumlah Trees', value: '100 Decision Trees' },
      { key: 'Variabel Fitur', value: '6 Band Spektral + 2 Indeks Spektral' },
      { key: 'Seed Reproduksibilitas', value: 'Seed 42' }
    ]
  },
  {
    id: 'evaluation',
    label: 'Evaluasi',
    icon: '🎯',
    color: '#f472b6',
    title: '5. Validasi & Evaluasi Model',
    description: 'Pengukuran keakuratan hasil prediksi model Random Forest menggunakan metrik confusion matrix dari subset data pengujian (testing) independen yang tidak digunakan saat pelatihan.',
    details: [
      { key: 'Rasio Split Data', value: '70% Training / 30% Testing' },
      { key: 'Akurasi Model', value: '92.4% (Overall Accuracy)' },
      { key: 'Indeks Kappa', value: '0.848 (Akurasi Sangat Baik)' }
    ]
  },
  {
    id: 'classification',
    label: 'Klasifikasi',
    icon: '🗺️',
    color: '#34d399',
    title: '6. Peta Klasifikasi Lahan',
    description: 'Penerapan model RF terlatih pada seluruh piksel citra di Kabupaten Bangka Barat untuk memproduksi peta klasifikasi biner (Vegetasi dan Non-Vegetasi) secara spasial untuk tahun 2024 dan 2025.',
    details: [
      { key: 'Keluaran', value: 'Peta Raster Biner (2 Kelas)' },
      { key: 'Area Cakupan', value: 'Kabupaten Bangka Barat (286.230 Ha)' },
      { key: 'Resolusi Output', value: 'Grid Raster 10 meter' }
    ]
  },
  {
    id: 'change',
    label: 'Change Analysis',
    icon: '🔄',
    color: '#f87171',
    title: '7. Analisis Deteksi Perubahan',
    description: 'Analisis post-classification comparison dengan melakukan overlay pixel-by-pixel antara peta klasifikasi tahun 2024 dan 2025 untuk mendeteksi area stabil, area kehilangan (loss), atau penambahan (gain) vegetasi.',
    details: [
      { key: 'Tipe Analisis', value: 'Post-Classification Pixel Overlay' },
      { key: 'Kelas Transisi', value: 'Stable Veg, Stable Non-Veg, Loss Veg, Gain Veg' },
      { key: 'Hasil Bersih', value: 'Kehilangan vegetasi bersih −6.270 Ha' }
    ]
  }
];

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(13,22,40,0.95)', border: '1px solid rgba(52,211,153,0.35)',
      borderRadius: 12, padding: '12px 16px', backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    }}>
      <div style={{ fontSize:11, color:'#94a3b8', marginBottom:8, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>
        Tahun {label}
      </div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
          <div style={{ width:10, height:10, borderRadius:3, background:p.fill }} />
          <span style={{ fontSize:12, color:'#cbd5e1' }}>{p.name}:</span>
          <span style={{ fontSize:13, fontWeight:700, color:p.fill, fontFamily:'monospace' }}>
            {p.value.toLocaleString('id-ID')} Ha
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── ACTIVE DONUT SHAPE ───────────────────────────────────────────────────────

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  return (
    <g>
      <text x={cx} y={cy - 14} textAnchor="middle" fill="#f1f5f9" fontSize={11} fontWeight={700}>{payload.name}</text>
      <text x={cx} y={cy + 8}  textAnchor="middle" fill={fill}    fontSize={22} fontWeight={800}>{(percent * 100).toFixed(1)}%</text>
      <text x={cx} y={cy + 28} textAnchor="middle" fill="#64748b" fontSize={10}>286.230 Ha total</text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 12} outerRadius={outerRadius + 16} startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
};

// ─── GLASS CARD STYLE ─────────────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
  background: 'rgba(17,31,58,0.6)',
  border: '1px solid rgba(51,65,85,0.45)',
  borderRadius: 20,
  overflow: 'hidden',
  position: 'relative',
  transition: 'all 0.25s ease',
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function TabData() {
  const [activeDonutIdx, setActiveDonutIdx] = useState(0);
  const [hoveredBand, setHoveredBand] = useState<string | null>(null);
  const [activeStepId, setActiveStepId] = useState<string>('s2');

  const activeStepData = flowchartSteps.find(s => s.id === activeStepId) || flowchartSteps[0];

  return (
    <div style={{
      width:'100%', height:'100%', overflowY:'auto', overflowX:'hidden',
      background:'radial-gradient(ellipse at 10% 10%, rgba(16,185,129,0.06) 0%, transparent 50%), #0d1628',
      padding:'28px 32px',
    }}>
      <style>{`
        .tabdata-card:hover {
          border-color: rgba(52,211,153,0.28) !important;
          box-shadow: 0 0 28px 4px rgba(52,211,153,0.10), 0 8px 32px rgba(0,0,0,0.35) !important;
          transform: translateY(-2px);
        }
        .tabdata-dl-btn { transition: all 0.2s ease; }
        .tabdata-dl-btn:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 8px 24px rgba(0,0,0,0.5) !important;
          filter: brightness(1.12);
        }
        .tabdata-badge { transition: all 0.18s ease; cursor:default; }
        .tabdata-badge:hover { transform: translateY(-2px) scale(1.06); }
        .tabdata-meta-row { transition: border-color 0.2s, background 0.2s; }
        .tabdata-meta-row:hover { border-color: rgba(52,211,153,0.35) !important; background: rgba(52,211,153,0.04) !important; }
        
        /* Flowchart Styles */
        .flowchart-connector {
          width: 24px;
          height: 2px;
          background: linear-gradient(90deg, rgba(52,211,153,0.4), rgba(96,165,250,0.4));
          flex-shrink: 0;
        }
        .flowchart-node {
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .flowchart-node:hover {
          transform: translateY(-4px) scale(1.04);
          box-shadow: 0 8px 20px rgba(0,0,0,0.4);
        }
      `}</style>

      <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', flexDirection:'column', gap:24 }}>

        {/* ── PAGE HEADER ── */}
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{
              width:40, height:40, borderRadius:12, fontSize:20,
              background:'rgba(52,211,153,0.12)', border:'1px solid rgba(52,211,153,0.35)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 0 18px rgba(52,211,153,0.2)',
            }}>📊</div>
            <div>
              <h2 style={{ fontSize:22, fontWeight:900, color:'#f1f5f9', margin:0, lineHeight:1.2 }}>Data &amp; Proses</h2>
              <p style={{ fontSize:12, color:'#64748b', margin:0 }}>
                Visualisasi, interaktivitas alur metodologi, dan metadata pemrosesan data GIS
              </p>
            </div>
          </div>
          <div style={{ height:1, background:'linear-gradient(90deg, rgba(52,211,153,0.4), transparent)', marginTop:16 }} />
        </div>

        {/* ── INTERACTIVE FLOWCHART (DIAGRAM ALUR) ── */}
        <div className="tabdata-card" style={{ ...glassCard, padding: 0 }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(51,65,85,0.4)', background:'rgba(15,23,42,0.55)' }}>
            <div style={{ fontWeight:800, fontSize:13, color:'#f1f5f9' }}>🔄 Diagram Alur Metodologi Pemrosesan Spasial</div>
            <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>Klik pada tahapan alur untuk melihat penjelasan detail proses pengolahan data</div>
          </div>
          
          <div style={{ padding: '24px', background: 'rgba(11,21,38,0.3)' }}>
            {/* Flow Nodes Container */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              overflowX: 'auto',
              padding: '12px 4px',
              gap: 8,
              scrollbarWidth: 'thin'
            }}>
              {flowchartSteps.map((step, idx) => {
                const isActive = activeStepId === step.id;
                return (
                  <React.Fragment key={step.id}>
                    <div 
                      className="flowchart-node"
                      onClick={() => setActiveStepId(step.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 105,
                        height: 90,
                        borderRadius: 16,
                        background: isActive ? `${step.color}18` : 'rgba(15,23,42,0.6)',
                        border: `1.5px solid ${isActive ? step.color : 'rgba(51,65,85,0.4)'}`,
                        boxShadow: isActive ? `0 0 16px ${step.color}35` : 'none',
                        textAlign: 'center',
                        flexShrink: 0
                      }}
                    >
                      <span style={{ fontSize: 24, marginBottom: 4 }}>{step.icon}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: isActive ? '#f1f5f9' : '#94a3b8' }}>
                        {step.label}
                      </span>
                      {isActive && (
                        <div style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: step.color,
                          boxShadow: `0 0 8px ${step.color}`,
                          marginTop: 4
                        }} />
                      )}
                    </div>
                    {idx < flowchartSteps.length - 1 && (
                      <div className="flowchart-connector" style={{
                        background: `linear-gradient(90deg, ${step.color}40, ${flowchartSteps[idx+1].color}40)`
                      }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Interactive Step Detail Card */}
            <div style={{
              marginTop: 20,
              padding: 20,
              borderRadius: 16,
              background: 'rgba(15,23,42,0.8)',
              border: `1px solid ${activeStepData.color}45`,
              boxShadow: `0 8px 30px rgba(0,0,0,0.5)`,
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: 20
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>{activeStepData.icon}</span>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: activeStepData.color, margin: 0 }}>
                    {activeStepData.title}
                  </h3>
                </div>
                <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                  {activeStepData.description}
                </p>
              </div>
              <div style={{
                borderLeft: '1px solid rgba(51,65,85,0.4)',
                paddingLeft: 20,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 8
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#475569', marginBottom: 2 }}>
                  Parameter &amp; Detail Teknis:
                </div>
                {activeStepData.details.map(d => (
                  <div key={d.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: '#64748b' }}>{d.key}</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 600, fontFamily: 'monospace' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 1: Bar Chart + Donut Chart ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

          {/* CARD 1 — Bar Chart */}
          <div className="tabdata-card" style={glassCard}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(51,65,85,0.4)', background:'rgba(15,23,42,0.55)' }}>
              <div style={{ fontWeight:800, fontSize:13, color:'#f1f5f9' }}>📊 Perbandingan Tutupan Vegetasi</div>
              <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>Vegetasi vs Non-Vegetasi · 2024 vs 2025 (Hektar)</div>
            </div>
            <div style={{ padding:'20px 16px 16px' }}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={vegetasiData} barCategoryGap="30%" barGap={6} margin={{ top:8, right:12, left:10, bottom:4 }}>
                  <defs>
                    <linearGradient id="td-gradVeg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#34d399" stopOpacity={1}   />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="td-gradNV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#f87171" stopOpacity={1}   />
                      <stop offset="100%" stopColor="#dc2626" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.4)" vertical={false} />
                  <XAxis dataKey="tahun" tick={{ fill:'#94a3b8', fontSize:13, fontWeight:700 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} tick={{ fill:'#64748b', fontSize:10 }} axisLine={false} tickLine={false} width={42} />
                  <Tooltip content={<BarTooltip />} cursor={{ fill:'rgba(255,255,255,0.04)' }} />
                  <Legend wrapperStyle={{ fontSize:11, color:'#94a3b8', paddingTop:10 }} iconType="square" iconSize={10} />
                  <Bar dataKey="Vegetasi"    fill="url(#td-gradVeg)" radius={[6,6,0,0]} maxBarSize={54} />
                  <Bar dataKey="NonVegetasi" name="Non-Vegetasi" fill="url(#td-gradNV)" radius={[6,6,0,0]} maxBarSize={54} />
                </BarChart>
              </ResponsiveContainer>
              {/* Stat pills */}
              <div style={{ display:'flex', gap:10, marginTop:12, flexWrap:'wrap' }}>
                {[
                  { label:'Δ Vegetasi', value:'−6.270 Ha', color:'#f87171' },
                  { label:'Δ Non-Veg',  value:'+6.270 Ha', color:'#fb923c' },
                  { label:'Laju Perubahan',  value:'−3.11%',    color:'#fbbf24' },
                ].map(s => (
                  <div key={s.label} style={{
                    flex:1, minWidth:90, padding:'8px 12px', borderRadius:10,
                    background:'rgba(15,23,42,0.7)', border:`1px solid ${s.color}30`,
                  }}>
                    <div style={{ fontSize:9, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</div>
                    <div style={{ fontSize:14, fontWeight:800, color:s.color, fontFamily:'monospace', marginTop:2 }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CARD 2 — Donut Chart */}
          <div className="tabdata-card" style={glassCard}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(51,65,85,0.4)', background:'rgba(15,23,42,0.55)' }}>
              <div style={{ fontWeight:800, fontSize:13, color:'#f1f5f9' }}>🍩 Persentase Tutupan Lahan 2025</div>
              <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>Proporsi klasifikasi Random Forest · Hover untuk detail</div>
            </div>
            <div style={{ padding:'16px', display:'flex', flexDirection:'column', alignItems:'center' }}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    activeIndex={activeDonutIdx}
                    activeShape={renderActiveShape}
                    data={donutData}
                    cx="50%" cy="50%"
                    innerRadius={62} outerRadius={90}
                    dataKey="value"
                    onMouseEnter={(_, i) => setActiveDonutIdx(i)}
                    strokeWidth={0}
                  >
                    {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', gap:12, marginTop:4 }}>
                {donutData.map((d, i) => (
                  <div key={d.name}
                    onMouseEnter={() => setActiveDonutIdx(i)}
                    style={{
                      display:'flex', alignItems:'center', gap:8, padding:'8px 14px',
                      borderRadius:10, cursor:'pointer',
                      background:`${DONUT_COLORS[i]}15`, border:`1px solid ${DONUT_COLORS[i]}40`,
                    }}
                  >
                    <div style={{ width:10, height:10, borderRadius:3, background:DONUT_COLORS[i], boxShadow:`0 0 8px ${DONUT_COLORS[i]}` }} />
                    <div>
                      <div style={{ fontSize:10, color:'#94a3b8' }}>{d.name}</div>
                      <div style={{ fontSize:15, fontWeight:800, color:DONUT_COLORS[i], fontFamily:'monospace' }}>{d.value}%</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop:14, padding:'8px 20px', borderRadius:30,
                background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.3)',
                fontSize:12, color:'#94a3b8', fontFamily:'monospace',
              }}>
                <span style={{ color:'#34d399', fontWeight:800 }}>286.230 Ha</span>&nbsp;Luas Total Wilayah
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 2: Metadata + Ground Truth & Hyperparameters ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

          {/* CARD 3 — Metadata & Spesifikasi Citra */}
          <div className="tabdata-card" style={glassCard}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(51,65,85,0.4)', background:'rgba(15,23,42,0.55)' }}>
              <div style={{ fontWeight:800, fontSize:13, color:'#f1f5f9' }}>🛰️ Metadata &amp; Sumber Data Spasial</div>
              <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>Spesifikasi teknis koleksi citra penginderaan jauh</div>
            </div>
            <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:10 }}>
              {metaItems.map(m => (
                <div key={m.label} className="tabdata-meta-row" style={{
                  display:'flex', alignItems:'flex-start', gap:14, padding:'10px 12px',
                  borderRadius:12, background:'rgba(15,23,42,0.6)', border:'1px solid rgba(51,65,85,0.35)',
                }}>
                  <div style={{
                    width:32, height:32, borderRadius:8, fontSize:16, flexShrink:0,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.25)',
                  }}>{m.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:9, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:700, marginBottom:2 }}>{m.label}</div>
                    <div style={{ fontSize:11, fontWeight:700, color:'#e2e8f0', fontFamily:m.mono?'monospace':'inherit', lineHeight:1.3 }}>{m.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CARD 4 — Ground Truth & Konfigurasi Validasi */}
          <div className="tabdata-card" style={glassCard}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(51,65,85,0.4)', background:'rgba(15,23,42,0.55)' }}>
              <div style={{ fontWeight:800, fontSize:13, color:'#f1f5f9' }}>📍 Dataset Ground Truth &amp; Verifikasi</div>
              <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>Detail sampling data lapangan sebagai data latih model</div>
            </div>
            <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ fontSize:12, color:'#94a3b8', lineHeight:1.5 }}>
                Verifikasi tutupan lahan dilakukan dengan menggabungkan <strong>Stratified Random Sampling</strong> secara spasial untuk menjaga keadilan representasi kelas tutupan lahan.
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div style={{ padding:'10px', borderRadius:12, background:'rgba(52,211,153,0.06)', border:'1px solid rgba(52,211,153,0.2)' }}>
                  <div style={{ fontSize:10, color:'#34d399', fontWeight:700 }}>Kelas 1: Vegetasi</div>
                  <div style={{ fontSize:18, fontWeight:900, color:'#34d399', fontFamily:'monospace', margin:'4px 0' }}>75 Titik</div>
                  <div style={{ fontSize:9, color:'#64748b' }}>Hutan sekunder, mangrove, perkebunan kelapa sawit &amp; lada</div>
                </div>
                <div style={{ padding:'10px', borderRadius:12, background:'rgba(248,113,113,0.06)', border:'1px solid rgba(248,113,113,0.2)' }}>
                  <div style={{ fontSize:10, color:'#f87171', fontWeight:700 }}>Kelas 0: Non-Vegetasi</div>
                  <div style={{ fontSize:18, fontWeight:900, color:'#f87171', fontFamily:'monospace', margin:'4px 0' }}>75 Titik</div>
                  <div style={{ fontSize:9, color:'#64748b' }}>Bekas galian timah, area terbangun, jalan, &amp; tubuh air tambang</div>
                </div>
              </div>
              <div style={{ fontSize:10, color:'#64748b', fontStyle:'italic' }}>
                *Sumber Ground Truth: GPS Field Survey 2024–2025 disinkronkan dengan visualisasi resolusi tinggi (High-Res Google Earth Orthophoto).
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 3: Hyperparameters & Band Badges ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

          {/* CARD 5 — Hyperparameter Model */}
          <div className="tabdata-card" style={glassCard}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(51,65,85,0.4)', background:'rgba(15,23,42,0.55)' }}>
              <div style={{ fontWeight:800, fontSize:13, color:'#f1f5f9' }}>⚙️ Hyperparameter &amp; Konfigurasi Model</div>
              <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>Setting latih algoritma Random Forest Classifier</div>
            </div>
            <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  { label:'Algoritma Classifier', value:'Random Forest (RF)', desc:'Ensambel Pohon Keputusan', color:'#a78bfa' },
                  { label:'Jumlah Trees (Pohon)', value:'100 Trees', desc:'Jumlah estimators pohon keputusan', color:'#34d399' },
                  { label:'Rasio Split Data', value:'70% : 30%', desc:'Train / Test Partition Ratio', color:'#60a5fa' },
                  { label:'Seed Random State', value:'42', desc:'Reproduksibilitas keacakan model', color:'#fb923c' },
                ].map(s => (
                  <div key={s.label} style={{
                    padding:'10px 12px', borderRadius:12,
                    background:'rgba(15,23,42,0.55)', border:'1px solid rgba(51,65,85,0.35)',
                  }}>
                    <div style={{ fontSize:9, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</div>
                    <div style={{ fontSize:13, fontWeight:800, color:s.color, fontFamily:'monospace', margin:'4px 0 2px' }}>{s.value}</div>
                    <div style={{ fontSize:9, color:'#475569' }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CARD 6 — Band Feature Badges */}
          <div className="tabdata-card" style={glassCard}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(51,65,85,0.4)', background:'rgba(15,23,42,0.55)' }}>
              <div style={{ fontWeight:800, fontSize:13, color:'#f1f5f9' }}>📡 Fitur Input Klasifikasi (Band &amp; Indeks)</div>
              <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>8 variabel fitur penyusun model Random Forest</div>
            </div>
            <div style={{ padding:'16px 20px' }}>
              {/* Category legend */}
              <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:12 }}>
                {[
                  { label:'Spektral', color:'#60a5fa' },
                  { label:'NIR',      color:'#a78bfa' },
                  { label:'SWIR',     color:'#fb923c' },
                  { label:'Indeks',   color:'#34d399' },
                ].map(c => (
                  <div key={c.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#94a3b8' }}>
                    <div style={{ width:7, height:7, borderRadius:2, background:c.color, boxShadow:`0 0 6px ${c.color}` }} />
                    {c.label}
                  </div>
                ))}
              </div>

              {/* Badge grid */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {bands.map(b => (
                  <div key={b.id} className="tabdata-badge"
                    onMouseEnter={() => setHoveredBand(b.id)}
                    onMouseLeave={() => setHoveredBand(null)}
                    style={{
                      display:'flex',
                      flexDirection:'column',
                      alignItems:'center',
                      padding:'8px 10px',
                      borderRadius:10,
                      minWidth:56,
                      cursor:'pointer',
                      background: hoveredBand === b.id ? b.bg.replace('0.15)','0.28)') : b.bg,
                      border:`1px solid ${hoveredBand === b.id ? b.color : b.border}`,
                      boxShadow: hoveredBand === b.id ? `0 0 12px ${b.color}40` : 'none',
                    }}
                  >
                    <span style={{
                      fontSize:12, fontWeight:950, color:b.color, fontFamily:'monospace',
                    }}>{b.label}</span>
                    <span style={{ fontSize:8, color:'#94a3b8', textAlign:'center', marginTop:1 }}>{b.name}</span>
                  </div>
                ))}
              </div>

              {/* Tooltip info */}
              {hoveredBand && (() => {
                const b = bands.find(x => x.id === hoveredBand)!;
                return (
                  <div style={{
                    marginTop:12, padding:'8px 12px', borderRadius:10,
                    background:'rgba(15,23,42,0.85)', border:`1px solid ${b.color}50`,
                    display:'flex', alignItems:'center', gap:8,
                  }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:b.color, boxShadow:`0 0 8px ${b.color}`, flexShrink:0 }} />
                    <span style={{ fontSize:10, color:'#cbd5e1' }}>
                      <strong style={{ color:b.color, fontFamily:'monospace' }}>{b.label}</strong>{' — '}{b.desc}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* ── DOWNLOAD DOCK ── */}
        <div className="tabdata-card" style={glassCard}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(51,65,85,0.4)', background:'rgba(15,23,42,0.55)' }}>
            <div style={{ fontWeight:800, fontSize:13, color:'#f1f5f9' }}>⬇️ Unduh Dataset</div>
            <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>Unduh data mentah &amp; spasial hasil pemrosesan model</div>
          </div>
          <div style={{ padding:'20px 24px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
              {downloadsNew.map(d => (
                <button key={d.label} className="tabdata-dl-btn"
                  onClick={() => alert(`Dataset "${d.label}" tersedia secara internal.\nHubungi peneliti untuk permintaan akses data.`)}
                  style={{
                    display:'flex', flexDirection:'column', alignItems:'center', gap:10,
                    padding:'18px 16px', borderRadius:16, cursor:'pointer',
                    background:'rgba(15,23,42,0.8)', border:'1px solid rgba(51,65,85,0.4)',
                    position:'relative', overflow:'hidden', outline:'none',
                  }}
                >
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:d.gradient }} />
                  <div style={{
                    width:44, height:44, borderRadius:12, fontSize:22,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)',
                  }}>{d.icon}</div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#e2e8f0', lineHeight:1.3, marginBottom:4 }}>{d.label}</div>
                    <div style={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', padding:'2px 8px', borderRadius:6, display:'inline-block', background:d.gradient, color:'#fff' }}>{d.ext}</div>
                  </div>
                  <div style={{
                    display:'flex', alignItems:'center', gap:5, fontSize:11, fontWeight:700,
                    color:'#34d399', padding:'5px 12px', borderRadius:8,
                    background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.25)',
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Unduh
                  </div>
                </button>
              ))}
            </div>
            <div style={{
              marginTop:16, padding:'10px 16px', borderRadius:10,
              background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.2)',
              display:'flex', alignItems:'center', gap:8,
            }}>
              <span style={{ fontSize:14 }}>ℹ️</span>
              <span style={{ fontSize:11, color:'#94a3b8' }}>
                Dataset GEE diproses menggunakan{' '}
                <span style={{ color:'#fbbf24', fontWeight:700 }}>Google Earth Engine</span>.
                {' '}Untuk permintaan akses, hubungi tim peneliti melalui kontak yang tersedia.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
